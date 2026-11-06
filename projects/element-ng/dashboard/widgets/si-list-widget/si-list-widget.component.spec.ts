/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { SortOrder } from './si-list-widget-body.component';
import { SiListWidgetItem } from './si-list-widget-item.component';
import { SiListWidgetComponent } from './si-list-widget.component';

describe('SiListWidgetComponent', () => {
  let fixture: ComponentFixture<SiListWidgetComponent>;
  let element: HTMLElement;
  let value: WritableSignal<SiListWidgetItem[] | undefined>;
  let numberOfLinks: WritableSignal<number | undefined>;
  let sort: WritableSignal<SortOrder | undefined>;
  let search: WritableSignal<boolean>;

  beforeEach(() => {
    value = signal(undefined);
    numberOfLinks = signal(undefined);
    sort = signal(undefined);
    search = signal(false);
    fixture = TestBed.createComponent(SiListWidgetComponent, {
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
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(6);
  });

  it('should enable number skeleton configuration', () => {
    numberOfLinks.set(10);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(10);
  });

  it('should display list items', () => {
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(0);
    expect(element.querySelectorAll('si-list-widget-item')).toHaveLength(3);
  });

  it('should support initial sorting of list items', () => {
    sort.set('DSC');
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();
    const items = element.querySelectorAll('si-list-widget-item');
    expect(items).toHaveLength(3);
    expect(items.item(0).textContent).toContain('item_3');
  });

  it('should support changing sort order of list items with labels', () => {
    sort.set('DSC');
    value.set([{ label: 'item_1' }, { label: 'item_2' }, { label: 'item_2' }, { label: 'item_3' }]);
    fixture.detectChanges();

    sort.set('ASC');
    fixture.detectChanges();

    const items = element.querySelectorAll('si-list-widget-item');
    expect(items).toHaveLength(4);
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
    expect(items).toHaveLength(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support sort by action', () => {
    sort.set('ASC');
    value.set([
      { label: { title: 'item_1' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_2' } },
      { label: { title: 'item_3' } }
    ]);
    fixture.detectChanges();

    const action = element.querySelector(
      'si-content-action-bar button[aria-label="Sort descending"]'
    ) as HTMLButtonElement;

    expect(action).toBeDefined();
    action!.click();
    fixture.detectChanges();

    let items = element.querySelectorAll('si-list-widget-item');
    expect(items).toHaveLength(4);
    expect(items.item(0).textContent).toContain('item_3');

    expect(action).toBeDefined();
    action!.click();
    fixture.detectChanges();

    items = element.querySelectorAll('si-list-widget-item');
    expect(items).toHaveLength(4);
    expect(items.item(0).textContent).toContain('item_1');
  });

  it('should support search', async () => {
    value.set([
      { label: { title: 'item_1' } },
      { label: { title: 'item_2' } },
      { label: 'item_2' },
      { label: 'item_3' }
    ]);
    await fixture.whenStable();

    expect(element.querySelector('si-search-bar')).not.toBeInTheDocument();

    search.set(true);
    await fixture.whenStable();
    expect(element.querySelector('si-search-bar')).toBeInTheDocument();

    const searchBarInput = element.querySelector<HTMLInputElement>('input')!;
    const items = (): NodeListOf<Element> => element.querySelectorAll('si-list-widget-item');
    await userEvent.fill(searchBarInput, 'item_3');
    await fixture.whenStable();

    await expect.poll(items).toHaveLength(1);
    expect(items().item(0)).not.toHaveTextContent('item_1');
    expect(items().item(0)).toHaveTextContent('item_3');

    await userEvent.fill(searchBarInput, '');
    await fixture.whenStable();
    await expect.poll(items).toHaveLength(4);
  });

  it('should not fail when searching without value', async () => {
    search.set(true);
    await fixture.whenStable();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(6);

    const searchBarInput = element.querySelector<HTMLInputElement>('input')!;
    await userEvent.fill(searchBarInput, 'item_3');
    await userEvent.tab();
    await fixture.whenStable();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(6);

    await userEvent.fill(searchBarInput, '');
    await userEvent.tab();
    await fixture.whenStable();
    expect(element.querySelectorAll('si-list-widget-item')).toHaveLength(6);
  });
});
