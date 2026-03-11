/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SiTabsetComponent } from './si-tabset.component';

/**
 * A component that renders the active tab's content at a remote
 * location in the DOM using an Angular CDK `DomPortal`.
 *
 * This component **automatically** renders the content of the currently
 * active `si-tab`, including the `role="tabpanel"` container with proper
 * ARIA attributes linked to the active tab.
 *
 * @example
 * ```html
 * <si-tabset #tabset>
 *   <si-tab heading="Overview" [active]="true">
 *     overview content
 *   </si-tab>
 *   <si-tab heading="History">
 *     history content
 *   </si-tab>
 * </si-tabset>
 *
 * <si-tab-portal [tabset]="tabset" />
 * ```
 */
@Component({
  selector: 'si-tab-portal',
  imports: [CdkPortalOutlet],
  template: ` <ng-template [cdkPortalOutlet]="tabset().contentPortal()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiTabPortalComponent {
  /**
   * Reference to the {@link SiTabsetComponent} whose active tab content
   * this component renders via a `DomPortal`.
   *
   * The tabset's tab panel container, including the `role="tabpanel"` element
   * with proper ARIA attributes, is transported to this component's location.
   */
  readonly tabset = input.required<SiTabsetComponent>();
}
