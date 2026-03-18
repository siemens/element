/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Creates an actions container for the side-panel.
 * This action will remain visible if the side-panel is collapsed.
 *
 * @example
 * ```html
 * <si-side-panel-content>
 *   <si-side-panel-actions>
 *       <button
 *         type="button"
 *         si-side-panel-action
 *         icon="element-alarm-background-filled"
 *         iconColor="status-danger"
 *         stackedIcon="element-alarm-tick"
 *         stackedIconColor="text-body"
 *         (click)="action()"
 *       >
 *         Action
 *       </button>
 *   </si-side-panel-actions>
 * </si-side-panel-content>
 * ```
 */
@Component({
  selector: 'si-side-panel-actions',
  template: '<ng-content />',
  styleUrl: './si-side-panel-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiSidePanelActionsComponent {}
