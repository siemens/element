/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  App,
  AppCategory,
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective,
  SiLaunchpadFactoryComponent
} from '@siemens/element-ng/application-header';
import { SiFormItemComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    RouterLink,
    SiHeaderBrandDirective,
    SiLaunchpadFactoryComponent,
    SiHeaderLogoDirective,
    FormsModule,
    SiFormItemComponent
  ],
  templateUrl: './si-launchpad.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  readonly enableFavorites = signal(true);
  readonly enableCategories = signal(false);

  private readonly businessApps = signal<App[]>([
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
      name: 'Statistics',
      systemName: 'System name',
      iconUrl: './assets/app-icons/statistics.svg',
      favorite: true,
      type: 'router-link',
      routerLink: 'stats'
    }
  ]);
  private readonly toolApps = signal<App[]>([
    {
      name: 'Rocket',
      systemName: 'System name',
      iconUrl: './assets/app-icons/rocket.svg',
      favorite: true,
      href: '.'
    },
    {
      name: 'This is a really long name',
      systemName: 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      external: true,
      href: '.'
    }
  ]);
  private appCounter = 0;
  private readonly otherApps = signal<App[]>(
    Array.from({ length: 11 }, (_, i) => ({
      name: i === 3 ? 'This is a really long name' : `App name ${++this.appCounter}`,
      systemName: i === 6 ? 'This is a really long name' : 'System name',
      iconUrl: './assets/app-icons/assets.svg',
      external: [0, 3].includes(i),
      href: '.'
    }))
  );

  readonly apps = computed((): App[] | AppCategory[] => {
    if (!this.enableCategories()) {
      return [...this.businessApps(), ...this.toolApps(), ...this.otherApps()];
    }

    return [
      { name: 'Business Applications', apps: this.businessApps() },
      { name: 'System Tools', apps: this.toolApps() },
      { name: 'Other Applications', apps: this.otherApps() }
    ].filter(category => category.apps.length > 0);
  });

  updateFavorite({ app, favorite }: { app: App; favorite: boolean }): void {
    for (const category of [this.businessApps, this.toolApps, this.otherApps]) {
      const match = category().find(a => a === app);
      if (match) {
        category.update(apps => {
          return apps.map(a => (a === app ? { ...a, favorite } : a));
        });
        break;
      }
    }
  }
}
