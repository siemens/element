/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiTimelineWidgetItem } from './si-timeline-widget-item.component';
import { SiTimelineWidgetComponent } from './si-timeline-widget.component';

@Component({
  imports: [SiTimelineWidgetComponent],
  template: `
    <si-timeline-widget
      [value]="items"
      [numberOfItems]="numberOfItems"
      [showDescription]="showDescription"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  items?: SiTimelineWidgetItem[];
  numberOfItems?: number;
  showDescription = true;
}

describe('SiTimelineWidgetComponent', () => {
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
    component.showDescription = false;
    fixture.detectChanges();
    expect(element.querySelector('.si-link-widget-skeleton')).toBeDefined();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(8);
  });

  it('should enable number skeleton configuration', () => {
    const numberOfItems = 3;
    component.numberOfItems = numberOfItems;
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(numberOfItems);
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(numberOfItems * 3);
  });

  it('should enable number skeleton configuration without showing the description', () => {
    const numberOfItems = 3;
    component.numberOfItems = numberOfItems;
    component.showDescription = false;
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-skeleton').length).toBe(numberOfItems);
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(numberOfItems * 2);
  });

  it('should display timeline items', () => {
    component.items = [
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
    ];
    fixture.detectChanges();
    expect(element.querySelectorAll('.si-link-widget-skeleton').length).toBe(0);
    expect(element.querySelectorAll('si-timeline-widget-item').length).toBe(3);
  });
});
