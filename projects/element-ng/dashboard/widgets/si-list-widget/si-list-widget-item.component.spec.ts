/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiListWidgetItem, SiListWidgetItemComponent } from './si-list-widget-item.component';

describe('SiListWidgetItemComponent', () => {
  let fixture: ComponentFixture<SiListWidgetItemComponent>;
  let element: HTMLElement;
  const value = signal<SiListWidgetItem | undefined>(undefined);

  beforeEach(() => {
    value.set(undefined);
    fixture = TestBed.createComponent(SiListWidgetItemComponent, {
      bindings: [inputBinding('value', value)]
    });
    element = fixture.nativeElement;
  });

  it('should show a skeleton without value', async () => {
    await fixture.whenStable();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
  });

  it('should display the item label string', async () => {
    value.set({ label: 'label' });
    await fixture.whenStable();
    expect(element.querySelector('.si-h5')!).toHaveTextContent('label');
  });

  it('should display the item link', async () => {
    value.set({ label: { title: 'example.org', href: 'https://example.org' } });
    await fixture.whenStable();
    expect(element.querySelector('a')!).toHaveTextContent('example.org');
  });

  it('should display the item badge with default color', async () => {
    value.set({ label: 'label', badge: 'badge' });
    await fixture.whenStable();
    expect(element.querySelector('.badge')!).toHaveTextContent('badge');
    expect(element.querySelector('.bg-default')).toBeInTheDocument();
  });

  it('should display the item badge with background color', async () => {
    value.set({ label: 'label', badge: 'badge', badgeColor: 'primary' });
    await fixture.whenStable();
    expect(element.querySelector('.badge')!).toHaveTextContent('badge');
    expect(element.querySelector('.bg-primary')).toBeInTheDocument();
  });

  it('should display the item description', async () => {
    value.set({ label: 'label', description: 'description' });
    await fixture.whenStable();
    expect(element.querySelector('.si-body')!).toHaveTextContent('description');
  });

  it('should display the item text', async () => {
    value.set({ label: 'label', text: 'text' });
    await fixture.whenStable();
    expect(element.textContent).toContain('text');
  });

  it('should display the item action', async () => {
    value.set({
      label: 'label',
      action: { title: 'action', action: () => undefined },
      actionIcon: 'element-user'
    });
    await fixture.whenStable();
    expect(element.querySelector('.element-user')).toBeInTheDocument();
    const actionButton = element.querySelector('button');
    expect(actionButton).toBeDefined();
    expect(actionButton).toHaveAttribute('aria-label', 'action');
  });
});
