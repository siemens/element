/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  App,
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective,
  SiLaunchpadFactoryComponent
} from '@siemens/element-ng/application-header';

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    RouterLink,
    SiHeaderBrandDirective,
    SiLaunchpadFactoryComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-launchpad.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  apps: App[] = [
    {
      name: 'Assets',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'Fischbach',
      iconUrl: './assets/app-icons/fischbach.svg',
      favorite: true,
      href: '.'
    },
    {
      name: 'Rocket',
      iconUrl: './assets/app-icons/rocket.svg',
      href: '.'
    },
    {
      name: 'Statistics',
      iconUrl: './assets/app-icons/statistics.svg',
      href: '.'
    }
  ];

  updateFavorite({ app, favorite }: { app: App; favorite: boolean }): void {
    app.favorite = favorite;
    this.apps = [...this.apps]; // Trigger change detection
  }
}
