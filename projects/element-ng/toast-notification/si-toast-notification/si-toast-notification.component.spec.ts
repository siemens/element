/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { STATUS_ICON } from '@siemens/element-ng/common';
import { Subject } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import { SI_TOAST_AUTO_HIDE_DELAY, SiToast } from '../si-toast.model';
import { SiToastNotificationComponent } from './si-toast-notification.component';

@Component({
  imports: [SiToastNotificationComponent],
  template: `<si-toast-notification [toast]="toast()" />`
})
class TestHostComponent {
  readonly siToastComponent = viewChild.required(SiToastNotificationComponent);
  readonly toast = signal<SiToast>({
    state: 'info',
    title: 'toast unit test',
    message: 'Sample toast that disappears',
    hidden: new Subject()
  });
  readonly statusIcon = STATUS_ICON.info;
}
describe('SiToastNotificationComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.toast.set({
      state: 'success',
      title: 'Success!',
      message: 'A successful event has occurred.',
      hidden: new Subject()
    });
    // Bind the required toast input before the next frame, or a mouseenter from the real pointer throws NG0950.
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls the close() function on clicking close icon', async () => {
    const closeSpy = vi.fn();
    component.toast.update(t => ({ ...t, close: closeSpy }));
    await fixture.whenStable();

    const closeButton = page.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    // Move the real pointer off the toast so it does not trigger mouseenter in the next test.
    await userEvent.unhover(closeButton);

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should pause/resume the animation on mouse events', async () => {
    const timerBar = element.querySelector<HTMLElement>('.si-toast-timer-bar');
    vi.spyOn(component.siToastComponent().paused, 'emit');
    vi.spyOn(component.siToastComponent().resumed, 'emit');

    expect(timerBar?.style.getPropertyValue('--toast-timer-duration')).toBe(
      SI_TOAST_AUTO_HIDE_DELAY / 1000 + 's'
    );
    const toastTitle = page.getByText('Success!', { exact: true });
    await userEvent.hover(toastTitle);
    await fixture.whenStable();

    expect(component.siToastComponent().paused.emit).toHaveBeenCalledTimes(1);

    expect(timerBar?.style.getPropertyValue('--play-state')).toBe('paused');

    await userEvent.unhover(toastTitle);
    await fixture.whenStable();

    expect(component.siToastComponent().resumed.emit).toHaveBeenCalledTimes(1);
    expect(timerBar?.style.getPropertyValue('--play-state')).toBe('running');
  });
});
