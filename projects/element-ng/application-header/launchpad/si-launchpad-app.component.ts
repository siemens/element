/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  model
} from '@angular/core';
import {
  addIcons,
  elementExport,
  elementFavorites,
  elementFavoritesFilled,
  SiIconNextComponent
} from '@siemens/element-ng/icon';

import { SiApplicationHeaderComponent } from '../si-application-header.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-launchpad-app]',
  imports: [SiIconNextComponent],
  templateUrl: './si-launchpad-app.component.html',
  styleUrl: './si-launchpad-app.component.scss',
  host: {
    class: 'focus-inside',
    '[class.active]': 'active()',
    '[class.action]': 'action()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiLaunchpadAppComponent {
  /** @defaultValue false */
  readonly external = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly active = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly enableFavoriteToggle = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly favorite = model(false);
  /** @defaultValue false */
  readonly action = input(false, { transform: booleanAttribute });
  readonly iconUrl = input<string>();
  readonly iconClass = input<string>();

  protected readonly icons = addIcons({ elementExport, elementFavorites, elementFavoritesFilled });

  private header = inject(SiApplicationHeaderComponent);

  @HostListener('keydown.space', ['$event'])
  protected favoriteClicked(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favorite.update(old => !old);
  }

  @HostListener('click') protected click(): void {
    this.header.closeLaunchpad();
  }
}
