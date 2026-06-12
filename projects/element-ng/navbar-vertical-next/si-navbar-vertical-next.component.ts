/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver } from '@angular/cdk/layout';
import { PortalModule } from '@angular/cdk/portal';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  Injector,
  input,
  model,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  elementDoubleLeft,
  elementDoubleRight,
  elementLayoutPane2,
  elementLayoutPane2Right
} from '@siemens/element-icons';
import { SI_UI_STATE_SERVICE } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSkipLinkTargetDirective } from '@siemens/element-ng/skip-links';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SiNavbarVerticalNextItemComponent } from './si-navbar-vertical-next-item.component';
import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
interface UIState {
  preferCollapse: boolean;
  expandedItems: Record<string, boolean>;
}

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next',
  imports: [PortalModule, SiIconComponent, SiSkipLinkTargetDirective, SiTranslatePipe],
  templateUrl: './si-navbar-vertical-next.component.html',
  styleUrl: './si-navbar-vertical-next.component.scss',
  providers: [{ provide: SI_NAVBAR_VERTICAL_NEXT, useExisting: SiNavbarVerticalNextComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'si-layout-inner ready',
    '[class.nav-collapsed]': 'collapsed()',
    '[class.nav-text-only]': 'textOnly()',
    '[class.nav-inline-collapse]': 'inlineCollapse()',
    '[class.visible]': 'visible()',
    '[class.ready]': 'ready()'
  }
})
export class SiNavbarVerticalNextComponent implements OnChanges, OnInit {
  protected readonly icons = addIcons({
    elementDoubleLeft,
    elementDoubleRight,
    elementLayoutPane2,
    elementLayoutPane2Right
  });

  /**
   * Whether the navbar-vertical is collapsed.
   *
   * @defaultValue false
   */
  readonly collapsed = model(false);

  /**
   * Set to `true` if there are no icons
   *
   * @defaultValue false
   */
  readonly textOnly = input(false, { transform: booleanAttribute });

  /**
   * Enables an alternative inline-collapse behavior.
   *
   * When collapsed, nav content becomes inert while the toggle remains
   * available in the page flow.
   *
   * @defaultValue false
   */
  readonly inlineCollapse = input(false, { transform: booleanAttribute });

  /**
   * When `true`, item-groups always open as a transient flyout panel adjacent to the
   * trigger, regardless of whether the navbar is collapsed or expanded.
   * Flyouts open and close on click.
   *
   * @defaultValue false
   */
  readonly alwaysFlyout = input(false, { transform: booleanAttribute });

  /**
   * List of vertical navigation items
   *
   * @deprecated Use the template-based declarative API with content projection instead. Use `<si-navbar-vertical-next-items>` and
   * `<a si-navbar-vertical-next-item>` / `<button si-navbar-vertical-next-item>` instead.
   *
   * @defaultValue true
   */
  readonly visible = input(true, { transform: booleanAttribute });

  /**
   * Text for the navbar toggle button used as `aria-label`.
   * The expanded state is communicated via `aria-expanded`.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.TOGGLE:Toggle`)
   * ```
   */
  readonly toggleButtonText = input(t(() => $localize`:@@SI_NAVBAR_VERTICAL.TOGGLE:Toggle`));

  /**
   * An optional stateId to uniquely identify a component instance.
   * Required for persistence of ui state.
   */
  readonly stateId = input<string>();

  /**
   * Label for the skip link to the vertical navbar
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.NAVIGATION_LABEL:Navigation`)
   * ```
   */
  readonly skipLinkNavigationLabel = input(
    t(() => $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.NAVIGATION_LABEL:Navigation`)
  );

  /**
   * Label for the skip link to main content
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.MAIN_LABEL:Main content`)
   * ```
   */
  readonly skipLinkMainContentLabel = input(
    t(() => $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.MAIN_LABEL:Main content`)
  );
  private uiStateService = inject(SI_UI_STATE_SERVICE, { optional: true });
  private breakpointObserver = inject(BreakpointObserver);
  private injector = inject(Injector);

  protected readonly ready = signal(false);
  protected readonly smallScreen = signal(false);

  /** Stable ViewContainerRef inside <nav>, used to host flyout anchors when the chip DomPortal moves a trigger outside the nav.
   * @internal
   */
  readonly flyoutAnchorHost = viewChild('flyoutAnchorHost', { read: ViewContainerRef });

  /** All projected nav items, including descendants inside group templates.
   * @internal
   */
  private readonly items = contentChildren(SiNavbarVerticalNextItemComponent, {
    descendants: true
  });

  /** The active root-level item; group triggers resolve for nested routes.
   * @internal
   */
  readonly activeItem = computed(() => this.items().find(item => item.isActiveRootItem()));

  /** `true` when the active item's portal should occupy the chip slot.
   * @internal
   */
  readonly chipPortalAttached = computed(
    () => this.inlineCollapse() && this.collapsed() && !!this.activeItem()
  );

  /**
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly uiStateExpandedItems = signal<Record<string, boolean>>({});

  // Indicates if the user prefers a collapsed navbar. Relevant for resizing.
  private preferCollapse = false;

  protected readonly toggleIcon = computed(() => {
    if (this.inlineCollapse()) {
      return this.collapsed() ? this.icons.elementLayoutPane2 : this.icons.elementLayoutPane2Right;
    }
    return this.collapsed() ? this.icons.elementDoubleRight : this.icons.elementDoubleLeft;
  });

  /** `true` when inline-collapse is active and the nav is collapsed.
   * @internal
   */
  readonly chipMode = computed(() => this.inlineCollapse() && this.collapsed());

  /** `true` when groups should render as flyout overlays.
   * @internal
   */
  readonly flyoutMode = computed(() => this.alwaysFlyout() || this.collapsed());

  constructor() {
    this.breakpointObserver
      .observe(`(max-width: ${BOOTSTRAP_BREAKPOINTS.lgMinimum}px)`)
      .pipe(takeUntilDestroyed())
      .subscribe(({ matches }) => {
        this.collapsed.set(matches || this.preferCollapse);
        this.smallScreen.set(matches);
      });
  }

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.collapsed) {
      this.preferCollapse = this.collapsed();
    }
  }

  ngOnInit(): void {
    const stateId = this.stateId();
    if (this.uiStateService && stateId) {
      this.uiStateService.load<UIState>(stateId).then(uiState => {
        if (uiState) {
          this.preferCollapse = uiState.preferCollapse;
          this.collapsed.set(this.smallScreen() ? this.collapsed() : this.preferCollapse);
          if (uiState.expandedItems) {
            this.uiStateExpandedItems.set(uiState.expandedItems);
          }
        }
        afterNextRender(() => this.ready.set(true), { injector: this.injector });
      });
    } else {
      this.ready.set(true);
    }
  }

  protected toggleCollapse(): void {
    if (this.collapsed()) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  /** Expands the vertical navbar. */
  expand(): void {
    this.collapsed.set(false);
    if (!this.smallScreen()) {
      this.preferCollapse = this.collapsed();
    }
    this.saveUIState();
  }

  /** Collapses the vertical navbar. */
  collapse(): void {
    this.collapsed.set(true);
    if (!this.smallScreen()) {
      this.preferCollapse = this.collapsed();
    }
    this.saveUIState();
  }

  /** @internal */
  groupStateChanged(stateId: string | undefined, expanded: boolean): void {
    if (stateId) {
      this.uiStateExpandedItems.update(items => ({ ...items, [stateId]: expanded }));
    }
    this.saveUIState();
  }

  protected saveUIState(): void {
    const stateId = this.stateId();
    if (!this.uiStateService || !stateId) {
      return;
    }

    this.uiStateService.save<UIState>(stateId, {
      preferCollapse: this.preferCollapse,
      expandedItems: this.uiStateExpandedItems()
    });
  }

  /** @internal */
  itemTriggered(): void {
    if (this.smallScreen()) {
      this.collapsed.set(true);
    }
  }
}
