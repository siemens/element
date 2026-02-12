/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiLoadingSpinnerModule } from './si-loading-spinner.module';

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
      imports: [SiLoadingSpinnerModule, TestHostComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  });

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should not display spinner before initial delay', async () => {
    fixture.detectChanges();
    jasmine.clock().tick(initialDelay - 10);
    await fixture.whenStable();
    expect(isLoading()).toBeFalse();
  });

  it('should display spinner after initial delay', async () => {
    await fixture.whenStable();
    jasmine.clock().tick(initialDelay);
    await fixture.whenStable();
    expect(isLoading()).toBeTrue();
  });

  it('should skip showing spinner if canceled before initial delay', async () => {
    await fixture.whenStable();
    jasmine.clock().tick(initialDelay - 10);
    await fixture.whenStable();
    expect(isLoading()).toBeFalse();

    fixture.componentInstance.loading = false;
    fixture.changeDetectorRef.markForCheck();
    jasmine.clock().tick(600);
    await fixture.whenStable();

    expect(isLoading()).toBeFalse();
  });

  it('should show and hide spinner', async () => {
    jasmine.clock().tick(initialDelay);
    await fixture.whenStable();
    jasmine.clock().tick(initialDelay);
    await fixture.whenStable();
    expect(isLoading()).toBeTrue();

    fixture.componentInstance.loading = false;
    fixture.changeDetectorRef.markForCheck();
    jasmine.clock().tick(500);
    await fixture.whenStable();
    // another one to update the DOM
    jasmine.clock().tick(0);
    await fixture.whenStable();

    expect(isLoading()).toBeFalse();
  });
});
