/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiEmptyStateComponent as TestComponent } from '.';

describe('SiEmptyStateComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let icon: WritableSignal<string | undefined>;
  let heading: WritableSignal<TranslatableString>;
  let content: WritableSignal<TranslatableString | undefined>;

  beforeEach(() => {
    icon = signal('element-icon');
    heading = signal<TranslatableString>('No Devices');
    content = signal<TranslatableString | undefined>('No devices were detected. Please retry!');

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('icon', icon),
        inputBinding('heading', heading),
        inputBinding('content', content)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should display the correct data', async () => {
    await fixture.whenStable();

    expect(element.querySelector('h2')!).toHaveTextContent('No Devices');
    expect(element.querySelector('p')!).toHaveTextContent(
      'No devices were detected. Please retry!'
    );
    expect(element.querySelector('.element-icon')!.innerHTML).toBeDefined();
  });

  it('should not render icon or description when not provided', async () => {
    icon.set(undefined);
    content.set(undefined);
    await fixture.whenStable();

    expect(element.querySelector('si-icon')).toBeNull();
    expect(element.querySelector('p.text-pre-wrap')).toBeNull();
  });
});
