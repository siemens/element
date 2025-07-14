/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
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

    it('should initially have no active theme', (done: DoneFn) => {
      store.loadActiveTheme().subscribe(theme => {
        expect(theme).toBeUndefined();
        done();
      });
    });

    it('should initially have no active theme', (done: DoneFn) => {
      store.loadThemeNames().subscribe(names => {
        expect(names).toBeDefined();
        expect(names.length).toBe(0);
        done();
      });
    });

    it('should return undefined for a name that does not exist', (done: DoneFn) => {
      store.loadTheme('example').subscribe(theme => {
        expect(theme).toBeUndefined();
        done();
      });
    });

    it('should save theme to local storage', (done: DoneFn) => {
      const theme: Theme = { name: 'test', schemes: {} };
      store.saveTheme(theme).subscribe(result => {
        expect(result).toBeTrue();
        const stored = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
        expect(stored).toBeDefined();
        expect(stored?.indexOf('test')).toBeGreaterThan(0);
        done();
      });
    });

    it('should load theme from local storage', (done: DoneFn) => {
      const theme: Theme = { name: 'test', schemes: {} };
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: { 'test': theme }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.loadTheme('test').subscribe(loadedTheme => {
        expect(loadedTheme).toBeDefined();
        expect(loadedTheme?.name).toBe(theme.name);
        done();
      });
    });

    it('should delete active theme from local storage', (done: DoneFn) => {
      const theme: Theme = { name: 'test', schemes: {} };
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': theme }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.deleteTheme('test').subscribe(result => {
        expect(result).toBeTrue();
        const stored = localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY);
        expect(stored).toBeDefined();
        expect(stored?.indexOf('test')).toBeLessThan(0);
        done();
      });
    });

    it('should active existing theme', (done: DoneFn) => {
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.activateTheme('test').subscribe(result => {
        expect(result).toBeTrue();
        const storage2 = JSON.parse(
          localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
        ) as ThemeStorage;
        expect(storage2).toBeDefined();
        expect(storage2.activeTheme).toBe('test');
        done();
      });
    });

    it('should deactive existing theme', (done: DoneFn) => {
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.deactivateTheme().subscribe(result => {
        expect(result).toBeTrue();
        const storage2 = JSON.parse(
          localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
        ) as ThemeStorage;
        expect(storage2).toBeDefined();
        expect(storage2.activeTheme).toBe(undefined);
        done();
      });
    });

    it('should load active theme', (done: DoneFn) => {
      const storage: ThemeStorage = {
        activeTheme: 'test',
        themes: { 'test': { name: 'test', schemes: {} } }
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.loadActiveTheme().subscribe(theme => {
        expect(theme).toBeDefined();
        expect(theme?.name).toBe('test');
        done();
      });
    });

    it('should not be able to active none existing theme', (done: DoneFn) => {
      const storage: ThemeStorage = {
        activeTheme: undefined,
        themes: {}
      };
      localStorage.setItem(SI_THEME_LOCAL_STORAGE_KEY, JSON.stringify(storage));

      store.activateTheme('test').subscribe(result => {
        expect(result).toBeFalse();
        const storage2 = JSON.parse(
          localStorage.getItem(SI_THEME_LOCAL_STORAGE_KEY)!
        ) as ThemeStorage;
        expect(storage2).toBeDefined();
        expect(storage2.activeTheme).toBeUndefined();
        done();
      });
    });
  });

  describe('in node environment', () => {
    beforeEach(() => {
      store = new SiDefaultThemeStore(false);
    });

    it('loadActiveTheme shall return undefined', (done: DoneFn) => {
      store.loadActiveTheme().subscribe(theme => {
        expect(theme).toBeUndefined();
        done();
      });
    });

    it('activateTheme on node shall return false', (done: DoneFn) => {
      store.activateTheme('any').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('deactivateTheme on node shall return false', (done: DoneFn) => {
      store.deactivateTheme().subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('loadThemeNames on node shall return []', (done: DoneFn) => {
      store.loadThemeNames().subscribe(result => {
        expect(result).toBeDefined();
        expect(result.length).toBe(0);
        done();
      });
    });

    it('saveTheme on node shall return false', (done: DoneFn) => {
      store.saveTheme({ name: 'test', schemes: {} }).subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('loadTheme on node shall return undefined', (done: DoneFn) => {
      store.loadTheme('any').subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('deleteTheme on node shall return false', (done: DoneFn) => {
      store.deleteTheme('any').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });
  });
});
