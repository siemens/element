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

  it('should show a skeleton without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
  });

  it('should display the item label string', () => {
    value.set({ label: 'label' });
    fixture.detectChanges();
    expect(element.querySelector('.si-h5')!.innerHTML).toContain('label');
  });

  it('should display the item link', () => {
    value.set({ label: { title: 'example.org', href: 'https://example.org' } });
    fixture.detectChanges();
    expect(element.querySelector('a')!.innerHTML).toContain('example.org');
  });

  it('should display the item badge with default color', () => {
    value.set({ label: 'label', badge: 'badge' });
    fixture.detectChanges();
    expect(element.querySelector('.badge')!.innerHTML).toContain('badge');
    expect(element.querySelector('.bg-default')).not.toBeNull();
  });

  it('should display the item badge with background color', () => {
    value.set({ label: 'label', badge: 'badge', badgeColor: 'primary' });
    fixture.detectChanges();
    expect(element.querySelector('.badge')!.innerHTML).toContain('badge');
    expect(element.querySelector('.bg-primary')).not.toBeNull();
  });

  it('should display the item description', () => {
    value.set({ label: 'label', description: 'description' });
    fixture.detectChanges();
    expect(element.querySelector('.si-body')!.innerHTML).toContain('description');
  });

  it('should display the item text', () => {
    value.set({ label: 'label', text: 'text' });
    fixture.detectChanges();
    expect(element.textContent).toContain('text');
  });

  it('should display the item action', () => {
    value.set({
      label: 'label',
      action: { title: 'action', action: () => undefined },
      actionIcon: 'element-user'
    });
    fixture.detectChanges();
    expect(element.querySelector('.element-user')).not.toBeNull();
    const actionButton = element.querySelector('button');
    expect(actionButton).toBeDefined();
    expect(actionButton?.getAttribute('aria-label')).toBe('action');
  });
});
