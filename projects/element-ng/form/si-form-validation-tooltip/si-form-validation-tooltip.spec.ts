/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SiFormValidationTooltipHarness } from '../testing/si-form-validation-tooltip.harness';
import { SiFormValidationTooltipDirective } from './si-form-validation-tooltip.directive';

describe('SiFormValidationTooltipDirective', () => {
  @Component({
    imports: [SiFormValidationTooltipDirective, ReactiveFormsModule],
    template: `<input siFormValidationTooltip required [formControl]="control" />`
  })
  class TestHostComponent {
    control = new FormControl('');
  }

  const hoverDelay = 500;
  let fixture: ComponentFixture<TestHostComponent>;
  let harness: SiFormValidationTooltipHarness;

  beforeEach(async () => {
    jasmine.clock().install();
    fixture = TestBed.createComponent(TestHostComponent);
    harness = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      SiFormValidationTooltipHarness
    );
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should show tooltip when control is hovered and becomes touched', async () => {
    await harness.hover();
    jasmine.clock().tick(hoverDelay);
    await harness.focus();
    await harness.blur();
    expect(await harness.getTooltip()).toBe('Required');
  });

  it('should show tooltip when hovered or focused', async () => {
    fixture.componentInstance.control.markAsTouched();
    await harness.focus();
    expect(await harness.getTooltip()).toBe('Required');
    await harness.hover();
    await harness.mouseAway();
    expect(await harness.getTooltip()).toBe('Required');
    await harness.blur();
    expect(await harness.getTooltip()).toBeFalsy();
  });

  it('should hide tooltip when control becomes valid', async () => {
    fixture.componentInstance.control.markAsTouched();
    await harness.hover();
    jasmine.clock().tick(hoverDelay);
    expect(await harness.getTooltip()).toBe('Required');
    await harness.sendKeys('Lorem ipsum');
    expect(await harness.getTooltip()).toBeFalsy();
  });

  it('should hide tooltip when control becomes untouched', async () => {
    fixture.componentInstance.control.markAsTouched();
    await harness.hover();
    jasmine.clock().tick(hoverDelay);
    expect(await harness.getTooltip()).toBe('Required');
    fixture.componentInstance.control.markAsUntouched();
    expect(await harness.getTooltip()).toBeFalsy();
  });
});
