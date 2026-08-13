/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, input, output } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiLaunchpadAppComponent } from './si-launchpad-app.component';
import { App, AppCategory, FavoriteChangeEvent } from './si-launchpad.model';

@Component({
  selector: 'si-launchpad-category',
  imports: [SiLaunchpadAppComponent, SiTranslatePipe, RouterLinkActive, RouterLink],
  templateUrl: './si-launchpad-category.component.html',
  host: {
    class: 'd-block',
    '[class.has-title]': '!!category().name'
  }
})
export class SiLaunchpadCategoryComponent {
  readonly category = input.required<AppCategory>();
  /** @defaultValue false */
  readonly enableFavorites = input(false);

  readonly favoriteChange = output<FavoriteChangeEvent>();

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });

  protected toggleFavorite(app: App, favorite: boolean): void {
    this.favoriteChange.emit({ app, favorite });
  }

  protected isFavoriteToggleDisabled(app: App): boolean {
    return '_noFavorite' in app && !!app._noFavorite;
  }
}
