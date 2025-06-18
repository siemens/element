/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { SI_LOCALE_LOCAL_STORAGE_KEY, SiDefaultLocaleStore } from './si-locale-store';

describe('SiDefaultLocaleStore', () => {
  afterEach(() => {
    localStorage.removeItem(SI_LOCALE_LOCAL_STORAGE_KEY);
  });

  it('should initially return undefined locale', () => {
    const store = new SiDefaultLocaleStore(true);
    expect(store.locale).toBeUndefined();
  });

  it('should return a saved locale', (done: DoneFn) => {
    const store = new SiDefaultLocaleStore(true);
    store.saveLocale('en').subscribe((saveSucceed: boolean) => {
      expect(saveSucceed).toBeTrue();
      const store2 = new SiDefaultLocaleStore(true);
      expect(store2.locale).toBe('en');
      done();
    });
  });
});
