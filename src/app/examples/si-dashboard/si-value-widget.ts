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
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { SiValueWidgetComponent } from '@spike-rabbit/element-ng/dashboard';
import { Link } from '@spike-rabbit/element-ng/link';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiValueWidgetComponent],
  templateUrl: './si-value-widget.html',
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

  simplActionLink: Link = {
    title: 'Do something',
    action: () => alert('Hello Element!'),
    tooltip: 'APP.CLAIM'
  };

  primaryActions: ContentActionBarMainItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  secondaryActions: MenuItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') }
  ];

  value?: string;

  ngOnInit(): void {
    setTimeout(
      () => {
        this.value = '72';
        this.cdRef.markForCheck();
      },
      navigator.webdriver ? 15000 : 2000
    );
  }
}
