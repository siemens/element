/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import {
  App,
  AppCategory,
  FavoriteChangeEvent,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderCollapsibleActionsComponent,
  SiHeaderLogoDirective,
  SiHeaderNavigationComponent,
  SiHeaderNavigationItemComponent,
  SiLaunchpadFactoryComponent
} from '@siemens/element-ng/application-header';
import { MenuItem } from '@siemens/element-ng/common';
import {
  HeaderWithDropdowns,
  SI_HEADER_WITH_DROPDOWNS,
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemsFactoryComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { defer } from 'rxjs';

import { AccountItem } from '../account.model';
import { AppItem, AppItemCategory } from './si-navbar-primary.model';

/** @deprecated Use the new `si-application-header` instead. */
@Component({
  selector: 'si-navbar-primary',
  imports: [
    A11yModule,
    NgTemplateOutlet,
    SiLinkDirective,
    SiTranslateModule,
    SiApplicationHeaderComponent,
    SiLaunchpadFactoryComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderDropdownItemsFactoryComponent,
    SiHeaderNavigationItemComponent,
    SiHeaderBrandDirective,
    SiHeaderNavigationComponent,
    SiHeaderActionsDirective,
    SiHeaderCollapsibleActionsComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-navbar-primary.component.html',
  styles: `
    .header-custom-logo {
      content: initial;
      inline-size: auto;
    }
  `,
  providers: [{ provide: SI_HEADER_WITH_DROPDOWNS, useExisting: SiNavbarPrimaryComponent }]
})
export class SiNavbarPrimaryComponent implements OnChanges, HeaderWithDropdowns {
  /**
   * List of navbar items which should be displayed at the left (in LTR) side next to the
   * banner.
   *
   * @defaultValue []
   */
  readonly primaryItems = input<MenuItem[]>([]);
  /**
   * List of account dropdown elements (defined by `title` and `link`).
   *
   * The menu item can have submenu items (supplying `items`: MenuItem[]).
   * Submenu items can be divided into groups by separators. A separator is
   * an item with only '-' set as `title`.
   *
   * Alternatively, you can can create a custom content by putting your html
   * code between the <si-navbar-primary> tags. In this case you don't need this
   * property (will be ignored if you set anyway).
   */
  readonly accountItems = input<MenuItem[]>();
  /**
   * Account settings name (`title`) and profile picture (`image` or `icon`)
   */
  readonly account = input<AccountItem>();
  /**
   * URL of the navbar brand.
   */
  readonly logoUrl = input<string>();
  /**
   * Title of the application.
   */
  readonly appTitle = input<string>();
  /**
   * Configurable home link that is used at the logo and app title.
   * Use `undefined` to disable the link.
   *
   * @defaultValue
   * ```
   * { link: '/' }
   * ```
   */
  readonly home = input<Link | undefined>({ link: '/' });
  /**
   * title for the launchpad
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.TITLE:Launchpad`
   * ```
   */
  readonly appSwitcherTitle = input($localize`:@@SI_LAUNCHPAD.TITLE:Launchpad`);

  /**
   * sub-title for the launchpad
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.SUB_TITLE:Access all your apps`
   * ```
   */
  readonly appSwitcherSubTitle = input($localize`:@@SI_LAUNCHPAD.SUB_TITLE:Access all your apps`);

  /**
   * Title or translate key for the favorite apps section.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.FAVORITE_APPS:Favorite apps`
   * ```
   */
  readonly favoriteAppsTitle = input($localize`:@@SI_LAUNCHPAD.FAVORITE_APPS:Favorite apps`);

  /**
   * Title or translate key for the default apps section.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.DEFAULT_CATEGORY_TITLE:Apps`
   * ```
   */
  readonly defaultAppsTitle = input($localize`:@@SI_LAUNCHPAD.DEFAULT_CATEGORY_TITLE:Apps`);

  /**
   * Title or translate key for the show more apps button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.SHOW_MORE:Show more`
   * ```
   */
  readonly showMoreAppsTitle = input($localize`:@@SI_LAUNCHPAD.SHOW_MORE:Show more`);

  /**
   * Title or translate key for the show less apps button.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.SHOW_LESS:Show less`
   * ```
   */
  readonly showLessAppsTitle = input($localize`:@@SI_LAUNCHPAD.SHOW_LESS:Show less`);

  /**
   * All app items shown in the launchpad. The launchpad will not be visible if the
   * app items are undefined. The launchpad will be visible if the app items are an
   * empty array.
   */
  readonly appItems = input<AppItem[]>();
  /**
   * Like `appItems` but with the addition of categories. If this is set, `appItems` is ignored.
   */
  readonly appCategoryItems = input<AppItemCategory[]>();

  /**
   * Allow the user to favorite apps which will then be displayed at the top.
   *
   * @defaultValue false
   */
  readonly appItemsFavorites = input(false, { transform: booleanAttribute });
  /**
   * "all apps" link in the launchpad
   */
  readonly allAppsLink = input<MenuItem>();
  /**
   * Specifies whether the component should automatically be focused as soon as it is loaded.
   *
   * @defaultValue false
   */
  readonly focusOnLoad = input(false, { transform: booleanAttribute });

  /**
   * Marks the navbar as primary navigation element. Needed for a11y (screen reader).
   * Only one element should be primary. If multiple navbars are used, it's up to the
   * user of the components to label them in the correct order.
   *
   * @defaultValue 'Primary'
   */
  readonly navAriaLabel = input('Primary');

  /**
   * Text to close the launchpad. Needed for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LAUNCHPAD.CLOSE:Close launchpad`
   * ```
   */
  readonly closeAppSwitcherText = input($localize`:@@SI_LAUNCHPAD.CLOSE:Close launchpad`);

  /**
   * Text for the launchpad icon. Needed for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_NAVBAR.OPEN_LAUNCHPAD:Open launchpad`
   * ```
   */
  readonly openAppSwitcherText = input($localize`:@@SI_NAVBAR.OPEN_LAUNCHPAD:Open launchpad`);

  /**
   * Text or translate key for the toggle navigation icon. Needed for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_NAVBAR.TOGGLE_NAVIGATION:Toggle navigation`
   * ```
   */
  readonly toggleNavigationText = input(
    $localize`:@@SI_NAVBAR.TOGGLE_NAVIGATION:Toggle navigation`
  );

  /**
   * Aria label for the main menu landmark
   *
   * @defaultValue 'Header main'
   */
  readonly ariaLabelMainMenu = input('Header main');

  /**
   * Aria label for the secondary menu landmark
   *
   * @defaultValue 'Header secondary'
   */
  readonly ariaLabelSecondaryMenu = input('Header secondary');

  readonly appItemFavoriteChanged = output<[AppItem, boolean]>();

  /** @internal */
  readonly header = viewChild.required(SiApplicationHeaderComponent);
  /** @internal */
  readonly collapsibleActions = viewChild(SiHeaderCollapsibleActionsComponent);
  /** @internal */
  readonly navItemCount = signal(0);

  protected newAppItems?: App[] | AppCategory[];
  protected active?: MenuItem;

  /** @internal */
  // defer is required as header is not available at the time of creation.`
  readonly inlineDropdown = defer(() => this.header().inlineDropdown);

  /** @internal */
  onDropdownItemTriggered(): void {
    this.header().onDropdownItemTriggered();
  }

  /** @internal */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appItems || changes.appCategoryItems) {
      const appItems = this.appItems();
      const appCategoryItems = this.appCategoryItems();
      if (appCategoryItems) {
        this.newAppItems = appCategoryItems.map(category => ({
          // Violation by intention.
          // Empty strings should also be replaced by the default title.
          // We rely on this in our examples, so projects might as well.
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          name: category.category || this.defaultAppsTitle(),
          apps: this.convertApps(category.items)
        }));
        const allAppsLink = this.allAppsLink();
        if (allAppsLink && this.newAppItems.length) {
          const lastCategory = this.newAppItems.at(-1)!;
          lastCategory.apps.push({
            name: allAppsLink.title!,
            iconClass: allAppsLink.icon ?? 'element-plus',
            href: allAppsLink.href!,
            target: allAppsLink.target,
            _noFavorite: true // this should not show up in public API, but we need it for now.
          } as App);
        }
      } else if (appItems) {
        this.newAppItems = this.convertApps(appItems!);
        const allAppsLink = this.allAppsLink();
        if (allAppsLink) {
          this.newAppItems.push({
            name: allAppsLink.title!,
            iconClass: allAppsLink.icon ?? 'element-plus',
            href: allAppsLink.href!,
            target: allAppsLink.target,
            _noFavorite: true // this should not show up in public API, but we need it for now.
          } as App);
        }
      }
    }
  }

  private convertApps(apps: AppItem[]): App[] {
    return apps.map(app => ({
      name: app.title!,
      href: app.href!,
      external: app.isExternal,
      active: app.isActive,
      target: app.target,
      iconClass: app.icon,
      favorite: app.isFavorite,
      _src: app // this should not show up in public API, but we need it for now.
    }));
  }

  protected onFavoriteChange({ app, favorite }: FavoriteChangeEvent): void {
    this.appItemFavoriteChanged.emit([(app as any)._src, favorite]);
  }
}
