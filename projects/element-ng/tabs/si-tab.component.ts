/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, model, OnDestroy } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabBaseDirective } from './si-tab-base.directive';

/**
 * Creates a normal tab that can contain any content.
 *
 * @example
 * ```html
 * <si-tabset>
 *   <si-tab heading="Tab 1">
 *     <p>Content of Tab 1</p>
 *   </si-tab>
 * </si-tabset>
 * ```
 */
@Component({
  selector: 'si-tab',
  imports: [SiIconComponent, SiTranslatePipe, SiTabBadgeComponent],
  templateUrl: './si-tab.component.html',
  styleUrl: './si-tab.component.scss',
  providers: [{ provide: SiTabBaseDirective, useExisting: SiTabComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'selectTabByUser()',
    '(keydown.enter)': 'selectTabByUser()'
  }
})
export class SiTabComponent extends SiTabBaseDirective implements OnDestroy {
  /**
   * Whether the tab is active or not.
   * If set to `true`, the tab will be selected and its content will be displayed.
   * @defaultValue false
   * */
  override readonly active = model(false);

  protected selectTabByUser(): void {
    if (!this.active()) {
      this.selectTab();
    }
  }

  /** {@inheritDoc} */
  override selectTab(retainFocus?: boolean): void {
    this.tabset.activeTab()?.deSelectTab();
    this.active.set(true);
    super.selectTab(retainFocus);
  }

  /** @internal */
  override deSelectTab(): void {
    this.active.set(false);
  }
}
