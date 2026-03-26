/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedStatusType } from '@siemens/element-ng/common';

import { SiStatusBarItemComponent } from './si-status-bar-item.component';

describe('SiStatusBarItemComponent', () => {
  let fixture: ComponentFixture<SiStatusBarItemComponent>;
  let element: HTMLElement;
  let status: WritableSignal<ExtendedStatusType | undefined>;
  let value: WritableSignal<string | number>;
  let heading: WritableSignal<string>;
  let blink: WritableSignal<boolean>;

  beforeEach(() => {
    status = signal(undefined);
    value = signal<string | number>('');
    heading = signal('');
    blink = signal(false);
    fixture = TestBed.createComponent(SiStatusBarItemComponent, {
      bindings: [
        inputBinding('status', status),
        inputBinding('value', value),
        inputBinding('heading', heading),
        inputBinding('blink', blink)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should contain set properties', async () => {
    heading.set('heading');
    status.set('danger');
    value.set('value');
    blink.set(true);

    await fixture.whenStable();

    expect(element.querySelector('.item-title')).toHaveTextContent('heading');
    expect(element.querySelector('.status-item .bg')).toHaveClass('bg-base-danger');
    expect(element.querySelector('.item-value')).toHaveTextContent('value');
  });
});
