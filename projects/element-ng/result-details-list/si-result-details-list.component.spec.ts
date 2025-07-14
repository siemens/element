/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { ResultDetailStep, SiResultDetailsListComponent } from '.';

@Component({
  imports: [SiResultDetailsListComponent, SiTranslateModule],
  template: `<si-result-details-list [steps]="steps" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestHostComponent {
  steps: ResultDetailStep[] = [];
}

describe('SiResultDetailsListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the steps', () => {
    component.steps = [
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
    ];
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-description').length).toEqual(component.steps.length);
  });

  it('should show step values if provided', () => {
    component.steps = [
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        value: '3.7 m3/h'
      }
    ];
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-value').length).toEqual(1);
  });

  it('should show no test step values if none provided', () => {
    component.steps = [
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      }
    ];
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-value').length).toEqual(0);
  });

  it('should show step errors if provided', () => {
    component.steps = [
      {
        description: 'Test maximum volume flow',
        state: 'failed',
        errorMessage: 'an error message'
      }
    ];
    fixture.detectChanges();

    expect(element.querySelectorAll('.text-danger').length).toEqual(1);
  });

  it('should show no step errors if none provided', () => {
    component.steps = [
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      }
    ];
    fixture.detectChanges();

    expect(element.querySelectorAll('.result-error').length).toEqual(0);
  });

  it('should show detail text if provided', () => {
    component.steps = [
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        detail: 'Test this detail'
      }
    ];
    fixture.detectChanges();
    expect(element.querySelectorAll('.result-detail').length).toEqual(1);
  });
});
