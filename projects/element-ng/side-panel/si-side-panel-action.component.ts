/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';

/**
 * Creates an action for the side-panel.
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
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[si-side-panel-action], a[si-side-panel-action]',
  imports: [SiIconComponent],
  template: `
    @if (disabled()) {
      <div class="icon dot text-muted text-center">&bull;</div>
    } @else {
      <span class="icon icon-stack">
        <si-icon [class]="iconColor()" [icon]="icon()" />
        @if (stackedIcon(); as stackedIcon) {
          <si-icon [class]="stackedIconColor()" [icon]="stackedIcon" />
        }
      </span>
      <span class="ms-2 auto-hide si-caption text-start">
        <ng-content />
      </span>
    }
  `,
  styleUrl: './si-side-panel-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'focus-inside'
  }
})
export class SiSidePanelActionComponent {
  /** Icon name for the main icon. */
  readonly icon = input.required<string>();

  /** CSS color class for the main icon (e.g. `'status-warning'`). */
  readonly iconColor = input<string>();

  /** Optional stacked icon name displayed on top of the main icon. */
  readonly stackedIcon = input<string>();

  /** CSS color class for the stacked icon (e.g. `'text-body'`). */
  readonly stackedIconColor = input<string>();

  /**
   * When disabled, renders a dot separator instead of the icon and label.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
}
