/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  OnDestroy
} from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
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
  },
  hostDirectives: [SiTooltipDirective]
})
export class SiTabComponent extends SiTabBaseDirective implements OnDestroy {
  private tooltipDirective = inject(SiTooltipDirective);

  /**
   * Whether the tab is active or not.
   * If set to `true`, the tab will be selected and its content will be displayed.
   * @defaultValue false
   * */
  override readonly active = model(false);

  /**
   * Guard to check if the tab can be activated.
   * If not provided, the tab can always be activated.
   */
  readonly canActivate = input<() => boolean>();
  /**
   * Guard to check if the tab can be deactivated.
   * If not provided, the tab can always be deactivated.
   */
  readonly canDeactivate = input<() => boolean>();

  protected selectTabByUser(): void {
    const canActivate = this.canActivate();
    if (!this.active() && (canActivate ? canActivate() : true)) {
      this.selectTab();
    }
  }

  /** {@inheritDoc} */
  override selectTab(retainFocus?: boolean): void {
    const activeTab = this.tabset.activeTab();
    if (activeTab instanceof SiTabComponent) {
      const canDeactivate = activeTab?.canDeactivate();
      if (canDeactivate ? !canDeactivate() : false) {
        return;
      }
    }
    this.tabset.activeTab()?.deSelectTab();
    this.active.set(true);
    super.selectTab(retainFocus);
  }

  /** @internal */
  override deSelectTab(): void {
    this.active.set(false);
  }

  constructor() {
    super();
    effect(() => this.tooltipDirective.setTooltipContent(this.icon() ? this.heading() : ''));
  }
}
