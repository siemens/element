/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectOption } from '@siemens/element-ng/select';
import { SiSelectHarness } from '@siemens/element-ng/select/testing';
import { userEvent } from 'vitest/browser';

import { SiThresholdComponent, ThresholdStep } from './index';

@Component({
  imports: [SiThresholdComponent],
  template: `
    <si-threshold
      [options]="options()"
      [unit]="unit()"
      [canAddRemoveSteps]="canAddRemoveSteps()"
      [horizontalLayout]="horizontalLayout()"
      [maxSteps]="maxSteps()"
      [readonly]="readonly()"
      [readonlyConditions]="readonlyConditions()"
      [minValue]="minValue()"
      [maxValue]="maxValue()"
      [stepSize]="stepSize()"
      [showDecIncButtons]="showDecIncButtons()"
      [validation]="validation()"
      [useAliasForStepValues]="useAliasForStepValues()"
      [(thresholdSteps)]="thresholdSteps"
      (validChange)="valid.set($event)"
      (thresholdStepsChange)="thresholdStepsChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly options = signal<SelectOption<string>[]>(undefined!);
  readonly thresholdSteps = signal<ThresholdStep[]>(undefined!);
  readonly canAddRemoveSteps = signal(true);
  readonly maxSteps = signal<number>(undefined!);
  readonly horizontalLayout = signal<boolean>(undefined!);
  readonly readonly = signal(false);
  readonly readonlyConditions = signal(false);
  readonly minValue = signal<number>(undefined!);
  readonly maxValue = signal<number>(undefined!);
  readonly stepSize = signal<number>(undefined!);
  readonly unit = signal<string>(undefined!);
  readonly showDecIncButtons = signal<boolean>(undefined!);
  readonly validation = signal<boolean>(undefined!);
  readonly valid = signal(true);
  readonly wrap = signal(false);
  readonly useAliasForStepValues = signal(false);

  thresholdStepsChange(steps: ThresholdStep[]): void {}
}

describe('SiThresholdComponent', () => {
  const optionsList: SelectOption<string>[] = [
    {
      value: 'good',
      icon: 'element-face-happy',
      label: 'Good',
      iconColor: 'status-success',
      type: 'option'
    },
    {
      value: 'average',
      icon: 'element-face-neutral',
      label: 'Average',
      iconColor: 'status-warning',
      type: 'option'
    },
    {
      value: 'poor',
      icon: 'element-face-unhappy',
      label: 'Poor',
      iconColor: 'status-danger',
      type: 'option'
    }
  ];

  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLInputElement;
  let loader: HarnessLoader;

  const getThresholdColors = (): string[] => {
    const calculatedColors: string[] = [];
    element.querySelectorAll('.ths-option .line').forEach(item => {
      calculatedColors.push(item.classList.value.replace('line', '').trim());
    });
    return calculatedColors;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.options.set(optionsList);
    component.thresholdSteps.set([
      { value: undefined, optionValue: 'poor' },
      { value: 15, optionValue: 'average' },
      { value: 20, optionValue: 'good' },
      { value: 26, optionValue: 'average' },
      { value: 30, optionValue: 'poor' }
    ]);
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display steps', async () => {
    const steps = element.querySelectorAll<HTMLElement>('.ths-step');
    expect(steps.length).toBe(5);
    expect(steps[0].querySelector('.ths-value')).not.toBeInTheDocument();
    expect(steps[1].querySelector('.ths-value')).toBeInTheDocument();

    const childloader = await loader.getAllChildLoaders('.ths-step');

    const items = await parallel(() =>
      childloader.map(childLoader =>
        childLoader.getHarness(SiSelectHarness).then(harness => harness.getSelectedTexts())
      )
    );

    expect(items.flat()).toEqual(['Poor', 'Average', 'Good', 'Average', 'Poor']);
  });

  it('should allow to add steps when enabled', async () => {
    vi.spyOn(component, 'thresholdStepsChange');
    await fixture.whenStable();
    const add2 = element.querySelectorAll<HTMLElement>('[aria-label="Add step"]')[1];
    await userEvent.click(add2);
    await fixture.whenStable();

    expect(component.thresholdStepsChange).toHaveBeenCalled();
    expect(component.thresholdSteps().length).toBe(6);
    expect(component.thresholdSteps()[2].value).toBeUndefined();
    expect(element.querySelectorAll<HTMLElement>('.ths-step').length).toBe(6);
  });

  it('should allow to remove steps when enabled', async () => {
    vi.spyOn(component, 'thresholdStepsChange');

    await fixture.whenStable();
    const remove2 = element.querySelectorAll<HTMLElement>('[aria-label="Delete step"]')[1];
    await userEvent.click(remove2);
    await fixture.whenStable();

    expect(component.thresholdStepsChange).toHaveBeenCalled();
    expect(component.thresholdSteps().length).toBe(4);
    expect(component.thresholdSteps()[2].value).toBe(26);
    expect(element.querySelectorAll<HTMLElement>('.ths-step').length).toBe(4);
  });

  it('should prevent to add/remove steps when disabled', async () => {
    component.canAddRemoveSteps.set(false);
    await fixture.whenStable();

    expect(element.querySelectorAll<HTMLElement>('[aria-label="Add step"]').length).toBe(0);
    expect(element.querySelectorAll<HTMLElement>('[aria-label="Delete step"]').length).toBe(0);
  });

  it('should limit max. number of steps', async () => {
    component.maxSteps.set(5);
    await fixture.whenStable();
    const add2 = element.querySelectorAll<HTMLButtonElement>('[aria-label="Add step"]')[1];
    expect(add2).toBeDisabled();
  });

  it('should calculate color of steps', async () => {
    await fixture.whenStable();
    const calculatedColors: string[] = getThresholdColors();
    expect(calculatedColors).toEqual([
      'status-danger',
      'status-warning',
      'status-success',
      'status-warning',
      'status-danger'
    ]);
  });

  it('should re-calculate color of steps when changing option', async () => {
    await fixture.whenStable();

    const selectHarness = await (
      await loader.getChildLoader('.ths-step:nth-child(2)')
    ).getHarness(SiSelectHarness);
    await selectHarness.clickItemsByText('Good');

    const calculatedColors: string[] = getThresholdColors();
    expect(calculatedColors).toEqual([
      'status-danger',
      'status-success',
      'status-success',
      'status-warning',
      'status-danger'
    ]);
  });

  it('should change threshold options to readonly', async () => {
    component.readonlyConditions.set(true);
    await fixture.whenStable();
    const readonlyOptions = element.querySelectorAll<HTMLElement>('si-readonly-threshold-option');
    expect(readonlyOptions).toHaveLength(component.thresholdSteps().length);
    component.thresholdSteps().forEach((step, index) => {
      const o = (component.options() as SelectOption<unknown>[]).find(
        option => option.value === step.optionValue
      )!;
      expect(readonlyOptions[index].querySelector('span')!).toHaveTextContent(o.label!);
    });
  });

  it('should display readonly options correctly', async () => {
    component.options.set([
      { type: 'option', value: 'good', label: 'Good' },
      { type: 'option', value: 'average', label: 'Average' },
      { type: 'option', value: 'poor', label: 'Poor' }
    ]);
    component.readonly.set(true);
    await fixture.whenStable();
    const readonlyOptions = Array.from(
      element.querySelectorAll<HTMLElement>('si-readonly-threshold-option span')
    ).map(option => option.innerText);

    expect(readonlyOptions).toEqual(['Poor', 'Average', 'Good', 'Average', 'Poor']);
  });

  describe('useAliasForStepValues', () => {
    beforeEach(async () => {
      component.useAliasForStepValues.set(true);
      component.thresholdSteps.set([
        { value: undefined, optionValue: 'poor' },
        { value: 15, optionValue: 'average', aliasLabel: 'Low' },
        { value: 20, optionValue: 'good', aliasLabel: 'Medium' },
        { value: 30, optionValue: 'poor', aliasLabel: 'High' }
      ]);
      await fixture.whenStable();
    });

    it('should hide add and delete buttons', () => {
      expect(element.querySelectorAll('[aria-label="Add step"]').length).toBe(0);
      expect(element.querySelectorAll('[aria-label="Delete step"]').length).toBe(0);
    });

    it('should show readonly text inputs instead of number inputs', () => {
      const numberInputs = element.querySelectorAll('si-number-input');
      expect(numberInputs.length).toBe(0);

      const textInputs = element.querySelectorAll<HTMLInputElement>('.ths-value input[readonly]');
      expect(textInputs.length).toBe(3);
    });

    it('should display alias labels in readonly inputs', () => {
      const textInputs = element.querySelectorAll<HTMLInputElement>('.ths-value input[readonly]');
      expect(textInputs[0].value).toBe('Low');
      expect(textInputs[1].value).toBe('Medium');
      expect(textInputs[2].value).toBe('High');
    });

    it('should display empty value when aliasLabel is not set', async () => {
      component.thresholdSteps.set([
        { value: undefined, optionValue: 'poor' },
        { value: 15, optionValue: 'average' }
      ]);
      await fixture.whenStable();

      const textInputs = element.querySelectorAll<HTMLInputElement>('.ths-value input[readonly]');
      expect(textInputs.length).toBe(1);
      expect(textInputs[0].value).toBe('');
    });
  });
});
