/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AsyncFactoryFn,
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  parallel,
  TestElement,
  TestKey
} from '@angular/cdk/testing';
import { SiDatepickerComponentHarness } from '@spike-rabbit/element-ng/datepicker/testing/si-datepicker.harness';
import { SiTypeaheadHarnessFilters } from '@spike-rabbit/element-ng/typeahead/testing/si-typeahead-harness-filters';
import { SiTypeaheadItemHarness } from '@spike-rabbit/element-ng/typeahead/testing/si-typeahead-item.harness';
import { SiTypeaheadHarness } from '@spike-rabbit/element-ng/typeahead/testing/si-typeahead.harness';

/** A set of criteria that can be used to filter a list of criteria. */
export interface SiFilteredSearchHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the item. */
  labelText?: string | RegExp;
  isValid?: boolean;
  isValidValue?: boolean;
}

export class SiFilteredSearchCriterionHarness extends ComponentHarness {
  static hostSelector = '.criteria';

  private readonly _label = this.locatorFor('.criterion-label');
  private readonly clearButton = this.locatorForOptional('button[aria-label="Clear"]');

  /**
   * Gets operator harness if the criterion has an operator.
   */
  readonly operator = this.locatorForOptional(SiFilteredSearchOperatorHarness);
  /**
   * Gets value harness if the criterion has a value.
   */
  readonly value = this.locatorForOptional(SiFilteredSearchValueHarness);

  /**
   * Gets a list of fields inside the filtered search.
   * @param filters - Optionally filters which cells are included.
   */
  static with(
    filters: SiFilteredSearchHarnessFilters = {}
  ): HarnessPredicate<SiFilteredSearchCriterionHarness> {
    return new HarnessPredicate(SiFilteredSearchCriterionHarness, filters)
      .addOption('labelText', filters.labelText, (harness, text) =>
        HarnessPredicate.stringMatches(harness.label(), text)
      )
      .addOption(
        'isValid',
        filters.isValid,
        async (harness, isValid) => (await harness.isValid()) === isValid
      )
      .addOption(
        'isValidValue',
        filters.isValidValue,
        async (harness, isValidValue) => (await harness.isValidValue()) === isValidValue
      );
  }

  /** Reads the current label text */
  async label(): Promise<string> {
    return (await this._label()).text();
  }

  async clickLabel(): Promise<void> {
    return (await this._label()).click();
  }

  async clickClearButton(): Promise<void> {
    const clearButton = await this.clearButton();
    if (!clearButton) {
      throw Error('Clear button is not visible');
    }
    return await clearButton.click();
  }

  async clearButtonVisible(): Promise<boolean> {
    return (await this.clearButton()) !== null;
  }

  /** Whether the criterion is valid. */
  async isValid(): Promise<boolean> {
    const invalid = (await this.host()).hasClass('invalid-criterion');
    return !(await invalid);
  }

  /** Whether the criterion value is valid. */
  async isValidValue(): Promise<boolean> {
    const valueElement = await this.value();
    return await valueElement!.isValidValue();
  }
}

/**
 * Share functionality between operator and value harnesses.
 */
export abstract class SiFilteredSearchSectionBase extends ComponentHarness {
  protected abstract inputSelector: string;
  protected abstract labelSelector: string;

  protected readonly typeaheadOverlay =
    this.documentRootLocatorFactory().locatorForOptional(SiTypeaheadHarness);

  protected getInput(): AsyncFactoryFn<TestElement | null> {
    return this.locatorForOptional(this.inputSelector);
  }

  protected getLabel(): AsyncFactoryFn<TestElement | null> {
    return this.locatorForOptional(this.labelSelector);
  }

  async text(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string | null> {
    const input = await this.getInput()();
    return (await input?.getProperty<string>('value')) ?? null;
  }

  /**
   * Clear input field and returns a promise that indicates when the
   * action is complete.
   */
  async clearText(): Promise<void> {
    const input = await this.getInput()();
    return input?.clear();
  }

  /** Click on the label. */
  async click(): Promise<void> {
    return (await this.getLabel()())?.click();
  }

  /**
   * Focuses the input and returns a promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<void> {
    const input = await this.getInput()();
    await input?.focus();
    await input?.dispatchEvent('focusin');
  }

  async blur(): Promise<void> {
    const input = await this.getInput()();
    await input?.blur();
    await input?.dispatchEvent('focusout');
  }

  async hasFocs(): Promise<boolean> {
    const input = await this.getInput()();
    return input?.isFocused() ?? false;
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    const input = await this.getInput()();
    return await input?.sendKeys(...keys);
  }

  /** Only sets the value. Does not trigger any events. */
  async setValue(value: string): Promise<void> {
    const input = await this.getInput()();
    return input?.setInputValue(value);
  }

  /**
   * Get a list of visible labels shown in the overlay or null in case the overlay is not visible.
   */
  async getItemLabels(filter: SiTypeaheadHarnessFilters = {}): Promise<null | readonly string[]> {
    const overlay = await this.typeaheadOverlay();
    if (!overlay) {
      return null;
    }
    return overlay.getItemLabels(filter);
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

  async isEditable(): Promise<boolean> {
    return (await this.getInput()()) !== null;
  }
}

export class SiFilteredSearchOperatorHarness extends SiFilteredSearchSectionBase {
  static hostSelector = '.criterion-operator-section';
  override inputSelector = 'input.operator-input';
  override labelSelector = '.criterion-operator-text';
}

export class SiFilteredSearchValueHarness extends SiFilteredSearchSectionBase {
  static hostSelector = '.criterion-value-section';
  override inputSelector = 'input';
  override labelSelector = '.criterion-value-text';

  readonly datepicker = this.documentRootLocatorFactory().locatorForOptional(
    SiDatepickerComponentHarness
  );

  /**
   * Get a list of typeahead items shown in the overlay or null in case the overlay is not visible.
   */
  async getItems(
    filter: SiTypeaheadHarnessFilters = {}
  ): Promise<null | readonly SiTypeaheadItemHarness[]> {
    const overlay = await this.typeaheadOverlay();
    if (!overlay) {
      return null;
    }
    return overlay.getItems(filter);
  }

  /** Whether the criterion value is valid. */
  async isValidValue(): Promise<boolean> {
    return this.host()
      .then(host => host.hasClass('invalid-criterion'))
      .then(invalid => !invalid);
  }
}
