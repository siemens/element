/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';
import { SiTypeaheadInputHarness } from '@siemens/element-ng/typeahead/testing/si-typeahead-input.harness';

import {
  SiFilteredSearchCriterionHarness,
  SiFilteredSearchHarnessFilters
} from './si-filtered-search-criterion.harness';

export class SiFilteredSearchHarness extends ComponentHarness {
  static hostSelector = 'si-filtered-search';

  private readonly clearButton = this.locatorForOptional(
    '.clear-button-container button[aria-label="Clear"]'
  );
  private readonly searchButton = this.locatorFor('button.search-button');
  readonly freeTextSearch = this.locatorFor(
    SiTypeaheadInputHarness.with({ selector: '.value-input' })
  );

  async getCriteria(
    filter: SiFilteredSearchHarnessFilters = {}
  ): Promise<SiFilteredSearchCriterionHarness[]> {
    return this.locatorForAll(SiFilteredSearchCriterionHarness.with(filter))();
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

  async clickSearchButton(): Promise<void> {
    return this.searchButton().then(button => button.click());
  }
}
