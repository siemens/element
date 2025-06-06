/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';

import { SiSelectMultiValueDirective } from '../selection/si-select-multi-value.directive';
import { SiSelectComponent } from '../si-select.component';
import { SelectItem, SelectOption } from '../si-select.types';
import { SiSelectHarness } from '../testing/si-select.harness';
import { SiSelectLazyOptionsDirective } from './si-select-lazy-options.directive';
import { SelectOptionSource } from './si-select-option.source';

import createSpy = jasmine.createSpy;

describe('SelectLazyOptionsDirective', () => {
  @Component({
    template: ` <si-select
      multi
      hasFilter
      [optionSource]="optionSource"
      [formControl]="control"
    />`,
    imports: [
      SiSelectComponent,
      SiSelectLazyOptionsDirective,
      ReactiveFormsModule,
      SiSelectMultiValueDirective
    ]
  })
  class TestHostComponent {
    readonly optionSource: SelectOptionSource<string> = {
      getOptionsForValues: (values: string[]): Observable<SelectOption<string>[]> =>
        of(values.map(valueToOption))
    };
    control = new FormControl<string[]>([]);
  }

  const valueToOption = (value: string): SelectOption<string> => ({
    label: `label: ${value}`,
    type: 'option',
    value
  });

  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;
  let component: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideNoopAnimations()]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
  });

  it('should render initial value', async () => {
    component.control.setValue(['value']);

    const harness = await loader.getHarness(SiSelectHarness);
    expect(await harness.getSelectedTexts()).toEqual(['label: value']);
  });

  it('should search for values', fakeAsync(async () => {
    component.optionSource.getOptionsForSearch = createSpy(
      'getOptionsForSearch',
      (search: string): Observable<SelectItem<string>[]> => of(['result'].map(valueToOption))
    ).and.callThrough();

    const harness = await loader.getHarness(SiSelectHarness);
    await harness.open();
    const list = (await harness.getList())!;
    await list.sendKeys('search');
    expect(component.optionSource.getOptionsForSearch).not.toHaveBeenCalled();
    tick(100);
    expect(component.optionSource.getOptionsForSearch).toHaveBeenCalled();
    expect(await list.getAllItemTexts()).toEqual(['label: result']);
  }));

  it('should use known values if possible to render selected values', fakeAsync(async () => {
    component.optionSource.getOptionsForSearch = (
      search: string
    ): Observable<SelectItem<string>[]> =>
      of(['result-0', 'result-1', 'result-2'].map(valueToOption));
    component.optionSource.compareOptions = (a, b) => a.value.localeCompare(b.value);
    component.control.setValue(['result-1']);

    const harness = await loader.getHarness(SiSelectHarness);
    await harness.open();
    const list = (await harness.getList())!;
    await list.sendKeys('result');
    tick(100);
    await list.getItemByText('label: result-2').then(item => item.click());
    await list.getItemByText('label: result-0').then(item => item.click());
    expect(await harness.getSelectedTexts()).toEqual([
      'label: result-0',
      'label: result-1',
      'label: result-2'
    ]);
    discardPeriodicTasks();
  }));

  it('should show selected values if getAll is not implemented', async () => {
    component.control.setValue(['value-0', 'value-1']);

    const harness = await loader.getHarness(SiSelectHarness);
    await harness.open();
    const list = (await harness.getList())!;
    expect(await list.getAllItemTexts()).toEqual(['label: value-0', 'label: value-1']);
  });

  it('should show getAll options if implemented', async () => {
    component.optionSource.getAllOptions = () =>
      of(['value-0', 'value-1', 'value-2'].map(valueToOption));
    component.control.setValue(['value-1']);

    const harness = await loader.getHarness(SiSelectHarness);
    await harness.open();
    const list = (await harness.getList())!;
    expect(await list.getAllItemTexts()).toEqual([
      'label: value-0',
      'label: value-1',
      'label: value-2'
    ]);
  });
});
