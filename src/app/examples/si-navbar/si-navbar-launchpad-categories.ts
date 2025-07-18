/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppItem, AppItemCategory, SiNavbarModule } from '@siemens/element-ng/navbar';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule], // eslint-disable-line @typescript-eslint/no-deprecated
  templateUrl: './si-navbar-launchpad-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  appCategories: AppItemCategory[] = [
    {
      category: 'Phishing Apps',
      items: [
        {
          title: 'Water',
          icon: 'element-waters',
          isFavorite: true,
          isActive: true,
          href: '.'
        }
      ]
    },
    {
      category: 'Other Apps',
      items: [
        {
          title: 'Assets',
          icon: 'element-warehouse',
          href: '.'
        },
        {
          title: 'Rocket',
          icon: 'element-rocket',
          href: '.'
        },
        {
          title: 'Statistics',
          icon: 'element-report',
          href: '.'
        }
      ]
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  favoriteChanged([app, favorite]: [AppItem, boolean]): void {
    app.isFavorite = favorite;
    this.appCategories = [...this.appCategories];
  }
}
