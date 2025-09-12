/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-translate-ng/translate';
import { of } from 'rxjs';

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
      providers: [
        provideMockTranslateServiceBuilder(
          () =>
            ({
              translate: (key: string) => `translated:${key}`,
              translateAsync: (key: string) => of(`translated:${key}`)
            }) as SiTranslateService
        )
      ]
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
    expect(element.querySelector('div.name')!.innerHTML.trim()).toBe('translated:Current Location');
    expect(element.querySelector('div.value')!.innerHTML.trim()).toBe('translated:Florida');
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

  it('should not translate the title and description if disableAutoTranslation is true', fakeAsync(() => {
    component.filter = {
      filterName: 'language',
      title: 'LANGUAGE',
      description: 'LANGUAGE',
      status: 'default',
      disableAutoTranslation: true
    };
    fixture.detectChanges();
    flush();

    expect(element.querySelector('div.name')!.innerHTML.trim()).toBe('LANGUAGE');
    expect(element.querySelector('div.value')!.innerHTML.trim()).toBe('LANGUAGE');
  }));
});
