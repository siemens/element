/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, HostListener, inject, input, model } from '@angular/core';
import { elementExport, elementFavorites, elementFavoritesFilled } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiApplicationHeaderComponent } from '../si-application-header.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[si-launchpad-app]',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-launchpad-app.component.html',
  styleUrl: './si-launchpad-app.component.scss',
  host: {
    class: 'focus-inside',
    '[class.active]': 'active()',
    '[class.action]': 'action()'
  }
})
export class SiLaunchpadAppComponent {
  /**
   * When `true`, an external link icon is shown to indicate the app opens in a new tab.
   *
   * @defaultValue false
   */
  readonly external = input(false, { transform: booleanAttribute });
  /**
   * When `true`, the app item is highlighted as the currently active application.
   *
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });
  /**
   * When `true`, a toggle button is shown to allow the user to mark or unmark this app as a favorite.
   *
   * @defaultValue false
   */
  readonly enableFavoriteToggle = input(false, { transform: booleanAttribute });
  /**
   * Whether this app is currently marked as a favorite by the user.
   *
   * @defaultValue false
   */
  readonly favorite = model(false);
  /**
   * When `true`, the item is styled as an action entry rather than a regular app link.
   *
   * @defaultValue false
   */
  readonly action = input(false, { transform: booleanAttribute });

  /** URL of the app icon. */
  readonly iconUrl = input<string>();
  /** CSS class applied to the app icon element. */
  readonly iconClass = input<string>();
  /**
   * Aria-label for the external link icon.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_LAUNCHPAD.EXTERNAL_LINK:Open in new tab`)
   * ```
   */
  readonly externalLinkText = input<TranslatableString>(
    t(() => $localize`:@@SI_LAUNCHPAD.EXTERNAL_LINK:Open in new tab`)
  );

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
