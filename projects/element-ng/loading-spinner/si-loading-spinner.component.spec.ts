/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SiLoadingSpinnerComponent as TestComponent } from './index';

describe('SiLoadingSpinnerComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent, NoopAnimationsModule]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
  });

  describe('SiLoadingComponent', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should contain the .loading class', () => {
      const element = fixture.nativeElement.querySelector('.loading');
      expect(element).toBeTruthy();
    });

    it('should contain the .blocking-spinner class for blocking spinner', () => {
      component.setInput('isBlockingSpinner', true);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('.blocking-spinner');
      expect(element).toBeTruthy();
    });

    it('should not contain the .blocking-spinner class for blocking spinner', () => {
      component.setInput('isBlockingSpinner', false);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('.blocking-spinner');
      expect(element).toBeFalsy();
    });
  });
});
