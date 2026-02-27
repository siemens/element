/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/**
 * A container component that renders tab content externally from the tabset.
 * When referenced via the `content` input on `si-tabset`, this component renders the
 * `role="tabpanel"` container with proper ARIA attributes linked to the active tab.
 *
 * @example
 * ```html
 * <si-tabset #tabset [content]="tabContent">
 *   <si-tab heading="Overview" [active]="true" />
 *   <si-tab heading="History" />
 * </si-tabset>
 *
 * <si-tab-content #tabContent>
 *   @switch (tabset.activeIndex()) {
 *     @case (0) { Overview content }
 *     @case (1) { History content }
 *   }
 * </si-tab-content>
 * ```
 */
@Component({
  selector: 'si-tab-content',
  template: `
    @if (panelId()) {
      <div
        class="tab-content"
        role="tabpanel"
        [id]="panelId()"
        [attr.aria-labelledby]="labelledBy()"
      >
        <ng-content />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-block'
  }
})
export class SiTabContentComponent {
  /** @internal */
  readonly panelId = signal<string | undefined>(undefined);

  /** @internal */
  readonly labelledBy = signal<string | undefined>(undefined);
}
