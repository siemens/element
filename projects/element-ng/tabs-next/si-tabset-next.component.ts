/**
 * Copyright (c) Siemens 2016 - 2025
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
  inject,
  INJECTOR,
  output,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isRTL } from '@siemens/element-ng/common';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabNextBaseDirective } from './si-tab-next-base.directive';
import { SiTabNextLinkComponent } from './si-tab-next-link.component';
import { SI_TABSET_NEXT } from './si-tabs-tokens';

/** @experimental */
export interface SiTabNextDeselectionEvent {
  /**
   * The target tab
   */
  target: SiTabNextBaseDirective;
  /**
   * The index of target tab
   */
  tabIndex: number;
  /**
   * To be called to prevent switching the tab
   */
  cancel: () => void;
}

/** @experimental */
@Component({
  selector: 'si-tabset-next',
  imports: [
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    NgTemplateOutlet,
    SiResizeObserverModule,
    RouterLink,
    SiTabBadgeComponent
  ],
  templateUrl: './si-tabset-next.component.html',
  styleUrl: './si-tabset-next.component.scss',
  providers: [
    {
      provide: SI_TABSET_NEXT,
      useExisting: SiTabsetNextComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTabsetNextComponent implements AfterViewInit {
  /**
   * Event emitter to notify when a tab became inactive.
   */
  readonly deselect = output<SiTabNextDeselectionEvent>();

  /** @internal */
  readonly activeTab = computed(() => {
    return this.tabPanels().find(tab => tab.active());
  });
  /** @internal */
  readonly activeTabIndex = computed(() => this.activeTab()?.index() ?? -1);

  readonly tabPanels = contentChildren(SiTabNextBaseDirective);

  /** @internal */
  focusKeyManager = new FocusKeyManager(this.tabPanels, inject(INJECTOR))
    .withHorizontalOrientation(isRTL() ? 'rtl' : 'ltr')
    .withWrap(true);

  /** @internal */

  protected readonly menu = viewChild(CdkMenu);
  protected readonly showMenuButton = signal(false);

  ngAfterViewInit(): void {
    // To avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.focusKeyManager.updateActiveItem(this.tabPanels().findIndex(tab => !tab.disabledTab()));
    });
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

  protected resizeContainer(width: number, scrollWidth: number): void {
    // 48px is the width of the menu button.
    this.showMenuButton.set(scrollWidth > width + (this.showMenuButton() ? 48 : 0));
  }

  protected keydown(event: KeyboardEvent): void {
    this.focusKeyManager.onKeydown(event);
  }
}
