/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal
} from '@angular/core';

import { SiTabsetComponent } from './si-tabset.component';

/**
 * A container component that renders tab content externally from the tabset.
 * When the `tabset` input references a `si-tabset`, this component renders the
 * `role="tabpanel"` container with proper ARIA attributes linked to the active tab.
 *
 * @example
 * ```html
 * <si-tabset #tabset>
 *   <si-tab heading="Overview" [active]="true" />
 *   <si-tab heading="History" />
 * </si-tabset>
 *
 * <si-tab-content [tabset]="tabset">
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
  /**
   * Reference to the {@link SiTabsetComponent} whose content this component renders externally.
   *
   * When set, the tabset will not render its own tab panel container.
   * This component will render the `role="tabpanel"` element
   * with proper ARIA attributes linked to the active tab.
   */
  readonly tabset = input.required<SiTabsetComponent>();

  /** @internal */
  readonly panelId = signal<string | undefined>(undefined);

  /** @internal */
  readonly labelledBy = signal<string | undefined>(undefined);

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Sync ARIA attributes from the tabset's active tab and register with the tabset.
    effect(() => {
      const tabsetRef = this.tabset();
      tabsetRef.hasExternalContent.set(true);

      const active = tabsetRef.activeTab();
      this.panelId.set(active ? `content-${active.tabId}` : undefined);
      this.labelledBy.set(active ? `tab-${active.tabId}` : undefined);
    });

    // Deregister from the tabset when this component is destroyed.
    destroyRef.onDestroy(() => {
      this.tabset().hasExternalContent.set(false);
    });
  }
}
