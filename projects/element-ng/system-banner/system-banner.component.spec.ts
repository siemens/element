/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedStatusType } from '@siemens/element-ng/common';

import { SiSystemBannerComponent } from './system-banner.component';

@Component({
  imports: [SiSystemBannerComponent],
  template: `
    <si-system-banner>
      <span>Update available</span>&nbsp;
      <a href="https://element.siemens.io/">Learn more</a>
    </si-system-banner>
  `
})
class TestHostComponent {}

describe('SiSystemBannerComponent', () => {
  let fixture: ComponentFixture<SiSystemBannerComponent>;
  let element: HTMLElement;
  let message: WritableSignal<string>;
  let status: WritableSignal<ExtendedStatusType>;

  beforeEach(() => {
    message = signal('Test');
    status = signal<ExtendedStatusType>('info');

    fixture = TestBed.createComponent(SiSystemBannerComponent, {
      bindings: [inputBinding('message', message), inputBinding('status', status)]
    });
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display message', async () => {
    await fixture.whenStable();

    expect(element).toHaveTextContent('Test');
  });

  it('should display projected content instead of a message', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    await hostFixture.whenStable();

    const alert = hostFixture.nativeElement.querySelector('[role="alert"]');

    expect(alert).toHaveTextContent(/Update available\s+Learn more/);
    expect(alert.querySelector('a')).toHaveAttribute('href', 'https://element.siemens.io/');
  });

  it('should have default banner type', () => {
    expect(status()).toBe('info');
  });

  it('should have class based on banner type', async () => {
    await fixture.whenStable();

    expect(element).toHaveClass('banner-info');

    status.set('success');
    await fixture.whenStable();

    expect(element).toHaveClass('banner-success');
  });
});
