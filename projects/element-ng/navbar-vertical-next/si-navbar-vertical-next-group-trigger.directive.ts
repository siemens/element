/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ComponentRef,
  computed,
  Directive,
  EmbeddedViewRef,
  HostListener,
  inject,
  Injector,
  input,
  model,
  OnInit,
  signal,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';

import {
  NavbarVerticalNextItem,
  NavbarVerticalNextItemGroup
} from './si-navbar-vertical-next.model';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/**
 * Using this component, to anchor the flyout inside the navbar within the a11y tree.
 * Otherwise, without aria-owns, screen reader will announce the leaving of the navbar when moving to the flyout.
 * Aria-owns cannot be put directly on the trigger
 * as chrome will include the flyout children in the a11y label of the trigger.
 */
/** @experimental */
@Component({
  selector: 'si-navbar-flyout-anchor',
  template: '',
  host: { '[attr.aria-owns]': 'groupId()' }
})
class SiNavbarFlyoutAnchorComponent {
  readonly groupId = input<string>();
}

/** @experimental */
@Directive({
  selector: 'button[siNavbarVerticalNextGroupTriggerFor]',
  host: {
    class: 'dropdown-toggle',
    '[id]': 'id',
    '[class.show]': 'expanded()',
    '[attr.aria-controls]': 'groupId',
    '[attr.aria-expanded]': 'expanded()'
  }
})
export class SiNavbarVerticalNextGroupTriggerDirective implements OnInit {
  private static idCounter = 0;

  /** @internal */
  readonly groupId = `si-navbar-vertical-next-group-${SiNavbarVerticalNextGroupTriggerDirective.idCounter++}`;
  readonly id = `${this.groupId}-trigger`;

  readonly groupTemplate = input.required<TemplateRef<unknown>>({
    alias: 'siNavbarVerticalNextGroupTriggerFor'
  });

  readonly groupData = input<{
    item?: NavbarVerticalNextItem;
    group: NavbarVerticalNextItemGroup;
  }>();

  readonly stateId = input<string>();

  readonly expanded = model.required<boolean>();

  /** @internal */
  readonly flyout = signal(false);

  /** @internal */
  readonly active = signal(false);

  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);

  private flyoutOutsideClickSubscription?: Subscription;
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly overlay = inject(Overlay);
  private readonly injector = Injector.create({ parent: inject(Injector), providers: [] });
  private readonly overlayRef = this.overlay.create({
    positionStrategy: this.overlay
      .position()
      .flexibleConnectedTo(this.viewContainer.element)
      .withPositions([
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
        { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' }
      ])
  });
  private groupView!: EmbeddedViewRef<unknown>;
  private flyoutAnchorComponentRef?: ComponentRef<SiNavbarFlyoutAnchorComponent>;
  private readonly templatePortal = computed(
    () =>
      new TemplatePortal(this.groupTemplate(), this.viewContainer, this.groupData(), this.injector)
  );

  ngOnInit(): void {
    this.attachInline();
  }

  /** @internal */
  hideFlyout(): void {
    if (this.flyout()) {
      this.flyout.set(false);
      this.active.set(false);
      this.flyoutAnchorComponentRef?.destroy();
      this.flyoutAnchorComponentRef = undefined;
      this.attachInline();
      this.flyoutOutsideClickSubscription?.unsubscribe();
    }
  }

  @HostListener('click') protected triggered(): void {
    if (this.navbar.collapsed()) {
      this.toggleFlyout();
    } else {
      this.expanded.set(!this.expanded());
      this.navbar.groupTriggered();
    }
  }

  private toggleFlyout(): void {
    if (this.flyout()) {
      this.hideFlyout();
    } else {
      this.flyout.set(true);
      this.attachFlyout();
    }
  }
  private attachInline(): void {
    this.overlayRef.detach();
    this.groupView?.destroy(); // we need ?. for first attachment
    this.groupView = this.viewContainer.createEmbeddedView(this.groupTemplate(), this.groupData(), {
      injector: this.injector
    });
  }

  private attachFlyout(): void {
    this.groupView.destroy();
    this.groupView = this.overlayRef.attach(this.templatePortal());
    this.flyoutAnchorComponentRef = this.viewContainer.createComponent(
      SiNavbarFlyoutAnchorComponent
    );
    this.flyoutAnchorComponentRef.setInput('groupId', this.groupId);
    this.flyoutOutsideClickSubscription = this.overlayRef
      .outsidePointerEvents()
      .subscribe(() => this.hideFlyout());
  }
}
