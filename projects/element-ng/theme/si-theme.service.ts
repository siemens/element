/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  DOCUMENT,
  computed,
  effect,
  EventEmitter,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
  untracked
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { SI_THEME_DOM_TARGET } from './si-theme-dom-target';
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
    return this.colorScheme() ?? this.initialColorScheme;
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
  readonly themeIcons = signal<Record<string, string>>({});

  private themes: Map<string, Theme> = new Map();
  private breakpointObserver = inject(BreakpointObserver);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly activeTheme = signal<{ theme?: Theme; overwrite?: boolean }>({});
  private readonly previewTheme = signal<Theme | undefined>(undefined);

  private themeStore =
    inject(SiThemeStore, { optional: true }) ?? new SiDefaultThemeStore(this.isBrowser);
  private document = inject(DOCUMENT);
  private themeTarget = inject(SI_THEME_DOM_TARGET);
  private readonly initialColorScheme = this.themeTarget.element.classList.contains('app--dark')
    ? 'dark'
    : 'light';
  private readonly themeType = signal<ThemeType | undefined>(undefined);
  private readonly prefersDark = toSignal(
    toObservable(this.themeType).pipe(
      switchMap(type =>
        type === 'auto' && this.isBrowser
          ? this.breakpointObserver
              .observe('(prefers-color-scheme: dark)')
              .pipe(map(state => state.matches))
          : of(undefined)
      )
    )
  );
  private readonly colorScheme = computed(() => {
    const type = this.themeType();
    if (type !== 'auto') {
      return type;
    }
    const prefersDark = this.prefersDark();
    return prefersDark === undefined ? undefined : prefersDark ? 'dark' : 'light';
  });
  private destroyRef = inject(DestroyRef);
  private themeStyles = new Set<HTMLStyleElement>();

  constructor() {
    this.themeNames$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(names => (this._themeNames = names));

    // Cached theme styles outlive individual effect runs, but never the service.
    this.destroyRef.onDestroy(() => this.themeStyles.forEach(style => style.remove()));

    effect(onCleanup => {
      const { theme, overwrite } = this.activeTheme();
      if (!this.isBrowser) {
        return;
      }
      if (theme) {
        if (theme.name !== ELEMENT_THEME_NAME && (overwrite || !this.hasThemeCSS(theme))) {
          this.createThemeCSS(theme);
        }
        onCleanup(this.applyClass(`theme-${theme.name}`));
      }
      untracked(() => this.themeChange.emit(theme));
    });

    effect(onCleanup => {
      const preview = this.previewTheme();
      if (!this.isBrowser || !preview) {
        return;
      }
      const style = this.createThemeCSS(preview);
      const restoreClass = this.applyClass('theme-__preview');
      onCleanup(() => {
        restoreClass();
        style.remove();
        this.themeStyles.delete(style);
      });
      untracked(() => this.dispatchThemeSwitchEvent());
    });

    effect(onCleanup => {
      const scheme = this.colorScheme();
      if (!this.isBrowser || !scheme) {
        return;
      }
      const restoreClass = this.applyClass('app--dark', scheme === 'dark');
      const restoreColorScheme = this.themeTarget.updateColorScheme(scheme);
      onCleanup(() => {
        restoreClass();
        restoreColorScheme?.();
      });
      untracked(() => {
        this.resolvedColorSchemeSub.next(scheme);
        this.dispatchThemeSwitchEvent();
      });
    });

    this.getActiveTheme()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: theme => this.applyThemeStyle(theme),
        error: error => console.error('Cannot load active theme', error)
      });

    this.themeStore
      .loadThemeNames()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
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
          this.applyTheme(theme);
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

    this.themeStore
      .saveTheme(theme)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
      if (this.activeTheme().theme?.name === name) {
        this.activeTheme.set({});
      }
      this.themeStore
        .deleteTheme(name)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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
    this.previewTheme.set(undefined);
  }

  /**
   * Sets the active theme to the given name. If no name is given, the default element theme is used.
   */
  setActiveTheme(name?: string, type?: ThemeType): Observable<boolean> {
    const theType = type ?? this.resolvedColorScheme ?? 'auto';
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
        take(1),
        takeUntilDestroyed(this.destroyRef)
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
   * Apply `light` or `dark` theme to the configured theme target.
   * DOM changes are applied during Angular's next synchronization.
   */
  applyThemeType(type: ThemeType): void {
    if (!this.isBrowser || type === (this.themeType() ?? this.initialColorScheme)) {
      return;
    }
    this.themeType.set(type);
  }

  /**
   * Applies the given theme to the configured theme target. If no theme is given, the active theme is applied.
   * DOM changes are applied during Angular's next synchronization.
   */
  applyTheme(theme?: Theme, type?: ThemeType, overwrite?: boolean): void {
    if (theme) {
      this.applyThemeStyle(theme, type, overwrite);
    } else {
      this.getActiveTheme()
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
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
    this.previewTheme.update(preview => ({
      name: '__preview',
      schemes: {
        ...preview?.schemes,
        [type]: { ...preview?.schemes[type], [name]: value }
      }
    }));
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

    this.activeTheme.set({ theme, overwrite });

    if (type) {
      this.applyThemeType(type);
    }

    this.themeIcons.set(
      Object.fromEntries(Object.entries(theme?.icons ?? {}).map(([key, icon]) => [key, icon]))
    );
  }

  private hasThemeCSS(theme: Theme): boolean {
    const id = `__theme-${theme.name}`;
    return !!this.themeTarget.getStyleElement(id);
  }

  private createThemeCSS(theme: Theme): HTMLStyleElement {
    let css = '';
    const themeSelector = this.createThemeSelector(theme.name);
    if (theme.schemes.light) {
      css = this.createThemeVariantCSS(css, themeSelector, theme.schemes.light);
    }
    if (theme.schemes.dark) {
      css = this.createThemeVariantCSS(
        css,
        this.createThemeSelector(theme.name, true),
        theme.schemes.dark
      );
    }

    this.removeThemeCSS(theme.name);
    const cssElement = this.document.createElement('style');
    cssElement.id = `__theme-${theme.name}`;
    cssElement.textContent = css;

    this.themeTarget.appendStyleElement(cssElement);
    this.themeStyles.add(cssElement);
    return cssElement;
  }

  private createThemeSelector(name: string, dark: boolean = false): string {
    const classes = `.theme-${name}${dark ? '.app--dark' : ''}`;
    return this.themeTarget.rootSelector === ':host'
      ? `:host(${classes})`
      : `${this.themeTarget.rootSelector}${classes}`;
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
    const style = this.themeTarget.getStyleElement(id);
    style?.remove();
    if (style) {
      this.themeStyles.delete(style);
    }
  }

  private applyClass(className: string, present = true): () => void {
    const previousClasses = new Map<HTMLElement, boolean>();
    this.themeTarget.forEachElement(element => {
      previousClasses.set(element, element.classList.contains(className));
      element.classList.toggle(className, present);
    });
    return () => {
      previousClasses.forEach((wasPresent, element) => {
        element.classList.toggle(className, wasPresent);
      });
    };
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
          dark: this.resolvedColorScheme === 'dark',
          colorScheme: this.resolvedColorScheme
        }
      })
    );
  }
}
