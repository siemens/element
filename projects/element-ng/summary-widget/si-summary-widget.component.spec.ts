/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSummaryWidgetComponent } from './index';

describe('SiSummaryWidgetComponent', () => {
  let fixture: ComponentFixture<SiSummaryWidgetComponent>;
  let element: HTMLElement;
  let label: WritableSignal<string>;
  let value: WritableSignal<string>;
  let icon: WritableSignal<string | undefined>;
  let color: WritableSignal<string | undefined>;
  let selected: WritableSignal<boolean>;
  let disabled: WritableSignal<boolean>;
  let readonly: WritableSignal<boolean>;

  beforeEach(() => {
    label = signal('test label');
    value = signal('42');
    icon = signal<string | undefined>(undefined);
    color = signal<string | undefined>(undefined);
    selected = signal(false);
    disabled = signal(false);
    readonly = signal(false);
    fixture = TestBed.createComponent(SiSummaryWidgetComponent, {
      bindings: [
        inputBinding('label', label),
        inputBinding('value', value),
        inputBinding('icon', icon),
        inputBinding('color', color),
        inputBinding('disabled', disabled),
        inputBinding('readonly', readonly),
        twoWayBinding('selected', selected)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should set label and value', async () => {
    await fixture.whenStable();

    expect(element.querySelector('.text-secondary')).toHaveTextContent('test label');
    expect(element.querySelector('.si-h5')).toHaveTextContent('42');
    expect(element.querySelector('si-icon')).not.toBeInTheDocument();
  });

  it('should display custom icon', async () => {
    icon.set('element-manual-filled');
    color.set('status-warning');
    await fixture.whenStable();

    expect(element.querySelector('si-icon div')).toHaveClass('element-manual-filled');
    expect(element.querySelector('si-icon')).toHaveClass('status-warning');
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

  it('should not toggle selected state on click when readonly', async () => {
    readonly.set(true);
    await fixture.whenStable();

    expect(selected()).toBe(false);

    element.querySelector('div')?.click();
    expect(selected()).toBe(false);
  });
});
