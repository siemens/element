/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { SiListWidgetComponent, SiListWidgetItem } from '@siemens/element-ng/dashboard';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { Link } from '@siemens/element-ng/link';

@Component({
  selector: 'app-sample',
  imports: [SiEmptyStateComponent, SiListWidgetComponent],
  templateUrl: './si-list-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  items: SiListWidgetItem[] = [
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

  itemsEmpty?: SiListWidgetItem[] = undefined;
  itemsA?: SiListWidgetItem[] = undefined;
  itemsB = this.items.map(value => ({ ...value, text: undefined }));
  itemsC = this.items.map(value => ({ ...value, badge: undefined }));
  itemsD = this.items.map(value => ({ ...value, badge: undefined, text: undefined }));
  itemsE = this.items.map(value => ({ ...value, action: undefined }));
  itemsF = this.items.map(value => ({ ...value, text: undefined, action: undefined }));
  itemsG = this.items.map(value => ({ ...value, badge: undefined, action: undefined }));
  itemsH = this.items.map(value => ({
    ...value,
    badge: undefined,
    text: undefined,
    action: undefined
  }));

  link: Link = { title: 'Home', 'link': '/' };
  actionLink: Link = { title: 'Print', 'action': () => alert('This is an action link') };

  private cdRef = inject(ChangeDetectorRef);

  constructor() {
    setTimeout(() => {
      this.itemsEmpty = [];
      this.itemsA = this.items;
      this.cdRef.markForCheck();
    }, 2000);
  }
}
