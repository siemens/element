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
  effect,
  EmbeddedViewRef,
  inject,
  Injector,
  input,
  linkedSignal,
  TemplateRef,
  untracked,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';

import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/**
 * Using this component, to anchor the flyout inside the navbar within the a11y tree.
 * Otherwise, without aria-owns, screen reader will announce the leaving of the navbar when moving to the flyout.
 * Aria-owns cannot be put directly on the trigger
 * as chrome will include the flyout children in the a11y label of the trigger.
 * @experimental
 */
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
    '[attr.aria-expanded]': 'expanded()',
    '(click)': 'triggered()'
  }
})
export class SiNavbarVerticalNextGroupTriggerDirective {
  private static idCounter = 0;

  /** @internal */
  readonly groupId = `si-navbar-vertical-next-group-${SiNavbarVerticalNextGroupTriggerDirective.idCounter++}`;
  readonly id = `${this.groupId}-trigger`;

  readonly groupTemplate = input.required<TemplateRef<unknown>>({
    alias: 'siNavbarVerticalNextGroupTriggerFor'
  });

  readonly stateId = input<string>();

  /** @defaultValue false */
  readonly expanded = linkedSignal<
    { uiState: boolean | undefined; alwaysFlyout: boolean },
    boolean
  >({
    source: () => {
      const stateId = this.stateId();
      return {
        uiState: stateId ? this.navbar.uiStateExpandedItems()[stateId] : undefined,
        alwaysFlyout: this.navbar.alwaysFlyout()
      };
    },
    computation: (source, previous) => {
      // `alwaysFlyout` toggled: reset expansion. When switching back to inline,
      // surface the group that owns the active route.
      if (previous && source.alwaysFlyout !== previous.source.alwaysFlyout) {
        return !source.alwaysFlyout && untracked(() => this.active());
      }
      // First run or UIState (re)loaded: honor the persisted value when present,
      // otherwise keep the user's current expansion.
      if (source.uiState !== undefined) {
        return source.uiState;
      }
      return previous?.value ?? false;
    }
  });

  /**
   * Whether the group is currently rendered as a transient flyout overlay
   * (true) or inline within the navbar (false). Automatically resets to
   * `false` whenever the rendering mode changes.
   * @internal
   */
  readonly flyout = linkedSignal({
    source: () => this.flyoutMode(),
    computation: () => false
  });

  /**
   * Whether the open flyout overlay currently contains the active route.
   * Reset together with `flyout` so it never lingers across mode changes.
   * @internal
   */
  readonly active = linkedSignal<boolean, boolean>({
    source: () => this.flyout(),
    computation: (open, previous) => (open ? (previous?.value ?? false) : false)
  });

  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);

  /** @internal */
  readonly flyoutMode = computed(() => this.navbar.alwaysFlyout() || this.navbar.collapsed());

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
  private groupView?: EmbeddedViewRef<unknown>;
  private flyoutAnchorComponentRef?: ComponentRef<SiNavbarFlyoutAnchorComponent>;
  private readonly templatePortal = computed(
    () => new TemplatePortal(this.groupTemplate(), this.viewContainer, undefined, this.injector)
  );

  constructor() {
    // Manage the rendering of the inline projection / flyout overlay in
    // response to mode changes. Only side effects belong here; the related
    // signal state is propagated by `flyout` / `expanded` linked signals.
    effect(() => {
      this.flyoutMode();
      untracked(() => {
        this.detachFlyout();
        this.attachInline();
      });
    });
  }

  /** @internal */
  hideFlyout(): void {
    if (!this.flyout()) return;
    this.flyout.set(false);
    this.detachFlyout();
    this.attachInline();
  }

  protected triggered(): void {
    if (this.flyoutMode()) {
      this.toggleFlyout();
    } else {
      this.expanded.set(!this.expanded());
      this.navbar.groupStateChanged(this.stateId(), this.expanded());
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
    this.groupView?.destroy();
    this.groupView = this.viewContainer.createEmbeddedView(this.groupTemplate(), undefined, {
      injector: this.injector
    });
  }

  private attachFlyout(): void {
    this.groupView?.destroy();
    this.groupView = this.overlayRef.attach(this.templatePortal());
    this.flyoutAnchorComponentRef = this.viewContainer.createComponent(
      SiNavbarFlyoutAnchorComponent
    );
    this.flyoutAnchorComponentRef.setInput('groupId', this.groupId);
    this.flyoutOutsideClickSubscription = this.overlayRef
      .outsidePointerEvents()
      .subscribe(() => this.hideFlyout());
  }

  private detachFlyout(): void {
    this.flyoutAnchorComponentRef?.destroy();
    this.flyoutAnchorComponentRef = undefined;
    this.flyoutOutsideClickSubscription?.unsubscribe();
    this.flyoutOutsideClickSubscription = undefined;
  }
}
