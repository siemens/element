/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { STATUS_ICON } from '@siemens/element-ng/common';
import { Subject } from 'rxjs';

import { SiToast } from '../si-toast.model';
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, SiToastNotificationComponent, TestHostComponent]
    }).compileComponents();
  }));

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
    const closeSpy = jasmine.createSpy();
    component.toast.close = closeSpy;

    element.querySelector<HTMLElement>(`[aria-label="Close"]`)?.click();

    expect(closeSpy).toHaveBeenCalled();
  });
});
