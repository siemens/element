/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Observable, of } from 'rxjs';

import { Theme } from './si-theme.model';

/**
 * SiThemeStore object is used by the theme service to load and
 * store the themes. You can inject your own implementation to provide
 * a backend implementation. Otherwise a localStorage based implementation
 * is used.
 */
export abstract class SiThemeStore {
  /**
   * Load and return an alternative custom theme, other then
   * the default element theme. This method is invoked initially
   * to check for an alternative custom theme.
   * @returns The active theme to be used, or undefined if the
   * default element theme shall be used. All wrapped in an observable
   * that can also emit errors.
   */
  abstract loadActiveTheme(): Observable<Theme | undefined>;
  /**
   * Sets the theme with the given name to active.
   * @param name - The name of the theme to become active.
   * @returns True on success, otherwise false.
   */
  abstract activateTheme(name: string): Observable<boolean>;
  /**
   * Deactivate any active theme and makes the element theme the default one.
   * @returns True on success, otherwise false.
   */
  abstract deactivateTheme(): Observable<boolean>;
  /**
   * Load and return the available theme names.
   * @returns An `Observable` of available theme names, other than the
   * default element theme.
   */
  abstract loadThemeNames(): Observable<string[]>;
  /**
   * Load theme with the given `name`.
   * @param name - The name of the theme to be returned.
   * @returns Observable with the named theme or `undefined` if no such theme exist.
   */
  abstract loadTheme(name: string): Observable<Theme | undefined>;
  /**
   * Saves a theme to the store. The name shall not be empty. A theme with
   * identical name gets overwritten.
   * @param theme - The theme to be saved.
   * @returns True on success, otherwise false. All nicely wrapped in
   * an observable that may also emit errors.
   */
  abstract saveTheme(theme: Theme): Observable<boolean>;
  /**
   * Deletes the theme with the given name from the store.
   * @param name - The name of the theme to be deleted.
   * @returns True on success, otherwise false. All nicely wrapped in
   * an observable that may also emit errors. Returns false,
   * if the theme does not exist.
   */
  abstract deleteTheme(name: string): Observable<boolean>;
}

export const SI_THEME_LOCAL_STORAGE_KEY = 'si-themes';

export interface ThemeStorage {
  activeTheme: string | undefined;
  themes: { [key: string]: Theme };
}

export class SiDefaultThemeStore extends SiThemeStore {
  private isBrowser: boolean;

  constructor(isBrowser: boolean) {
    super();
    this.isBrowser = isBrowser;
  }

  loadActiveTheme(): Observable<Theme | undefined> {
    if (!this.isBrowser) {
      return of(undefined);
    }

    const store = this.loadStore();
    if (store.activeTheme) {
      return of(store.themes[store.activeTheme]);
    } else {
      return of(undefined);
    }
  }

  activateTheme(name: string): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const store = this.loadStore();
    if (store.themes[name]) {
      store.activeTheme = name;
      this.saveStore(store);
      return of(true);
    } else {
      return of(false);
    }
  }

  deactivateTheme(): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const store = this.loadStore();
    store.activeTheme = undefined;
    this.saveStore(store);
    return of(true);
  }

  loadThemeNames(): Observable<string[]> {
    if (!this.isBrowser) {
      return of([]);
    }
    const store = this.loadStore();
    return of(Array.from(Object.keys(store.themes)));
  }

  saveTheme(theme: Theme): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const store = this.loadStore();
    store.themes[theme.name] = theme;
    this.saveStore(store);
    return of(true);
  }

  loadTheme(name: string): Observable<Theme | undefined> {
    if (!this.isBrowser) {
      return of(undefined);
    }
    const store = this.loadStore();
    return of(store.themes[name]);
  }

  deleteTheme(name: string): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const store = this.loadStore();
    delete store.themes[name];
    if (store.activeTheme === name) {
      store.activeTheme = undefined;
    }
    this.saveStore(store);
    return of(true);
  }

  private loadStore(): ThemeStorage {
    const storeStr = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
    if (storeStr) {
      return JSON.parse(storeStr) as ThemeStorage;
    } else {
      return { activeTheme: undefined, themes: {} };
    }
  }

  private saveStore(store: ThemeStorage): void {
    localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(store));
  }
}
