/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import {
  AxisType,
  SiChartCartesianComponent,
  SiChartCircleComponent,
  SiChartGaugeComponent,
  SiChartProgressBarComponent,
  themeElement,
  themeSupport
} from '@siemens/charts-ng';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import {
  SiDashboardCardComponent,
  SiDashboardComponent,
  SiValueWidgetComponent
} from '@siemens/element-ng/dashboard';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { Link } from '@siemens/element-ng/link';
import { NavbarVerticalItem } from '@siemens/element-ng/navbar-vertical';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { LOG_EVENT } from '@siemens/live-preview';

themeSupport.setDefault(themeElement);

@Component({
  selector: 'app-sample',
  imports: [
    DecimalPipe,
    NgTemplateOutlet,
    SiChartCartesianComponent,
    SiChartCircleComponent,
    SiChartGaugeComponent,
    SiChartProgressBarComponent,
    SiDashboardCardComponent,
    SiDashboardComponent,
    SiValueWidgetComponent,
    SiIconComponent,
    SiResizeObserverDirective
  ],
  templateUrl: './si-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  menuItems: NavbarVerticalItem[] = [
    {
      type: 'group',
      label: 'Home',
      children: [
        { type: 'router-link', label: 'Sub Item', routerLink: 'subItem' },
        { type: 'router-link', label: 'Sub Item 2', routerLink: 'subItem2' },
        { type: 'router-link', label: 'Sub Item 3', routerLink: 'subItem3' }
      ]
    },
    {
      type: 'group',
      label: 'Documentation',
      children: [
        { type: 'router-link', label: 'Sub Item 4', routerLink: 'subItem4' },
        { type: 'router-link', label: 'Sub Item 5', routerLink: 'subItem5' },
        { type: 'router-link', label: 'Sub Item 6', routerLink: 'subItem6' }
      ]
    },
    { type: 'header', label: 'All the rest' },
    { type: 'router-link', label: 'Energy & Operations', routerLink: 'energy' },
    { type: 'router-link', label: 'Test Coverage', routerLink: 'coverage' }
  ];

  items = [
    { title: 'All days', value: null },
    { title: 'Mon', value: 0 },
    { title: 'Tue', value: 1 },
    { title: 'Wed', value: 2 },
    { title: 'Thu', value: 3 },
    { title: 'Fri', value: 4 },
    { title: 'Sat', value: 5 },
    { title: 'Sun', value: 6 }
  ];
  apiActions = {
    title: 'API',
    icon: 'element-api',
    items: [
      {
        title: 'Expand',
        action: () => {
          this.dashboard().expand(this.card());
        }
      },
      {
        title: 'Restore',
        action: () => {
          this.dashboard().restore();
        }
      }
    ]
  };
  linesAdded = [50, 25, 10, 43, 58, 80, 0];
  linesRemoved = [20, 10, 15, 29, 47, 0, 100];
  doorAccessEvents = [300, 400, 100, 33, 50, 500, 999];
  doorAccessEventsfiltered = this.doorAccessEvents;
  private readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  getSeries = (
    type: 'bar',
    name: string,
    data: number[]
  ): { type: 'bar'; name: string; data: number[] } => ({ type, name, data });
  getDay = (event: number): string => this.days[this.doorAccessEvents.indexOf(event)];
  series = [
    this.getSeries('bar', 'lines added', this.linesAdded),
    this.getSeries('bar', 'lines removed', this.linesRemoved)
  ];
  categories = {
    type: 'category' as AxisType,
    data: this.days
  };
  linesAddedWeek = this.series[0].data.reduce((a: number, b: number) => a + b, 0);
  linesRemovedWeek = this.series[1].data.reduce((a: number, b: number) => a + b, 0);
  doorEventsWeek = this.doorAccessEvents.reduce((a: number, b: number) => a + b, 0);
  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];
  simplActionLink: Link = {
    title: 'Do something',
    action: () => alert('Hello Element!'),
    tooltip: 'APP.CLAIM'
  };
  readonly dashboard = viewChild.required<SiDashboardComponent>('dashboard');
  readonly card = viewChild.required<SiDashboardCardComponent>('card');

  onChange(value: string): void {
    if (value !== 'null') {
      this.doorAccessEventsfiltered = [this.doorAccessEvents[parseInt(value, 10)]];
      this.series = [
        this.getSeries('bar', 'lines added', [this.linesAdded[parseInt(value, 10)]]),
        this.getSeries('bar', 'lines removed', [this.linesRemoved[parseInt(value, 10)]])
      ];
      this.categories = {
        type: 'category',
        data: [this.days[parseInt(value, 10)]]
      };
    } else {
      this.series = [
        this.getSeries('bar', 'lines added', this.linesAdded),
        this.getSeries('bar', 'lines removed', this.linesRemoved)
      ];
      this.series[1].data = this.linesRemoved;
      this.categories.data = this.days;
      this.doorAccessEventsfiltered = this.doorAccessEvents;
    }
    this.doorEventsWeek = this.doorAccessEventsfiltered.reduce((a: number, b: number) => a + b, 0);
    this.linesAddedWeek = this.series[0].data.reduce((a: number, b: number) => a + b, 0);
    this.linesRemovedWeek = this.series[1].data.reduce((a: number, b: number) => a + b, 0);
  }
}
