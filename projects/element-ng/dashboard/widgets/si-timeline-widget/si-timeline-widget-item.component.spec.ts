/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SiTimelineWidgetItem,
  SiTimelineWidgetItemComponent
} from './si-timeline-widget-item.component';

describe('SiTimelineWidgetItemComponent', () => {
  let fixture: ComponentFixture<SiTimelineWidgetItemComponent>;
  let element: HTMLElement;
  let value: WritableSignal<SiTimelineWidgetItem | undefined>;
  let showDescription: WritableSignal<boolean>;

  beforeEach(() => {
    value = signal(undefined);
    showDescription = signal(true);
    fixture = TestBed.createComponent(SiTimelineWidgetItemComponent, {
      bindings: [inputBinding('value', value), inputBinding('showDescription', showDescription)]
    });
    element = fixture.nativeElement;
  });

  it('should display a skeleton without value', async () => {
    await fixture.whenStable();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(1);
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(3);
    expect(element.querySelectorAll('.si-timeline-widget-lower-line').length).toBe(0);
  });

  it('should display a skeleton without value and without showing the description', async () => {
    showDescription.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(1);
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(2);
  });

  it('should display the lower line', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    await fixture.whenStable();
    expect(element.querySelector('.si-timeline-widget-item-lower-line')).toBeDefined();
    expect(element.querySelectorAll('.si-timeline-widget-item-lower-line').length).toBe(1);
  });

  it('should display the item timestamp string', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    await fixture.whenStable();
    expect(element.querySelector('.si-caption')!).toHaveTextContent('Today 23:59');
  });

  it('should display the item label string', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    await fixture.whenStable();
    expect(element.querySelector('.si-h5')!).toHaveTextContent('Title');
  });

  it('should display the item description string', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-plant'
    });
    await fixture.whenStable();
    expect(element.querySelector('.si-body')!).toHaveTextContent('Description');
  });

  it('should display the item icon', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    await fixture.whenStable();
    expect(element.querySelector('si-icon div')).toHaveClass('element-plant');
  });

  it('should display the item icon color', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger'
    });
    await fixture.whenStable();
    expect(element.querySelector('si-icon')).toHaveClass('status-danger');
  });

  it('should display the item icon stacked icon', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark'
    });
    await fixture.whenStable();
    expect(element.querySelectorAll('.element-state-exclamation-mark').length).toBe(1);
  });

  it('should display the item icon stacked color', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast'
    });
    await fixture.whenStable();
    expect(element.querySelectorAll('.status-danger-contrast').length).toBe(1);
  });

  it('should display the item action', async () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant',
      action: {
        type: 'action',
        label: 'Redo',
        icon: 'redo',
        action: () => {}
      }
    });
    await fixture.whenStable();
    expect(element.querySelectorAll('.si-timeline-widget-item-action').length).toBe(1);
  });
});
