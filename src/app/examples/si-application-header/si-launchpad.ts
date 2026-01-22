/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  App,
  AppCategory,
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
  readonly enableFavorites = signal(true);
  readonly enableCategories = signal(false);

  private readonly baseApps = signal<App[]>([
    {
      name: 'Assets',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      favorite: true,
      href: '.'
    },
    {
      name: 'Fischbach',
      systemName: 'System name',
      iconUrl: './assets/app-icons/fischbach.svg',
      favorite: true,
      active: true,
      href: '.'
    },
    {
      name: 'Rocket',
      systemName: 'System name',
      iconUrl: './assets/app-icons/rocket.svg',
      favorite: true,
      href: '.'
    },
    {
      name: 'Statistics',
      systemName: 'System name',
      iconUrl: './assets/app-icons/statistics.svg',
      favorite: true,
      type: 'router-link',
      routerLink: 'stats'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      external: true,
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'This is a really long name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      external: true,
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'This is a really long name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    },
    {
      name: 'App name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      href: '.'
    }
  ]);

  readonly apps = computed((): App[] | AppCategory[] => {
    const businessApps = this.baseApps().filter(app =>
      ['Assets', 'Fischbach', 'Statistics'].includes(app.name)
    );
    const toolApps = this.baseApps().filter(
      app => app.name === 'Rocket' || app.systemName === 'This is a really long name'
    );
    const otherApps = this.baseApps().filter(
      app => !businessApps.includes(app) && !toolApps.includes(app)
    );

    if (!this.enableCategories()) {
      return [...businessApps, ...toolApps, ...otherApps];
    }

    return [
      { name: 'Business Applications', apps: businessApps },
      { name: 'System Tools', apps: toolApps },
      { name: 'Other Applications', apps: otherApps }
    ].filter(category => category.apps.length > 0);
  });

  updateFavorite({ app, favorite }: { app: App; favorite: boolean }): void {
    this.baseApps.set(this.baseApps().map(a => (a === app ? { ...a, favorite } : a)));
  }

  toggleFavorites(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.enableFavorites.set(target.checked);
  }

  toggleCategories(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.enableCategories.set(target.checked);
  }
}
