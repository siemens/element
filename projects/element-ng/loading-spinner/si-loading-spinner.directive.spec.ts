/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SiLoadingSpinnerModule } from './si-loading-spinner.module';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
  imports: [SiLoadingSpinnerModule],
  template: `
    <div [siLoading]="loading" [blocking]="blocking">
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
      invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
      justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
      ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos
      et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet.
    </div>
  `
})
export class TestHostComponent {
  public loading = true;
  public blocking = false;
}

describe('SiLoadingSpinnerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  const initialDelay = 500;

  const isLoading = (): boolean => !!fixture.nativeElement.querySelector('.loading');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiLoadingSpinnerModule, NoopAnimationsModule, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not display spinner before initial delay', async () => {
    fixture.detectChanges();
    vi.advanceTimersByTime(initialDelay - 10);
    await fixture.whenStable();
    expect(isLoading()).toBe(false);
  });

  it('should display spinner after initial delay', async () => {
    await fixture.whenStable();
    vi.advanceTimersByTime(initialDelay);
    await fixture.whenStable();
    expect(isLoading()).toBe(true);
  });

  it('should skip showing spinner if canceled before initial delay', async () => {
    await fixture.whenStable();
    vi.advanceTimersByTime(initialDelay - 10);
    await fixture.whenStable();
    expect(isLoading()).toBe(false);

    fixture.componentInstance.loading = false;
    fixture.changeDetectorRef.markForCheck();
    vi.advanceTimersByTime(600);
    await fixture.whenStable();

    expect(isLoading()).toBe(false);
  });

  it('should show and hide spinner', async () => {
    vi.advanceTimersByTime(initialDelay);
    await fixture.whenStable();
    vi.advanceTimersByTime(initialDelay);
    await fixture.whenStable();
    expect(isLoading()).toBe(true);

    fixture.componentInstance.loading = false;
    fixture.changeDetectorRef.markForCheck();
    vi.advanceTimersByTime(500);
    await fixture.whenStable();
    // another one to update the DOM
    vi.advanceTimersByTime(0);
    await fixture.whenStable();

    expect(isLoading()).toBe(false);
  });
});
