/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Component, signal } from '@angular/core';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { INoRowsOverlayParams } from 'ag-grid-community';

/**
 * Custom AG Grid no rows overlay component using Element Empty State.
 * This component is displayed when the grid has no data to show.
 *
 * @example
 * Using with custom parameters
 * ```typescript
 * <ag-grid-angular
 *   [noRowsOverlayComponent]="AgNoRowsOverlayComponent"
 *   [noRowsOverlayComponentParams]="{
 *     icon: 'element-technical-search',
 *     heading: 'No results found',
 *     content: 'Try adjusting your filters.'
 *   }"
 * />
 * ```
 */
@Component({
  selector: 'si-ag-no-rows-overlay',
  imports: [SiEmptyStateComponent],
  template: ` <si-empty-state [icon]="icon()" [heading]="heading()" [content]="content()" /> `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    }
  `
})
export class AgNoRowsOverlayComponent {
  /**
   * Icon to display in the empty state.
   *
   */
  protected readonly icon = signal<string>('');

  /**
   * Heading text for the empty state.
   *
   */
  protected readonly heading = signal<string>('');

  /**
   * Description text for the empty state.
   *
   */
  protected readonly content = signal<string | undefined>(undefined);

  agInit(params: INoRowsOverlayParams & { icon: string; heading: string; content?: string }): void {
    this.icon.set(params.icon);
    this.heading.set(params.heading);
    this.content.set(params.content);
  }
}
