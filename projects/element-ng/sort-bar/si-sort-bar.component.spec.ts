/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiSortBarComponent } from './si-sort-bar.component';

@Component({
  template: `<si-sort-bar
    [sortCriteria]="sortCriteria"
    [defaultSortCriteria]="defaultSortCriteria"
    (sortChange)="logEvent($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiSortBarComponent]
})
class TestHostComponent {
  readonly component = viewChild.required(SiSortBarComponent);
  sortCriteria = [
    { name: 'Name', key: 'name' },
    { name: 'Street', key: 'street' },
    { name: 'Country', key: 'country' }
  ];
  defaultSortCriteria: string | number = 'street';
  logEvent(event: any): void {}
}

describe('SiSortBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: SiSortBarComponent;
  let element: HTMLElement;

  const getCriteriaByKey = (key: string): HTMLElement | null =>
    element.querySelector<HTMLElement>(`div[data-key="${key}"]`);

  const getItemByIndex = (itemIndex: number): HTMLElement =>
    element.querySelectorAll<HTMLElement>('.sort-item')[itemIndex];

  const getNameByIndex = (itemIndex: number): HTMLElement | null =>
    getItemByIndex(itemIndex)?.querySelector('span:not(.icon)') ?? null;

  const getIconByIndex = (itemIndex: number): HTMLElement | null =>
    getItemByIndex(itemIndex)?.querySelector('.icon div') ?? null;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance.component();
    element = fixture.nativeElement;
  });

  it('should correctly identify the default sort criteria', () => {
    fixture.detectChanges();

    expect(getNameByIndex(1)?.textContent).toBe('Street');
    expect(getIconByIndex(1)?.classList).toContain('element-sort-up');
  });

  it('should correctly change the active sort criteria', () => {
    fixture.detectChanges();
    getCriteriaByKey('country')?.click();
    fixture.detectChanges();

    expect(getNameByIndex(2)?.textContent).toBe('Country');
    expect(getIconByIndex(2)?.classList).toContain('element-sort-up');
  });

  it('should correctly toggle the sort criteria', () => {
    fixture.detectChanges();

    expect(getNameByIndex(1)?.textContent).toBe('Street');
    expect(getIconByIndex(1)?.classList).toContain('element-sort-up');
    getCriteriaByKey('street')?.click();
    fixture.detectChanges();
    expect(getIconByIndex(1)?.classList).toContain('element-sort-down');
  });

  it('should successfully trigger the sort-change event', (done: DoneFn) => {
    fixture.detectChanges();
    const sortDirectionAfter = getIconByIndex(1)?.classList.contains('element-sort-up')
      ? 'desc'
      : 'asc';
    component.sortChange.subscribe((e: HttpParams) => {
      expect(e.get('sort')).toBe('street');
      expect(e.get('order')).toBe(sortDirectionAfter);
      done();
    });
    getItemByIndex(1)?.click();
  });
});
