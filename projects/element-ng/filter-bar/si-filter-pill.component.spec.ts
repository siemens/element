/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Filter } from './filter';
import { SiFilterPillComponent } from './index';

@Component({
  imports: [SiFilterPillComponent],
  template: `
    <si-filter-pill [totalPills]="1" [filter]="filter" (deleteFilters)="deleteFilters($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  filter!: Filter;
  deleteFilters = (event: any): void => {};
}

describe('SiFilterPillComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiFilterPillComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should correctly display the filter properties', () => {
    component.filter = {
      filterName: 'location',
      title: 'Current Location',
      description: 'Florida'
    };
    fixture.detectChanges();
    expect(element.querySelector('div.name')!.innerHTML).toBe('Current Location');
    expect(element.querySelector('div.value')!.innerHTML).toBe('Florida');
  });

  it('should emit a deleted event if deleted - for single pill', () => {
    component.filter = {
      filterName: 'lastName',
      title: 'Last Name',
      description: 'Your Last Name'
    };
    const spyEvent = vi.spyOn(component, 'deleteFilters');
    fixture.detectChanges();
    element.querySelector<HTMLElement>('[aria-label="Remove"]')?.click();
    fixture.detectChanges();
    expect(spyEvent).toHaveBeenCalled();
  });
});
