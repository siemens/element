/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { Filter, SiFilterBarComponent } from './index';

describe('SiFilterBarComponent', () => {
  let fixture: ComponentFixture<SiFilterBarComponent>;
  let element: HTMLElement;
  const timeout = async (ms?: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

  let filters: WritableSignal<Filter[]>;
  let allowReset: WritableSignal<boolean>;
  let resetText: WritableSignal<TranslatableString>;
  let disabled: WritableSignal<boolean>;

  const removeButtons = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('[aria-label="Remove"]'));

  beforeEach(() => {
    filters = signal<Filter[]>([]);
    allowReset = signal(false);
    resetText = signal<TranslatableString>('');
    disabled = signal(false);

    fixture = TestBed.createComponent(SiFilterBarComponent, {
      bindings: [
        twoWayBinding('filters', filters),
        inputBinding('allowReset', allowReset),
        inputBinding('resetText', resetText),
        inputBinding('disabled', disabled)
      ]
    });
    element = fixture.nativeElement;
    element.classList.add('d-block');
    element.style.width = '600px';
  });

  it('should not show empty indicator when filters are active', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    await fixture.whenStable();
    expect(filters().length).toBeTruthy();
  });

  it('should not display reset button when responsive is set and allow reset is false', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    allowReset.set(false);
    await fixture.whenStable();
    expect(element.querySelector('button.text-nowrap')).not.toBeInTheDocument();
  });

  it('should not display reset button when allow reset is set', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    allowReset.set(false);
    await fixture.whenStable();

    expect(element.querySelector('button.text-nowrap')).not.toBeInTheDocument();
  });

  it('should correctly display reset button when responsive and allowReset is set', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    allowReset.set(true);
    resetText.set('reset test');
    await fixture.whenStable();

    const resetButton = element.querySelector('button.text-nowrap') as HTMLButtonElement;

    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveTextContent('reset test');
  });

  it('should disable reset button when disabled and responsive and allowReset is set', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    allowReset.set(true);
    disabled.set(true);
    await fixture.whenStable();

    const resetButton = element.querySelector('button') as HTMLButtonElement;

    expect(resetButton).toBeDisabled();
  });

  it('should show empty indicator when no filters are active', async () => {
    filters.set([]);
    await fixture.whenStable();
    expect(filters().length).toBeFalsy();
  });

  it('should emit a change event when modified', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
    await fixture.whenStable();
    element.querySelector<HTMLElement>('[aria-label="Remove"]')!.click();

    expect(filters()).toEqual([
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
  });

  it('should clear the applied filters on reset', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
    allowReset.set(true);
    await fixture.whenStable();
    element.querySelector<HTMLElement>('button.text-nowrap')!.click();
    await fixture.whenStable();
    expect(element.querySelector('button.text-nowrap')).not.toBeInTheDocument();
  });

  it('should emit a change event when modified from inside', async () => {
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      }
    ]);
    await fixture.whenStable();
    removeButtons().at(1)!.click();

    expect(filters()).toEqual([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      }
    ]);
  });

  it('should emit a change event when modified from filter group while using responsive', async () => {
    element.style.width = '650px';
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country1',
        title: 'First Country',
        description: 'USA',
        status: 'info'
      },
      {
        filterName: 'country2',
        title: 'Second Country',
        description: 'IO',
        status: 'info'
      },
      {
        filterName: 'country3',
        title: 'Third Country',
        description: 'TC',
        status: 'info'
      },
      {
        filterName: 'lastCountry',
        title: 'Last Country',
        description: 'CH',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    expect(filters().length).toEqual(5);
    removeButtons().at(-1)!.click();

    expect(filters().length).toEqual(3);
  });

  it('should not display too many filters when responsive is enabled', async () => {
    element.style.width = '650px';
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'IO',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'TC',
        status: 'info'
      },
      {
        filterName: 'lastCountry',
        title: 'Last Country',
        description: 'CH',
        status: 'info'
      }
    ]);
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    const values = element.querySelectorAll<HTMLElement>('si-filter-pill .value');
    expect(values[values.length - 1]).toHaveTextContent('+ 1 filters');
  });

  it('should not display too many filters when responsive is enabled and allow reset disabled', async () => {
    element.style.width = '600px';
    filters.set([
      {
        filterName: 'city',
        title: 'City',
        description: 'Chicago',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'USA',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'IO',
        status: 'info'
      },
      {
        filterName: 'country',
        title: 'Country',
        description: 'TC',
        status: 'info'
      },
      {
        filterName: 'lastCountry',
        title: 'Last Country',
        description: 'CH',
        status: 'info'
      }
    ]);
    allowReset.set(false);
    fixture.detectChanges();
    await timeout(200);
    fixture.detectChanges();
    const values = element.querySelectorAll<HTMLElement>('si-filter-pill .value');
    expect(values[values.length - 1]).toHaveTextContent('+ 2 filters');
  });
});
