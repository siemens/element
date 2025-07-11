/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiAccordionHCollapseService } from '@siemens/element-ng/accordion';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import {
  elementDoubleLeft,
  elementDoubleRight,
  addIcons,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { MenuItem } from '@siemens/element-ng/menu';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiSidePanelService } from './si-side-panel.service';

/**
 * An extension of MenuItem to support combined icons
 */
export interface StatusItem extends MenuItemLegacy {
  overlayIcon?: string;
}

@Component({
  selector: 'si-side-panel-content',
  imports: [
    SiContentActionBarComponent,
    SiIconNextComponent,
    SiLinkDirective,
    SiSearchBarComponent,
    SiTranslateModule
  ],
  templateUrl: './si-side-panel-content.component.html',
  styleUrl: './si-side-panel-content.component.scss',
  providers: [SiAccordionHCollapseService],
  host: {
    '[class.collapsed]': 'isCollapsed()',
    '[class.expanded]': 'isExpanded()',
    '[class.enable-mobile]': 'enableMobile()'
  }
})
export class SiSidePanelContentComponent implements OnInit {
  /**
   * @defaultValue false
   */
  readonly collapsible = input(false, { transform: booleanAttribute });

  /**
   * Header of side panel
   *
   * @defaultValue ''
   */
  readonly heading = input<TranslatableString>('');

  /**
   * Input list of primary action items
   *
   * @defaultValue []
   */
  readonly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);

  /**
   * Input list of secondary action items.
   *
   * @defaultValue []
   */
  readonly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);

  /**
   * Status icons/actions
   *
   * @defaultValue []
   */
  readonly statusActions = input<StatusItem[]>([]);

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
   * $localize`:@@SI_SIDE_PANEL.SEARCH_PLACEHOLDER:Search...`
   * ```
   */
  readonly searchPlaceholder = input($localize`:@@SI_SIDE_PANEL.SEARCH_PLACEHOLDER:Search...`);

  /**
   * Aria label for close button. Needed for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_SIDE_PANEL.CLOSE:Close`
   * ```
   */
  readonly closeButtonLabel = input($localize`:@@SI_SIDE_PANEL.CLOSE:Close`);

  /**
   * Toggle icon aria-label, required for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`
   * ```
   */
  readonly toggleItemLabel = input($localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`);

  /**
   * Show a badge on the mobile drawer indicating a new alert or notification
   *
   * @defaultValue false
   */
  readonly showMobileDrawerBadge = input(false, { transform: booleanAttribute });

  /**
   * Output for search bar input
   */
  readonly searchEvent = output<string>();

  protected readonly isCollapsed = signal(false);
  protected readonly isExpanded = signal(true);
  protected readonly enableMobile = computed(() => this.service?.enableMobile() ?? false);
  protected readonly mobileSize = signal(false);
  protected readonly focusable = computed(
    () => !this.mobileSize() || !this.enableMobile() || !this.isCollapsed()
  );
  protected readonly icons = addIcons({ elementDoubleLeft, elementDoubleRight });
  /**
   * The $rpanel-transition-duration in the style is 0.5 seconds.
   * For the animation we need to wait until the resize is done.
   */
  private readonly resizeAnimationDelay = 500;
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(SiSidePanelService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private expandedTimeout: any;

  constructor() {
    const accordionHcollapse = inject(SiAccordionHCollapseService);
    this.service.isOpen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      this.isCollapsed.set(!state);
      clearTimeout(this.expandedTimeout);
      this.expandedTimeout = undefined;
      if (!state) {
        this.isExpanded.set(false);
      } else {
        this.expandedTimeout = setTimeout(() => {
          this.isExpanded.set(true);
        }, this.resizeAnimationDelay / 2);
      }
      accordionHcollapse.hcollapsed.set(!state);
    });
    accordionHcollapse.open$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.service.open());
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe('(max-width: ' + BOOTSTRAP_BREAKPOINTS.smMinimum + 'px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ matches }) => {
        this.mobileSize.set(matches);
      });
  }

  protected toggleSidePanel(event?: MouseEvent): void {
    if (event?.detail !== 0) {
      // Blur except if triggered by keyboard
      (document?.activeElement as HTMLElement)?.blur();
    }
    if (this.service.isTemporaryOpen()) {
      this.service.hideTemporaryContent();
    } else {
      this.service.toggle();
    }
  }
}
