/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, ElementDimensions, parallel } from '@angular/cdk/testing';

import { SiTypeaheadHarnessFilters } from './si-typeahead-harness-filters';
import { SiTypeaheadItemHarness } from './si-typeahead-item.harness';

/** Harness for interacting with si-typeahead in tests. */
export class SiTypeaheadHarness extends ComponentHarness {
  static hostSelector = 'si-typeahead';

  /**
   * Gets the currently shown items (empty list if the typeahead is closed).
   * @param filter - Optionally filters which items are included.
   */
  async getItems(filter: SiTypeaheadHarnessFilters = {}): Promise<SiTypeaheadItemHarness[]> {
    return this.locatorForAll(SiTypeaheadItemHarness.with(filter))();
  }

  /**
   * Gets all labels displayed in typeahead.
   * @param filter - Optionally filters which items are included.
   */
  async getItemLabels(filter: SiTypeaheadHarnessFilters = {}): Promise<string[]> {
    const items = await this.getItems(filter);
    return parallel(() => items.map(e => e.getText()));
  }

  /*
   * Get the dimension of the typeahead component.
   */
  async getDimensions(): Promise<ElementDimensions> {
    return (await this.host()).getDimensions();
  }
}
