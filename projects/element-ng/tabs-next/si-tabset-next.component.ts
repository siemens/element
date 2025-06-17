/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  INJECTOR,
  output,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { ElementDimensions, SiResizeObserverModule } from '@siemens/element-ng/resize-observer';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiTabNextLinkComponent } from './si-tab-next-link.component';
import { SiTabNextComponent } from './si-tab-next.component';
import { SI_TABSET_NEXT } from './si-tabs-tokens';

/** @experimental */
export interface SiTabNextDeselectionEvent {
  /**
   * The target tab
   */
  target: SiTabNextComponent | SiTabNextLinkComponent;
  /**
   * The index of target tab
   */
  tabIndex: number;
  /**
   * To be called to prevent switching the tab
   */
  cancel: () => void;
}

interface RangeConfig {
  start: number;
  end: number;
  step: number;
}

/** @experimental */
@Component({
  selector: 'si-tabset-next',
  templateUrl: './si-tabset-next.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './si-tabset-next.component.scss',
  imports: [
    SiTranslateModule,
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    NgTemplateOutlet,
    SiResizeObserverModule,
    RouterLink
  ],
  providers: [
    {
      provide: SI_TABSET_NEXT,
      useExisting: SiTabsetNextComponent
    }
  ]
})
export class SiTabsetNextComponent implements AfterViewInit {
  /**
   * Event emitter to notify when a tab became inactive.
   */
  readonly deselect = output<SiTabNextDeselectionEvent>();

  /** @internal */
  readonly visibleTabIndexes = signal<number[]>([]);
  /** @internal */
  readonly activeTab = computed(() => {
    return this.tabPanels().find(tab => tab.active());
  });
  /** @internal */
  readonly activeTabIndex = computed(() => this.activeTab()?.index() ?? -1);

  /** @internal */
  focusKeyManager?: FocusKeyManager<SiTabNextComponent | SiTabNextLinkComponent>;

  private readonly tabPanelsLinks = contentChildren(SiTabNextLinkComponent);
  private readonly tabPanelsComponents = contentChildren(SiTabNextComponent);

  /** @internal */
  readonly tabPanels = computed(() => {
    const allTabs: (SiTabNextLinkComponent | SiTabNextComponent)[] = [
      ...this.tabPanelsLinks(),
      ...this.tabPanelsComponents()
    ];
    return allTabs;
  });
  /** @internal */
  private readonly tabContainer = viewChild.required<ElementRef<HTMLDivElement>>('tabContainer');
  readonly tabScrollContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('tabScrollContainer');

  protected readonly maxWrapperWidth = computed(() => {
    const visibleIndexes = this.visibleTabIndexes();
    return visibleIndexes.length
      ? this.tabButtons()
          .filter((_, index) => visibleIndexes.includes(index))
          .reduce((total, current) => {
            return total + current.nativeElement.clientWidth;
          }, 0)
      : undefined;
  });
  protected readonly menu = viewChild('menu', { read: CdkMenu });

  private readonly tabButtons = computed(() => {
    return this.tabPanels().map(tab => tab.tabButton);
  });

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private previousWidth = 0;
  private injector = inject(INJECTOR);

  ngAfterViewInit(): void {
    this.focusKeyManager = new FocusKeyManager(this.tabPanels, this.injector);
    // To avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.focusKeyManager?.updateActiveItem(this.tabPanels().findIndex(tab => !tab.disabledTab()));
    });
  }

  protected resize(e: ElementDimensions): void {
    if (this.previousWidth && this.previousWidth === e.width) {
      return;
    } else {
      this.previousWidth = e.width;
    }
    this.updateVisibleTabIndexes(this.activeTabIndex(), 'next', true);
  }

  protected menuOpened(): void {
    // wait for menu items to be rendered
    setTimeout(() => {
      const nextMenuItemToFocus = this.getNextIndexToFocus(this.activeTabIndex() + 1);
      const menuItems = this.menu()?.items.toArray() ?? [];
      if (nextMenuItemToFocus >= 0 && nextMenuItemToFocus < menuItems.length) {
        menuItems[nextMenuItemToFocus].focus();
        // bug in cdk as setting focus on menu item does not update focus manager active item
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const focusManager = this.menu()?.['keyManager'];
        focusManager?.updateActiveItem(nextMenuItemToFocus);
      } else {
        menuItems[0].focus();
      }
    });
  }

  protected tabIsLink(tab: unknown): tab is SiTabNextLinkComponent {
    return tab instanceof SiTabNextLinkComponent;
  }

  /** @internal */
  focusPrevious(e: Event): void {
    e.preventDefault();
    const activeItemIndex = this.focusKeyManager?.activeItemIndex;
    if (activeItemIndex! > 0) {
      this.focusKeyManager?.setPreviousItemActive();
      this.updateVisibleTabIndexes(this.focusKeyManager!.activeItemIndex!, 'previous');
      setTimeout(() => {
        this.focusKeyManager?.setActiveItem(this.focusKeyManager!.activeItemIndex!);
      });
    }
  }

  /** @internal */
  focusNext(e: Event): void {
    e.preventDefault();
    const activeItemIndex = this.focusKeyManager?.activeItemIndex;
    if (activeItemIndex! < this.tabButtons().length) {
      this.focusKeyManager?.setNextItemActive();
      this.updateVisibleTabIndexes(this.focusKeyManager!.activeItemIndex!, 'next');
      setTimeout(() => {
        this.focusKeyManager?.setActiveItem(this.focusKeyManager!.activeItemIndex!);
      });
    }
  }

  /** @internal */
  updateVisibleTabIndexes(
    startIndex: number,
    type: 'next' | 'previous',
    forceUpdate?: boolean
  ): void {
    if (startIndex < this.tabButtons().length) {
      if (!this.visibleTabIndexes().includes(startIndex) || forceUpdate) {
        let availableWidth = this.tabContainer().nativeElement.clientWidth;

        if (this.menuButton()) {
          availableWidth = availableWidth - this.menuButton()!.nativeElement.clientWidth;
        }

        let consumedWidth = 0;
        const visibleTabIndexes: number[] = [];

        const calculateConsumedWidth = (i: number): boolean => {
          consumedWidth += this.tabButtons()[i].nativeElement.clientWidth;
          if (
            visibleTabIndexes.includes(0) &&
            i === this.tabButtons().length - 1 &&
            this.menuButton()
          ) {
            availableWidth = availableWidth + this.menuButton()!.nativeElement.clientWidth;
          }
          if (consumedWidth <= availableWidth) {
            visibleTabIndexes.push(i);
            return false;
          } else {
            consumedWidth -= this.tabButtons()[i].nativeElement.clientWidth;
            return true;
          }
        };

        const isNextDirection: boolean = type === 'next';

        // First pass: Calculate in primary direction
        const primaryRange = this.getPrimaryRange(
          isNextDirection,
          startIndex,
          this.tabButtons().length
        );
        this.traverseRange(primaryRange, calculateConsumedWidth);

        // Second pass: Calculate in opposite direction if space available
        if (consumedWidth < availableWidth) {
          const secondaryRange = this.getSecondaryRange(
            isNextDirection,
            startIndex,
            this.tabButtons().length
          );
          this.traverseRange(secondaryRange, calculateConsumedWidth);
        }
        visibleTabIndexes.sort((a, b) => a - b);
        this.visibleTabIndexes.set(visibleTabIndexes);
        this.scrollFirstVisibleTabIntoView();
      }
    }
  }

  /** @internal */
  getNextIndexToFocus(currentIndex: number): number {
    for (let i = 0; i < this.tabPanels().length; i++) {
      // Get the actual index using modulo to wrap around
      const checkIndex = (currentIndex + i) % this.tabPanels().length;

      if (!this.tabPanels()[checkIndex].disabledTab()) {
        return this.tabPanels()[checkIndex].index();
      }
    }
    return -1;
  }

  private getPrimaryRange(
    isNextDirection: boolean,
    startIndex: number,
    length: number
  ): RangeConfig {
    return isNextDirection
      ? { start: startIndex, end: 0, step: -1 }
      : { start: startIndex, end: length - 1, step: 1 };
  }

  private getSecondaryRange(
    isNextDirection: boolean,
    startIndex: number,
    length: number
  ): RangeConfig {
    return isNextDirection
      ? { start: startIndex + 1, end: length - 1, step: 1 }
      : { start: startIndex - 1, end: 0, step: -1 };
  }

  private traverseRange(range: RangeConfig, callback: (index: number) => boolean): void {
    const condition = (i: number): boolean => (range.step > 0 ? i <= range.end : i >= range.end);

    for (let i = range.start; condition(i); i += range.step) {
      if (callback(i)) {
        break;
      }
    }
  }

  private scrollFirstVisibleTabIntoView(): void {
    setTimeout(() => {
      this.tabButtons().at(this.visibleTabIndexes()[0])?.nativeElement.scrollIntoView({
        behavior: 'instant',
        inline: 'start',
        block: 'nearest'
      });
    });
  }
}
