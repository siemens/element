/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
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
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild,
  viewChildren
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { elementDoubleLeft, elementDoubleRight, elementSearch } from '@siemens/element-icons';
import { MenuItem, SI_UI_STATE_SERVICE } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSkipLinkTargetDirective } from '@siemens/element-ng/skip-links';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

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
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    SiIconComponent,
    SiNavbarVerticalDividerComponent,
    SiNavbarVerticalGroupComponent,
    SiNavbarVerticalGroupTriggerDirective,
    SiNavbarVerticalHeaderComponent,
    SiNavbarVerticalItemComponent,
    SiNavbarVerticalItemGuardDirective,
    SiNavbarVerticalItemLegacyComponent,
    SiSearchBarComponent,
    SiSkipLinkTargetDirective,
    SiTranslatePipe,
    SiTooltipDirective
  ],
  templateUrl: './si-navbar-vertical.component.html',
  styleUrl: './si-navbar-vertical.component.scss',
  providers: [{ provide: SI_NAVBAR_VERTICAL, useExisting: SiNavbarVerticalComponent }],
  host: {
    class: 'si-layout-inner',
    '[class.nav-collapsed]': 'collapsed()',
    '[class.nav-text-only]': 'textOnly()',
    '[class.visible]': 'visible()'
  }
})
export class SiNavbarVerticalComponent implements OnChanges, OnInit {
  protected readonly icons = addIcons({ elementDoubleLeft, elementDoubleRight, elementSearch });
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
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.SEARCH_PLACEHOLDER:Search ...`)
   * ```
   */
  readonly searchPlaceholder = input(
    t(() => $localize`:@@SI_NAVBAR_VERTICAL.SEARCH_PLACEHOLDER:Search ...`)
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
   * Text for the navbar expand button. Required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.EXPAND:Expand`)
   * ```
   */
  readonly navbarExpandButtonText = input(t(() => $localize`:@@SI_NAVBAR_VERTICAL.EXPAND:Expand`));

  /**
   * Text for the navbar collapse button. Required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_NAVBAR_VERTICAL.COLLAPSE:Collapse`)
   * ```
   */
  readonly navbarCollapseButtonText = input(
    t(() => $localize`:@@SI_NAVBAR_VERTICAL.COLLAPSE:Collapse`)
  );

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

  // Indicates if the user prefers a collapsed navbar. Relevant for resizing.
  private preferCollapse = false;

  constructor() {
    this.breakpointObserver
      .observe(`(max-width: ${BOOTSTRAP_BREAKPOINTS.lgMinimum}px)`)
      .pipe(takeUntilDestroyed())
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
