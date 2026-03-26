/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSummaryChipComponent } from './index';

describe('SiSummaryChipComponent', () => {
  let fixture: ComponentFixture<SiSummaryChipComponent>;
  let element: HTMLElement;
  let label: WritableSignal<string>;
  let value: WritableSignal<string | undefined>;
  let icon: WritableSignal<string | undefined>;
  let hideLabel: WritableSignal<boolean>;
  let selected: WritableSignal<boolean>;
  let disabled: WritableSignal<boolean>;

  beforeEach(() => {
    label = signal('test label');
    value = signal<string | undefined>('42');
    icon = signal<string | undefined>(undefined);
    hideLabel = signal(false);
    selected = signal(false);
    disabled = signal(false);
    fixture = TestBed.createComponent(SiSummaryChipComponent, {
      bindings: [
        inputBinding('label', label),
        inputBinding('value', value),
        inputBinding('icon', icon),
        inputBinding('hideLabel', hideLabel),
        inputBinding('disabled', disabled),
        twoWayBinding('selected', selected)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should set label and value', async () => {
    await fixture.whenStable();

    expect(element.querySelector('.si-body')).toHaveTextContent('test label');
    expect(element.querySelector('.si-h5')).toHaveTextContent('42');
    expect(element.querySelector('si-icon')).not.toBeInTheDocument();
  });

  it('should hide label when requested', async () => {
    icon.set('element-not-checked');
    hideLabel.set(true);
    await fixture.whenStable();

    expect(element.querySelector('.si-body')).toHaveTextContent('test label');
    expect(element.querySelector('.si-body')).toHaveClass('visually-hidden');
  });

  it('should display selected state', async () => {
    selected.set(true);
    await fixture.whenStable();

    expect(element.querySelector('.selected')).toBeInTheDocument();
  });

  it('should toggle selected state on click', async () => {
    await fixture.whenStable();

    expect(selected()).toBe(false);

    element.querySelector('div')?.click();
    expect(selected()).toBe(true);
  });

  it('should not toggle selected state on click when disabled', async () => {
    disabled.set(true);
    await fixture.whenStable();

    expect(selected()).toBe(false);

    element.querySelector('div')?.click();
    expect(selected()).toBe(false);
  });
});
