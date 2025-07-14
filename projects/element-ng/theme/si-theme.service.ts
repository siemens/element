/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { EventEmitter, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml } from '@angular/platform-browser';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { SiDefaultThemeStore, SiThemeStore } from './si-theme-store';
import {
  ELEMENT_THEME_NAME,
  Theme,
  ThemeColorScheme,
  ThemeColorSchemes,
  ThemeType
} from './si-theme.model';

@Injectable({ providedIn: 'root' })
export class SiThemeService {
  /**
   * The current color scheme. (e.g. light or dark).
   */
  private _resolvedColorScheme: ThemeType | undefined = 'light';
  private resolvedColorSchemeSub = new ReplaySubject<keyof ThemeColorSchemes>(1);
  /**
   * Emits events when the color scheme changes.
   *
   * @defaultValue this.resolvedColorSchemeSub.asObservable()
   */
  readonly resolvedColorScheme$ = this.resolvedColorSchemeSub.asObservable();
  /**
   * The current color scheme. (e.g. light or dark).
   */
  get resolvedColorScheme(): ThemeType | undefined {
    return this._resolvedColorScheme;
  }

  /**
   * All available theme names, including element theme name.
   */
  private _themeNames: string[] = [ELEMENT_THEME_NAME];
  private themeNamesSub = new ReplaySubject<string[]>(1);
  /**
   * Emits events when the list of available theme names changes.
   *
   * @defaultValue this.themeNamesSub.asObservable()
   */
  readonly themeNames$ = this.themeNamesSub.asObservable();

  /**
   * All available theme names, including element theme name.
   */
  get themeNames(): string[] {
    return this._themeNames;
  }

  /**
   * Emits events when the currently applied theme changes. Either by
   * changing to another theme or by re-applying a theme with updated
   * properties. When switching to default theme element, `undefined`
   * is emitted.
   */
  readonly themeChange = new EventEmitter<Theme | undefined>();

  /**
   * The name of the theme that is active. Theme name `element` is the default.
   */
  activeThemeName?: string;
  /**
   * Icon overrides by the currently activeTheme.
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly themeIcons = signal<Record<string, SafeHtml>>({});

  private themes: Map<string, Theme> = new Map();
  private darkMediaQuery?: MediaQueryList;
  private mediaQueryListener?: () => void;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previewTheme?: Theme;

  private themeStore =
    inject(SiThemeStore, { optional: true }) ?? new SiDefaultThemeStore(this.isBrowser);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private domSanitizer = inject(DomSanitizer);

  constructor() {
    this.resolvedColorScheme$.subscribe(scheme => (this._resolvedColorScheme = scheme));
    this.themeNames$.subscribe(names => (this._themeNames = names));

    if (this.isBrowser) {
      this.darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = () => this.toggleDark(this.darkMediaQuery!.matches);
    }

    this.getActiveTheme()
      .pipe(take(1))
      .subscribe({
        next: theme => this.applyThemeStyle(theme, this._resolvedColorScheme),
        error: error => console.error('Cannot load active theme', error)
      });

    this.themeStore
      .loadThemeNames()
      .pipe(take(1))
      .subscribe({
        next: names => {
          names.push(ELEMENT_THEME_NAME);
          this.themeNamesSub.next(names);
        },
        error: error => console.error('Cannot load theme names', error)
      });
  }

  /**
   * Returns `true` if a theme with the given name is available.
   */
  hasTheme(name: string): boolean {
    return this._themeNames.includes(name);
  }

  /**
   * Returns a clone of the theme with the given name or `undefined` if not
   * available or name is `element`.
   * @param name - The name of the theme to be returned.
   * @returns The theme with the given name and `undefined` if name is `element`.
   */
  getTheme(name: string): Observable<Theme | undefined> {
    if (name === ELEMENT_THEME_NAME || !this.hasTheme(name)) {
      return of(undefined);
    }

    if (this.themes.has(name)) {
      const theme = this.themes.get(name)!;
      // return a clone to avoid changes as a side effect
      return of(this.cloneTheme(theme));
    }

    return this.themeStore.loadTheme(name).pipe(
      tap(theme => {
        if (theme) {
          this.themes.set(theme.name, this.cloneTheme(theme));
        }
      })
    );
  }

  /**
   * Loads and returns the currently active theme. Returns undefined if no custom theme is used.
   * @returns A custom theme or `undefined` if the default element theme is used.
   */
  getActiveTheme(): Observable<Theme | undefined> {
    if (this.activeThemeName) {
      return of(this.themes.get(this.activeThemeName));
    }
    return this.themeStore.loadActiveTheme().pipe(
      map(theme => {
        if (theme) {
          this.activeThemeName = theme.name;
          this.themes.set(theme.name, theme);
          this.applyTheme(theme, this._resolvedColorScheme);
          return theme;
        }
        this.activeThemeName = ELEMENT_THEME_NAME;
        return undefined;
      })
    );
  }

  /**
   * Adds or updates the given theme in the theme store.
   * @param theme - The theme to be saved.
   * @returns `true` if the theme was saved successfully.
   */
  addOrUpdateTheme(theme: Theme): Observable<boolean> {
    const result = new ReplaySubject<boolean>(1);

    this.themeStore.saveTheme(theme).subscribe({
      next: saveResult => {
        if (saveResult) {
          this.themes.set(theme.name, this.cloneTheme(theme));
          // Update list of theme names when this is a new one
          if (!this.hasTheme(theme.name)) {
            const names = this._themeNames.concat(theme.name);
            this.themeNamesSub.next(names);
          }
        }
        result.next(saveResult);
        result.complete();
      },
      error: error => result.error(error),
      complete: () => result.complete()
    });
    return result;
  }

  /**
   * Deletes the theme with the given name from the theme store.
   */
  deleteTheme(name: string): Observable<boolean> {
    const result = new ReplaySubject<boolean>(1);
    if (!this.hasTheme(name) || name === ELEMENT_THEME_NAME) {
      result.next(false);
      result.complete();
    } else {
      this.removeThemeCSS(name);
      this.themeStore.deleteTheme(name).subscribe({
        next: deleteResult => {
          if (deleteResult) {
            this.themes.delete(name);
            const names = this._themeNames.filter(themeName => themeName !== name);
            this.themeNamesSub.next(names);
          }
          result.next(deleteResult);
          result.complete();
        },
        error: error => result.error(error),
        complete: () => result.complete()
      });
    }
    return result;
  }

  /**
   * Resets the preview theme to the default element theme.
   */
  resetPreview(): void {
    this.previewTheme = { name: '__preview', schemes: { dark: {}, light: {} } };
    this.removeThemeCSS(this.previewTheme.name);
  }

  /**
   * Sets the active theme to the given name. If no name is given, the default element theme is used.
   */
  setActiveTheme(name?: string, type?: ThemeType): Observable<boolean> {
    const theType = type ?? this._resolvedColorScheme ?? 'auto';
    const theName = name ?? this.activeThemeName ?? ELEMENT_THEME_NAME;

    if (theName === this.activeThemeName) {
      return of(true);
    }
    if (!this.hasTheme(theName)) {
      return of(false);
    }

    const result = new ReplaySubject<boolean>(1);
    this.activeThemeName = theName;
    // Make the change in the remove store
    const store =
      theName !== ELEMENT_THEME_NAME
        ? this.themeStore.activateTheme(theName)
        : this.themeStore.deactivateTheme();
    store
      .pipe(
        // On success, load the theme
        switchMap(storeResult => {
          if (storeResult) {
            return this.getTheme(theName);
          } else {
            return throwError(() => 'Cannot change active theme in theme store.');
          }
        }),
        // Only take one to avoid unsubscription issues
        take(1)
      )
      .subscribe({
        next: theme => {
          this.applyTheme(theme, theType);
          result.next(true);
        },
        error: error => {
          console.error(`Activating theme ${name} failed`, error);
          result.next(false);
        },
        complete: () => result.complete()
      });
    return result;
  }

  /**
   * Apply `light` or `dark` theme to the document.
   */
  applyThemeType(type: ThemeType): void {
    if (type === this._resolvedColorScheme || !this.darkMediaQuery || !this.mediaQueryListener) {
      return;
    }

    this.darkMediaQuery.removeEventListener('change', this.mediaQueryListener);

    if (type === 'light') {
      this.toggleDark(false);
    } else if (type === 'dark') {
      this.toggleDark(true);
    } else {
      this.mediaQueryListener();
      this.darkMediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  /**
   * Applies the given theme to the document. If no theme is given, the active theme is applied.
   */
  applyTheme(theme?: Theme, type?: ThemeType, overwrite?: boolean): void {
    if (theme) {
      this.applyThemeStyle(theme, type, overwrite);
    } else {
      this.getActiveTheme()
        .pipe(take(1))
        .subscribe({
          next: loadedTheme => this.applyThemeStyle(loadedTheme, type),
          error: error => console.error('Cannot load active theme', error)
        });
    }
  }

  /**
   * Updates the given property of the preview theme.
   */
  updateProperty(name: string, value: string, type: keyof ThemeColorSchemes): void {
    if (!this.previewTheme) {
      this.resetPreview();
    }
    this.previewTheme!.schemes[type]![name] = value;
    this.createThemeCSS(this.previewTheme!);
    this.document.documentElement.classList.add('theme-__preview');
    this.dispatchThemeSwitchEvent();
  }

  /**
   * Checks if the given theme JSON object is a valid theme.
   */
  isThemeValid(data: unknown): boolean {
    const theme = data as Theme;
    return (
      !!data &&
      typeof data === 'object' &&
      'name' in data &&
      'schemes' in data &&
      typeof theme.name === 'string' &&
      typeof theme.schemes === 'object' &&
      this.isThemeTypeValid(theme, 'light') &&
      this.isThemeTypeValid(theme, 'dark')
    );
  }

  private isThemeTypeValid(theme: Theme, type: 'light' | 'dark'): boolean {
    return (
      !(type in theme.schemes) ||
      (typeof theme.schemes[type] === 'object' &&
        Object.values(theme.schemes[type] as ThemeColorScheme).every(
          item => typeof item === 'string'
        ) &&
        Object.keys(theme.schemes[type] as ThemeColorScheme).every(
          item => typeof item === 'string'
        ))
    );
  }

  private applyThemeStyle(theme?: Theme, type?: ThemeType, overwrite?: boolean): void {
    if (!this.isBrowser) {
      return;
    }
    this.resetPreview();

    if (theme && theme.name !== ELEMENT_THEME_NAME && (overwrite || !this.hasThemeCSS(theme))) {
      this.createThemeCSS(theme);
    }
    this.activateTheme(theme);

    if (type && type !== this._resolvedColorScheme) {
      this.applyThemeType(type);
    }

    this.themeIcons.set(
      Object.fromEntries(
        Object.entries(theme?.icons ?? {}).map(([key, icon]) => [key, this.parseDataSvgIcon(icon)])
      )
    );
    this.themeChange.emit(theme);
  }

  private activateTheme(theme?: Theme): void {
    const classList = this.document.documentElement.classList;
    classList.forEach(c => {
      if (c.startsWith('theme-')) {
        classList.remove(c);
      }
    });
    if (theme) {
      classList.add(`theme-${theme.name}`);
    }
  }

  private hasThemeCSS(theme: Theme): boolean {
    const id = `__theme-${theme.name}`;
    return !!this.document.getElementById(id);
  }

  private createThemeCSS(theme: Theme): void {
    let css = '';
    const themeSelector = `:root.theme-${theme.name}`;
    if (theme.schemes.light) {
      css = this.createThemeVariantCSS(css, themeSelector, theme.schemes.light);
    }
    if (theme.schemes.dark) {
      css = this.createThemeVariantCSS(css, themeSelector + '.app--dark', theme.schemes.dark);
    }

    this.removeThemeCSS(theme.name);
    const cssElement = this.document.createElement('style');
    cssElement.id = `__theme-${theme.name}`;
    cssElement.textContent = css;

    this.document.body.appendChild(cssElement);
  }

  private createThemeVariantCSS(css: string, selector: string, scheme: ThemeColorScheme): string {
    css += `${selector} {\n`;
    for (const key of Object.keys(scheme)) {
      css += `${key}: ${scheme[key]};\n`;
    }
    css += '}\n';
    return css;
  }

  private removeThemeCSS(name: string): void {
    const id = `__theme-${name}`;
    this.document.getElementById(id)?.remove();
    this.document.documentElement.classList.remove(`theme-${name}`);
  }

  private toggleDark(dark: boolean): void {
    if (!this.isBrowser) {
      return;
    }

    this.document.documentElement.classList.toggle('app--dark', dark);
    const colorScheme = dark ? 'dark' : 'light';
    this.meta.updateTag({ name: 'color-scheme', content: colorScheme });
    this.resolvedColorSchemeSub.next(colorScheme);
    this.dispatchThemeSwitchEvent();
  }

  private cloneTheme(theme: Theme): Theme {
    const clone: Theme = { ...theme, schemes: {} };
    if (theme.schemes.light) {
      clone.schemes.light = { ...theme.schemes.light };
    }
    if (theme.schemes.dark) {
      clone.schemes.dark = { ...theme.schemes.dark };
    }
    return clone;
  }

  private dispatchThemeSwitchEvent(): void {
    window.dispatchEvent(
      new CustomEvent('theme-switch', {
        detail: {
          dark: this._resolvedColorScheme === 'dark',
          colorScheme: this._resolvedColorScheme
        }
      })
    );
  }

  private parseDataSvgIcon(icon: string): SafeHtml {
    // This method is currently a copy of parseDataSvgIcon in si-icon.registry.ts.
    // Those are likely to diverge in the future, as this version will get support for other formats like:
    // - URLs
    // - Plain SVG data
    // - Promises to enable lazy icon loading using import()
    const parsed = /^data:image\/svg\+xml;utf8,(.*)$/.exec(icon);
    if (!parsed) {
      console.error('Failed to parse icon', icon);
      return '';
    }
    return this.domSanitizer.bypassSecurityTrustHtml(parsed[1]);
  }
}
