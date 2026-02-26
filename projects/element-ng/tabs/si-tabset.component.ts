/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  INJECTOR,
  input,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { elementOptions } from '@siemens/element-icons';
import { isRTL } from '@siemens/element-ng/common';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabBaseDirective } from './si-tab-base.directive';
import { SiTabContentComponent } from './si-tab-content.component';
import { SiTabLinkComponent } from './si-tab-link.component';
import { SI_TABSET } from './si-tabs-tokens';

/**
 * A component to group multiple tabs together.
 * Can either be used with {@link SiTabLinkComponent} or {@link SiTabComponent} components.
 */
@Component({
  selector: 'si-tabset',
  imports: [
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    NgTemplateOutlet,
    SiResizeObserverModule,
    RouterLink,
    SiTabBadgeComponent,
    SiIconComponent
  ],
  templateUrl: './si-tabset.component.html',
  styleUrl: './si-tabset.component.scss',
  providers: [
    {
      provide: SI_TABSET,
      useExisting: SiTabsetComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTabsetComponent {
  protected readonly icons = addIcons({ elementOptions });

  /**
   * Optional reference to an external {@link SiTabContentComponent} where the tab panel
   * will be rendered instead of inline within the tabset.
   *
   * When set, the tabset will not render its own tab panel container.
   * The referenced `si-tab-content` component will render the `role="tabpanel"` element
   * with proper ARIA attributes linked to the active tab.
   */
  readonly content = input<SiTabContentComponent>();

  /** @internal */
  readonly activeTab = computed(() => this.tabPanels().find(tab => tab.active()));

  /**
   * The index of the currently active tab, or `-1` if no tab is active.
   */
  readonly activeIndex = computed(() => {
    const active = this.activeTab();
    return active ? this.tabPanels().indexOf(active) : -1;
  });

  /** @internal */
  readonly tabPanels = contentChildren(SiTabBaseDirective);

  /** @internal */
  focusKeyManager = new FocusKeyManager(this.tabPanels, inject(INJECTOR))
    .withHorizontalOrientation(isRTL() ? 'rtl' : 'ltr')
    .withWrap(true);

  /** @internal */
  protected readonly showMenuButton = signal(false);

  protected tabIsLink(tab: unknown): tab is SiTabLinkComponent {
    return tab instanceof SiTabLinkComponent;
  }

  constructor() {
    // Push ARIA attributes to external content component when active tab changes.
    effect(() => {
      const contentRef = this.content();
      const active = this.activeTab();
      if (contentRef) {
        contentRef.panelId.set(active ? `content-${active.tabId}` : undefined);
        contentRef.labelledBy.set(active ? `tab-${active.tabId}` : undefined);
      }
    });

    effect(() => {
      if (this.showMenuButton() && this.activeTab()) {
        // wait for menu button to render on DOM
        setTimeout(() => {
          this.activeTab()?.scrollTabIntoView();
        });
      }
    });
  }

  /** @internal */
  removedTabByUser(index: number, active?: boolean): void {
    // The tab was already removed from the tabPanels list when this function is called.
    // We need to:
    // - focus another tab if the closed one was focused
    // - activate another tab if the closed one was active
    // If the closed tab was not focussed, there is no need to restore the focus as it could only be closed by mouse.
    for (let i = 0; i < this.tabPanels().length; i++) {
      // Get the actual index using modulo to wrap around
      const checkIndex = (index + i) % this.tabPanels().length;
      const checkTab = this.tabPanels()[checkIndex];
      if (!checkTab.disabledTab()) {
        if (this.focusKeyManager.activeItemIndex === index) {
          this.focusKeyManager.setActiveItem(checkIndex);
        }
        if (active) {
          checkTab.selectTab(true);
        }
        return;
      }
    }
  }

  protected resizeContainer(width: number, scrollWidth: number): void {
    // 48px is the width of the menu button.
    this.showMenuButton.set(scrollWidth > width + (this.showMenuButton() ? 48 : 0));
  }

  protected keydown(event: KeyboardEvent): void {
    this.focusKeyManager.onKeydown(event);
  }
}
