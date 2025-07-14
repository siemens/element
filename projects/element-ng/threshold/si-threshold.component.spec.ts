/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectOption, SelectOptionLegacy } from '@siemens/element-ng/select';
import { SiSelectHarness } from '@siemens/element-ng/select/testing';

import { runOnPushChangeDetection } from '../test-helpers/change-detection.helper';
import { SiThresholdComponent, ThresholdStep } from './index';

@Component({
  imports: [SiThresholdComponent],
  template: `
    <si-threshold
      [options]="options"
      [unit]="unit"
      [canAddRemoveSteps]="canAddRemoveSteps"
      [horizontalLayout]="horizontalLayout"
      [maxSteps]="maxSteps"
      [readonly]="readonly"
      [readonlyConditions]="readonlyConditions"
      [minValue]="minValue"
      [maxValue]="maxValue"
      [stepSize]="stepSize"
      [showDecIncButtons]="showDecIncButtons"
      [validation]="validation"
      [(thresholdSteps)]="thresholdSteps"
      (validChange)="valid = $event"
      (thresholdStepsChange)="thresholdStepsChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  options!: SelectOption<string>[] | SelectOptionLegacy[];
  thresholdSteps!: ThresholdStep[];
  canAddRemoveSteps = true;
  maxSteps!: number;
  horizontalLayout!: boolean;
  readonly = false;
  readonlyConditions = false;
  minValue!: number;
  maxValue!: number;
  stepSize!: number;
  unit!: string;
  showDecIncButtons!: boolean;
  validation!: boolean;
  valid = true;
  wrap = false;

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

  const getThreshodColors = (): string[] => {
    const calculatedColors: string[] = [];
    element.querySelectorAll('.ths-option .line').forEach(item => {
      calculatedColors.push(item.classList.value.replace('line', '').trim());
    });
    return calculatedColors;
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
  );

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.options = optionsList;
    component.thresholdSteps = [
      { value: undefined, optionValue: 'poor' },
      { value: 15, optionValue: 'average' },
      { value: 20, optionValue: 'good' },
      { value: 26, optionValue: 'average' },
      { value: 30, optionValue: 'poor' }
    ];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display steps', async () => {
    const steps = element.querySelectorAll<HTMLElement>('.ths-step');
    expect(steps.length).toBe(5);
    expect(steps[0].querySelector('.ths-value')).toBeFalsy();
    expect(steps[1].querySelector('.ths-value')).toBeTruthy();

    const childloader = await loader.getAllChildLoaders('.ths-step');

    const items = await parallel(() =>
      childloader.map(childLoader =>
        childLoader.getHarness(SiSelectHarness).then(harness => harness.getSelectedTexts())
      )
    );

    expect(items.flat()).toEqual(['Poor', 'Average', 'Good', 'Average', 'Poor']);
  });

  it('should allow to add steps when enabled', () => {
    spyOn(component, 'thresholdStepsChange');
    fixture.detectChanges();
    const add2 = element.querySelectorAll<HTMLElement>('[aria-label="Add step"]')[1];
    add2.click();
    fixture.detectChanges();

    expect(component.thresholdStepsChange).toHaveBeenCalled();
    expect(component.thresholdSteps.length).toBe(6);
    expect(component.thresholdSteps[2].value).toBeUndefined();
    expect(element.querySelectorAll<HTMLElement>('.ths-step').length).toBe(6);
  });

  it('should allow to remove steps when enabled', () => {
    spyOn(component, 'thresholdStepsChange');

    fixture.detectChanges();
    const remove2 = element.querySelectorAll<HTMLElement>('[aria-label="Delete step"]')[1];
    remove2.click();
    fixture.detectChanges();

    expect(component.thresholdStepsChange).toHaveBeenCalled();
    expect(component.thresholdSteps.length).toBe(4);
    expect(component.thresholdSteps[2].value).toBe(26);
    expect(element.querySelectorAll<HTMLElement>('.ths-step').length).toBe(4);
  });

  it('should prevent to add/remove steps when disabled', () => {
    component.canAddRemoveSteps = false;
    runOnPushChangeDetection(fixture);

    expect(element.querySelectorAll<HTMLElement>('[aria-label="Add step"]').length).toBe(0);
    expect(element.querySelectorAll<HTMLElement>('[aria-label="Delete step"]').length).toBe(0);
  });

  it('should limit max. number of steps', () => {
    component.maxSteps = 5;
    runOnPushChangeDetection(fixture);
    const add2 = element.querySelectorAll<HTMLButtonElement>('[aria-label="Add step"]')[1];
    expect(add2.disabled).toBeTruthy();
  });

  it('should calculate color of steps', () => {
    fixture.detectChanges();
    const calculatedColors: string[] = getThreshodColors();
    expect(calculatedColors).toEqual([
      'status-danger',
      'status-warning',
      'status-success',
      'status-warning',
      'status-danger'
    ]);
  });

  it('should re-calculate color of steps when changing option', async () => {
    fixture.detectChanges();

    const selectHarness = await (
      await loader.getChildLoader('.ths-step:nth-child(2)')
    ).getHarness(SiSelectHarness);
    await selectHarness.clickItemsByText('Good');

    const calculatedColors: string[] = getThreshodColors();
    expect(calculatedColors).toEqual([
      'status-danger',
      'status-success',
      'status-success',
      'status-warning',
      'status-danger'
    ]);
  });

  it('should change threshold options to readonly', () => {
    component.readonlyConditions = true;
    runOnPushChangeDetection(fixture);
    const readonlyOptions = fixture.debugElement.queryAll(By.css('si-readonly-threshold-option'));
    expect(readonlyOptions).toHaveSize(component.thresholdSteps.length);
    component.thresholdSteps.forEach((step, index) => {
      const o = (component.options as SelectOption<unknown>[]).find(
        option => option.value === step.optionValue
      );
      expect(readonlyOptions.at(index)?.query(By.css('span')).nativeElement.innerText).toBe(
        o?.label
      );
    });
  });

  it('should still support legacy options', () => {
    component.options = [
      { title: 'Good', id: 'good' },
      { title: 'Average', id: 'average' },
      { title: 'Poor', id: 'poor' }
    ];
    component.readonly = true;
    runOnPushChangeDetection(fixture);
    const readonlyOptions = fixture.debugElement
      .queryAll(By.css('si-readonly-threshold-option span'))
      .map(option => option.nativeElement.innerText);

    expect(readonlyOptions).toEqual(['Poor', 'Average', 'Good', 'Average', 'Poor']);
  });
});
