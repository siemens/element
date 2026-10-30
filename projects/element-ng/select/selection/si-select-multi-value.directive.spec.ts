/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { SelectItem, SiSelectModule } from '@siemens/element-ng/select';

import { SiSelectHarness } from '../testing/si-select.harness';

@Component({
  imports: [SiSelectModule, ReactiveFormsModule],
  template: `
    <si-select
      multi
      style="width: 200px"
      [options]="options"
      [formControl]="control"
      (valueChange)="valueChange($event)"
    />
  `
})
class TestComponent {
  options: SelectItem<string>[] = [
    { type: 'option', value: 'a', label: 'a' },
    { type: 'option', value: 'b', label: 'b' },
    { type: 'option', value: 'c', label: 'c' },
    { type: 'option', value: 'd', label: 'd' },
    { type: 'option', value: 'e', label: 'e' },
    { type: 'option', value: 'f', label: 'f' }
  ];

  control = new FormControl(['a', 'b']);

  changedValue?: string[];

  valueChangeHandler: (value: string[]) => void = () => {};

  valueChange(valueChange: string[]): void {
    this.changedValue = valueChange;
    this.valueChangeHandler(valueChange);
  }
}

describe('SiSelectMultiValueDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let selectHarness: SiSelectHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService()]
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    selectHarness = await TestbedHarnessEnvironment.loader(fixture).getHarness(SiSelectHarness);
  });

  it('should select value', async () => {
    fixture.detectChanges();
    expect(await selectHarness.getSelectedTexts()).toEqual(['a', 'b']);
    await selectHarness.clickItems(2);
    expect(await selectHarness.getSelectedTexts()).toEqual(['a', 'b', 'c']);
    expect(component.changedValue).toEqual(['a', 'b', 'c']);
    expect(component.control.value).toEqual(['a', 'b', 'c']);
  });

  it('should deselect value', async () => {
    expect(await selectHarness.getSelectedTexts()).toEqual(['a', 'b']);
    await selectHarness.clickItems(1);
    expect(await selectHarness.getSelectedTexts()).toEqual(['a']);
    expect(component.changedValue).toEqual(['a']);
    expect(component.control.value).toEqual(['a']);
  });

  it('formcontrol reset should deselect value', async () => {
    expect(await selectHarness.getSelectedTexts()).toEqual(['a', 'b']);

    component.control.reset();

    expect(await selectHarness.getSelectedTexts()).toEqual([]);
    // changedValue should not be updated on value write
    expect(component.changedValue).toEqual(undefined);
  });

  it('should update selection when setting a mutated array with the same reference', async () => {
    const values = component.control.value;
    if (values === null) {
      throw new Error('Expected the form control to have a value');
    }

    values.push('c');
    component.control.setValue(values);

    expect(await selectHarness.getSelectedTexts()).toEqual(['a', 'b', 'c']);
  });

  it('should keep the latest value written by a valueChange handler', async () => {
    component.valueChangeHandler = () => component.control.setValue(['d']);

    await selectHarness.clickItems(2);

    expect(await selectHarness.getSelectedTexts()).toEqual(['d']);
    expect(component.control.value).toEqual(['d']);
  });
});
