/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';

import { SortOrder } from './si-list-widget-body.component';
import { SiListWidgetItem } from './si-list-widget-item.component';
import { SiListWidgetComponent } from './si-list-widget.component';

@Component({
  imports: [SiListWidgetComponent],
  template: `
    <si-list-widget
      [value]="items"
      [numberOfLinks]="numberOfLinks"
      [sort]="sort"
      [search]="search"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  items?: SiListWidgetItem[];
  numberOfLinks?: number;
  sort?: SortOrder;
  search = false;
}

describe('SiListWidgetComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should show 6 skeletons as default without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(6);
  });

  it('should enable number skeleton configuration', () => {
    component.numberOfLinks = 10;
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(10);
  });

  it('should display list items', () => {
    component.items = [{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }];
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(0);
    expect(element.querySelectorAll('si-list-widget-item').length).toBe(3);
  });

  it('should support initial sorting of list items', () => {
    component.sort = 'DSC';
    component.items = [{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }];
    fixture.detectChanges();
    const items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(3);
    expect(items.item(0).textContent).toContain('item_3');
  });

  it('should support changing sort order of list items with labels', () => {
    component.sort = 'DSC';
    component.items = [
      { label: 'item_1' },
      { label: 'item_2' },
      { label: 'item_2' },
      { label: 'item_3' }
    ];
    fixture.detectChanges();

    component.sort = 'ASC';
    runOnPushChangeDetection(fixture);

    const items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support changing sort order of list items with links', () => {
    component.sort = 'DSC';
    component.items = [
      { label: { title: 'item_1' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_3' } }
    ];
    fixture.detectChanges();

    component.sort = 'ASC';
    runOnPushChangeDetection(fixture);

    const items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support sort by action', () => {
    component.sort = 'ASC';
    component.items = [
      { label: { title: 'item_1' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_3' } }
    ];
    fixture.detectChanges();

    let action: HTMLButtonElement | undefined = undefined;
    element.querySelectorAll('button').forEach(btn => {
      if (btn.getAttribute('title') === 'Sort descending') {
        action = btn;
      }
    });
    expect(action).toBeDefined();
    action!.click();
    fixture.detectChanges();

    let items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_3');

    element.querySelectorAll('button').forEach(btn => {
      if (btn.getAttribute('title') === 'Sort ascending') {
        action = btn;
      }
    });
    expect(action).toBeDefined();
    action!.click();
    fixture.detectChanges();

    items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support search', fakeAsync(() => {
    component.items = [
      { label: { title: 'item_1' } },
      { label: { title: 'item_2' } },
      { label: 'item_2' },
      { label: 'item_3' }
    ];
    fixture.detectChanges();

    // No search as default
    expect(element.querySelector('si-search-bar')).toBeNull();

    // Show the search bar
    component.search = true;
    runOnPushChangeDetection(fixture);
    const searchBar = element.querySelector('si-search-bar');
    expect(searchBar).not.toBeNull();

    // Enter text in the search input and search
    const searchBarInput = element.querySelector('input');
    searchBarInput!.value = 'item_3';
    searchBarInput!.dispatchEvent(new Event('input'));
    tick(500);
    runOnPushChangeDetection(fixture);

    let items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(1);
    expect(items.item(0).textContent).not.toContain('item_1');
    expect(items.item(0).textContent).toContain('item_3');

    // Clear search again
    searchBarInput!.value = '';
    searchBarInput!.dispatchEvent(new Event('input'));
    tick(500);
    runOnPushChangeDetection(fixture);

    items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(4);
  }));

  it('should not fail when searching without value', fakeAsync(() => {
    component.search = true;
    runOnPushChangeDetection(fixture);

    // Should show 6 skeletons
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();

    // Enter text in the search input and search
    const searchBarInput = element.querySelector('input');
    searchBarInput!.value = 'item_3';
    searchBarInput!.dispatchEvent(new Event('input'));
    tick(500);
    runOnPushChangeDetection(fixture);

    // Should show 6 skeletons after search
    let items = element.querySelectorAll('.si-link-widget-skeleton');
    expect(items.length).toBe(6);

    // Clear search again
    searchBarInput!.value = '';
    searchBarInput!.dispatchEvent(new Event('input'));
    tick(500);
    runOnPushChangeDetection(fixture);

    // Should still show 6 skeletons after clearing search
    items = element.querySelectorAll('si-list-widget-item');
    expect(items.length).toBe(6);
  }));
});
