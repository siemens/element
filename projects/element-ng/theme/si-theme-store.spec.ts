/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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
      store.loadActiveTheme().subscribe(theme => {
        expect(theme).toBeUndefined();
      });
    });

    it('should initially have no active theme', async () => {
      store.loadThemeNames().subscribe(names => {
        expect(names).toBeDefined();
        expect(names.length).toBe(0);
      });
    });

    it('should return undefined for a name that does not exist', async () => {
      store.loadTheme('example').subscribe(theme => {
        expect(theme).toBeUndefined();
      });
    });

    it('should save theme to local storage', async () => {
      const theme: Theme = { name: 'test', schemes: {} };
      store.saveTheme(theme).subscribe(result => {
        expect(result).toBe(true);
        const stored = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
        expect(stored).toBeDefined();
        expect(stored?.indexOf('test')).toBeGreaterThan(0);
      });
    });

    it('should load theme from local storage', async () => {
      const theme: Theme = { name: 'test', schemes: {} };
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: { 'test': theme }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.loadTheme('test').subscribe(loadedTheme => {
        expect(loadedTheme).toBeDefined();
        expect(loadedTheme?.name).toBe(theme.name);
      });
    });

    it('should delete active theme from local storage', async () => {
      const theme: Theme = { name: 'test', schemes: {} };
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': theme }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.deleteTheme('test').subscribe(result => {
        expect(result).toBe(true);
        const stored = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
        expect(stored).toBeDefined();
        expect(stored?.indexOf('test')).toBeLessThan(0);
      });
    });

    it('should active existing theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.activateTheme('test').subscribe(result => {
        expect(result).toBe(true);
        const storage2 = JSON.parse(
          localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
        ) as ThemeStorage;
        expect(storage2).toBeDefined();
        expect(storage2.activeTheme).toBe('test');
      });
    });

    it('should deactive existing theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.deactivateTheme().subscribe(result => {
        expect(result).toBe(true);
        const storage2 = JSON.parse(
          localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
        ) as ThemeStorage;
        expect(storage2).toBeDefined();
        expect(storage2.activeTheme).toBe(undefined);
      });
    });

    it('should load active theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.loadActiveTheme().subscribe(theme => {
        expect(theme).toBeDefined();
        expect(theme?.name).toBe('test');
      });
    });

    it('should not be able to active none existing theme', async () => {
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: {}
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.activateTheme('test').subscribe(result => {
        expect(result).toBe(false);
        const storage2 = JSON.parse(
          localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
        ) as ThemeStorage;
        expect(storage2).toBeDefined();
        expect(storage2.activeTheme).toBeUndefined();
      });
    });
  });

  describe('in node environment', () => {
    beforeEach(() => {
      store = new SiDefaultThemeStore(false);
    });

    it('loadActiveTheme shall return undefined', async () => {
      store.loadActiveTheme().subscribe(theme => {
        expect(theme).toBeUndefined();
      });
    });

    it('activateTheme on node shall return false', async () => {
      store.activateTheme('any').subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('deactivateTheme on node shall return false', async () => {
      store.deactivateTheme().subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('loadThemeNames on node shall return []', async () => {
      store.loadThemeNames().subscribe(result => {
        expect(result).toBeDefined();
        expect(result.length).toBe(0);
      });
    });

    it('saveTheme on node shall return false', async () => {
      store.saveTheme({ name: 'test', schemes: {} }).subscribe(result => {
        expect(result).toBe(false);
      });
    });

    it('loadTheme on node shall return undefined', async () => {
      store.loadTheme('any').subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('deleteTheme on node shall return false', async () => {
      store.deleteTheme('any').subscribe(result => {
        expect(result).toBe(false);
      });
    });
  });
});
