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

  it('renders an empty list', async () => {
    await fixture.whenStable();

    expect(element.querySelector('ul')).not.toBeNull();
    expect(element.querySelectorAll('li')).toHaveLength(0);
  });

  it('should show the steps', async () => {
    const configuredSteps = [
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
    ] satisfies ResultDetailStep[];
    steps.set(configuredSteps);
    await fixture.whenStable();

    const listItems = element.querySelectorAll('li');
    expect(listItems).toHaveLength(configuredSteps.length);
    configuredSteps.forEach((step, index) => {
      expect(listItems[index]).toMatchTextContent(new RegExp(step.description));
    });
  });

  it('should show step values if provided', async () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        value: '3.7 m3/h'
      }
    ]);
    await fixture.whenStable();

    const listItem = element.querySelector<HTMLElement>('li')!;
    expect(listItem).toMatchTextContent(/Test maximum volume flow/);
    expect(listItem).toMatchTextContent(/3\.7 m3\/h/);
  });

  it('should show no test step values if none provided', async () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        value: '3.7 m3/h'
      }
    ]);
    await fixture.whenStable();
    expect(element.querySelector<HTMLElement>('ul')!).toMatchTextContent(/3\.7 m3\/h/);

    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      }
    ]);
    await fixture.whenStable();

    const list = element.querySelector<HTMLElement>('ul')!;
    expect(list).toMatchTextContent(/Test maximum volume flow/);
    expect(list).not.toMatchTextContent(/3\.7 m3\/h/);
  });

  it('should show step errors if provided', async () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'failed',
        errorMessage: 'an error message'
      }
    ]);
    await fixture.whenStable();

    const listItem = element.querySelector<HTMLElement>('li')!;
    expect(listItem).toMatchTextContent(/Test maximum volume flow/);
    expect(listItem).toMatchTextContent(/an error message/);
  });

  it('should show no step errors if none provided', async () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'failed',
        errorMessage: 'an error message'
      }
    ]);
    await fixture.whenStable();
    expect(element.querySelector<HTMLElement>('ul')!).toMatchTextContent(/an error message/);

    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed'
      }
    ]);
    await fixture.whenStable();

    const list = element.querySelector<HTMLElement>('ul')!;
    expect(list).toMatchTextContent(/Test maximum volume flow/);
    expect(list).not.toMatchTextContent(/an error message/);
  });

  it('should show detail text if provided', async () => {
    steps.set([
      {
        description: 'Test maximum volume flow',
        state: 'passed',
        detail: 'Test this detail'
      }
    ]);
    await fixture.whenStable();

    const listItem = element.querySelector<HTMLElement>('li')!;
    expect(listItem).toMatchTextContent(/Test maximum volume flow/);
    expect(listItem).toMatchTextContent(/Test this detail/);
  });
});
