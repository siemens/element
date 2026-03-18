/**
 * Copyright (c) Siemens 2016 - 2026
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
 *         overlayIcon="element-alarm-tick"
 *         overlayIconColor="text-body"
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
      <div class="dot text-muted text-center">&bull;</div>
    } @else {
      <si-icon class="icon" [class]="iconColor()" [icon]="icon()" />
      @if (overlayIcon(); as overlayIcon) {
        <si-icon class="icon position-absolute" [class]="overlayIconColor()" [icon]="overlayIcon" />
      }
      <span class="ms-2 auto-hide text-start">
        <ng-content />
      </span>
    }
  `,
  styleUrl: './si-side-panel-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'focus-inside position-relative',
    '[class.dot-outer]': 'disabled()'
  }
})
export class SiSidePanelActionComponent {
  /** Icon name for the main icon. */
  readonly icon = input.required<string>();

  /** CSS color class for the main icon (e.g. `'status-warning'`). */
  readonly iconColor = input<string>();

  /** Optional overlay icon name displayed on top of the main icon. */
  readonly overlayIcon = input<string>();

  /** CSS color class for the overlay icon (e.g. `'text-body'`). */
  readonly overlayIconColor = input<string>();

  /**
   * When disabled, renders a dot separator instead of the icon and label.
   *
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
}
