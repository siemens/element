/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import {
  SiNotificationItemComponent,
  type NotificationItemLink,
  type NotificationItemPrimaryAction,
  type NotificationItemQuickAction,
  type NotificationItemRouterLink
} from './si-notification-item.component';

@Component({
  imports: [SiNotificationItemComponent],
  template: `
    <si-notification-item
      [timeStamp]="timeStamp"
      [heading]="heading"
      [description]="description"
      [unread]="unread"
      [itemLink]="itemLink"
      [quickActions]="quickActions"
      [primaryAction]="primaryAction"
    />
  `,
  providers: [
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          queryParams: {}
        }
      }
    }
  ]
})
class TestHostComponent {
  timeStamp = 'Today 12:00';
  heading = 'Heading';

  description?: string;
  unread?: boolean;
  itemLink?: NotificationItemRouterLink | NotificationItemLink;
  quickActions?: NotificationItemQuickAction[];
  primaryAction?: NotificationItemPrimaryAction;
}

describe('SiNotificationItemComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
    expect(element.querySelector('span.si-body.text-secondary')!.innerHTML).toContain(
      'Today 12:00'
    );
    expect(element.querySelector('span.si-h5')!.innerHTML).toContain('Heading');
  });

  it('should display the description', () => {
    component.description = 'Description';
    fixture.detectChanges();
    expect(element.querySelectorAll('span.si-body')[1].innerHTML).toContain('Description');
  });

  it('should display the unread state', () => {
    component.unread = true;
    fixture.detectChanges();
    expect(element.querySelector('span.si-h5')).not.toBeTruthy();
    expect(element.querySelector('span.si-h5-bold')).toBeTruthy();
    expect(element.querySelector('span.dot')).toBeTruthy();
  });

  it('should link with the item link', () => {
    component.itemLink = { type: 'link', href: '/test' };
    fixture.detectChanges();
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/test');
  });

  it('should link with the router link', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    component.itemLink = { type: 'router-link', routerLink: '/test' };
    fixture.detectChanges();

    element.querySelector<HTMLElement>('a')?.click();
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('should display the quick actions', () => {
    component.quickActions = [
      {
        type: 'action-circle-button',
        action: () => {},
        ariaLabel: 'Action',
        icon: 'element-plant'
      },
      { type: 'link', href: '/test', ariaLabel: 'Link', icon: 'element-plant' },
      { type: 'router-link', routerLink: '/test', ariaLabel: 'Router Link', icon: 'element-plant' }
    ];
    fixture.detectChanges();
    expect(element.querySelectorAll('button').length).toBe(1);
    expect(element.querySelectorAll('a').length).toBe(2);
  });

  it('should display the primary action menu', () => {
    component.primaryAction = {
      type: 'menu',
      menuItems: [
        { type: 'action', label: 'Action 1', action: () => {} },
        { type: 'action', label: 'Action 2', action: () => {} }
      ]
    };
    fixture.detectChanges();
    expect(element.querySelector('button.element-options-vertical')).toBeTruthy();
  });

  it('should display the primary action action-button', () => {
    component.primaryAction = {
      type: 'action-button',
      label: 'Action',
      action: () => {}
    };
    fixture.detectChanges();
    expect(element.querySelector('button')?.textContent).toContain('Action');
  });
});
