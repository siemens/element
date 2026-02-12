/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  viewChild
} from '@angular/core';

import { AppMenuComponent } from './app-menu/app-menu.component';
import { AppSectionComponent } from './app-section/app-section.component';
import { AppSidebarComponent } from './app-sidebar/app-sidebar.component';
import { IconCategory, IconService, IconSet } from './icon.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'si-icon-viewer',
  imports: [AppMenuComponent, AppSectionComponent, AppSidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: {
    '[class.dark-theme]': 'isDarkTheme()',
    '[style.--base-size]': 'baseSize()',
    '[style.--light-background-color]': 'lightBackgroundColor()',
    '[style.--dark-background-color]': 'darkBackgroundColor()',
    '[style.--page-background-color]': 'pageBackgroundColor()',
    '[style.--light-text-color]': 'lightTextColor()',
    '[style.--dark-text-color]': 'darkTextColor()',
    '[style.--success-text-color]': 'successTextColor()',
    '[style.display]': 'display',
    '(window:scroll)': 'onScroll()',
    '(window:resize)': 'resize()'
  }
})
export class AppRootComponent implements OnInit {
  // Signal outputs
  readonly categoriesReceived = output<IconCategory[]>();

  // Signal inputs

  readonly iconSet = input<string>('');
  readonly iconsMargin = input<string>('false');
  readonly iconCategory = input<string>('');
  readonly cdnUrl = input<string>('');
  readonly hideSidebar = input<string>('true');
  readonly noScroll = input<string>('true');
  readonly hideMenu = input<string>('false');
  readonly floatMenu = input<string>('true');
  readonly floatMenuTop = input<string>('5vh');
  readonly displayTags = input<string>('false');
  readonly displayHeading = input<string>('false');
  readonly darkTheme = input<string>('false');
  readonly baseSize = input<string>('');
  readonly lightBackgroundColor = input<string>('');
  readonly darkBackgroundColor = input<string>('');
  readonly pageBackgroundColor = input<string>('');
  /**
   * Will only work if the {@link darkTheme} is active.
   */
  readonly lightTextColor = input<string>('');
  /**
   * Will only work if the {@link darkTheme} is not active.
   */
  readonly darkTextColor = input<string>('');
  readonly successTextColor = input<string>('');

  // Computed signals
  readonly actualIconSet = computed(() => {
    const set = this.iconSet();
    return set ? JSON.parse(set.replace(/'/g, '"')) : undefined;
  });

  private readonly _iconCategory = computed(() => this.iconCategory());

  readonly hasCategory = computed(() => !!this._iconCategory());

  readonly idPrefix = computed(() => (this._iconCategory() ? this._iconCategory() + '-' : ''));

  readonly isDarkTheme = computed(() => this.darkTheme() !== 'false');

  readonly dark = computed(() => this.fontService.dark());

  readonly filled = computed(() => this.fontService.filled());

  toggleDark(): void {
    this.fontService.dark.update(value => !value);
  }

  private actualDisplay = '';
  display = '';

  readonly menu = viewChild(AppMenuComponent, { read: ElementRef });
  private loadedFiles: string[] = [];

  readonly displayIconSetName = computed(() => this.fontService.iconSet()?.name ?? '');

  readonly displayIconCategories = computed(() => {
    const filtered = this.fontService.filteredIcons();
    const all = this.fontService.allIcons();
    const hasCategory = !!this.iconCategory();
    const hasActiveSearch = !!this.fontService.generalSearch();

    if (hasCategory && !hasActiveSearch) {
      return all;
    }
    return filtered;
  });

  readonly foundCategory = computed(() =>
    this.displayIconCategories().find(category => category.id === this.iconCategory())
  );

  readonly foundCategoryLength = computed(() => this.foundCategory()?.members.length ?? 0);

  private initialRouteHash = '';

  readonly fontService = inject(IconService);
  private readonly element = inject(ElementRef);

  constructor() {
    // Get category hash from URL for restoration
    this.initialRouteHash = window.location.hash;
    // If found, disable scroll restoration
    if (this.initialRouteHash) {
      history.scrollRestoration = 'manual';
    }

    // Effect to react to iconSet changes
    effect(() => {
      const iconSet = this.actualIconSet();
      this.fontService.setIconSet(iconSet);
    });

    // Effect to react to cdnUrl changes
    effect(() => {
      const url = this.cdnUrl();
      this.fontService.setCdnUrl(url);
    });

    // Effect to load icon set
    effect(() => {
      const set = this.fontService.iconSet();
      this.loadIconSet(set);
    });

    // Effect to react to allIcons changes
    effect(() => {
      const categories = this.fontService.allIcons();
      this.categoriesReceived.emit(categories);

      // Navigate to category hash
      if (this.initialRouteHash) {
        // Wait for content to load (This is a bit hacky.)
        setTimeout(() => {
          window.location.hash = '';
          window.location.hash = this.initialRouteHash;
        }, 100);
        // If the size changed because of icon loading.
        setTimeout(() => {
          window.location.hash = '';
          window.location.hash = this.initialRouteHash;
          this.initialRouteHash = '';
        }, 1000);
      }
    });

    // Effect to react to filteredIcons changes
    effect(() => {
      this.fontService.filteredIcons();
      const y = this.element.nativeElement.getBoundingClientRect().y;
      if (!this.iconCategory()) {
        setTimeout(() => {
          const yNew = this.element.nativeElement.getBoundingClientRect().y;
          const yDiff = y - yNew;
          document.documentElement.scrollTop = document.documentElement.scrollTop - yDiff;
        });
      }
      const hasActiveSearch = !!this.fontService.generalSearch();
      if (this.iconCategory() && hasActiveSearch) {
        this.actualDisplay =
          !!this.iconCategory() && !this.foundCategory()?.members.length ? 'none' : '';
        this.display = this.actualDisplay;
      }
    });
  }

  ngOnInit(): void {
    // Get search query from URL
    const currentParams = new URLSearchParams(window.location.search);
    const query = currentParams.get('iq');
    if (query) {
      this.fontService.generalSearch.set(query);
      this.fontService.setSearch(query);
    }

    const isDark = this.isDarkTheme();
    if (this.fontService.dark() !== isDark) {
      this.fontService.dark.set(isDark);
    }
  }

  protected floatingMenu = false;
  protected floatingMenuTop = '';
  protected floatingMenuLeft = 0;
  protected floatingMenuHeight = 0;
  protected floatingMenuWidth = 0;

  onScroll(): void {
    const menuItem = this.menu()?.nativeElement;
    if (menuItem) {
      const componentRect = this.element.nativeElement.getBoundingClientRect();
      if (componentRect.top < 0 && componentRect.bottom > 0 && this.floatMenu() !== 'false') {
        if (!this.floatingMenu) {
          const menuRect = menuItem.getBoundingClientRect();
          this.floatingMenuTop = this.floatMenuTop();
          this.floatingMenuLeft = menuRect.left;
          this.floatingMenuHeight = menuRect.height;
          this.floatingMenuWidth = menuRect.width;
          this.floatingMenu = true;
        }
      } else if (this.floatingMenu) {
        this.floatingMenu = false;
        this.floatingMenuTop = '';
        this.floatingMenuLeft = 0;
        this.floatingMenuHeight = 0;
        this.floatingMenuWidth = 0;
      }
    }
  }

  resize(): void {
    if (this.floatingMenu) {
      const componentRect = this.element.nativeElement.getBoundingClientRect();
      this.floatingMenuLeft = componentRect.left;
      this.floatingMenuWidth = componentRect.width;
    }
  }

  private loadIconSet(iconSet: IconSet | null): void {
    if (iconSet) {
      const globalUrl = this.fontService.cdnUrl();
      const url = globalUrl && globalUrl !== '/' ? globalUrl : iconSet.cdnUrl;

      const head = document.getElementsByTagName('head')[0];

      const stylesUrl = url + iconSet.stylesFile;
      if (!this.loadedFiles.includes(stylesUrl)) {
        const link = document.createElement('link');
        link.href = stylesUrl;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        head.append(link);

        this.loadedFiles.push(url);
      }
    }
  }
}
