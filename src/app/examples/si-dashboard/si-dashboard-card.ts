/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { SiDashboardCardComponent } from '@spike-rabbit/element-ng/dashboard';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { MenuItem, MenuItemAction, MenuItemCheckbox } from '@spike-rabbit/element-ng/menu';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiDashboardCardComponent, SiFormItemComponent],
  templateUrl: './si-dashboard-card.html',
  styles: `
    .expanded {
      position: absolute;
      top: 32px;
      right: 32px;
      bottom: 32px;
      left: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);

  readonly primaryItems: MenuItemAction[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    { type: 'action', label: 'Delete', action: () => this.logEvent('Delete clicked') }
  ];

  readonly secondaryItems: MenuItem[] = [
    { type: 'action', label: 'Settings', action: () => this.logEvent('Settings clicked') },
    { type: 'action', label: 'Copy', action: () => this.logEvent('Copy clicked') },
    {
      type: 'checkbox',
      label: 'Enable Expand Interaction',
      checked: false,
      action: () => this.toggleExpandInteraction()
    }
  ];

  readonly primaryActions = signal<ContentActionBarMainItem[]>(this.primaryItems);
  readonly secondaryActions = signal<MenuItem[]>(this.secondaryItems);

  readonly enableExpandInteraction = signal(false);
  readonly enablePrimaryActions = signal(true);
  readonly enableSecondaryActions = signal(true);

  expanded(event: boolean): void {
    this.logEvent('Expand: ' + event);
  }

  toggleEnablePrimaryActions(): void {
    this.enablePrimaryActions.update(v => !v);
    this.primaryActions.set(this.enablePrimaryActions() ? this.primaryItems : []);
  }

  toggleEnableSecondaryActions(): void {
    this.enableSecondaryActions.update(v => !v);
    this.secondaryActions.set(this.enableSecondaryActions() ? this.secondaryItems : []);
  }

  toggleExpandInteraction(): void {
    this.enableExpandInteraction.update(v => !v);
    (this.secondaryItems[2] as MenuItemCheckbox).checked = this.enableExpandInteraction();
  }
}
