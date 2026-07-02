/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Overlay } from '@angular/cdk/overlay';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { SiFormValidationTooltipHarness } from '../testing/si-form-validation-tooltip.harness';
import { SiFormValidationTooltipDirective } from './si-form-validation-tooltip.directive';

describe('SiFormValidationTooltipDirective', () => {
  @Component({
    imports: [SiFormValidationTooltipDirective, ReactiveFormsModule],
    template: `<input siFormValidationTooltip required [formControl]="control" />`,
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  class TestHostComponent {
    control = new FormControl('');
  }

  const hoverDelay = 500;
  let fixture: ComponentFixture<TestHostComponent>;
  let harness: SiFormValidationTooltipHarness;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setTimerTickMode('nextTimerAsync');
    fixture = TestBed.createComponent(TestHostComponent);
    inputElement = fixture.nativeElement.querySelector('input')!;
    vi.spyOn(inputElement, 'matches').mockReturnValue(true);
    harness = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      SiFormValidationTooltipHarness
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show tooltip when control is hovered and becomes touched', async () => {
    await harness.hover();
    await harness.focus();
    await harness.blur();
    expect(await harness.getTooltip()).toBe('Required');
  });

  it('should show tooltip when hovered or focused', async () => {
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    await harness.focus();
    expect(await harness.getTooltip()).toBe('Required');
    await harness.hover();
    await vi.advanceTimersByTimeAsync(hoverDelay);
    await harness.mouseAway();
    expect(await harness.getTooltip()).toBe('Required');
    await harness.blur();
    expect(await harness.getTooltip()).toBeFalsy();
  });

  it('should hide tooltip when control becomes valid', async () => {
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    await harness.hover();
    await vi.advanceTimersByTimeAsync(hoverDelay);
    expect(await harness.getTooltip()).toBe('Required');
    await harness.sendKeys('Lorem ipsum');
    expect(await harness.getTooltip()).toBeFalsy();
  });

  it('should hide tooltip when control becomes untouched', async () => {
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    await harness.hover();
    await vi.advanceTimersByTimeAsync(hoverDelay);
    expect(await harness.getTooltip()).toBe('Required');
    fixture.componentInstance.control.markAsUntouched();
    await fixture.whenStable();
    expect(await harness.getTooltip()).toBeFalsy();
  });

  it('should reposition the overlay when the validation errors change while open', async () => {
    const control = fixture.componentInstance.control;
    control.addValidators(Validators.minLength(5));
    const createSpy = vi.spyOn(Overlay.prototype, 'create');

    control.markAsTouched();
    await fixture.whenStable();
    await harness.focus();
    expect(await harness.getTooltip()).toBe('Required');

    const overlayRef = createSpy.mock.results.at(-1)!.value as ReturnType<Overlay['create']>;
    const repositionSpy = vi.spyOn(overlayRef, 'updatePosition');

    await harness.sendKeys('ab');
    await fixture.whenStable();
    expect(await harness.getTooltip()).toBe('Min. 5 characters');

    expect(repositionSpy).toHaveBeenCalled();
  });
});
