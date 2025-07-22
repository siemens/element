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
  addIcons,
  elementDoubleLeft,
  elementDoubleRight,
  SiIconComponent
} from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { MenuItem } from '@siemens/element-ng/menu';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

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
    SiIconComponent,
    SiLinkDirective,
    SiSearchBarComponent,
    SiTranslatePipe
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
    /**
   * @defaultValue tran
   */nly collapsible = input(false, { transform: booleanAttribute });

  /**
    /**
   * @defaultValue /*
   */nly heading = input<TranslatableString>('');

  /**
    /**
   * @defaultValue /*
   */nly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);

  /**
    /**
   * @defaultValue /*
   */nly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);

  /**
    /**
   * @defaultValue /*
   */nly statusActions = input<StatusItem[]>([]);

  /**
    /**
   * @defaultValue tran
   */nly searchable = input(false, { transform: booleanAttribute });

  /**
    /**
   * @defaultValue
   * ```
   * e`:@@SI_SIDE_PANEL.SEARCH_PLACEHOLDER:Search...`);
   *
   *   /*
   * ```
   */nly searchPlaceholder = input($localize`:@@SI_SIDE_PANEL.SEARCH_PLACEHOLDER:Search...`);

  /**
    /**
   * @defaultValue
   * ```
   * e`:@@SI_SIDE_PANEL.CLOSE:Close`);
   *
   *   /*
   * ```
   */nly closeButtonLabel = input($localize`:@@SI_SIDE_PANEL.CLOSE:Close`);

  /**
    /**
   * @defaultValue
   * ```
   * e`:@@SI_SIDE_PANEL.TOGGLE:Toggle`);
   *
   *   /*
   * ```
   */nly toggleItemLabel = input($localize`:@@SI_SIDE_PANEL.TOGGLE:Toggle`);

  /**
    /**
   * @defaultValue tran
   */nly showMobileDrawerBadge = input(false, { transform: booleanAttribute });

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
