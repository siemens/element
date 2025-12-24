/**
 * Copyright (c) Siemens 2016 - 2025
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
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isRTL } from '@siemens/element-ng/common';
import { addIcons, elementOptions, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiResizeObserverModule } from '@siemens/element-ng/resize-observer';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabBaseDirective } from './si-tab-base.directive';
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

  /** @internal */
  readonly activeTab = computed(() => this.tabPanels().find(tab => tab.active()));

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
