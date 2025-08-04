/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SiTimelineWidgetItem,
  SiTimelineWidgetItemComponent
} from './si-timeline-widget-item.component';

@Component({
  imports: [SiTimelineWidgetItemComponent],
  template: ` <si-timeline-widget-item [value]="item" [showDescription]="showDescription" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  item?: SiTimelineWidgetItem;
  showDescription = true;
}

describe('SiTimelineWidgetItemComponent', () => {
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

  it('should display a skeleton without value', () => {
    fixture.detectChanges();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(1);
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(3);
    expect(element.querySelectorAll('.si-timeline-widget-lower-line').length).toBe(0);
  });

  it('should display a skeleton without value and without showing the description', () => {
    component.showDescription = false;
    fixture.detectChanges();
    expect(element.querySelector('.si-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(1);
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(2);
  });

  it('should display the lower line', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    };
    fixture.detectChanges();
    expect(element.querySelector('.si-timeline-widget-item-lower-line')).toBeDefined();
    expect(element.querySelectorAll('.si-timeline-widget-item-lower-line').length).toBe(1);
  });

  it('should display the item timestamp string', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    };
    fixture.detectChanges();
    expect(element.querySelector('.si-caption')!.innerHTML).toContain('Today 23:59');
  });

  it('should display the item label string', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    };
    fixture.detectChanges();
    expect(element.querySelector('.si-title-2')!.innerHTML).toContain('Title');
  });

  it('should display the item description string', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      description: 'Description',
      icon: 'element-plant'
    };
    fixture.detectChanges();
    expect(element.querySelector('.si-body-2')!.innerHTML).toContain('Description');
  });

  it('should display the item icon', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant'
    };
    fixture.detectChanges();
    expect(element.querySelector('si-icon-next div')?.classList).toContain('element-plant');
  });

  it('should display the item icon color', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger'
    };
    fixture.detectChanges();
    expect(element.querySelector('si-icon-next')?.classList).toContain('status-danger');
  });

  it('should display the item icon stacked icon', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark'
    };
    fixture.detectChanges();
    expect(element.querySelectorAll('.element-state-exclamation-mark').length).toBe(1);
  });

  it('should display the item icon stacked color', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-exclamation-mark',
      stackedIconColor: 'status-danger-contrast'
    };
    fixture.detectChanges();
    expect(element.querySelectorAll('.status-danger-contrast').length).toBe(1);
  });

  it('should display the item action', () => {
    component.item = {
      timeStamp: 'Today 23:59',
      title: 'Title',
      icon: 'element-plant',
      action: {
        type: 'action',
        label: 'Redo',
        icon: 'redo',
        action: () => {}
      }
    };
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-timeline-widget-item-action').length).toBe(1);
  });
});
