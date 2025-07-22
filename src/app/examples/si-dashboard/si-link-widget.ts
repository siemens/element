/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { SiLinkWidgetComponent } from '@siemens/element-ng/dashboard';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { Link } from '@siemens/element-ng/link';
import { MenuItem } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiIconComponent, SiLinkWidgetComponent],
  templateUrl: './si-link-widget.html',
  styles: `
    .card-size {
      height: 400px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  logEvent = inject(LOG_EVENT);
  private cdRef = inject(ChangeDetectorRef);

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  secondaryActions: MenuItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') }
  ];

  links?: Link[];

  ngOnInit(): void {
    setTimeout(() => {
      this.links = [
        { title: 'Card link', href: 'https://element.siemens.io' },
        { title: 'Card link', href: 'https://element.siemens.io' },
        { title: 'Card link', href: 'https://element.siemens.io' },
        { title: 'Print action', action: () => this.logEvent('Print job started.') }
      ];
      this.cdRef.markForCheck();
    }, 2000);
  }
}
