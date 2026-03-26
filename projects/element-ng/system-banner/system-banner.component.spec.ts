/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtendedStatusType } from '@siemens/element-ng/common';

import { SiSystemBannerComponent } from './system-banner.component';

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
