/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiAccordionHCollapseService } from '@siemens/element-ng/accordion';
import { MenuItem as MenuItemLegacy } from '@siemens/element-ng/common';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import {
  addIcons,
  elementCancel,
  elementDoubleLeft,
  elementDoubleRight,
  SiIconComponent
} from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { MenuItem } from '@siemens/element-ng/menu';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';
import { timer } from 'rxjs';

import { SiSidePanelService } from './si-side-panel.service';
import { SidePanelDisplayMode, SidePanelNavigateConfig } from './side-panel.model';

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
    SiIconComponent,
    SiLinkDirective,
    RouterLink,
    SiSearchBarComponent,
    SiTranslatePipe
  ],
  templateUrl: './si-side-panel-content.component.html',
  styleUrl: './si-side-panel-content.component.scss',
  providers: [SiAccordionHCollapseService],
  host: {
    '[class.collapsed]': 'isCollapsed()',
    '[class.expanded]': 'isExpanded()',
    '[class.enable-mobile]': 'enableMobile()',
    '[class.rpanel-fullscreen-overlay]': 'isFullscreen()'
  }
})
export class SiSidePanelContentComponent implements OnInit {
  /**
   * @deprecated This input is no longer used. The collapsible state is managed by the SiSidePanelService.
   * This input will be removed in a future major version.
   * @defaultValue undefined
   */
  readonly collapsibleInput = input(undefined, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'collapsible',
    transform: booleanAttribute
  });
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
   * t(() => $localize`:@@SI_SIDE_PANEL.SEARCH_PLACEHOLDER:Search...`)
   * ```
   */
  readonly searchPlaceholder = input(
    t(() => $localize`:@@SI_SIDE_PANEL.SEARCH_PLACEHOLDER:Search...`)
  );

  /**
   * Aria label for close button. Needed for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SIDE_PANEL.CLOSE:Close`)
   * ```
   */
  readonly closeButtonLabel = input(t(() => $localize`:@@SI_SIDE_PANEL.CLOSE:Close`));

  /**
   * Toggle icon aria-label, required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`)
   * ```
   */
  readonly toggleItemLabel = input(t(() => $localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`));

  /**
   * Enter fullscreen aria-label, required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SIDE_PANEL.ENTER_FULLSCREEN:Enter fullscreen`)
   * ```
   */
  readonly enterFullscreenLabel = input(
    t(() => $localize`:@@SI_SIDE_PANEL.ENTER_FULLSCREEN:Enter fullscreen`)
  );

  /**
   * Exit fullscreen aria-label, required for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SIDE_PANEL.EXIT_FULLSCREEN:Exit fullscreen`)
   * ```
   */
  readonly exitFullscreenLabel = input(
    t(() => $localize`:@@SI_SIDE_PANEL.EXIT_FULLSCREEN:Exit fullscreen`)
  );

  /**
   * Show a badge on the mobile drawer indicating a new alert or notification
   *
   * @defaultValue false
   */
  readonly showMobileDrawerBadge = input(false, { transform: booleanAttribute });

  /**
   * Display mode for side panel - enables navigate or overlay functionality
   */
  readonly displayMode = input<SidePanelDisplayMode>();

  /**
   * Configuration for navigate mode
   */
  readonly navigateConfig = input<SidePanelNavigateConfig>();

  /**
   * Output for search bar input
   */
  readonly searchEvent = output<string>();

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });
  protected readonly service = inject(SiSidePanelService);
  protected readonly isCollapsed = signal(false);
  protected readonly isExpanded = signal(true);
  protected readonly isFullscreen = signal(false);
  protected readonly enableMobile = computed(() => this.service?.enableMobile() ?? false);
  protected readonly collapsible = computed(() => {
    return this.collapsibleInput() ?? this.service?.collapsible() ?? false;
  });
  protected readonly mobileSize = signal(false);
  protected readonly focusable = computed(
    () => !this.mobileSize() || !this.enableMobile() || !this.isCollapsed()
  );
  protected readonly icons = addIcons({ elementCancel, elementDoubleLeft, elementDoubleRight });
  /**
   * The $rpanel-transition-duration in the style is 0.5 seconds.
   * For the animation we need to wait until the resize is done.
   */
  private readonly resizeAnimationDelay = 500;
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private expandedTimeout: any;

  constructor() {
    const accordionHcollapse = inject(SiAccordionHCollapseService);

    this.service.isFullscreen$.pipe(takeUntilDestroyed()).subscribe(fullscreen => {
      this.isFullscreen.set(fullscreen);
    });

    this.service.isOpen$.pipe(takeUntilDestroyed()).subscribe(state => {
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
    });

    effect(() => {
      if (this.collapsible()) {
        accordionHcollapse.hcollapsed.set(this.isCollapsed());
      }
    });

    effect(() => {
      if (this.isCollapsed() && !this.service.isTemporaryOpen() && this.isFullscreen()) {
        timer(this.resizeAnimationDelay)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.service.setFullscreen(false);
          });
      }
    });

    accordionHcollapse.open$.pipe(takeUntilDestroyed()).subscribe(() => this.service.open());
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe('(max-width: ' + BOOTSTRAP_BREAKPOINTS.smMinimum + 'px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ matches }) => {
        this.mobileSize.set(matches);
      });
  }

  /**
   * Toggle fullscreen overlay mode
   */
  toggleFullscreen(): void {
    if (this.isCollapsed() && !this.service.isTemporaryOpen()) {
      return;
    }
    this.service.toggleFullscreen();
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
