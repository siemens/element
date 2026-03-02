/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDetailStep, SiResultDetailsListComponent } from '.';

describe('SiResultDetailsListComponent', () => {
  let fixture: ComponentFixture<SiResultDetailsListComponent>;
  let element: HTMLElement;
  let steps: WritableSignal<ResultDetailStep[]>;

  beforeEach(() => {
    steps = signal([]);
    fixture = TestBed.createComponent(SiResultDetailsListComponent, {
      bindings: [inputBinding('steps', steps)]
    });
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the steps', () => {
    steps.set([
      {
        description: 'Test volume flow sensor',
        state: 'failed'
      },
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      },
      {
        description: 'Test maximum differential pressure',
        state: 'passed'
      },
      {
        description: 'Test nominal volume flow',
        state: 'passed'
      },
      {
        description: 'Test nominal differential pressure',
        state: 'failed'
      },
      { description: 'Test leakage rate', state: 'failed' },
      {
        description: 'Test valve fully operational',
        state: 'failed'
      }
    ]);
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-description').length).toEqual(steps().length);
  });

  it('should show step values if provided', () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        value: '3.7 m3/h'
      }
    ]);
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-value').length).toEqual(1);
  });

  it('should show no test step values if none provided', () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      }
    ]);
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-value').length).toEqual(0);
  });

  it('should show step errors if provided', () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'failed',
        errorMessage: 'an error message'
      }
    ]);
    fixture.detectChanges();

    expect(element.querySelectorAll('.text-danger').length).toEqual(1);
  });

  it('should show no step errors if none provided', () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      }
    ]);
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-error').length).toEqual(0);
  });

  it('should show detail text if provided', () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        detail: 'Test this detail'
      }
    ]);
    fixture.detectChanges();
    expect(element.querySelectorAll('.result-detail').length).toEqual(1);
  });
});
