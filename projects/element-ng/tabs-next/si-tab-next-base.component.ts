/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import { SiIconNextComponent, addIcons, elementCancel } from '@siemens/element-ng/icon';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SI_TABSET_NEXT } from './si-tabs-tokens';

@Component({
  selector: 'si-tab-next-base',
  templateUrl: './si-tab-next.component.html',
  styleUrl: './si-tab-next.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, SiIconNextComponent, SiTranslateModule],
  host: {
    class: 'nav-link focus-inside px-5 si-title-1',
    role: 'tab',
    '[class.disabled]': 'disabledTab()',
    '[class.hidden]':
      'tabset.visibleTabIndexes().length && !tabset.visibleTabIndexes().includes(index())',
    '[attr.id]': "'tab-' + tabId",
    '[attr.aria-disabled]': 'disabledTab()',
    '[attr.tabindex]': 'tabset.focusKeyManager?.activeItem === this && !disabledTab() ? 0 : -1',
    '[attr.aria-controls]': "'content-' + tabId",
    '(keydown.arrowLeft)': 'tabset.focusPrevious()',
    '(keydown.arrowRight)': 'tabset.focusNext()',
    '(keydown.delete)': 'closeTab($event, true)'
  }
})
export abstract class SiTabNextBaseComponent<T> implements OnDestroy, FocusableOption {
  abstract readonly active: WritableSignal<boolean>;
  /** Title of the tab item. */
  readonly heading = input.required<TranslatableString>();
  /**
   * Icon of the tab item.
   * If provided, heading text will be ignored and only icon will be displayed.
   */
  readonly icon = input<string>();
  /**
   * Additional badge content. A value of
   * - `true` will render a red dot
   * - any string without a `badgeColor` will render a red dot with text
   * - any string with a `badgeColor` will render a normal badge
   */
  readonly badgeContent = input<TranslatableString | boolean>();
  /**
   * Background color of the badge.
   * If no color is provided a red dot badge will be rendered.
   */
  readonly badgeColor = input<string>();
  /**
   * Disables the tab.
   *
   * @defaultValue false
   */
  readonly disabledTab = input(false, {
    transform: booleanAttribute,
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'disabled'
  });
  /**
   * Close the current tab.
   *
   * @defaultValue false
   */
  readonly closable = input(false, {
    transform: booleanAttribute
  });
  /** Event emitter to notify when a tab is closed. */
  readonly closeTriggered = output();

  readonly badgeIsNumber = computed(() => {
    return typeof this.badgeContent !== 'boolean';
  });

  readonly tabButton = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly tabContent = viewChild('tabContent', { read: TemplateRef });

  private static tabCounter = 0;
  private retainFocus = false;
  private indexBeforeClose = -1;

  tabId = `${SiTabNextBaseComponent.tabCounter++}`;
  protected readonly icons = addIcons({ elementCancel });
  protected tabset = inject(SI_TABSET_NEXT);
  readonly index = computed(() =>
    this.tabset.tabPanels().findIndex(tab => tab.tabId === this.tabId)
  );

  isTabButtonFullyVisible(): boolean {
    const tabButton = this.tabButton.nativeElement;
    const tabsetElement = this.tabset.tabContainer().nativeElement;

    const tabButtonRect = tabButton.getBoundingClientRect();
    const tabsetRect = tabsetElement.getBoundingClientRect();
    return (
      Math.round(tabButtonRect.left) >= Math.round(tabsetRect.left) &&
      Math.round(tabButtonRect.right) <= Math.round(tabsetRect.right)
    );
  }

  ngOnDestroy(): void {
    // adjust the focus index and selected tab index if component is destroyed
    // as a side effect to close tab event
    if (this.indexBeforeClose >= 0) {
      const indexToFocus = this.getNextIndexToFocus();
      if (this.retainFocus) {
        // wait for a cycle to render the tab if not visible
        setTimeout(() => {
          this.tabset.focusKeyManager?.setActiveItem(indexToFocus);
        });
      } else if (this.indexBeforeClose >= 0 && this.active()) {
        this.tabset.focusKeyManager?.updateActiveItem(indexToFocus);
        this.tabset.tabPanels()[indexToFocus].tabButton.nativeElement.focus();
      } else {
        let selectedItemIndex = this.tabset.activeTabIndex() ?? 0;
        if (selectedItemIndex > this.indexBeforeClose) {
          selectedItemIndex--;
        }
        this.tabset.focusKeyManager?.updateActiveItem(selectedItemIndex);
        this.tabset.tabPanels()[selectedItemIndex].tabButton.nativeElement.focus();
      }
      // if this tab was the active one we need to select next tab as active
      if (this.active()) {
        const targetActiveTab = this.tabset.tabPanels()[indexToFocus];
        if (targetActiveTab) {
          targetActiveTab.activateTab();
        }
      }
      this.tabset.updateVisibleTabIndexes(indexToFocus, 'next', true);
    }
  }

  protected closeTab(event: Event, retainFocus = false): void {
    if (this.closable() && !this.disabledTab()) {
      event.stopPropagation();
      const index = this.index();
      this.closeTriggered.emit();
      this.retainFocus = retainFocus;
      this.indexBeforeClose = index;
    }
  }

  private getNextIndexToFocus(): number {
    for (let i = 0; i < this.tabset.tabPanels().length; i++) {
      // Get the actual index using modulo to wrap around
      const checkIndex = (this.indexBeforeClose + i) % this.tabset.tabPanels().length;

      if (!this.tabset.tabPanels()[checkIndex].disabledTab()) {
        return this.tabset.tabPanels()[checkIndex].index();
      }
    }
    return -1;
  }

  focus(origin?: FocusOrigin): void {
    this.tabButton.nativeElement.focus();
  }

  get disabled(): boolean {
    return this.disabledTab();
  }

  abstract activateTab(): void;
  abstract selectTab(retainFocus?: boolean): void;
}
