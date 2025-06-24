/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';

import { SiValueWidgetComponent } from './si-value-widget.component';

@Component({
  imports: [SiValueWidgetComponent],
  template: `
    <si-value-widget
      value="72"
      unit="kWh"
      icon="element-checked"
      description="Description"
      [heading]="heading"
      [primaryActions]="primaryActions"
      [secondaryActions]="secondaryActions"
      [link]="simplActionLink"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  primaryActions: ContentActionBarMainItem[] = [];
  secondaryActions: MenuItem[] = [];
  heading = '';
  enableExpandInteraction = false;
}

describe('SiValueWidgetComponent', () => {
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

  it('should have a heading', () => {
    component.heading = 'TITLE_KEY';
    fixture.detectChanges();
    expect(element.querySelector('.card-header')!.innerHTML).toContain('TITLE_KEY');
  });
});
