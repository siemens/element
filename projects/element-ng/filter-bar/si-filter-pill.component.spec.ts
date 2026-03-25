/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Filter } from './filter';
import { SiFilterPillComponent } from './index';

describe('SiFilterPillComponent', () => {
  let fixture: ComponentFixture<SiFilterPillComponent>;
  let element: HTMLElement;

  let filter: WritableSignal<Filter>;
  let totalPills: WritableSignal<number>;
  let deleteFiltersSpy: (event: Filter) => void;

  beforeEach(() => {
    filter = signal<Filter>({
      filterName: '',
      title: '',
      description: ''
    });
    totalPills = signal(1);
    deleteFiltersSpy = vi.fn();

    fixture = TestBed.createComponent(SiFilterPillComponent, {
      bindings: [
        inputBinding('filter', filter),
        inputBinding('totalPills', totalPills),
        outputBinding('deleteFilters', deleteFiltersSpy)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should correctly display the filter properties', async () => {
    filter.set({
      filterName: 'location',
      title: 'Current Location',
      description: 'Florida'
    });
    await fixture.whenStable();
    expect(element.querySelector('div.name')!).toHaveTextContent('Current Location');
    expect(element.querySelector('div.value')!).toHaveTextContent('Florida');
  });

  it('should emit a deleted event if deleted - for single pill', async () => {
    filter.set({
      filterName: 'lastName',
      title: 'Last Name',
      description: 'Your Last Name'
    });
    await fixture.whenStable();
    element.querySelector<HTMLElement>('[aria-label="Remove"]')?.click();
    await fixture.whenStable();
    expect(deleteFiltersSpy).toHaveBeenCalled();
  });
});
