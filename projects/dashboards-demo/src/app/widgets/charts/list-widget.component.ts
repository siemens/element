/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, TemplateRef, ViewChild } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@spike-rabbit/dashboards-ng';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import {
  SiListWidgetBodyComponent,
  SiListWidgetItem,
  SortOrder
} from '@spike-rabbit/element-ng/dashboard';
import { SiEmptyStateComponent } from '@spike-rabbit/element-ng/empty-state';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';

@Component({
  selector: 'app-list-widget',
  imports: [SiEmptyStateComponent, SiListWidgetBodyComponent, SiLinkDirective],
  template: `
    <si-list-widget-body search [sort]="sort" [value]="listWidgetValue">
      <si-empty-state
        empty-state
        icon="element-info"
        heading="No buildings found."
        content="Please refine your search."
      />
    </si-list-widget-body>
    <ng-template #footer><a [siLink]="link">Go to...</a></ng-template>
  `
})
export class ListWidgetComponent implements WidgetInstance {
  readonly config = input.required<WidgetConfig>();
  protected listWidgetValue: SiListWidgetItem[] = [
    {
      label: { title: 'Taj Mahal', href: 'https://en.wikipedia.org/wiki/Taj_Mahal' },
      description: 'The Taj Mahal is an ivory-white marble mausoleum',
      badge: '99+',
      badgeColor: 'warning',
      text: '10.7',
      action: { title: 'Building overview', action: () => alert('Report') },
      actionIcon: 'element-report'
    },
    {
      label: {
        title: 'Tower of Pisa',
        href: 'https://en.wikipedia.org/wiki/Leaning_Tower_of_Pisa'
      },
      description: 'The Leaning Tower of Pisa is the campanile of Pisa Cathedral.',
      badge: 'info',
      badgeColor: 'info',
      text: '9.7',
      action: { title: 'Building overview', action: () => alert('Report') },
      actionIcon: 'element-report'
    },
    {
      label: 'Eiffel Tower',
      description:
        'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris.',
      badge: '3',
      text: '8.3',
      action: { title: 'Building overview', action: () => alert('Report') },
      actionIcon: 'element-report'
    },
    {
      label: 'Colosseum',
      badge: '5',
      text: '12.7',
      action: { title: 'Building overview', action: () => alert('Report') },
      actionIcon: 'element-report'
    },
    {
      label: 'Burj Khalifa',
      badge: '5',
      text: '4.5',
      action: { title: 'Building overview', action: () => alert('Report') },
      actionIcon: 'element-report'
    },
    {
      label: "St. Basil's Cathedral",
      badge: '6',
      text: '11.1',
      action: { title: 'Building overview', action: () => alert('Report') },
      actionIcon: 'element-report'
    }
  ];
  @ViewChild('footer', { static: true }) footer?: TemplateRef<unknown>;
  primaryActions!: ContentActionBarMainItem[];
  protected link?: Link = { href: 'https://github.com/siemens/element/issues' };

  sort?: SortOrder;

  constructor() {
    this.setupSortAction();
  }

  private doSort(): void {
    if (this.sort === 'ASC') {
      this.sort = 'DSC';
    } else {
      this.sort = 'ASC';
    }
    this.setupSortAction();
  }

  private setupSortAction(): void {
    if (!this.primaryActions) {
      this.primaryActions = [
        {
          type: 'action',
          label: 'Sort descending',
          icon: 'element-sort-down',
          iconOnly: true,
          action: () => this.doSort()
        }
      ];
    }
    if (this.sort === 'ASC') {
      this.primaryActions[0].label = 'Sort ascending';
      this.primaryActions[0].icon = 'element-sort-up';
    } else {
      this.primaryActions[0].label = 'Sort descending';
      this.primaryActions[0].icon = 'element-sort-down';
    }
  }
}
