/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, ElementDimensions, HarnessPredicate } from '@angular/cdk/testing';

import { SiTypeaheadHarnessFilters } from './si-typeahead-harness-filters';

/** Harness for interacting with si-typeahead items in tests. */
export class SiTypeaheadItemHarness extends ComponentHarness {
  static hostSelector = 'li';

  protected readonly input = this.locatorForOptional('input');
  readonly icon = this.locatorForOptional('si-icon-next div');

  static with(options: SiTypeaheadHarnessFilters = {}): HarnessPredicate<SiTypeaheadItemHarness> {
    return new HarnessPredicate(SiTypeaheadItemHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption(
        'isActive',
        options.isActive,
        async (harness, isActive) => (await harness.isActive()) === isActive
      )
      .addOption(
        'isSelected',
        options.isSelected,
        async (harness, isSelected) => (await harness.isSelected()) === isSelected
      );
  }

  /** Gets the text of the typeahead item. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets whether the option is active. */
  async isActive(): Promise<boolean> {
    return (await this.host()).hasClass('active');
  }

  /** Selects the typeahead item. */
  async select(): Promise<void> {
    return (await this.host()).click();
  }

  /** Gets whether the option is selected. */
  async isSelected(): Promise<boolean> {
    return this.host()
      .then(async host => host.getAttribute('aria-selected'))
      .then(selected => selected === 'true');
  }

  /** Gets the dimensions of the li element */
  async getDimensions(): Promise<ElementDimensions> {
    return (await this.host()).getDimensions();
  }
}
