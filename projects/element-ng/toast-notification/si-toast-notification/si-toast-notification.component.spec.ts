/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { STATUS_ICON } from '@siemens/element-ng/common';
import { Subject } from 'rxjs';

import { SI_TOAST_AUTO_HIDE_DELAY, SiToast } from '../si-toast.model';
import { SiToastNotificationComponent } from './si-toast-notification.component';

@Component({
  imports: [SiToastNotificationComponent],
  template: `<si-toast-notification [toast]="toast" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly siToastComponent = viewChild.required(SiToastNotificationComponent);
  toast: SiToast = {
    state: 'info',
    title: 'toast unit test',
    message: 'Sample toast that disappears',
    hidden: new Subject()
  };
  statusIcon = STATUS_ICON.info;
}
describe('SiToastNotificationComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, SiToastNotificationComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    component.toast = {
      state: 'success',
      title: 'Success!',
      message: 'A successful event has occurred.',
      hidden: new Subject()
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls the close() function on clicking close icon', () => {
    const closeSpy = vi.fn();
    component.toast.close = closeSpy;

    element.querySelector<HTMLElement>(`[aria-label="Close"]`)?.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should pause/resume the animation on mouse events', () => {
    const timerBar = element.querySelector<HTMLElement>('.si-toast-timer-bar');
    vi.spyOn(component.siToastComponent().paused, 'emit');
    vi.spyOn(component.siToastComponent().resumed, 'emit');

    expect(timerBar?.style.getPropertyValue('--toast-timer-duration')).toBe(
      SI_TOAST_AUTO_HIDE_DELAY / 1000 + 's'
    );
    element.querySelector('si-toast-notification')?.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(component.siToastComponent().paused.emit).toHaveBeenCalledTimes(1);

    expect(timerBar?.style.getPropertyValue('--play-state')).toBe('paused');

    element.querySelector('si-toast-notification')?.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();

    expect(component.siToastComponent().resumed.emit).toHaveBeenCalledTimes(1);
    expect(timerBar?.style.getPropertyValue('--play-state')).toBe('running');
  });
});
