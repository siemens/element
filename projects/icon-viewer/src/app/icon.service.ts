/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';

export interface Icon {
  name: string;
  filledName?: string;
  description?: string;
  tags?: string[];
  /**
   * Search terms (not visible to user)
   */
  terms?: string[];
  category?: string;
}

export interface IconSet {
  name: string;
  id: string;
  prefix: string;
  metaFile: string;
  packageName: string;
  stylesFile: string;
  cdnUrl: string;
  codeUrl: string;
  downloadFile: string;
}

export interface IconCategory {
  id: string;
  title: string;
  members: Icon[];
}

@Injectable({
  providedIn: 'root'
})
export class IconService {
  // Public signals
  readonly dark = signal<boolean>(false);
  readonly filled = signal<boolean>(false);
  readonly generalSearch = signal<string>('');

  // Private signals
  private readonly _iconSet = signal<IconSet | null>(null);
  private readonly _search = signal<string>('');
  private readonly _cdnUrl = signal<string>('');

  // httpResource to fetch icon metadata
  private readonly iconMetadataResource = httpResource<Icon[]>(() => {
    const iconSet = this._iconSet();
    const cdnUrl = this._cdnUrl();

    if (!iconSet) {
      return { url: '' };
    }

    const url = cdnUrl && cdnUrl !== '/' ? cdnUrl : iconSet.cdnUrl;
    return { url: url + iconSet.metaFile };
  });

  // Computed signals
  readonly allIcons = computed(() => {
    const data = this.iconMetadataResource.value();
    const iconSet = this._iconSet();

    if (!data || !iconSet) {
      return [];
    }

    return this.processIconData(data, iconSet);
  });

  readonly isLoading = computed(() => this.iconMetadataResource.isLoading());

  readonly filteredIcons = computed(() => {
    const icons = this.allIcons();
    const search = this._search();
    return this.filter(icons, search);
  });

  readonly hasFilled = computed(() => {
    const categories = this.filteredIcons();
    return categories.some(category => category.members.some(icon => icon.filledName));
  });

  readonly cdnUrl = computed(() => this._cdnUrl());
  readonly search = computed(() => this._search());
  readonly iconSet = computed(() => this._iconSet());

  setIconSet(iconSet?: IconSet): void {
    this._iconSet.set(iconSet ?? null);
  }

  setCdnUrl(url: string): void {
    const shortenedUrl = url.replace(/\/?$/, '/');
    this._cdnUrl.set(shortenedUrl);
  }

  setSearch(search: string): void {
    // Change query params
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set('iq', search);
    } else {
      params.delete('iq');
    }
    let paramsString = params.toString();
    if (paramsString) {
      paramsString = '?' + paramsString;
    }
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${paramsString}${window.location.hash}`
    );
    this._search.set(search);
  }

  private processIconData(data: Icon[], iconSet: IconSet): IconCategory[] {
    const iconCategories: IconCategory[] = [];

    data.forEach((icon: Icon) => {
      icon.name = iconSet.prefix + '-' + icon.name;

      const iconIndex = iconCategories.findIndex(item => item.title === icon.category);

      let isFilledIcon = false;
      const search = /^(.+?)-filled$/.exec(icon.name);
      if (search) {
        const foundIcon = data.find(searchIcon => searchIcon.name === search[1]);
        if (foundIcon) {
          foundIcon.filledName = icon.name;
          isFilledIcon = true;
        }
      }

      if (!isFilledIcon) {
        if (iconIndex !== -1) {
          iconCategories[iconIndex].members.push(icon);
        } else {
          iconCategories.push({
            title: icon.category!,
            id: icon.category!.replace(' ', '-'),
            members: [icon]
          });
        }
      }
    });

    return iconCategories;
  }

  private filter(items: IconCategory[], searchtext: string): IconCategory[] {
    if (!searchtext) {
      return items;
    }
    let categories: IconCategory[] = JSON.parse(JSON.stringify(items));
    // First clean the search term .
    const processedSearchtext = searchtext.toLocaleLowerCase().trim();
    const searchwords = processedSearchtext
      .toLocaleLowerCase()
      .split(' ')
      .filter(item => item);

    // Check if some category title matches exactly, if yes, show the entire category (skip other filter).
    const entireCategoriesTitles = categories
      .map(category => category.title)
      .filter(title => title.toLocaleLowerCase() === processedSearchtext);

    searchwords.forEach(searchword => {
      if (searchword?.length) {
        categories = categories.filter(category => {
          if (entireCategoriesTitles.includes(category.title)) {
            return true;
          }
          category.members = category.members.filter(member => {
            if (member.name.includes(searchword)) {
              return member;
            }
            const tagsAndTerms = [...(member.tags ?? []), ...(member.terms ?? [])];
            if (tagsAndTerms.length) {
              const tags = tagsAndTerms.filter(tag => tag.includes(searchword));
              if (tags.length) {
                return member;
              }
            }
            return undefined;
          });
          return category.members.length;
        });
      }
    });

    return categories;
  }
}
