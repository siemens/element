/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SI_THEME_LOCAL_STORAGE_KEY, SiThemeStore } from './si-theme-store';
import { ELEMENT_THEME_NAME, Theme } from './si-theme.model';
import { SiThemeService as TestService } from './si-theme.service';

describe('SiThemeService', () => {
  let service: TestService;
  let themeSwitchSpy: jasmine.Spy;

  const setupTestBed = (prefersDarkColor: boolean = false, store?: SiThemeStore): void => {
    document.documentElement.classList.remove('app--dark');
    spyOn(window, 'matchMedia').and.callFake(
      () =>
        ({
          matches: prefersDarkColor,
          addEventListener: () => {},
          removeEventListener: () => {}
        }) as any
    );
    TestBed.configureTestingModule({
      providers: [TestService, { provide: SiThemeStore, useValue: store }]
    });
    service = TestBed.inject(TestService);
    service.resolvedColorScheme$.subscribe(themeSwitchSpy);
  };

  beforeEach(() => (themeSwitchSpy = jasmine.createSpy()));
  afterEach(() => localStorage.removeItem(SI_THEME_LOCAL_STORAGE_KEY));

  describe('with theme type auto', () => {
    it('should set theme to `light` if preferred', () => {
      setupTestBed();
      service.applyThemeType('auto');
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('light');
    });

    it('should set theme to `dark` if preferred', () => {
      setupTestBed(true);
      service.applyThemeType('auto');
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('with fixed theme type values', () => {
    beforeEach(() => setupTestBed());

    it('should not set `app--dark` class on `light` mode', () => {
      service.applyThemeType('light');
      expect(document.documentElement.classList).not.toContain('app--dark');
      expect(themeSwitchSpy).not.toHaveBeenCalled(); // because light is the default
    });

    it('should set `app--dark` class on `dark` mode', () => {
      service.applyThemeType('dark');
      expect(document.documentElement.classList).toContain('app--dark');
      expect(themeSwitchSpy).toHaveBeenCalledWith('dark');
    });
  });

  describe('without custom theme', () => {
    let theme: Theme;
    let store: jasmine.SpyObj<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = jasmine.createSpyObj('store', ['loadActiveTheme', 'loadThemeNames', 'saveTheme']);
      store.loadActiveTheme.and.callFake(() => of(undefined));
      store.loadThemeNames.and.callFake(() => of([]));
      store.saveTheme.and.callFake(() => of(true));
    });

    it('setActiveTheme of unknown theme should return false', async () => {
      setupTestBed();
      const result = await firstValueFrom(service.setActiveTheme('any'));
      expect(result).toBeFalse();
    });

    it('should initially return undefined as active theme', async () => {
      setupTestBed();
      const result = await firstValueFrom(service.getActiveTheme());
      expect(result).toBeUndefined();
    });

    it('should use element as initial active theme', async () => {
      setupTestBed();
      expect(service.activeThemeName).toBe(ELEMENT_THEME_NAME);
      expect(service.hasTheme(ELEMENT_THEME_NAME)).toBeTrue();
      expect(service.themeNames.length).toBe(1);
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
      expect(result).toBeTrue();
      expect(store.saveTheme).toHaveBeenCalledTimes(1);
      expect(store.saveTheme).toHaveBeenCalledWith(theme);
    });

    it('addOrUpdateTheme should return false on storage failure', async () => {
      store.saveTheme.and.callFake(() => of(false));
      setupTestBed(false, store);
      const ok = await firstValueFrom(service.addOrUpdateTheme(theme));
      expect(ok).toBeFalse();
    });

    it('addOrUpdateTheme should return error on storage errors', async () => {
      store.saveTheme.and.callFake(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      try {
        await firstValueFrom(service.addOrUpdateTheme(theme));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBe('no network');
      }
    });
  });

  describe('with custom active theme', () => {
    let theme: Theme;
    let store: jasmine.SpyObj<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = jasmine.createSpyObj('store', [
        'loadActiveTheme',
        'loadThemeNames',
        'deleteTheme',
        'deactivateTheme',
        'loadTheme'
      ]);
      store.loadActiveTheme.and.callFake(() => of(theme));
      store.loadThemeNames.and.callFake(() => of([theme.name]));
      store.loadTheme.and.callFake(() => of(theme));
    });

    it('getActiveTheme should return other then element', async () => {
      setupTestBed(false, store);
      const result = await firstValueFrom(service.getActiveTheme());
      expect(result).toBeDefined();
      expect(result!.name).toBe('example');
    });

    it('deleteTheme with unknown theme should return false', async () => {
      store.deleteTheme.and.callFake(() => of(true));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.deleteTheme('any'));
      expect(result).toBeFalse();
      expect(store.deleteTheme).not.toHaveBeenCalled();
    });

    it('deleteTheme should call storage deleteTheme', async () => {
      store.deleteTheme.and.callFake(() => of(true));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.deleteTheme(theme.name));
      expect(result).toBeTrue();
      expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
    });

    it('deleteTheme should return false on storage failures', async () => {
      store.deleteTheme.and.callFake(() => of(false));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.deleteTheme(theme.name));
      expect(result).toBeFalse();
      expect(store.deleteTheme).toHaveBeenCalledWith(theme.name);
    });

    it('deleteTheme should return error on storage errors', async () => {
      store.deleteTheme.and.callFake(() => throwError(() => 'no network'));
      setupTestBed(false, store);
      try {
        await firstValueFrom(service.deleteTheme(theme.name));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBe('no network');
      }
    });

    it('setActiveTheme with element should call deactive theme on storage', async () => {
      store.deactivateTheme.and.callFake(() => of(true));
      setupTestBed(false, store);
      const result = await firstValueFrom(service.setActiveTheme(ELEMENT_THEME_NAME));
      expect(result).toBeTrue();
      expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
    });

    it('setActiveTheme should return false on theme on storage failure', async () => {
      store.deactivateTheme.and.callFake(() => of(false));
      setupTestBed(false, store);
      expect(service.activeThemeName).toBe('example');
      const result = await firstValueFrom(service.setActiveTheme(ELEMENT_THEME_NAME));
      expect(result).toBeFalse();
      expect(store.deactivateTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('with custom inactive theme', () => {
    let theme: Theme;
    let store: jasmine.SpyObj<SiThemeStore>;

    beforeEach(() => {
      theme = { name: 'example', schemes: { light: {}, dark: {} } };
      store = jasmine.createSpyObj('store', [
        'loadActiveTheme',
        'loadThemeNames',
        'activateTheme',
        'loadTheme'
      ]);
      store.loadActiveTheme.and.callFake(() => of(undefined));
      store.loadThemeNames.and.callFake(() => of([theme.name]));
      store.activateTheme.and.callFake(() => of(true));
      store.loadTheme.and.callFake(() => of(theme));

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
      expect(result).toBeTrue();
      expect(store.activateTheme).toHaveBeenCalledTimes(1);
    });

    it('setActiveTheme of current active theme should return true', async () => {
      const result = await firstValueFrom(service.setActiveTheme(ELEMENT_THEME_NAME));
      expect(result).toBeTrue();
      expect(store.activateTheme).toHaveBeenCalledTimes(0);
    });
  });
});
