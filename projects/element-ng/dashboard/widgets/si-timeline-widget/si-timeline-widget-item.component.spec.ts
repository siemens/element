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

  it('should display a skeleton without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(1);
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(3);
    expect(element.querySelectorAll('.si-timeline-widget-lower-line').length).toBe(0);
  });

  it('should display a skeleton without value and without showing the description', () => {
    showDescription.set(false);
    fixture.detectChanges();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(1);
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(2);
  });

  it('should display the lower line', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    fixture.detectChanges();
    expect(element.querySelector('.si-timeline-widget-item-lower-line')).toBeDefined();
    expect(element.querySelectorAll('.si-timeline-widget-item-lower-line').length).toBe(1);
  });

  it('should display the item timestamp string', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    fixture.detectChanges();
    expect(element.querySelector('.si-caption')!.innerHTML).toContain('Today 23:59');
  });

  it('should display the item label string', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    fixture.detectChanges();
    expect(element.querySelector('.si-h5')!.innerHTML).toContain('Title');
  });

  it('should display the item description string', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-plant'
    });
    fixture.detectChanges();
    expect(element.querySelector('.si-body')!.innerHTML).toContain('Description');
  });

  it('should display the item icon', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    });
    fixture.detectChanges();
    expect(element.querySelector('si-icon div')?.classList).toContain('element-plant');
  });

  it('should display the item icon color', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger'
    });
    fixture.detectChanges();
    expect(element.querySelector('si-icon')?.classList).toContain('status-danger');
  });

  it('should display the item icon stacked icon', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark'
    });
    fixture.detectChanges();
    expect(element.querySelectorAll('.element-state-exclamation-mark').length).toBe(1);
  });

  it('should display the item icon stacked color', () => {
    value.set({
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast'
    });
    fixture.detectChanges();
    expect(element.querySelectorAll('.status-danger-contrast').length).toBe(1);
  });

  it('should display the item action', () => {
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
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-timeline-widget-item-action').length).toBe(1);
  });
});
