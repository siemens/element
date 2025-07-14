/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  parallel,
  TestKey
} from '@angular/cdk/testing';

export interface SiFormItemFilter extends BaseHarnessFilters {
  label?: string;
}

export class SiFormItemHarness extends ComponentHarness {
  static readonly hostSelector = 'si-form-item';

  static with(predicate: SiFormItemFilter): HarnessPredicate<SiFormItemHarness> {
    return new HarnessPredicate(SiFormItemHarness, predicate).addOption(
      'label',
      predicate.label,
      async (harness, label) =>
        (await HarnessPredicate.stringMatches(harness.getLabel() as Promise<string>, label)) ||
        (await HarnessPredicate.stringMatches(
          harness.getFormCheckLabel() as Promise<string>,
          label
        ))
    );
  }

  private readonly getLabelElement = this.locatorForOptional('.form-label');
  private readonly getFormCheckLabelElement = this.locatorForOptional('.form-check-label');
  private readonly getInvalidFeedback = this.locatorForAll('.invalid-feedback div');
  private readonly getFormCheckElement = this.locatorForOptional('input.form-check-input');
  private readonly getFormTextInputElement = this.locatorForOptional('input.form-control');

  async getLabel(): Promise<string | undefined> {
    return this.getLabelElement().then(element => element?.text());
  }

  async getFormCheckLabel(): Promise<string | undefined> {
    return this.getFormCheckLabelElement().then(element => element?.text());
  }

  async getErrorMessages(): Promise<string[]> {
    return this.getInvalidFeedback().then(feedbacks =>
      parallel(() => feedbacks.map(feedback => feedback.text()))
    );
  }

  async toggleCheck(): Promise<void> {
    return this.getFormCheckElement().then(element => element!.click());
  }

  async getCheckValue(): Promise<string> {
    return this.getFormCheckElement().then(element => element!.getProperty('value'));
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    return this.getFormTextInputElement().then(element => element!.sendKeys(...keys));
  }

  async isRequired(): Promise<boolean> {
    return this.getLabelElement()
      .then(element => element?.getProperty<DOMTokenList>('classList'))
      .then(classList => !!classList?.contains('required'));
  }
}
