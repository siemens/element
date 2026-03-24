/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import {
  SiNotificationItemComponent,
  type NotificationItemLink,
  type NotificationItemPrimaryAction,
  type NotificationItemQuickAction,
  type NotificationItemRouterLink
} from './si-notification-item.component';

describe('SiNotificationItemComponent', () => {
  let fixture: ComponentFixture<SiNotificationItemComponent>;
  let element: HTMLElement;
  let timeStamp: WritableSignal<TranslatableString>;
  let heading: WritableSignal<TranslatableString>;
  let description: WritableSignal<TranslatableString | undefined>;
  let unread: WritableSignal<boolean>;
  let itemLink: WritableSignal<NotificationItemRouterLink | NotificationItemLink | undefined>;
  let quickActions: WritableSignal<NotificationItemQuickAction[] | undefined>;
  let primaryAction: WritableSignal<NotificationItemPrimaryAction | undefined>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    })
  );

  beforeEach(() => {
    timeStamp = signal<TranslatableString>('Today 12:00');
    heading = signal<TranslatableString>('Heading');
    description = signal<TranslatableString | undefined>(undefined);
    unread = signal(false);
    itemLink = signal<NotificationItemRouterLink | NotificationItemLink | undefined>(undefined);
    quickActions = signal<NotificationItemQuickAction[] | undefined>(undefined);
    primaryAction = signal<NotificationItemPrimaryAction | undefined>(undefined);

    fixture = TestBed.createComponent(SiNotificationItemComponent, {
      bindings: [
        inputBinding('timeStamp', timeStamp),
        inputBinding('heading', heading),
        inputBinding('description', description),
        inputBinding('unread', unread),
        inputBinding('itemLink', itemLink),
        inputBinding('quickActions', quickActions),
        inputBinding('primaryAction', primaryAction)
      ]
    });
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

  it('should display the description', async () => {
    description.set('Description');
    await fixture.whenStable();
    expect(element.querySelectorAll('span.si-body')[1].innerHTML).toContain('Description');
  });

  it('should display the unread state', async () => {
    unread.set(true);
    await fixture.whenStable();
    expect(element.querySelector('span.si-h5')).not.toBeTruthy();
    expect(element.querySelector('span.si-h5-bold')).toBeTruthy();
    expect(element.querySelector('span.dot')).toBeTruthy();
  });

  it('should link with the item link', async () => {
    itemLink.set({ type: 'link', href: '/test' });
    await fixture.whenStable();
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/test');
  });

  it('should link with the router link', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    itemLink.set({ type: 'router-link', routerLink: '/test' });
    await fixture.whenStable();

    element.querySelector<HTMLElement>('a')?.click();
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('should display the quick actions', async () => {
    quickActions.set([
      {
        type: 'action-icon-button',
        action: () => {},
        ariaLabel: 'Action',
        icon: 'element-plant'
      },
      { type: 'link', href: '/test', ariaLabel: 'Link', icon: 'element-plant' },
      { type: 'router-link', routerLink: '/test', ariaLabel: 'Router Link', icon: 'element-plant' }
    ]);
    await fixture.whenStable();
    expect(element.querySelectorAll('button').length).toBe(1);
    expect(element.querySelectorAll('a').length).toBe(2);
  });

  it('should display the primary action menu', async () => {
    primaryAction.set({
      type: 'menu',
      menuItems: [
        { type: 'action', label: 'Action 1', action: () => {} },
        { type: 'action', label: 'Action 2', action: () => {} }
      ]
    });
    await fixture.whenStable();
    expect(element.querySelector('button si-icon')).toBeTruthy();
  });

  it('should display the primary action action-button', async () => {
    primaryAction.set({
      type: 'action-button',
      label: 'Action',
      action: () => {}
    });
    await fixture.whenStable();
    expect(element.querySelector('button')?.textContent).toContain('Action');
  });
});
