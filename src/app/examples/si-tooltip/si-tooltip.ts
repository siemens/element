/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
  CartesianChartSeries,
  ChartXAxis,
  ChartYAxis,
  SiChartCartesianComponent
} from '@siemens/charts-ng';
import { SiAccordionComponent, SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderActionsDirective,
  SiHeaderActionItemComponent,
  SiHeaderLogoDirective,
  SiHeaderCollapsibleActionsComponent,
  SiAccountDetailsComponent,
  SiHeaderAccountItemComponent
} from '@siemens/element-ng/application-header';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiSidePanelComponent, SiSidePanelContentComponent } from '@siemens/element-ng/side-panel';
import { SiTabsetComponent, SiTabComponent } from '@siemens/element-ng/tabs';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { SiTreeViewComponent, TreeItem } from '@siemens/element-ng/tree-view';

import { ChartData } from '../si-charts/cartesian/chart-base';

@Component({
  selector: 'app-sample',
  imports: [
    SiTooltipDirective,
    SiTabsetComponent,
    SiTabComponent,
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    SiTreeViewComponent,
    SiSearchBarComponent,
    SiSidePanelComponent,
    SiSidePanelContentComponent,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    SiHeaderActionsDirective,
    SiHeaderActionItemComponent,
    SiHeaderLogoDirective,
    SiAccordionComponent,
    SiCollapsiblePanelComponent,
    SiContentActionBarComponent,
    SiChartCartesianComponent,
    SiHeaderCollapsibleActionsComponent,
    SiHeaderDropdownComponent,
    SiHeaderAccountItemComponent,
    SiAccountDetailsComponent,
    SiHeaderDropdownTriggerDirective
  ],
  templateUrl: './si-tooltip.html'
})
export class SampleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('focusButton') focusButton!: ElementRef<HTMLButtonElement>;
  private focusTimeout?: ReturnType<typeof setTimeout>;

  html = `<strong>I'm a microwave</strong>`;
  splitOpen = false;
  collapsed = true;

  treeItems: TreeItem[] = [
    {
      label: 'This is a really really long tree item label',
      icon: 'element-special-object',
      children: [
        {
          label: 'New York',
          dataField1: 'NYC',
          state: 'leaf'
        },
        {
          label: 'London',
          dataField1: 'LDN',
          state: 'leaf'
        }
      ]
    },
    {
      label: 'Tree item label',
      icon: 'element-special-object',
      children: [
        {
          label: 'Tokyo',
          dataField1: 'TYO',
          state: 'leaf'
        }
      ]
    },
    {
      label: 'This is a really really long tree item label',
      icon: 'element-special-object',
      children: [
        {
          label: 'Paris',
          dataField1: 'PAR',
          state: 'leaf'
        },
        {
          label: 'This is a really really long leaf tree item label',
          dataField1: 'ZRH',
          state: 'leaf'
        }
      ]
    },
    {
      label: 'Tree item label',
      icon: 'element-special-object',
      state: 'leaf'
    }
  ];

  chartData: ChartData = {
    title: 'Bar Chart',
    xAxis: { type: 'category' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        type: 'bar',
        name: 'Series 1',
        data: [
          ['Value 1', 8],
          ['Value 2', 10],
          ['Value 3', 1],
          ['Value 4', 7],
          ['Value 5', 2]
        ]
      },
      {
        type: 'bar',
        name: 'Series 2',
        data: [
          ['Value 1', 3],
          ['Value 2', 10],
          ['Value 3', 8],
          ['Value 4', 11],
          ['Value 5', 5]
        ]
      },
      {
        type: 'bar',
        name: 'Series 3',
        data: [
          ['Value 1', 5],
          ['Value 2', 7],
          ['Value 3', 5],
          ['Value 4', 4],
          ['Value 5', 6]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true
  };

  primaryActionsIcons: ContentActionBarMainItem[] = [
    {
      type: 'action',
      label: 'Download',
      iconOnly: true,
      action: () => alert('Download'),
      icon: 'element-download',
      tooltip: 'Download'
    },
    {
      type: 'action',
      label: 'Share',
      iconOnly: true,
      action: () => alert('Share'),
      icon: 'element-share',
      tooltip: 'Share'
    },
    {
      type: 'action',
      label: 'Copy',
      iconOnly: true,
      action: () => alert('Copy'),
      icon: 'element-copy',
      tooltip: 'Copy'
    }
  ];

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  ngAfterViewInit(): void {
    if (!this.focusButton) return;

    this.focusTimeout = setTimeout(() => {
      this.focusButton.nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }
  }
}
