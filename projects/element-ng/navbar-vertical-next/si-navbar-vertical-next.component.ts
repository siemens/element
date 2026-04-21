/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { elementDoubleLeft, elementDoubleRight, elementSearch } from '@siemens/element-icons';
import { SI_UI_STATE_SERVICE } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSkipLinkTargetDirective } from '@siemens/element-ng/skip-links';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SI_NAVBAR_VERTICAL_NEXT } from './si-navbar-vertical-next.provider';

/** @experimental */
interface UIState {
  preferCollapse: boolean;
  expandedItems: Record<string, boolean>;
}

/** @experimental */
@Component({
  selector: 'si-navbar-vertical-next',
  imports: [SiIconComponent, SiSearchBarComponent, SiSkipLinkTargetDirective, SiTranslatePipe],
  templateUrl: './si-navbar-vertical-next.component.html',
  styleUrl: './si-navbar-vertical-next.component.scss',
  providers: [{ provide: SI_NAVBAR_VERTICAL_NEXT, useExisting: SiNavbarVerticalNextComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'si-layout-inner ready',
    '[class.nav-collapsed]': 'collapsed()',
    '[class.nav-text-only]': 'textOnly()',
    '[class.visible]': 'visible()'
  }
})
export class SiNavbarVerticalNextComponent implements OnChanges, OnInit {
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
   * Set to `true` if there are no icons
   *
   * @defaultValue false
   */
  readonly textOnly = input(false, { transform: booleanAttribute });

  /**
   * List of vertical navigation items
   *
   * @deprecated Use the template-based declarative API with content projection instead. Use `<si-navbar-vertical-items-next>` and
   * `<a si-navbar-vertical-next-item>` / `<button si-navbar-vertical-next-item>` instead.
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
   * Debounce time for the search input
   * @defaultValue 400
   */
  readonly searchDebounceTime = input(400);
  /**
   * Output for search bar input
   */
  readonly searchEvent = output<string>();

  private readonly searchBar = viewChild.required(SiSearchBarComponent);

  private uiStateService = inject(SI_UI_STATE_SERVICE, { optional: true });
  private breakpointObserver = inject(BreakpointObserver);

  protected readonly smallScreen = signal(false);

  /**
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly uiStateExpandedItems = signal<Record<string, boolean>>({});

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
