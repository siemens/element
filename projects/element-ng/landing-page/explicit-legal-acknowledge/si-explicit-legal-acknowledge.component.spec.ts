/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiExplicitLegalAcknowledgeComponent as TestComponent } from './si-explicit-legal-acknowledge.component';

describe('SiExplicitLegalAcknowledgeComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: ComponentRef<TestComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentRef;
    component.setInput('heading', 'Test heading');
    component.setInput('subheading', 'Test subheading');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render the accept and back button with correct label', () => {
    component.setInput('acceptButtonLabel', 'Test Accept');
    component.setInput('backButtonLabel', 'Test Back');
    fixture.detectChanges();

    const acceptButton = fixture.nativeElement.querySelector('button[type="button"].btn-primary');
    const backButton = fixture.nativeElement.querySelector('button[type="button"].btn-secondary');

    expect(acceptButton).toBeTruthy();
    expect(backButton).toBeTruthy();

    expect(acceptButton.textContent.trim()).toBe('Test Accept');
    expect(backButton.textContent.trim()).toBe('Test Back');
  });

  it('should disable the accept button when disableAcceptance is set to true', () => {
    component.setInput('disableAcceptance', true);
    fixture.detectChanges();

    const acceptButton = fixture.nativeElement.querySelector('button[type="button"].btn-primary');
    expect(acceptButton.disabled).toBeTrue();
  });

  it('should emit back event when the back button is clicked', () => {
    const spy = spyOn(component.instance.back, 'emit');

    const backButton = fixture.nativeElement.querySelector('button[type="button"].btn-secondary');
    backButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit accept event when the accept button is clicked', () => {
    const spy = spyOn(component.instance.accept, 'emit');

    const acceptButton = fixture.nativeElement.querySelector('button[type="button"].btn-primary');
    acceptButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });
});
