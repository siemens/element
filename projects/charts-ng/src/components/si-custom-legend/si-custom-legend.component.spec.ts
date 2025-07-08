/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SiCustomLegendComponent } from './si-custom-legend.component';
import { CustomLegend, CustomLegendItem } from './si-custom-legend.interface';

@Component({
  template: `<si-custom-legend
    [title]="title"
    [subTitle]="subTitle"
    [customLegend]="customLegend"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiCustomLegendComponent]
})
class TestHostComponent {
  customLegend?: CustomLegend;
  title?: string;
  subTitle?: string;
  legendIconClickEvent = (_legend: CustomLegendItem): void => {};
  legendClickEvent = (_legend: CustomLegendItem): void => {};
  legendHoverStartEvent = (_legend: CustomLegendItem, _start: boolean): void => {};
}
describe('SiCustomLegendComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test if custom legend is visible', () => {
    component.customLegend = {
      customLegends: [
        {
          list: [
            {
              name: 'test-1',
              displayName: 'test1',
              selected: true
            }
          ],
          unit: ''
        },
        { list: [], unit: '' }
      ],
      legendAxis: 'right'
    };

    fixture.detectChanges();
    const legendTextEl = element.querySelector('si-custom-legend');
    expect(legendTextEl).toBeTruthy();
  });
});
