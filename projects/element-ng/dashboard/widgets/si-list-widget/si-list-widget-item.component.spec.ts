/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiListWidgetItem, SiListWidgetItemComponent } from './si-list-widget-item.component';

@Component({
  imports: [SiListWidgetItemComponent],
  template: ` <si-list-widget-item [value]="item" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  item?: SiListWidgetItem;
}

describe('SiListWidgetItemComponent', () => {
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

  it('should show a skeleton without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
  });

  it('should display the item label string', () => {
    component.item = { label: 'label' };
    fixture.detectChanges();
    expect(element.querySelector('.si-title-2')!.innerHTML).toContain('label');
  });

  it('should display the item link', () => {
    component.item = { label: { title: 'example.org', href: 'https://example.org' } };
    fixture.detectChanges();
    expect(element.querySelector('a')!.innerHTML).toContain('example.org');
  });

  it('should display the item badge with default color', () => {
    component.item = { label: 'label', badge: 'badge' };
    fixture.detectChanges();
    expect(element.querySelector('.badge')!.innerHTML).toContain('badge');
    expect(element.querySelector('.bg-default')).not.toBeNull();
  });

  it('should display the item badge with background color', () => {
    component.item = { label: 'label', badge: 'badge', badgeColor: 'primary' };
    fixture.detectChanges();
    expect(element.querySelector('.badge')!.innerHTML).toContain('badge');
    expect(element.querySelector('.bg-primary')).not.toBeNull();
  });

  it('should display the item description', () => {
    component.item = { label: 'label', description: 'description' };
    fixture.detectChanges();
    expect(element.querySelector('.si-body-2')!.innerHTML).toContain('description');
  });

  it('should display the item text', () => {
    component.item = { label: 'label', text: 'text' };
    fixture.detectChanges();
    expect(element.textContent).toContain('text');
  });

  it('should display the item action', () => {
    component.item = {
      label: 'label',
      action: { title: 'action', action: () => undefined },
      actionIcon: 'element-user'
    };
    fixture.detectChanges();
    expect(element.querySelector('.element-user')).not.toBeNull();
    const actionButton = element.querySelector('button');
    expect(actionButton).toBeDefined();
    expect(actionButton?.getAttribute('aria-label')).toBe('action');
  });
});
