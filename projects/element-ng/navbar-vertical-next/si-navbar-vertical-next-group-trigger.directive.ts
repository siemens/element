/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    '[attr.aria-expanded]': 'flyoutMode() ? flyout() : expanded()',
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

  /** `true` when this group contains the active route. Set by the group component.
   * @internal
   */
  readonly active = signal<boolean>(false);

  protected readonly navbar = inject(SI_NAVBAR_VERTICAL_NEXT);

  /** Signal mirror of the navbar's flyout mode. `true` when groups should render as transient overlays instead of inline.
   * @internal
   */
  readonly flyoutMode = computed(() => this.navbar.flyoutMode());

  private flyoutOutsideClickSubscription?: Subscription;
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = Injector.create({ parent: inject(Injector), providers: [] });
  private readonly overlayRef = this.overlay.create({
    positionStrategy: this.buildPositionStrategy(this.navbar.chipMode())
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

    this.destroyRef.onDestroy(() => {
      this.overlayRef.detach();
      this.overlayRef.dispose();
    });
  }

  /** @internal */
  private buildPositionStrategy(chipMode: boolean): FlexibleConnectedPositionStrategy {
    const positions: ConnectionPositionPair[] = chipMode
      ? [
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
        ]
      : [
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
          { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' }
        ];

    return this.overlay
      .position()
      .flexibleConnectedTo(this.viewContainer.element)
      .withPositions(positions);
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
    this.overlayRef.updatePositionStrategy(this.buildPositionStrategy(this.navbar.chipMode()));
    this.groupView?.destroy();
    this.groupView = this.overlayRef.attach(this.templatePortal());
    // In chip mode the trigger's DOM is outside <nav> via DomPortal; use the
    // navbar's in-nav anchor host so aria-owns stays within the navigation landmark.
    const anchorHost = this.navbar.flyoutAnchorHost() ?? this.viewContainer;
    this.flyoutAnchorComponentRef = anchorHost.createComponent(SiNavbarFlyoutAnchorComponent);
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
