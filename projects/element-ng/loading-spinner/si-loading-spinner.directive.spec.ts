/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiLoadingSpinnerModule } from './si-loading-spinner.module';

@Component({
  imports: [SiLoadingSpinnerModule],
  template: `
    <div [siLoading]="loading()" [blocking]="blocking()">
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
  readonly loading = signal(true);
  readonly blocking = signal(false);
}

describe('SiLoadingSpinnerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  const initialDelay = 500;

  const isLoading = (): boolean => !!fixture.nativeElement.querySelector('.loading');

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not display spinner before initial delay', async () => {
    vi.advanceTimersByTime(initialDelay - 10);
    await fixture.whenStable();
    expect(isLoading()).toBe(false);
  });

  it('should display spinner after initial delay', async () => {
    await fixture.whenStable();
    vi.advanceTimersByTime(initialDelay);
    expect(isLoading()).toBe(true);
  });

  it('should skip showing spinner if canceled before initial delay', async () => {
    await fixture.whenStable();
    vi.advanceTimersByTime(initialDelay - 10);
    await fixture.whenStable();
    expect(isLoading()).toBe(false);

    component.loading.set(false);
    vi.advanceTimersByTime(600);
    await fixture.whenStable();

    expect(isLoading()).toBe(false);
  });

  it('should show and hide spinner', async () => {
    await fixture.whenStable();
    await vi.advanceTimersByTimeAsync(initialDelay);
    await vi.advanceTimersByTimeAsync(initialDelay);
    expect(isLoading()).toBe(true);

    component.loading.set(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(isLoading()).toBe(false);
  });

  it('should propagate blocking change to si-loading-spinner component', async () => {
    await vi.advanceTimersByTimeAsync(initialDelay);
    await vi.advanceTimersByTimeAsync(initialDelay);
    expect(isLoading()).toBe(true);
    expect(fixture.nativeElement.querySelector('.blocking-spinner')).not.toBeInTheDocument();

    component.blocking.set(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(fixture.nativeElement.querySelector('.blocking-spinner')).toBeInTheDocument();

    component.blocking.set(false);
    await vi.advanceTimersByTimeAsync(0);
    expect(fixture.nativeElement.querySelector('.blocking-spinner')).not.toBeInTheDocument();
  });
});
