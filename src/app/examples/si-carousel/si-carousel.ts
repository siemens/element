/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiCarouselComponent, SiCarouselItemDirective } from '@siemens/element-ng/carousel';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { MenuItem } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiCarouselComponent,
    SiCarouselItemDirective,
    SiCardComponent,
    SiFormItemComponent,
    FormsModule,
    NgTemplateOutlet
  ],
  templateUrl: './si-carousel.html',
  styles: `
    si-carousel si-card {
      block-size: 100%;
      min-block-size: 175px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  readonly autoPlay = signal(false);
  readonly autoPlayDuration = signal(6000);
  readonly slideShowMode = signal(false);
  readonly additionalItemsCount = signal(0);
  readonly withoutPageControls = signal(false);
  readonly additionalItems = computed(() => Array.from({ length: this.additionalItemsCount() }));

  readonly primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  readonly secondaryActions: MenuItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') }
  ];
}
