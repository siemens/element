/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { Observable, Subject } from 'rxjs';

import { SiToast } from '../si-toast.model';
import { SiToastNotificationDrawerComponent } from './si-toast-notification-drawer.component';

@Component({
  imports: [SiToastNotificationDrawerComponent],
  standalone: true,
  template: `<si-toast-notification-drawer [toasts]="toasts" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  toasts: Observable<SiToast[]> = new Subject<SiToast[]>();
}
describe('SiToastNotificationDrawerComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, NoopAnimationsModule, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders toasts', fakeAsync(() => {
    const toastSubject = new Subject<SiToast[]>();
    component.toasts = toastSubject;
    fixture.detectChanges();

    toastSubject.next([
      { state: 'danger', title: 'danger toast', message: 'danger message', hidden: new Subject() },
      { state: 'info', title: 'info toast', message: 'info message', hidden: new Subject() }
    ]);

    fixture.detectChanges();
    tick();

    const toasts = element.querySelectorAll('si-toast-notification');
    expect(toasts.length).toBe(2);
    expect(toasts[0].innerHTML).toContain('danger message');
    expect(toasts[1].innerHTML).toContain('info message');
  }));
});
