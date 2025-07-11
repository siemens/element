/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, model, OnDestroy } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiTabNextBaseDirective } from './si-tab-next-base.directive';

/** @experimental */
@Component({
  selector: 'si-tab-next',
  imports: [NgClass, SiIconNextComponent, SiTranslateModule],
  templateUrl: './si-tab-next.component.html',
  styleUrl: './si-tab-next.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.active]': 'active()',
    '[attr.aria-selected]': 'active()',
    '(click)': 'selectTab()',
    '(keydown.enter)': 'selectTab()'
  }
})
export class SiTabNextComponent extends SiTabNextBaseDirective implements OnDestroy {
  /**
   * Whether the tab is active or not.
   * If set to `true`, the tab will be selected and its content will be displayed.
   * @defaultValue false
   * */
  override readonly active = model(false);

  /** @internal */
  override selectTab(retainFocus?: boolean): void {
    const tabs = this.tabset.tabPanels();
    const newTabIndex = this.index();
    const currentTabIndex = this.tabset.activeTabIndex();
    let continueWithSelection = newTabIndex !== currentTabIndex;

    if (continueWithSelection && currentTabIndex !== -1) {
      const currentTab = tabs[currentTabIndex];
      const deselectEvent = {
        target: currentTab,
        tabIndex: currentTabIndex,
        cancel: () => {
          continueWithSelection = false;
          currentTab.active.set(true);
        }
      };

      currentTab.active.set(false);
      this.tabset.deselect.emit(deselectEvent);
    }

    if (continueWithSelection) {
      this.active.set(true);
      super.selectTab(retainFocus);
    }
  }
}
