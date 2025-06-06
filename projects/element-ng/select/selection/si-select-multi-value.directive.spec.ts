/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SiSelectModule } from '@siemens/element-ng/select';

import { SiSelectHarness } from '../testing/si-select.harness';

@Component({
  template: `
    <si-select
      multi
      style="width: 200px"
      [complexOptions]="options"
      [formControl]="control"
      (valueChange)="valueChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiSelectModule, ReactiveFormsModule]
})
class TestComponent {
  options = ['a', 'b', 'c', 'd', 'e', 'f'];

  control = new FormControl(['a', 'b']);

  changedValue?: string[];

  valueChange(valueChange: string[]): void {
    this.changedValue = valueChange;
  }
}

describe('SiSelectMultiValueDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let selectHarness: SiSelectHarness;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiSelectModule, ReactiveFormsModule, TranslateModule.forRoot(), TestComponent]
    }).compileComponents();
  });

  beforeEach(async () => {
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

  it('formcontrol setValue null should deselect value', async () => {
    expect(await selectHarness.getSelectedTexts()).toEqual(['a', 'b']);

    component.control.setValue(null);

    expect(await selectHarness.getSelectedTexts()).toEqual([]);
    // changedValue should not be updated on value write
    expect(component.changedValue).toEqual(undefined);
  });
});
