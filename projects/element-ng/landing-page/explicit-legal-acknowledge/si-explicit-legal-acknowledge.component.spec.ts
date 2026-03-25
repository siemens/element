/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatableString } from '@siemens/element-translate-ng/translate';
import { type Mock } from 'vitest';

import { SiExplicitLegalAcknowledgeComponent as TestComponent } from './si-explicit-legal-acknowledge.component';

describe('SiExplicitLegalAcknowledgeComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  let heading: WritableSignal<TranslatableString>;
  let subheading: WritableSignal<TranslatableString>;
  let acceptButtonLabel: WritableSignal<TranslatableString>;
  let backButtonLabel: WritableSignal<TranslatableString>;
  let disableAcceptance: WritableSignal<boolean>;
  let accept: Mock;
  let back: Mock;

  beforeEach(async () => {
    heading = signal<TranslatableString>('Test heading');
    subheading = signal<TranslatableString>('Test subheading');
    acceptButtonLabel = signal<TranslatableString>('Test Accept');
    backButtonLabel = signal<TranslatableString>('Test Back');
    disableAcceptance = signal(false);
    accept = vi.fn();
    back = vi.fn();

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('subheading', subheading),
        inputBinding('acceptButtonLabel', acceptButtonLabel),
        inputBinding('backButtonLabel', backButtonLabel),
        inputBinding('disableAcceptance', disableAcceptance),
        outputBinding('accept', accept),
        outputBinding('back', back)
      ]
    });
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the accept and back button with correct label', async () => {
    acceptButtonLabel.set('Test Accept');
    backButtonLabel.set('Test Back');
    await fixture.whenStable();

    const acceptButton = element.querySelector('button[type="button"].btn-primary');
    const backButton = element.querySelector('button[type="button"].btn-secondary');

    expect(acceptButton).toBeTruthy();
    expect(backButton).toBeTruthy();

    expect(acceptButton).toHaveTextContent('Test Accept');
    expect(backButton).toHaveTextContent('Test Back');
  });

  it('should disable the accept button when disableAcceptance is set to true', async () => {
    disableAcceptance.set(true);
    await fixture.whenStable();

    const acceptButton = element.querySelector('button[type="button"].btn-primary');
    expect(acceptButton).toBeDisabled();
  });

  it('should emit back event when the back button is clicked', async () => {
    const backButton: HTMLButtonElement = element.querySelector(
      'button[type="button"].btn-secondary'
    )!;
    backButton.click();
    await fixture.whenStable();

    expect(back).toHaveBeenCalled();
  });

  it('should emit accept event when the accept button is clicked', async () => {
    const acceptButton: HTMLButtonElement = element.querySelector(
      'button[type="button"].btn-primary'
    )!;
    acceptButton.click();
    await fixture.whenStable();

    expect(accept).toHaveBeenCalled();
  });
});
