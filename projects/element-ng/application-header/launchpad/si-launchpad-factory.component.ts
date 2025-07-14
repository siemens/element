/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import {
  addIcons,
  elementCancel,
  elementDown2,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import { SiLinkModule } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

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
    CommonModule,
    SiLinkModule,
    SiTranslateModule,
    SiLaunchpadAppComponent,
    SiIconNextComponent
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
   * $localize`:@@SI_LAUNCHPAD.CLOSE:Close launchpad`
   * ```
   */
  readonly closeText = input($localize`:@@SI_LAUNCHPAD.CLOSE:Close launchpad`);

  /**
   * Title of the launchpad.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.TITLE:Launchpad`
   * ```
   */
  readonly titleText = input($localize`:@@SI_LAUNCHPAD.TITLE:Launchpad`);

  /**
   * Subtitle of the launchpad.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.SUBTITLE:Access all your apps`
   * ```
   */
  readonly subtitleText = input($localize`:@@SI_LAUNCHPAD.SUBTITLE:Access all your apps`);

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
   * $localize`:@@SI_LAUNCHPAD.FAVORITE_APPS:Favorite apps`
   * ```
   */
  readonly favoriteAppsText = input($localize`:@@SI_LAUNCHPAD.FAVORITE_APPS:Favorite apps`);

  /**
   * Title of the show more apps button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.SHOW_MORE:Show more`
   * ```
   */
  readonly showMoreAppsText = input($localize`:@@SI_LAUNCHPAD.SHOW_MORE:Show more`);

  /**
   * Title of the show less apps button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.SHOW_LESS:Show less`
   * ```
   */
  readonly showLessAppsText = input($localize`:@@SI_LAUNCHPAD.SHOW_LESS:Show less`);

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
  private header = inject(SiApplicationHeaderComponent);

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
}
