/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { correctKeyRTL } from '@siemens/element-ng/common';
import { addIcons, elementCancel, elementDown2, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiApplicationHeaderComponent } from '../si-application-header.component';
import { SiLaunchpadAppComponent } from './si-launchpad-app.component';
import { App, AppCategory } from './si-launchpad.model';

export interface FavoriteChangeEvent {
  app: App;
  favorite: boolean;
}

@Component({
  selector: 'si-launchpad-factory',
  imports: [
    A11yModule,
    SiLinkModule,
    SiTranslatePipe,
    SiLaunchpadAppComponent,
    SiIconComponent,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './si-launchpad-factory.component.html',
  styleUrl: './si-launchpad-factory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiLaunchpadFactoryComponent {
  /**
   * Text to close the launchpad. Needed for a11y.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LAUNCHPAD.CLOSE:Close launchpad`)
   * ```
   */
  readonly closeText = input(t(() => $localize`:@@SI_LAUNCHPAD.CLOSE:Close launchpad`));

  /**
   * Title of the launchpad.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LAUNCHPAD.TITLE:Switch applications`)
   * ```
   */
  readonly titleText = input(t(() => $localize`:@@SI_LAUNCHPAD.TITLE:Switch applications`));

  /**
   * Subtitle of the launchpad.
   * When not provided, no subtitle is displayed.
   */
  readonly subtitleText = input<TranslatableString>();

  /** All app items shown in the launchpad. */
  readonly apps = input.required<App[] | AppCategory[]>();

  /**
   * Allow the user to select favorite apps which will then be displayed at the top.
   *
   * @defaultValue false
   */
  readonly enableFavorites = input(false, { transform: booleanAttribute });

  /**
   * Title of the favorite apps section.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LAUNCHPAD.FAVORITE_APPS:Favorites`)
   * ```
   */
  readonly favoriteAppsText = input(t(() => $localize`:@@SI_LAUNCHPAD.FAVORITE_APPS:Favorites`));

  /**
   * Title of the show more apps button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LAUNCHPAD.SHOW_MORE:Show more`)
   * ```
   */
  readonly showMoreAppsText = input(t(() => $localize`:@@SI_LAUNCHPAD.SHOW_MORE:Show more`));

  /**
   * Title of the show less apps button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LAUNCHPAD.SHOW_LESS:Show less`)
   * ```
   */
  readonly showLessAppsText = input(t(() => $localize`:@@SI_LAUNCHPAD.SHOW_LESS:Show less`));

  readonly favoriteChange = output<FavoriteChangeEvent>();

  protected showAllApps = false;
  protected readonly categories = computed(() => {
    const apps = this.apps();
    const favorites = this.favorites();
    const categories: AppCategory[] = [];
    if (this.enableFavorites() && this.hasFavorites()) {
      categories.push({
        name: this.favoriteAppsText(),
        apps: favorites
      });
    }

    if (this.isCategories(apps)) {
      categories.push(...apps);
    } else {
      categories.push({ name: '', apps: [...apps] });
    }
    return categories;
  });
  protected readonly favorites = computed(() =>
    this.apps()
      .flatMap(app => ('apps' in app ? app.apps : (app as App)))
      .filter(app => app.favorite)
  );
  protected readonly hasFavorites = computed(() => this.favorites().length > 0);
  protected readonly icons = addIcons({ elementDown2, elementCancel });
  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });
  private header = inject(SiApplicationHeaderComponent);

  // Navigation constants for keyboard arrow navigation
  private readonly rowTolerance = 10;
  private readonly leftTolerance = 20;

  protected closeLaunchpad(): void {
    this.header.closeLaunchpad();
  }

  protected toggleFavorite(app: App, favorite: boolean): void {
    this.favoriteChange.emit({ app, favorite });
  }

  protected escape(): void {
    this.closeLaunchpad();
  }

  protected isCategories(items: App[] | AppCategory[]): items is AppCategory[] {
    return items.some(item => 'apps' in item);
  }

  protected handleAppsNavigation(event: KeyboardEvent, element: EventTarget | null): void {
    const correctedKey = correctKeyRTL(event.key);

    if (
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(correctedKey) ||
      !element ||
      !(element instanceof HTMLElement)
    ) {
      return;
    }

    const appContainer = element.closest('.d-flex');
    if (!appContainer) return;

    const enabledApps = Array.from(
      appContainer.querySelectorAll(':scope > a[si-launchpad-app]')
    ) as HTMLElement[];

    const currentIndex = enabledApps.indexOf(element);
    if (currentIndex === -1) return;

    let targetIndex: number;

    if (correctedKey === 'ArrowLeft' || correctedKey === 'ArrowRight') {
      // Horizontal navigation within the same row
      const direction = correctedKey === 'ArrowLeft' ? -1 : 1;
      targetIndex = (currentIndex + direction + enabledApps.length) % enabledApps.length;
    } else {
      // Vertical navigation between rows
      targetIndex = this.getVerticalTargetIndex(
        enabledApps,
        currentIndex,
        correctedKey === 'ArrowUp'
      );
    }

    enabledApps[targetIndex]?.focus();
    event.preventDefault();
  }

  private getVerticalTargetIndex(apps: HTMLElement[], currentIndex: number, isUp: boolean): number {
    // Cache all bounding rects to avoid multiple expensive DOM calls
    const appRects = apps.map(app => ({
      element: app,
      rect: app.getBoundingClientRect()
    }));

    const currentRect = appRects[currentIndex].rect;

    // Check if layout is single column (mobile/narrow screen)
    const alignedApps = appRects.filter(
      ({ rect }) => Math.abs(rect.left - currentRect.left) <= this.leftTolerance
    );

    // Single column: use sequential navigation
    if (alignedApps.length >= apps.length) {
      const direction = isUp ? -1 : 1;
      const targetIndex = currentIndex + direction;

      return targetIndex < 0 ? apps.length - 1 : targetIndex >= apps.length ? 0 : targetIndex;
    }

    // Grid layout: use spatial navigation
    const currentRowKey = Math.round(currentRect.top / this.rowTolerance) * this.rowTolerance;

    // Group apps by rows (excluding current app for target selection)
    const rowGroups = new Map<number, typeof appRects>();
    let hasMultipleRows = false;

    appRects.forEach((appRect, index) => {
      const rowKey = Math.round(appRect.rect.top / this.rowTolerance) * this.rowTolerance;

      if (rowKey !== currentRowKey) {
        hasMultipleRows = true;
      }

      if (index !== currentIndex) {
        if (!rowGroups.has(rowKey)) {
          rowGroups.set(rowKey, []);
        }
        rowGroups.get(rowKey)!.push(appRect);
      }
    });

    // Single row: no vertical movement
    if (!hasMultipleRows) {
      return currentIndex;
    }

    // Find target row and closest app
    const sortedRowKeys = Array.from(rowGroups.keys()).sort((a, b) => a - b);
    const currentRowIndex = sortedRowKeys.indexOf(currentRowKey);

    const targetRowKey = isUp
      ? currentRowIndex > 0
        ? sortedRowKeys[currentRowIndex - 1]
        : sortedRowKeys[sortedRowKeys.length - 1]
      : currentRowIndex < sortedRowKeys.length - 1
        ? sortedRowKeys[currentRowIndex + 1]
        : sortedRowKeys[0];

    const targetRowApps = rowGroups.get(targetRowKey) ?? [];

    if (targetRowApps.length === 0) return currentIndex;

    // Find closest app horizontally in target row
    const closestApp = targetRowApps.reduce((closest, app) =>
      Math.abs(app.rect.left - currentRect.left) < Math.abs(closest.rect.left - currentRect.left)
        ? app
        : closest
    );

    return apps.indexOf(closestApp.element);
  }
}
