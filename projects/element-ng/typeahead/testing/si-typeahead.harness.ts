/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, ElementDimensions, parallel } from '@angular/cdk/testing';

import { SiTypeaheadHarnessFilters } from './si-typeahead-harness-filters';
import { SiTypeaheadItemHarness } from './si-typeahead-item.harness';

/** Harness for interacting with si-typeahead in tests. */
export class SiTypeaheadHarness extends ComponentHarness {
  static hostSelector = 'si-typeahead';

  private readonly list = this.locatorFor('ul.typeahead');
  private readonly loadingSpinner = this.locatorForOptional('.loading');

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

  /** Whether the typeahead shows the loading state with no matches. */
  async isEmptyLoading(): Promise<boolean> {
    return (await this.list()).hasClass('empty-loading');
  }

  /** Whether a loading spinner is visible in the overlay. */
  async hasLoadingSpinner(): Promise<boolean> {
    return !!(await this.loadingSpinner());
  }
}
