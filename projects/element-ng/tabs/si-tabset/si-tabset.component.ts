/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  viewChildren,
  viewChild
} from '@angular/core';
import { isRTL, WebComponentContentChildren } from '@siemens/element-ng/common';
import {
  elementCancel,
  elementLeft3,
  elementRight3,
  addIcons,
  SiIconComponent,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { asyncScheduler, Subscription } from 'rxjs';
import { first, observeOn } from 'rxjs/operators';

import { SiTabComponent } from '../si-tab/si-tab.component';

export interface SiTabDeselectionEvent {
  /**
   * The target tab
   */
  target: SiTabComponent;
  /**
   * The index of target tab
   */
  tabIndex: number;
  /**
   * To be called to prevent switching the tab
   */
  cancel: () => void;
}

const SCROLL_INCREMENT = 55;

@Component({
  selector: 'si-tabset',
  imports: [
    NgClass,
    SiIconNextComponent,
    SiIconComponent,
    SiResizeObserverDirective,
    SiTranslateModule
  ],
  templateUrl: './si-tabset.component.html',
  styleUrl: './si-tabset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTabsetComponent implements AfterViewInit, OnDestroy {
  /**
   * Contains the current tab components.
   */
  @WebComponentContentChildren(SiTabComponent)
  @ContentChildren(SiTabComponent)
  protected tabPanels!: QueryList<SiTabComponent>;

  /**
   * Component variable to indicate if scrolling is necessary or the container is big enough to display all tabs.
   */
  protected scrollable = false;

  protected xPos = 0;
  protected endArrowDisabled = false;
  protected focusedTabIndex?: number;
  protected readonly icons = addIcons({ elementCancel, elementLeft3, elementRight3 });

  /**
   * If selectDefaultTab is passed as 'false', this implies no default tab selection
   * i.e. on initial load of tabset component no tab gets selected.
   *
   * @defaultValue true
   */
  @Input({ transform: booleanAttribute }) selectDefaultTab = true;

  /**
   * Sets a selected tab index. This will activate the tab of the provided
   * index, activates the tab and fires a notification about the change.
   * If index is passed as -1 i.e. `selectedTabIndex = -1`, this implies to clear all tab selection.
   * @defaultref {@link _selectedTabIndex}
   */
  @Input()
  set selectedTabIndex(tabIndex: number) {
    if (this.initialized && this.tabPanels.get(tabIndex)) {
      this.selectTab(this.tabPanels.get(tabIndex)!);
    } else {
      this.initTabIndex = tabIndex;
    }
  }

  /**
   * Returns the currently selected tab index.
   */
  get selectedTabIndex(): number {
    return this.tabPanels?.toArray().findIndex(tab => tab.active());
  }

  /** Define an optional max-width in px for the tab buttons. The minimum value is `100`. */
  @Input() tabButtonMaxWidth?: number;

  /**
   * Event emitter to notify about selected tab index changes. You can either
   * use bi-directional binding with [(selectedTabIndex)] or separate both with
   * [selectedTabIndex]=... and (selectedTabIndexChange)=...
   */
  @Output() readonly selectedTabIndexChange = new EventEmitter<number>();

  /**
   * Event emitter to notify when a tab became inactive.
   */
  @Output() readonly deselect = new EventEmitter<SiTabDeselectionEvent>();

  private initTabIndex = 0;
  private initialized = false;
  private subscription?: Subscription;
  private readonly tabContainer = viewChild.required<ElementRef>('tabContainer');
  private readonly innerTabContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('innerTabContainer');
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tabElement');
  private changeDetectorRef = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.initialized = true;
    this.subscription = this.tabPanels.changes.subscribe(() => {
      this.tabPanels.forEach(tab => tab.registerParent(this));
      this.changeDetectorRef.markForCheck();
    });
    this.tabPanels.notifyOnChanges();

    if (this.selectDefaultTab) {
      if (this.tabPanels.length) {
        queueMicrotask(() => this.selectTab(this.tabPanels.get(this.initTabIndex)!));
      } else {
        // no tabs are there yet. But maybe there will be some soon, so let's wait for it
        this.subscription.add(
          this.tabPanels.changes
            .pipe(
              first(() => !!this.tabPanels.length),
              observeOn(asyncScheduler)
            )
            .subscribe(() => {
              this.selectTab(this.tabPanels.get(this.initTabIndex)!);
              this.changeDetectorRef.markForCheck();
            })
        );
      }
    }

    setTimeout(() => {
      this.resize();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined as any;
  }

  /** @internal */
  notifyChildrenChanged(): void {
    this.changeDetectorRef.markForCheck();
  }

  protected isTabFocusable(index: number): boolean {
    const tab = this.tabPanels.get(index)!;
    return !tab.disabled;
  }

  protected focusNext(): void {
    do {
      this.focusedTabIndex = (this.focusedTabIndex ?? 0) + 1;
      if (this.focusedTabIndex >= this.tabs().length) {
        this.focusedTabIndex = 0;
      }
    } while (!this.isTabFocusable(this.focusedTabIndex));
    this.tabs().at(this.focusedTabIndex!)!.nativeElement.focus();
  }

  protected focusPrevious(): void {
    do {
      this.focusedTabIndex = (this.focusedTabIndex ?? 0) - 1;
      if (this.focusedTabIndex < 0) {
        this.focusedTabIndex += this.tabs().length;
      }
    } while (!this.isTabFocusable(this.focusedTabIndex));
    this.tabs().at(this.focusedTabIndex!)!.nativeElement.focus();
  }

  protected resize(): void {
    this.scrollable =
      Math.round(this.tabContainer().nativeElement.offsetWidth) <
      this.innerTabContainer().nativeElement.scrollWidth;
    this.scroll(0);
  }

  /**
   * Finds the index of the provided tab and sets the index as new selected tab index
   *
   * @param selectedTab - The tab to be selected. This must already be part of the container.
   */
  protected selectTab(selectedTab: SiTabComponent): void {
    if (selectedTab?.disabled) {
      return;
    }
    const tabs = this.tabPanels.toArray();
    const newTabIndex = tabs.indexOf(selectedTab);
    const currentTabIndex = tabs.findIndex(tab => tab.active());
    let continueWithSelection = newTabIndex !== currentTabIndex;

    if (continueWithSelection && currentTabIndex !== -1) {
      const currentTab = tabs[currentTabIndex];
      const deselectEvent: SiTabDeselectionEvent = {
        target: currentTab,
        tabIndex: currentTabIndex,
        cancel: () => {
          continueWithSelection = false;
          currentTab.active.set(true);
        }
      };

      currentTab.active.set(false);
      this.deselect.emit(deselectEvent);
    }

    if (continueWithSelection) {
      selectedTab.active.set(true);
      this.changeDetectorRef.markForCheck();
      this.selectedTabIndexChange.emit(newTabIndex);
    }
  }

  /**
   * Scrolls the tab headers to the end (right in LTR).
   */
  protected scrollEnd(): void {
    this.scroll(SCROLL_INCREMENT);
  }

  /**
   * Scrolls the tab headers to the start (left in LTR).
   */
  protected scrollStart(): void {
    this.scroll(-SCROLL_INCREMENT);
  }

  private scroll(inc: number): void {
    this.xPos += inc;
    this.xPos = Math.max(
      0,
      Math.min(
        this.innerTabContainer().nativeElement.scrollWidth -
          this.innerTabContainer().nativeElement.offsetWidth,
        this.xPos
      )
    );

    this.endArrowDisabled =
      this.xPos + this.tabContainer().nativeElement.offsetWidth >=
      this.innerTabContainer().nativeElement.scrollWidth;

    this.innerTabContainer().nativeElement.style.transform = `translateX(${
      this.xPos * (isRTL() ? 1 : -1)
    }px)`;
  }

  protected mouseScroll(event: WheelEvent): void {
    if (event.deltaY < 0) {
      this.scroll(-SCROLL_INCREMENT);
    } else {
      this.scroll(SCROLL_INCREMENT);
    }

    if (this.xPos || !this.endArrowDisabled) {
      event.preventDefault();
    }
  }

  /** @internal */
  focus(index: number): void {
    this.focusedTabIndex = index;
  }

  /** @internal */
  blur(): void {
    this.focusedTabIndex = undefined;
  }

  protected closeTab(event: MouseEvent, tab: SiTabComponent): void {
    event.stopPropagation();
    let targetActiveTab: SiTabComponent | undefined;
    if (tab.active()) {
      const index = this.tabPanels.toArray().indexOf(tab);
      targetActiveTab = this.tabPanels.toArray()[index + 1] ?? this.tabPanels.toArray()[index - 1];
      if (targetActiveTab) {
        this.selectTab(targetActiveTab);
      }
    } else {
      targetActiveTab = this.tabPanels.find(otherTabs => otherTabs.active());
    }

    if (targetActiveTab) {
      // The focus will always get the next element due browser behavior.
      // Setting it to the active element solves this.
      setTimeout(() => {
        this.tabs().at(this.tabPanels.toArray().indexOf(targetActiveTab))!.nativeElement.focus();
      });
    }
    tab.closeTriggered.emit(tab);
    this.focusedTabIndex = undefined;
  }
}
