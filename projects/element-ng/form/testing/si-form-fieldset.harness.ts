/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';
import {
  SiFormItemFilter,
  SiFormItemHarness
} from '@spike-rabbit/element-ng/form/testing/si-form-item.harness';

export class SiFormFieldsetHarness extends ComponentHarness {
  static readonly hostSelector = 'si-form-fieldset';

  static with(label: string): HarnessPredicate<SiFormFieldsetHarness> {
    return new HarnessPredicate(SiFormFieldsetHarness, {
      label: label
    } as BaseHarnessFilters).addOption('label', label, harness =>
      HarnessPredicate.stringMatches(harness.getLabel(), label)
    );
  }

  private readonly getLabelElement = this.locatorFor('.form-label');
  private readonly getInvalidFeedback = this.locatorForAll('.invalid-feedback div');

  async getLabel(): Promise<string> {
    return this.getLabelElement().then(element => element.text());
  }

  async getFormField(filter: SiFormItemFilter): Promise<SiFormItemHarness> {
    return this.locatorFor(SiFormItemHarness.with(filter))();
  }

  async getErrorMessages(): Promise<string[]> {
    return this.getInvalidFeedback().then(feedbacks =>
      parallel(() => feedbacks.map(feedback => feedback.text()))
    );
  }

  async isRequired(): Promise<boolean> {
    return this.getLabelElement()
      .then(element => element?.getProperty<DOMTokenList>('classList'))
      .then(classList => !!classList?.contains('required'));
  }
}
