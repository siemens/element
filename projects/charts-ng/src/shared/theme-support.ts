/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { themeElement } from '../shared/themes/element';

export const themeSupport = {
  _defaultTheme: themeElement,
  _themes: {} as { [key: string]: any },

  registerTheme(theme: any) {
    if (theme.name) {
      this._themes[theme.name] = theme;
    }
  },

  getThemeNames() {
    return Object.keys(this._themes);
  },

  getThemeByName(name: string) {
    return this._themes[name];
  },

  setDefault(theme: any) {
    this._defaultTheme = theme;
  },

  getDefault(): any {
    return this._defaultTheme;
  }
};
