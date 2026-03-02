/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestScheduler } from 'rxjs/testing';

import { SiListWidgetBodyComponent, SortOrder } from './si-list-widget-body.component';
import { SiListWidgetItem } from './si-list-widget-item.component';

describe('SiListWidgetBodyComponent', () => {
  let fixture: ComponentFixture<SiListWidgetBodyComponent>;
  let element: HTMLElement;
  let testScheduler: TestScheduler;
  let value: WritableSignal<SiListWidgetItem[] | undefined>;
  let numberOfLinks: WritableSignal<number | undefined>;
  let sort: WritableSignal<SortOrder | undefined>;
  let search: WritableSignal<boolean>;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  beforeEach(() => {
    value = signal(undefined);
    numberOfLinks = signal(undefined);
    sort = signal(undefined);
    search = signal(false);
    fixture = TestBed.createComponent(SiListWidgetBodyComponent, {
      bindings: [
        inputBinding('value', value),
        inputBinding('numberOfLinks', numberOfLinks),
        inputBinding('sort', sort),
        inputBinding('search', search)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should show 6 skeletons as default without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(6);
  });

  it('should enable number skeleton configuration', () => {
    numberOfLinks.set(10);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(10);

    numberOfLinks.set(12);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(12);
  });

  it('should display list items', () => {
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(0);
    expect(element.querySelectorAll('si-list-widget-item').length).toBe(3);
  });

  it('should support initial sorting of list items', () => {
    sort.set('DSC');
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();
    const items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(3);
    expect(items.item(0).textContent).toContain('item_3');
  });

  it('should support resorting when new values are set', () => {
    sort.set('DSC');
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();
    let items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(3);
    expect(items.item(0).textContent).toContain('item_3');

    value.set([{ label: 'item_4' }, { label: 'item_5' }, { label: 'item_6' }, { label: 'item_7' }]);
    fixture.detectChanges();

    items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_7');
  });

  it('should support changing sort order of list items with labels', () => {
    sort.set('DSC');
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();

    sort.set('ASC');
    fixture.detectChanges();

    const items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support changing sort order of list items with links', () => {
    sort.set('DSC');
    value.set([
      { label: { title: 'item_1' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_3' } }
    ]);
    fixture.detectChanges();

    sort.set('ASC');
    fixture.detectChanges();

    const items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support search', () => {
    testScheduler.run(({ flush }) => {
      value.set([
        { label: { title: 'item_1' } },
        { label: { title: 'item_2' } },
        { label: 'item_2' },
        { label: 'item_3' }
      ]);
      fixture.detectChanges();

      // No search as default
      expect(element.querySelector('si-search-bar')).toBeNull();

      // Show the search bar
      search.set(true);
      fixture.detectChanges();
      const searchBar = element.querySelector('si-search-bar');
      expect(searchBar).not.toBeNull();

      // Enter text in the search input and search
      const searchBarInput = element.querySelector('input');
      searchBarInput!.value = 'item_3';
      searchBarInput!.dispatchEvent(new Event('input'));
      flush();
      fixture.detectChanges();

      let items = element.querySelectorAll('si-list-widget-item');
      expect(items.length).toBe(1);
      expect(items.item(0).textContent).not.toContain('item_1');
      expect(items.item(0).textContent).toContain('item_3');

      // Clear search again
      searchBarInput!.value = '';
      searchBarInput!.dispatchEvent(new Event('input'));
      flush();
      fixture.detectChanges();

      items = element.querySelectorAll('si-list-widget-item');
      expect(items.length).toBe(4);
    });
  });

  it('should not fail when searching without value', () => {
    testScheduler.run(({ flush }) => {
      search.set(true);
      fixture.detectChanges();

      // Should show 6 skeletons
      expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();

      // Enter text in the search input and search
      const searchBarInput = element.querySelector('input');
      searchBarInput!.value = 'item_3';
      searchBarInput!.dispatchEvent(new Event('input'));
      flush();
      fixture.detectChanges();

      // Should show 6 skeletons after search
      let items = element.querySelectorAll('.si-link-widget-skeleton');
      expect(items.length).toBe(6);

      // Clear search again
      searchBarInput!.value = '';
      searchBarInput!.dispatchEvent(new Event('input'));
      flush();
      fixture.detectChanges();

      // Should still show 6 skeletons after clearing search
      items = element.querySelectorAll('si-list-widget-item');
      expect(items.length).toBe(6);
    });
  });
});
