/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal
} from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { MenuItem } from '@siemens/element-ng/common';
import {
  ContentActionBarMainItem,
  SiContentActionBarComponent
} from '@siemens/element-ng/content-action-bar';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiDashboardService } from './si-dashboard.service';

@Component({
  selector: 'si-dashboard-card',
  imports: [SiContentActionBarComponent, SiTranslateModule],
  templateUrl: './si-dashboard-card.component.html',
  styleUrl: './si-dashboard-card.component.scss',
  host: {
    '[class.elevation-2]': 'isExpanded()',
    '[class.expanded]': 'isExpanded()',
    '[class.d-none]': 'hide'
  }
})
export class SiDashboardCardComponent extends SiCardComponent implements OnDestroy {
  /**
   * Description of cancel button & action.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_DASHBOARD.RESTORE:Restore`
   * ```
   */
  readonly restoreText = input($localize`:@@SI_DASHBOARD.RESTORE:Restore`);
  /**
   * Description of expand button & action.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_DASHBOARD.EXPAND:Expand`
   * ```
   */
  readonly expandText = input($localize`:@@SI_DASHBOARD.EXPAND:Expand`);
  /**
   * Option to enable and show the UI controls for card expand functionality.
   * `Expand` and `restore` action items will be added to the content action bar.
   * The expand resizing has to be implemented by the container of the card.
   *
   * @defaultValue false
   */
  readonly enableExpandInteraction = input(false, { transform: booleanAttribute });

  /**
   * Used in combination with si-dashboard to show filters when a card is expanded or not.
   *
   * @defaultValue true
   */
  readonly showMenubar = input(true, { transform: booleanAttribute });
  /**
   * Emitter for size state change
   */
  readonly expandChange = output<boolean>();

  /**
   * Whether the card is currently expanded.
   *
   * @defaultValue false
   */
  readonly isExpanded = signal(false);
  /** @internal */
  hide = false;
  /** @internal */
  readonly enableExpandInteractionInternal = signal(false);
  readonly enableExpandInteractionComputed = computed(
    () => this.enableExpandInteraction() || this.enableExpandInteractionInternal()
  );
  /** @internal */
  element = inject(ElementRef);

  override readonly displayContentActionBar = computed(
    () => this.primaryActionsComputed()?.length > 0 || this.secondaryActions()?.length > 0
  );

  protected readonly actionBarViewTypeComputed = computed(() => {
    if (!this.hasContentBarActions()) {
      if (this.enableExpandInteractionComputed()) {
        return 'expanded';
      } else {
        return this.actionBarViewType();
      }
    } else {
      return this.actionBarViewType();
    }
  });

  protected readonly actionBarTitleComputed = computed(() => {
    if (!this.hasContentBarActions()) {
      if (this.enableExpandInteractionComputed()) {
        return this.expandRestoreIconTooltip();
      } else {
        return this.actionBarTitle();
      }
    } else {
      return this.actionBarTitle();
    }
  });

  protected readonly primaryActionsComputed = computed<(ContentActionBarMainItem | MenuItem)[]>(
    () => {
      const expandRestoreButtonActions: ContentActionBarMainItem[] = [
        {
          type: 'action',
          label: this.isExpanded() ? this.restoreText() : this.expandText(),
          icon: this.isExpanded() ? 'element-pinch' : 'element-zoom',
          iconOnly: true,
          action: () => this.expandCard(!this.isExpanded())
        }
      ];

      if (!this.hasContentBarActions()) {
        if (this.enableExpandInteractionComputed()) {
          return expandRestoreButtonActions;
        } else {
          return [];
        }
      } else {
        if (!this.enableExpandInteractionComputed()) {
          return this.primaryActions();
        } else {
          const action = this.isExpanded() ? this.restoreActionItem() : this.expandActionItem();
          if (this.primaryActions() && this.primaryActions().length > 0) {
            return [...this.primaryActions(), action];
          } else {
            return [action];
          }
        }
      }
    }
  );

  private readonly expandRestoreIconTooltip = computed(() => {
    return this.isExpanded() ? this.restoreText() : this.expandText();
  });
  private readonly expandActionItem = computed(() => {
    return {
      type: 'action',
      label: this.expandText(),
      icon: 'element-zoom',
      iconOnly: true,
      action: () => this.expandCard(true)
    } as ContentActionBarMainItem;
  });
  private readonly restoreActionItem = computed(() => {
    return {
      type: 'action',
      label: this.restoreText(),
      icon: 'element-pinch',
      iconOnly: true,
      action: () => this.expandCard(false)
    } as ContentActionBarMainItem;
  });
  private readonly hasContentBarActions = computed(() => {
    return this.primaryActions()?.length > 0 || this.secondaryActions()?.length > 0;
  });
  private dashboardService = inject(SiDashboardService, { optional: true });

  constructor() {
    super();
    this.dashboardService?.register(this);
  }

  ngOnDestroy(): void {
    this.dashboardService?.unregister(this);
  }

  /**
   * Expand the dashboard card.
   */
  expand(): void {
    this.expandCard(true);
  }

  /**
   * Restore the dashboard card to the original, non-expanded state.
   */
  restore(): void {
    this.expandCard(false);
  }

  private expandCard(expand: boolean): void {
    this.isExpanded.set(expand);
    this.expandChange.emit(expand);
  }
}
