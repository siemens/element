/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  animate,
  animateChild,
  group,
  query,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  Directive,
  HostBinding,
  inject,
  input,
  model,
  numberAttribute,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild,
  viewChildren
} from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem, SI_UI_STATE_SERVICE } from '@siemens/element-ng/common';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSkipLinkTargetDirective } from '@siemens/element-ng/skip-links';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SiNavbarVerticalDividerComponent } from './si-navbar-vertical-divider.component';
import { SiNavbarVerticalGroupTriggerDirective } from './si-navbar-vertical-group-trigger.directive';
import { SiNavbarVerticalGroupComponent } from './si-navbar-vertical-group.component';
import { SiNavbarVerticalHeaderComponent } from './si-navbar-vertical-header.component';
import { SiNavbarVerticalItemLegacyComponent } from './si-navbar-vertical-item-legacy.component';
import { SiNavbarVerticalItemComponent } from './si-navbar-vertical-item.component';
import { NavbarVerticalItem, NavbarVerticalItemGroup } from './si-navbar-vertical.model';
import { SI_NAVBAR_VERTICAL } from './si-navbar-vertical.provider';

interface UIState {
  preferCollapse: boolean;
  expandedItems: Record<string, boolean>;
}

/** Required to have compiler checks on the factory template */
@Directive({ selector: '[siNavbarVerticalItemGuard]' })
export class SiNavbarVerticalItemGuardDirective {
  static ngTemplateContextGuard(
    dir: SiNavbarVerticalItemGuardDirective,
    ctx: any
  ): ctx is { item: NavbarVerticalItem; group: NavbarVerticalItemGroup } {
    return true;
  }
}

@Component({
  selector: 'si-navbar-vertical',
  imports: [
    SiNavbarVerticalItemLegacyComponent,
    SiSearchBarComponent,
    SiSkipLinkTargetDirective,
    SiTranslatePipe,
    SiNavbarVerticalItemComponent,
    RouterLink,
    SiNavbarVerticalItemGuardDirective,
    NgTemplateOutlet,
    SiNavbarVerticalGroupComponent,
    RouterLinkActive,
    SiNavbarVerticalGroupTriggerDirective,
    SiNavbarVerticalDividerComponent,
    SiNavbarVerticalHeaderComponent
  ],
  templateUrl: './si-navbar-vertical.component.html',
  styleUrl: './si-navbar-vertical.component.scss',
  host: {
    class: 'si-layout-inner',
    '[class.nav-collapsed]': 'collapsed()',
    '[class.nav-text-only]': 'textOnly()',
    '[class.visible]': 'visible()'
  },
  providers: [{ provide: SI_NAVBAR_VERTICAL, useExisting: SiNavbarVerticalComponent }],
  animations: [
    trigger('collapse', [
      state('expanded', style({ 'inline-size': '240px' })),
      state('collapsed', style({ 'inline-size': '*' })),
      transition('collapsed => expanded', [
        group([
          animate('0.5s ease'),
          query('si-navbar-vertical-group, si-navbar-vertical-header', animateChild(), {
            optional: true
          }),
          query(
            '.dropdown-caret',
            [style({ 'opacity': '0' }), animate('0.5s ease', style({ 'opacity': '1' }))],
            { optional: true }
          ),
          query(
            '.mobile-drawer',
            style({ 'box-shadow': 'none', background: 'var(--element-base-1)' })
          ),
          query('.mobile-drawer', [
            style({ 'inline-size': '*', 'box-shadow': '*' }),
            animate('0.5s ease', style({ 'inline-size': '240px' })),
            style({ 'inline-size': '240px' })
          ])
        ])
      ]),
      transition('expanded => collapsed', [
        query('.nav-search', style({ 'display': 'flex' }), { optional: true }),
        query('.nav-scroll', style({ 'display': 'block' })),
        group([
          animate('0.5s ease'),
          query('si-navbar-vertical-group, si-navbar-vertical-header', animateChild(), {
            optional: true
          }),
          query('.section-item', style({ visibility: 'hidden' }), { optional: true }),
          query('si-navbar-vertical-group', style({ visibility: 'hidden' }), { optional: true }),
          query('.mobile-drawer', [
            style({ 'inline-size': '240px', 'box-shadow': 'none' }),
            animate('0.5s ease', style({ 'inline-size': '*' })),
            style({ 'inline-size': '*' })
          ])
        ])
      ])
    ]),
    trigger('backdrop', [
      state('show', style({ 'opacity': '1' })),
      state('hide', style({ 'opacity': '0' })),
      transition('* <=> *', [animate('0.15s linear')])
    ])
  ]
})
export class SiNavbarVerticalComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * Whether the navbar-vertical is collapsed.
   *
   * @defaultValue false
   */
  readonly collapsed = model(false);

  /**
   * Toggles search bar
   *
   * @defaultValue false
   */
  readonly searchable = input(false, { transform: booleanAttribute });

  /**
   * Placeholder text for search
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_NAVBAR_VERTICAL.SEARCH_PLACEHOLDER:Search ...`
   * ```
   */
  readonly searchPlaceholder = input(
    $localize`:@@SI_NAVBAR_VERTICAL.SEARCH_PLACEHOLDER:Search ...`
  );

  /**
   * List of vertical navigation items
   *
   * @defaultValue []
   */
  readonly items = model<(MenuItem | NavbarVerticalItem)[]>([]);

  /**
   * Set to `true` if there are no icons
   *
   * @defaultValue false
   */
  /**
   * Set to `true` if there are no icons
   *
   * @defaultValue false
   */
  readonly textOnly = input(false, { transform: booleanAttribute });

  /**
   * Set to false to hide the vertical navbar
   *
   * @defaultValue true
   */
  /**
   * Set to false to hide the vertical navbar
   *
   * @defaultValue true
   */
  readonly visible = input(true, { transform: booleanAttribute });

  /**
   * @deprecated dropped without replacement.
   *
   * @defaultValue undefined
   */
  readonly autoCollapseDelay = input<number, unknown>(undefined, { transform: numberAttribute });

  /**
   * Text for the navbar expand button. Required for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_NAVBAR_VERTICAL.EXPAND:Expand`
   * ```
   */
  readonly navbarExpandButtonText = input($localize`:@@SI_NAVBAR_VERTICAL.EXPAND:Expand`);

  /**
   * Text for the navbar collapse button. Required for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_NAVBAR_VERTICAL.COLLAPSE:Collapse`
   * ```
   */
  readonly navbarCollapseButtonText = input($localize`:@@SI_NAVBAR_VERTICAL.COLLAPSE:Collapse`);

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
   * $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.NAVIGATION_LABEL:Navigation`
   * ```
   */
  readonly skipLinkNavigationLabel = input(
    $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.NAVIGATION_LABEL:Navigation`
  );

  /**
   * Label for the skip link to main content
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.MAIN_LABEL:Main content`
   * ```
   */
  readonly skipLinkMainContentLabel = input(
    $localize`:@@SI_NAVBAR_VERTICAL.SKIP_LINK.MAIN_LABEL:Main content`
  );

  /**
   * Output for search bar input
   */
  readonly searchEvent = output<string>();

  private readonly searchBar = viewChild.required(SiSearchBarComponent);
  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });
  // Is required to prevent the navbar from running the padding animation on creation.
  @HostBinding('class.ready') protected readonly ready = true;

  protected readonly searchInputDelay = 400;

  private uiStateService = inject(SI_UI_STATE_SERVICE, { optional: true });
  private breakpointObserver = inject(BreakpointObserver);
  private readonly navbarItems = viewChildren(SiNavbarVerticalItemComponent);
  private readonly navbarItemsLegacy = viewChildren(SiNavbarVerticalItemLegacyComponent);
  private readonly itemsToComponents = computed(
    () =>
      new Map(
        [...this.navbarItems(), ...this.navbarItemsLegacy()].map(component => [
          component.item() as NavbarVerticalItem | MenuItem, // to have a broader key type allowed
          component
        ])
      )
  );

  protected readonly smallScreen = signal(false);
  protected readonly uiStateExpandedItems = signal<Record<string, boolean>>({});
  private destroyer = new Subject<void>();

  // Indicates if the user prefers a collapsed navbar. Relevant for resizing.
  private preferCollapse = false;

  constructor() {
    this.breakpointObserver
      .observe(`(max-width: ${BOOTSTRAP_BREAKPOINTS.lgMinimum}px)`)
      .pipe(takeUntil(this.destroyer))
      .subscribe(({ matches }) => {
        this.collapsed.set(matches || this.preferCollapse);
        this.smallScreen.set(matches);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
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
          this.uiStateExpandedItems.set(uiState.expandedItems);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyer.next();
    this.destroyer.complete();
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
      const autoCollapseDelay = this.autoCollapseDelay();
      if (autoCollapseDelay) {
        setTimeout(() => {
          if (!this.collapsed()) {
            this.toggleCollapse();
          }
        }, autoCollapseDelay);
      }
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

  protected expandForSearch(): void {
    this.expand();
    setTimeout(() => this.searchBar().focus());
  }

  protected doSearch(event: string): void {
    this.searchEvent.emit(event);
  }

  /** @internal */
  groupTriggered(): void {
    this.saveUIState();
    const itemToComponentMap = this.itemsToComponents();
    this.items.set(
      this.items().map(item => {
        const component = itemToComponentMap.get(item);
        if (!component) {
          return item;
        }

        if (component instanceof SiNavbarVerticalItemLegacyComponent) {
          return {
            ...item,
            expanded: component.expanded()
          };
        }

        if (component.group) {
          return {
            ...item,
            expanded: component.group.expanded()
          };
        }

        return item;
      })
    );
    this.collapsed.set(false);
  }

  protected saveUIState(): void {
    const stateId = this.stateId();
    if (!this.uiStateService || !stateId) {
      return;
    }

    const expandedGroups = this.navbarItems()
      .filter(item => item.item().id && item.group?.expanded())
      .map(item => [item.item().id, true]);

    const expandedGroupsLegacy = this.navbarItemsLegacy()
      .filter(item => item.item().id && item.expanded())
      .map(item => [item.item().id, true]);

    this.uiStateService.save<UIState>(stateId, {
      preferCollapse: this.preferCollapse,
      expandedItems: Object.fromEntries([...expandedGroups, ...expandedGroupsLegacy])
    });
  }

  /** @internal */
  itemTriggered(): void {
    if (this.smallScreen()) {
      this.collapsed.set(true);
    }
  }

  protected isLegacyStyle(item: MenuItem | NavbarVerticalItem): item is MenuItem {
    return !('type' in item && item.type !== 'check' && item.type !== 'radio');
  }
}
