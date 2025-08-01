/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, model, OnDestroy } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiTabBadgeComponent } from './si-tab-badge.component';
import { SiTabNextBaseDirective } from './si-tab-next-base.directive';

/** @experimental */
@Component({
  selector: 'si-tab-next',
  imports: [SiIconNextComponent, SiTranslatePipe, SiTabBadgeComponent],
  templateUrl: './si-tab-next.component.html',
  styleUrl: './si-tab-next.component.scss',
  providers: [{ provide: SiTabNextBaseDirective, useExisting: SiTabNextComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'selectTabByUser()',
    '(keydown.enter)': 'selectTabByUser()'
  }
})
export class SiTabNextComponent extends SiTabNextBaseDirective implements OnDestroy {
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

  /** @internal */
  override selectTab(retainFocus?: boolean): void {
    const tabs = this.tabset.tabPanels();
    const currentTabIndex = this.tabset.activeTabIndex();
    const currentTab = tabs[currentTabIndex];

    currentTab?.deSelectTab();
    this.active.set(true);
    super.selectTab(retainFocus);
  }

  override deSelectTab(): void {
    this.active.set(false);
  }
}
