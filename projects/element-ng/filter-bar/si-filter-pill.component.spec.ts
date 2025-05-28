/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { Filter } from './filter';
import { SiFilterPillComponent } from './index';

@Component({
  template: `
    <si-filter-pill [totalPills]="1" [filter]="filter" (deleteFilters)="deleteFilters($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiFilterPillComponent]
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
      imports: [SiFilterPillComponent, TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should correctly display the filter properties', fakeAsync(() => {
    component.filter = {
      filterName: 'location',
      title: 'Current Location',
      description: 'Florida',
      status: 'warning'
    };
    fixture.detectChanges();
    expect(element.querySelector('div.name')!.innerHTML).toBe('Current Location');
    expect(element.querySelector('div.value')!.innerHTML).toBe('Florida');
    expect(element.querySelector('.pill.pill-warning')!.innerHTML).toBeDefined();
  }));

  it('should emit a deleted event if deleted - for single pill', fakeAsync(() => {
    component.filter = {
      filterName: 'lastName',
      title: 'Last Name',
      description: 'Your Last Name',
      status: 'info'
    };
    const spyEvent = spyOn(component, 'deleteFilters');
    fixture.detectChanges();
    flush();
    element.querySelector<HTMLElement>('[aria-label="Remove"]')?.click();
    fixture.detectChanges();
    expect(spyEvent).toHaveBeenCalled();
  }));
});
