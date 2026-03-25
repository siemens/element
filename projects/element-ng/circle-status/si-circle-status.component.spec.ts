/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SimpleChange, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntityStatusType } from '@siemens/element-ng/common';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiCircleStatusComponent as TestComponent } from './index';

describe('SiCircleStatusComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let icon: WritableSignal<string | undefined>;
  let status: WritableSignal<EntityStatusType | undefined>;
  let ariaLabel: WritableSignal<TranslatableString | undefined>;
  let blink: WritableSignal<boolean>;
  let eventOut: WritableSignal<boolean>;

  const checkAriaLabel = (label: string): void =>
    expect(element.querySelector('.status-indication')?.getAttribute('aria-label')).toBe(label);

  beforeEach(() => {
    icon = signal<string | undefined>(undefined);
    status = signal<EntityStatusType | undefined>(undefined);
    ariaLabel = signal<TranslatableString | undefined>(undefined);
    blink = signal(false);
    eventOut = signal(false);

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('icon', icon),
        inputBinding('status', status),
        inputBinding('ariaLabel', ariaLabel),
        inputBinding('blink', blink),
        inputBinding('eventOut', eventOut)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should not set icon class, if no icon is configured', async () => {
    icon.set(undefined);
    await fixture.whenStable();

    expect(element.querySelector('.status-indication-icon')).not.toBeInTheDocument();
    checkAriaLabel('status none');
  });

  it('should set configured icon class', async () => {
    icon.set('element-door');
    status.set('info');
    await fixture.whenStable();

    expect(element.querySelector('.element-door')).toBeDefined();
    checkAriaLabel('door in status info');
  });

  it('set aria-label according to status and icon', async () => {
    icon.set('element-door');
    status.set('info');
    await fixture.whenStable();

    checkAriaLabel('door in status info');
  });

  it('set passed aria-label', async () => {
    ariaLabel.set('icon description');
    await fixture.whenStable();

    checkAriaLabel('icon description');
  });

  it('set blink to true', async () => {
    vi.useFakeTimers();
    blink.set(true);
    status.set('info');
    fixture.componentInstance.ngOnChanges({
      blink: new SimpleChange(false, true, true),
      status: new SimpleChange(undefined, 'info', false)
    });
    await fixture.whenStable();

    const statusIndication = element.querySelector('.status-indication .bg') as HTMLElement;
    expect(statusIndication).not.toHaveClass('pulse');
    vi.advanceTimersByTime(4 * 1400);

    await fixture.whenStable();
    expect(statusIndication).toHaveClass('pulse');
    fixture.componentInstance.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should show event out indication', async () => {
    eventOut.set(true);
    await fixture.whenStable();

    const outElement = element.querySelector('.event-out');
    expect(outElement).toBeTruthy();
  });
});
