/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ApplicationRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  SiShadowRootDirective,
  provideShadowRootThemeTarget
} from '@siemens/element-ng/shadow-root';
import { BehaviorSubject, firstValueFrom, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { type Mock } from 'vitest';

import { SI_THEME_LOCAL_STORAGE_KEY, SiThemeStore } from './si-theme-store';
import { ELEMENT_THEME_NAME, Theme } from './si-theme.model';
import { SiThemeService as TestService } from './si-theme.service';

describe('SiThemeService', () => {
  @Component({
    selector: 'si-test-shadow-theme-host',
    template: '',
    providers: [provideShadowRootThemeTarget()],
    encapsulation: ViewEncapsulation.ShadowDom,
    hostDirectives: [SiShadowRootDirective]
  })
  class ShadowThemeHostComponent {
    readonly themeService = inject(TestService);
  }

  let service: TestService;
  let mediaQuery: BehaviorSubject<BreakpointState>;
  const breakpointObserver = { observe: vi.fn(() => mediaQuery.asObservable()) };
  let themeSwitchSpy: Mock;

  const setupTestBed = (prefersDarkColor: boolean = false, store?: Partial<SiThemeStore>): void => {
    document.documentElement.classList.remove('app--dark');
    mediaQuery = new BehaviorSubject<BreakpointState>({
      matches: prefersDarkColor,
      breakpoints: { '(prefers-color-scheme: dark)': prefersDarkColor }
    });
    TestBed.configureTestingModule({
      providers: [
        TestService,
        { provide: SiThemeStore, useValue: store },
        { provide: BreakpointObserver, useValue: breakpointObserver }
      ]
    });
    service = TestBed.inject(TestService);
    service.resolvedColorScheme$.subscribe(themeSwitchSpy);
  };

  // Restore shared DOM state until all theme state is owned by effects.
  aroundEach(async runTest => {
    const rootClassName = document.documentElement.className;
    try {
      await runTest();
    } finally {
      TestBed.resetTestingModule();
      document.documentElement.className = rootClassName;
      document.querySelectorAll('style[id^="__theme-"]').forEach(style => style.remove());
    }
  });

  beforeEach(() => (themeSwitchSpy = vi.fn()));
  afterEach(() => localStorage.removeItem(SI_THEME_LOCAL_STORAGE_KEY));

  describe('on destruction', () => {
    it('should unsubscribe from automatic color-scheme changes', async () => {
      setupTestBed(true);
      service.applyThemeType('auto');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(breakpointObserver.observe).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mediaQuery.observed).toBe(true);
      expect(document.documentElement.classList).toContain('app--dark');

      TestBed.resetTestingModule();

      expect(mediaQuery.observed).toBe(false);
      mediaQuery.next({ matches: false, breakpoints: { '(prefers-color-scheme: dark)': false } });
      expect(document.documentElement.classList).toContain('app--dark');
    });
  });

  describe('with theme type auto', () => {
    it('should set theme to `light` if preferred', async () => {
      setupTestBed();
      service.applyThemeType('auto');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('light');
    });

    it('should set theme to `dark` if preferred', async () => {
      setupTestBed(true);
      service.applyThemeType('auto');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('dark');
    });

    it('should react to changes in the preferred color scheme', async () => {
      setupTestBed();
      service.applyThemeType('auto');
      await TestBed.inject(ApplicationRef).whenStable();

      mediaQuery.next({ matches: true, breakpoints: {} });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenLastCalledWith('dark');

      mediaQuery.next({ matches: false, breakpoints: {} });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenLastCalledWith('light');
    });

    it('should stop observing when selecting the currently resolved fixed scheme', async () => {
      setupTestBed(true);
      service.applyThemeType('auto');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).toContain('app--dark');

      service.applyThemeType('dark');
      await TestBed.inject(ApplicationRef).whenStable();
      mediaQuery.next({ matches: false, breakpoints: {} });
      await TestBed.inject(ApplicationRef).whenStable();

      expect(mediaQuery.observed).toBe(false);
      expect(document.documentElement.classList).toContain('app--dark');
    });
  });

  describe('with fixed theme type values', () => {
    beforeEach(() => setupTestBed());

    it('should leave the initial color-scheme metadata untouched', async () => {
      const previousTag = document.querySelector('meta[name="color-scheme"]')?.outerHTML;

      await TestBed.inject(ApplicationRef).whenStable();

      expect(document.querySelector('meta[name="color-scheme"]')?.outerHTML).toBe(previousTag);
      expect(service.resolvedColorScheme).toBe('light');
      expect(themeSwitchSpy).not.toHaveBeenCalled();
    });

    it('should not set `app--dark` class on `light` mode', async () => {
      service.applyThemeType('light');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).not.toHaveBeenCalled(); // because light is the default
    });

    it('should set `app--dark` class on `dark` mode', async () => {
      service.applyThemeType('dark');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('with a shadow root target', () => {
    it('should leave the shadow host color scheme unchanged when destroyed', async () => {
      setupTestBed();
      const fixture = TestBed.createComponent(ShadowThemeHostComponent);
      const host = fixture.nativeElement as HTMLElement;
      fixture.componentInstance.themeService.applyThemeType('dark');
      await fixture.whenStable();
      expect(host.classList).toContain('app--dark');

      fixture.destroy();

      expect(host.classList).toContain('app--dark');
    });

    it('should apply the color scheme only to the shadow host', async () => {
      setupTestBed();
      const fixture = TestBed.createComponent(ShadowThemeHostComponent);

      fixture.componentInstance.themeService.applyThemeType('dark');
      await fixture.whenStable();

      expect(fixture.nativeElement.classList).toContain('app--dark');
      expect(document.documentElement.classList).not.toContain('app--dark');
    });

    it('should add custom theme styles to the shadow root with host selectors', async () => {
      setupTestBed();
      const fixture = TestBed.createComponent(ShadowThemeHostComponent);
      const theme: Theme = {
        name: 'example',
        schemes: {
          light: { '--element-base-0': '#fff' },
          dark: { '--element-base-0': '#000' }
        }
      };

      fixture.componentInstance.themeService.applyTheme(theme, 'dark', true);
      await fixture.whenStable();

      const style = fixture.nativeElement.shadowRoot.getElementById('__theme-example');
      expect(fixture.nativeElement.classList).toContain('theme-example');
      expect(style.textContent).toContain(':host(.theme-example)');
      expect(style.textContent).toContain(':host(.theme-example.app--dark)');
      expect(document.getElementById('__theme-example')).toBeNull();
    });
  });

  describe('without custom theme', () => {
    let theme: Theme;
    let store: Record<string, Mock>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = {
        loadActiveTheme: vi.fn(() => of(undefined)),
        loadThemeNames: vi.fn(() => of([])),
        saveTheme: vi.fn(() => of(true))
      };
    });

    it('setActiveTheme of unknown theme should return false', async () => {
      setupTestBed();
      const result = await firstValueFrom(service.setActiveTheme('any'));
      expect(result).toBe(false);
    });

    it('should initially return undefined as active theme', async () => {
      setupTestBed();
      const result = await firstValueFrom(service.getActiveTheme());
      expect(result).toBeUndefined();
    });

    it('should use element as initial active theme', async () => {
      setupTestBed();
      expect(service.activeThemeName).toBe(ELEMENT_THEME_NAME);
      expect(service.hasTheme(ELEMENT_THEME_NAME)).toBe(true);
      expect(service.themeNames).toHaveLength(1);
      const result = await firstValueFrom(service.getActiveTheme());
      expect(result).toBeUndefined();
    });

    it('getTheme should return element theme by name', async () => {
      setupTestBed();
      const result = await firstValueFrom(service.getTheme(ELEMENT_THEME_NAME));
      expect(result).toBeUndefined();
    });

    it('getTheme should return undefined for unknown theme name', async () => {
      setupTestBed();
      const result = await firstValueFrom(service.getTheme('any'));
      expect(result).toBeUndefined();
    });

    it('addOrUpdateTheme should saveTheme on store', async () => {
      setupTestBed(false, store);
      const result = await firstValueFrom(service.addOrUpdateTheme(theme));
      expect(result).toBe(true);
      expect(store.saveTheme).toHaveBeenCalledTimes(1);
      expect(store.saveTheme).toHaveBeenCalledWith(theme);
    });

    it('addOrUpdateTheme should return false on storage failure', async () => {
      store.saveTheme.mockImplementation(() => of(false));
      setupTestBed(false, store);
      const ok = await firstValueFrom(service.addOrUpdateTheme(theme));
      expect(ok).toBe(false);
    });

    it('addOrUpdateTheme should return error on storage errors', async () => {
      store.saveTheme.mockImplementation(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      await expect(firstValueFrom(service.addOrUpdateTheme(theme))).rejects.toBe('no network');
    });
  });

  describe('with custom active theme', () => {
    let theme: Theme;
    let store: Record<string, Mock>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = {
        loadActiveTheme: vi.fn(() => of(theme)),
        loadThemeNames: vi.fn(() => of([theme.name])),
        deleteTheme: vi.fn(),
        deactivateTheme: vi.fn(),
        loadTheme: vi.fn(() => of(theme))
      };
    });

    it('getActiveTheme should return other then element', async () => {
      setupTestBed(false, store);
      const result = await firstValueFrom(service.getActiveTheme());
      expect(result).toBeDefined();
      expect(result!.name).toBe('example');
    });

    it('deleteTheme with unknown theme should return false', async () => {
      store.deleteTheme.mockImplementation(() => of(true));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.deleteTheme('any'));
      expect(result).toBe(false);
      expect(store.deleteTheme).not.toHaveBeenCalled();
    });

    it('deleteTheme should call storage deleteTheme', async () => {
      store.deleteTheme.mockImplementation(() => of(true));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.deleteTheme(theme.name));
      expect(result).toBe(true);
      expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
    });

    it('deleteTheme should return false on storage failures', async () => {
      store.deleteTheme.mockImplementation(() => of(false));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.deleteTheme(theme.name));
      expect(result).toBe(false);
      expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
    });

    it('deleteTheme should return error on storage errors', async () => {
      store.deleteTheme.mockImplementation(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      await expect(firstValueFrom(service.deleteTheme(theme.name))).rejects.toBe('no network');
    });

    it('setActiveTheme with element should call deactive theme on storage', async () => {
      store.deactivateTheme.mockImplementation(() => of(true));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.setActiveTheme(ELEMENT_THEME_NAME));
      expect(result).toBe(true);
      expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
    });

    it('setActiveTheme should return false on theme on storage failure', async () => {
      store.deactivateTheme.mockImplementation(() => of(false));
      setupTestBed(false, store);
      expect(service.activeThemeName).toBe('example');
      const result = await firstValueFrom(service.setActiveTheme(ELEMENT_THEME_NAME));
      expect(result).toBe(false);
      expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('with custom inactive theme', () => {
    let theme: Theme;
    let store: Record<string, Mock>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = {
        loadActiveTheme: vi.fn(() => of(undefined)),
        loadThemeNames: vi.fn(() => of([theme.name])),
        activateTheme: vi.fn(() => of(true)),
        loadTheme: vi.fn(() => of(theme))
      };

      setupTestBed(false, store);
    });

    it('getTheme should return cached theme on second call', async () => {
      const result = await firstValueFrom(
        service.getTheme('example').pipe(switchMap(() => service.getTheme('example')))
      );
      expect(result).toBeDefined();
      expect(result!.name).toBe('example');
      expect(store.loadTheme).toHaveBeenCalledTimes(1);
    });

    it('getTheme should load theme from store', async () => {
      const result = await firstValueFrom(service.getTheme('example'));
      expect(result).toBeDefined();
      expect(result!.name).toBe('example');
    });

    it('setActiveTheme should invoke activateTheme on store', async () => {
      const result = await firstValueFrom(service.setActiveTheme(theme.name));
      expect(result).toBe(true);
      expect(store.activateTheme).toHaveBeenCalledTimes(1);
    });

    it('setActiveTheme of current active theme should return true', async () => {
      const result = await firstValueFrom(service.setActiveTheme(ELEMENT_THEME_NAME));
      expect(result).toBe(true);
      expect(store.activateTheme).toHaveBeenCalledTimes(0);
    });
  });
});
