/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ElementRef, inject } from '@angular/core';
import { SiThemeDomTarget } from '@siemens/element-ng/theme';

export const createShadowRootThemeTarget = (): SiThemeDomTarget => {
  const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const elements = new Set([element]);
  const getShadowRoot = (): ShadowRoot => {
    if (!element.shadowRoot) {
      throw new Error(
        'createShadowRootThemeTarget requires a component with Shadow DOM encapsulation.'
      );
    }
    return element.shadowRoot;
  };

  return {
    element,
    rootSelector: ':host',
    forEachElement: callback => elements.forEach(callback),
    registerElement: registeredElement => {
      elements.add(registeredElement);
      registeredElement.classList.toggle('app--dark', element.classList.contains('app--dark'));
      element.classList.forEach(className => {
        if (className.startsWith('theme-')) {
          registeredElement.classList.add(className);
        }
      });
      registeredElement.style.colorScheme = element.style.colorScheme;
      return () => elements.delete(registeredElement);
    },
    getStyleElement: id => getShadowRoot().getElementById(id) as HTMLStyleElement | null,
    appendStyleElement: style => getShadowRoot().append(style),
    updateColorScheme: colorScheme =>
      elements.forEach(themeElement => themeElement.style.setProperty('color-scheme', colorScheme))
  };
};
