/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  BaseHarnessFilters,
  ComponentHarness,
  ElementDimensions,
  HarnessPredicate,
  parallel,
  TestKey
} from '@angular/cdk/testing';

import { SiTypeaheadHarnessFilters } from './si-typeahead-harness-filters';
import { SiTypeaheadHarness } from './si-typeahead.harness';

export class SiTypeaheadInputHarness extends ComponentHarness {
  static hostSelector = 'input.si-typeahead';

  static with(options: BaseHarnessFilters = {}): HarnessPredicate<SiTypeaheadInputHarness> {
    return new HarnessPredicate(SiTypeaheadInputHarness, options);
  }

  protected readonly typeaheadOverlay =
    this.documentRootLocatorFactory().locatorForOptional(SiTypeaheadHarness);

  protected readonly backdrop =
    this.documentRootLocatorFactory().locatorForOptional('.cdk-overlay-backdrop');

  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return await (await this.host()).getProperty<boolean>('disabled');
  }

  /** Whether the input is readonly. */
  async isReadonly(): Promise<boolean> {
    return await (await this.host()).getProperty<boolean>('readOnly');
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string> {
    // The "value" property of the native input is never undefined.
    return await (await this.host()).getProperty<string>('value');
  }

  /** Gets the id of the input. */
  async getId(): Promise<string> {
    // The input directive always assigns a unique id to the input in
    // case no id has been explicitly specified.
    return await (await this.host()).getProperty<string>('id');
  }

  /** Gets the placeholder of the input. */
  async getPlaceholder(): Promise<string> {
    // The input directive always assigns a unique id to the input in
    // case no id has been explicitly specified.
    return await (await this.host()).getProperty<string>('placeholder');
  }

  /**
   * Focuses the input and returns a promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<void> {
    const host = await this.host();
    await host.focus();
    // Ensure we dispatch the focusin event since the directive is listening to the event
    // without it the test start flickering
    return host.dispatchEvent('focusin');
  }

  /** Whether the input is focused. */
  async isFocused(): Promise<boolean> {
    return await (await this.host()).isFocused();
  }

  /**
   * Blurs the input and returns a promise that indicates when the
   * action is complete.
   */
  async blur(): Promise<void> {
    const host = await this.host();
    await host.dispatchEvent('focusout');
    return host.blur();
  }

  /**
   * Sets the value of the input. The value will be set by simulating
   * key presses that correspond to the given value.
   */
  async typeText(newValue: string): Promise<void> {
    const inputEl = await this.host();
    await inputEl.clear();
    // We don't want to send keys for the value if the value is an empty
    // string in order to clear the value. Sending keys with an empty string
    // still results in unnecessary focus events.
    if (newValue) {
      await inputEl.sendKeys(newValue);
    }

    // Some input types won't respond to key presses (e.g. `color`) so to be sure that the
    // value is set, we also set the property after the keyboard sequence. Note that we don't
    // want to do it before, because it can cause the value to be entered twice.
    return inputEl.setInputValue(newValue);
  }

  /**
   * Clear input field and returns a promise that indicates when the
   * action is complete.
   */
  async clearText(): Promise<void> {
    return (await this.host()).clear();
  }

  /**
   * Enters text or send keyboard interaction to input and returns a promise that
   * indicates when the action is complete.
   */
  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    return (await this.host()).sendKeys(...keys);
  }

  /**
   * Get a list of visible labels shown in the overlay or null in case the overlay is not visible.
   */
  async getItems(filter?: SiTypeaheadHarnessFilters): Promise<null | readonly string[]> {
    const overlay = await this.typeaheadOverlay();
    if (!overlay) {
      return null;
    }
    return overlay.getItemLabels(filter);
  }

  /**
   * Get the dimensions of the typeahead overlay.
   * @returns the dimensions of the typeahead overlay or null in case the overlay is not visible.
   */
  async getTypeaheadDimensions(): Promise<ElementDimensions | null> {
    const overlay = await this.typeaheadOverlay();
    return (await overlay?.getDimensions()) ?? null;
  }

  /**
   * Select a specific item either via index or filter.
   */
  async select(filter: SiTypeaheadHarnessFilters | number): Promise<void> {
    const overlay = await this.typeaheadOverlay();
    if (!overlay) {
      return;
    }
    if (typeof filter === 'number') {
      await (await overlay.getItems({})).at(filter)?.select();
    } else {
      const items = await overlay.getItems(filter);
      await parallel(() => items.map(item => item.select()));
    }
  }

  /**
   * Close the overlay with the resulting items.
   */
  async closeOverlay(): Promise<void> {
    return (await this.backdrop())?.click();
  }

  /**
   * Hovers the mouse over the element.
   */
  async hover(): Promise<void> {
    return (await this.host()).hover();
  }
}
