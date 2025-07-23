/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import { addIcons, elementCancel } from '@siemens/element-ng/icon';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SI_TABSET_NEXT } from './si-tabs-tokens';

@Directive({
  selector: '[siTabNextBase]',
  host: {
    class: 'nav-link focus-inside px-5 si-title-1',
    role: 'tab',
    '[class.disabled]': 'disabledTab()',
    '[attr.id]': "'tab-' + tabId",
    '[attr.aria-disabled]': 'disabledTab()',
    '[attr.tabindex]': 'tabset.focusKeyManager.activeItem === this && !disabledTab() ? 0 : -1',
    '[attr.aria-controls]': "'content-' + tabId",
    '(keydown.delete)': 'closeTab($event)'
  }
})
export abstract class SiTabNextBaseDirective implements OnDestroy, FocusableOption {
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

  /** @internal */
  readonly badgeIsNumber = computed(() => {
    return typeof this.badgeContent() !== 'boolean';
  });

  readonly tabButton = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly tabContent = viewChild('tabContent', { read: TemplateRef });

  private static tabCounter = 0;
  private indexBeforeClose = -1;

  /** @internal */
  tabId = `${SiTabNextBaseDirective.tabCounter++}`;
  protected readonly icons = addIcons({ elementCancel });
  protected tabset = inject(SI_TABSET_NEXT);
  /** @internal */
  readonly index = computed(() =>
    this.tabset.tabPanels().findIndex(tab => tab.tabId === this.tabId)
  );

  ngOnDestroy(): void {
    // adjust the focus index and selected tab index if component is destroyed
    // as a side effect to close tab event
    if (this.indexBeforeClose >= 0) {
      const indexToFocus = this.tabset.getNextIndexToFocus(this.indexBeforeClose);
      if (this.active()) {
        this.tabset.focusKeyManager.updateActiveItem(indexToFocus);
        this.tabset.tabPanels()[indexToFocus].tabButton.nativeElement.focus();
      } else {
        const selectedItemIndex = this.tabset.activeTabIndex() ?? 0;
        this.tabset.focusKeyManager.updateActiveItem(selectedItemIndex);
        this.tabset.tabPanels()[selectedItemIndex].focus();
      }
      // if this tab was the active one we need to select next tab as active
      if (this.active()) {
        const targetActiveTab = this.tabset.tabPanels()[indexToFocus];
        if (targetActiveTab) {
          targetActiveTab.active.set(true);
        }
      }
    }
  }

  protected closeTab(event: Event): void {
    if (this.closable() && !this.disabledTab()) {
      event.stopPropagation();
      const index = this.index();
      this.closeTriggered.emit();
      this.indexBeforeClose = index;
    }
  }

  focus(origin?: FocusOrigin): void {
    this.tabButton.nativeElement.focus({ preventScroll: true });
    // The element is not fully scrolled into view when focused. So we prevent and scroll it manually.
    this.tabButton.nativeElement.scrollIntoView({
      inline: 'nearest',
      block: 'nearest',
      behavior: 'instant'
    });
  }

  get disabled(): boolean {
    return this.disabledTab();
  }

  selectTab(retainFocus?: boolean): void {
    this.tabset.focusKeyManager.updateActiveItem(this.index());
    if (retainFocus) {
      // We need the timeout to wait for cdkMenu to restore the focus before we move it again.
      setTimeout(() => this.focus());
    }
  }
}
