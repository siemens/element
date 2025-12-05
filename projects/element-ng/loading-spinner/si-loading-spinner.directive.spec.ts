/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync
} from '@angular/core/testing';
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiLoadingSpinnerModule, NoopAnimationsModule, TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should not display spinner before initial delay', fakeAsync(() => {
    fixture.detectChanges();
    tick(initialDelay - 10);
    fixture.detectChanges();
    expect(isLoading()).toBe(false);
    discardPeriodicTasks();
  }));

  it('should display spinner after initial delay', fakeAsync(() => {
    fixture.detectChanges();
    tick(initialDelay);
    fixture.detectChanges();
    expect(isLoading()).toBe(true);
    discardPeriodicTasks();
  }));

  it('should skip showing spinner if canceled before initial delay', fakeAsync(() => {
    fixture.detectChanges();
    tick(initialDelay - 10);
    fixture.detectChanges();
    expect(isLoading()).toBe(false);

    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    tick(600);
    fixture.detectChanges();

    expect(isLoading()).toBe(false);
  }));

  it('should show and hide spinner', fakeAsync(() => {
    fixture.detectChanges();
    tick(initialDelay);
    fixture.detectChanges();
    expect(isLoading()).toBe(true);

    fixture.componentInstance.loading = false;
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
    // another one to update the DOM
    tick();
    fixture.detectChanges();

    expect(isLoading()).toBe(false);
  }));
});
