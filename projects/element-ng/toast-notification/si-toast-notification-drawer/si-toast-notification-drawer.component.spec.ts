/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { SiToast } from '../si-toast.model';
import { SiToastNotificationDrawerComponent } from './si-toast-notification-drawer.component';

@Component({
  imports: [SiToastNotificationDrawerComponent],
  template: `<si-toast-notification-drawer [toasts]="toasts()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly toasts = signal<Observable<SiToast[]>>(new Subject<SiToast[]>());
}
describe('SiToastNotificationDrawerComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('renders toasts', async () => {
    const toastSubject = new Subject<SiToast[]>();
    component.toasts.set(toastSubject);
    fixture.detectChanges();

    toastSubject.next([
      { state: 'danger', title: 'danger toast', message: 'danger message', hidden: new Subject() },
      { state: 'info', title: 'info toast', message: 'info message', hidden: new Subject() }
    ]);

    await fixture.whenStable();

    const toasts = element.querySelectorAll('si-toast-notification');
    expect(toasts.length).toBe(2);
    expect(toasts[0]).toHaveTextContent('danger message');
    expect(toasts[1]).toHaveTextContent('info message');
  });
});
