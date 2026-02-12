/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { firstValueFrom } from 'rxjs';

import {
  SI_THEME_LOCAL_STORAGE_KEY,
  SiDefaultThemeStore,
  SiThemeStore,
  ThemeStorage
} from './si-theme-store';
import { Theme } from './si-theme.model';

describe('SiDefaultThemeStore', () => {
  let store: SiThemeStore;

  afterEach(() => {
    localStorage.removeItem(SI_THEME_LOCAL_STORAGE_KEY);
  });

  describe('in browser environment', () => {
    beforeEach(() => {
      store = new SiDefaultThemeStore(true);
    });

    it('should initially have no active theme', async () => {
      const theme = await firstValueFrom(store.loadActiveTheme());
      expect(theme).toBeUndefined();
    });

    it('should initially have no theme names', async () => {
      const names = await firstValueFrom(store.loadThemeNames());
      expect(names).toBeDefined();
      expect(names.length).toBe(0);
    });

    it('should return undefined for a name that does not exist', async () => {
      const theme = await firstValueFrom(store.loadTheme('example'));
      expect(theme).toBeUndefined();
    });

    it('should save theme to local storage', async () => {
      const theme: Theme = { name: 'test', schemes: {} };
      const result = await firstValueFrom(store.saveTheme(theme));
      expect(result).toBeTrue();
      const stored = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
      expect(stored).toBeDefined();
      expect(stored?.indexOf('test')).toBeGreaterThan(0);
    });

    it('should load theme from local storage', async () => {
      const theme: Theme = { name: 'test', schemes: {} };
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: { 'test': theme }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      const loadedTheme = await firstValueFrom(store.loadTheme('test'));
      expect(loadedTheme).toBeDefined();
      expect(loadedTheme?.name).toBe(theme.name);
    });

    it('should delete active theme from local storage', async () => {
      const theme: Theme = { name: 'test', schemes: {} };
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': theme }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      const result = await firstValueFrom(store.deleteTheme('test'));
      expect(result).toBeTrue();
      const stored = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
      expect(stored).toBeDefined();
      expect(stored?.indexOf('test')).toBeLessThan(0);
    });

    it('should active existing theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      const result = await firstValueFrom(store.activateTheme('test'));
      expect(result).toBeTrue();
      const storage2 = JSON.parse(
        localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
      ) as ThemeStorage;
      expect(storage2).toBeDefined();
      expect(storage2.activeTheme).toBe('test');
    });

    it('should deactive existing theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      const result = await firstValueFrom(store.deactivateTheme());
      expect(result).toBeTrue();
      const storage2 = JSON.parse(
        localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
      ) as ThemeStorage;
      expect(storage2).toBeDefined();
      expect(storage2.activeTheme).toBe(undefined);
    });

    it('should load active theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      const theme = await firstValueFrom(store.loadActiveTheme());
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('test');
    });

    it('should not be able to active none existing theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: {}
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      const result = await firstValueFrom(store.activateTheme('test'));
      expect(result).toBeFalse();
      const storage2 = JSON.parse(
        localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
      ) as ThemeStorage;
      expect(storage2).toBeDefined();
      expect(storage2.activeTheme).toBeUndefined();
    });
  });

  describe('in node environment', () => {
    beforeEach(() => {
      store = new SiDefaultThemeStore(false);
    });

    it('loadActiveTheme shall return undefined', async () => {
      const theme = await firstValueFrom(store.loadActiveTheme());
      expect(theme).toBeUndefined();
    });

    it('activateTheme on node shall return false', async () => {
      const result = await firstValueFrom(store.activateTheme('any'));
      expect(result).toBeFalse();
    });

    it('deactivateTheme on node shall return false', async () => {
      const result = await firstValueFrom(store.deactivateTheme());
      expect(result).toBeFalse();
    });

    it('loadThemeNames on node shall return []', async () => {
      const result = await firstValueFrom(store.loadThemeNames());
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('saveTheme on node shall return false', async () => {
      const result = await firstValueFrom(store.saveTheme({ name: 'test', schemes: {} }));
      expect(result).toBeFalse();
    });

    it('loadTheme on node shall return undefined', async () => {
      const result = await firstValueFrom(store.loadTheme('any'));
      expect(result).toBeUndefined();
    });

    it('deleteTheme on node shall return false', async () => {
      const result = await firstValueFrom(store.deleteTheme('any'));
      expect(result).toBeFalse();
    });
  });
});
