/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Link } from '@siemens/element-ng/link';

import { SiTimelineWidgetItem } from './si-timeline-widget-item.component';
import { SiTimelineWidgetComponent } from './si-timeline-widget.component';

describe('SiTimelineWidgetComponent', () => {
  let fixture: ComponentFixture<SiTimelineWidgetComponent>;
  let element: HTMLElement;
  let value: WritableSignal<SiTimelineWidgetItem[] | undefined>;
  let numberOfItems: WritableSignal<number | undefined>;
  let showDescription: WritableSignal<boolean>;
  let link: WritableSignal<Link | undefined>;

  beforeEach(() => {
    value = signal(undefined);
    numberOfItems = signal(undefined);
    showDescription = signal(true);
    link = signal(undefined);
    fixture = TestBed.createComponent(SiTimelineWidgetComponent, {
      bindings: [
        inputBinding('value', value),
        inputBinding('numberOfItems', numberOfItems),
        inputBinding('showDescription', showDescription),
        inputBinding('link', link)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should show 4 si-skeletons as default without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton')).toHaveLength(4);
  });

  it('should show 12 si-link-widget-skeletons as default without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(12);
  });

  it('should show 8 si-link-widget-skeletons as default without value and without showing the description', () => {
    showDescription.set(false);
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(8);
  });

  it('should enable number skeleton configuration', () => {
    const numItems = 3;
    numberOfItems.set(numItems);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-skeleton')).toHaveLength(numItems);
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(numItems * 3);
  });

  it('should enable number skeleton configuration without showing the description', () => {
    const numItems = 3;
    numberOfItems.set(numItems);
    showDescription.set(false);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-skeleton')).toHaveLength(numItems);
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(numItems * 2);
  });

  it('should display a footer anchor with the link title, destination and icon', async () => {
    link.set({ title: 'View all events', href: '/events', target: '_blank' });
    await fixture.whenStable();

    const anchor = element.querySelector('.card-footer a');
    expect(anchor).toHaveTextContent('View all events');
    expect(anchor).toHaveAttribute('href', '/events');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor!.querySelector('si-icon')).toHaveClass('link-icon', 'link-end');
    expect(element.querySelector('.card-footer button')).toBeNull();
  });

  it('should display a footer button that invokes the link action', async () => {
    const action = vi.fn();
    link.set({ title: 'Load more events', action });
    await fixture.whenStable();

    const button = element.querySelector<HTMLButtonElement>('.card-footer button')!;
    expect(button).toHaveTextContent('Load more events');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn', 'btn-link');
    expect(element.querySelector('.card-footer a')).toBeNull();
    expect(button.querySelector('si-icon')).toBeNull();

    button.click();
    await fixture.whenStable();

    expect(action).toHaveBeenCalledExactlyOnceWith();
  });

  it('should remove the footer when the link is removed', async () => {
    link.set({ title: 'View all events', href: '/events' });
    await fixture.whenStable();

    expect(element.querySelector('.card-footer a')).toHaveTextContent('View all events');

    link.set(undefined);
    await fixture.whenStable();

    expect(element.querySelector('.card-footer')).toBeNull();
  });

  it('should display timeline items', () => {
    value.set([
      {
        timeStamp: 'Today 23:59',
        title: 'Title',
        description: 'Description',
        icon: 'element-triangle-filled',
        iconColor: 'status-warning',
        stackedIcon: 'element-state-exclamation-mark',
        stackedIconColor: 'status-warning-contrast'
      },
      {
        timeStamp: 'Today 23:59',
        title: 'Title',
        icon: 'element-circle-filled',
        iconColor: 'status-danger',
        stackedIcon: 'element-state-exclamation-mark',
        stackedIconColor: 'status-danger-contrast'
      },
      {
        timeStamp: 'Today 23:59',
        title: 'Title',
        icon: 'element-plant'
      }
    ]);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton')).toHaveLength(0);
    expect(element.querySelectorAll('si-timeline-widget-item')).toHaveLength(3);
  });
});
