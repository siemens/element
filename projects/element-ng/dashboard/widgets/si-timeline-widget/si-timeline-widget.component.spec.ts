/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiTimelineWidgetItem } from './si-timeline-widget-item.component';
import { SiTimelineWidgetComponent } from './si-timeline-widget.component';

describe('SiTimelineWidgetComponent', () => {
  let fixture: ComponentFixture<SiTimelineWidgetComponent>;
  let element: HTMLElement;
  let value: WritableSignal<SiTimelineWidgetItem[] | undefined>;
  let numberOfItems: WritableSignal<number | undefined>;
  let showDescription: WritableSignal<boolean>;

  beforeEach(() => {
    value = signal(undefined);
    numberOfItems = signal(undefined);
    showDescription = signal(true);
    fixture = TestBed.createComponent(SiTimelineWidgetComponent, {
      bindings: [
        inputBinding('value', value),
        inputBinding('numberOfItems', numberOfItems),
        inputBinding('showDescription', showDescription)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should show 4 si-skeletons as default without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(4);
  });

  it('should show 12 si-link-widget-skeletons as default without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(12);
  });

  it('should show 8 si-link-widget-skeletons as default without value and without showing the description', () => {
    showDescription.set(false);
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(8);
  });

  it('should enable number skeleton configuration', () => {
    const numItems = 3;
    numberOfItems.set(numItems);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(numItems);
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(numItems * 3);
  });

  it('should enable number skeleton configuration without showing the description', () => {
    const numItems = 3;
    numberOfItems.set(numItems);
    showDescription.set(false);
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(numItems);
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(numItems * 2);
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
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(0);
    expect(element.querySelectorAll('si-timeline-widget-item').length).toBe(3);
  });
});
