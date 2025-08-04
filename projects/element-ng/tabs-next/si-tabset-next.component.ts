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
  inject,
  INJECTOR,
  signal
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
export class SiTabsetNextComponent {
  /** @internal */
  readonly activeTab = computed(() => this.tabPanels().find(tab => tab.active()));

  /** @internal */
  readonly tabPanels = contentChildren(SiTabNextBaseDirective);

  /** @internal */
  focusKeyManager = new FocusKeyManager(this.tabPanels, inject(INJECTOR))
    .withHorizontalOrientation(isRTL() ? 'rtl' : 'ltr')
    .withWrap(true);

  /** @internal */
  protected readonly showMenuButton = signal(false);

  protected tabIsLink(tab: unknown): tab is SiTabNextLinkComponent {
    return tab instanceof SiTabNextLinkComponent;
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
