/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DestroyRef, inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SiThemeService } from '@spike-rabbit/element-ng/theme';

interface RegisteredIcon {
  content: SafeHtml | undefined;
  // Count how often an icon was registered to only remove it if it is no longer in use.
  referenceCount: number;
}

const parseDataSvgIcon = (icon: string, domSanitizer: DomSanitizer): SafeHtml => {
  const parsed = /^data:image\/svg\+xml;utf8,(.*)$/.exec(icon);
  if (!parsed) {
    console.error('Failed to parse icon', icon);
    return '';
  }
  return domSanitizer.bypassSecurityTrustHtml(parsed[1]);
};

const registeredIcons = new Map<string, RegisteredIcon>();

/**
 * Adds the provided icons.
 * It requires an Angular InjectionContent.
 * The Icons are available until the component is destroyed.
 * Call this function only in the component which actually uses the icon.
 * Importing all icons on the global level is discouraged.
 *
 * When using a string instead of the object to use an icon,
 * use the kebab-case version of the icon name.
 *
 * @example
 * ```ts
 * import { elementIcon } from '@simpl/element-icons/ionic';
 * import { addIcons } from '@spike-rabbit/element-ng/icon'
 *
 * @Component({`<si-icon-next [icon]="icons.elementIcon"`})
 * class MyComponent {
 *   icons = addIcons({ elementIcon })
 * }
 * ```
 */
export const addIcons = <T extends string>(icons: Record<T, string>): Record<T, string> => {
  const iconMap = {} as Record<T, string>;
  const domSanitizer = inject(DomSanitizer);
  for (const [key, rawContent] of Object.entries<string>(icons)) {
    const registeredIcon = registeredIcons.get(key) ?? {
      content: parseDataSvgIcon(rawContent, domSanitizer),
      referenceCount: 0
    };
    registeredIcon.referenceCount++;
    registeredIcons.set(key, registeredIcon);
    iconMap[key as T] = key;
  }

  // Delete registered Icons after Component is destroyed to optimize memory usage.
  // WeakMap must not be used, as the Icon can only be removed on component destruction.
  // When using a WeakMap it would also get destroyed if it is not referenced, but the component may use it later again.
  inject(DestroyRef).onDestroy(() => {
    for (const key of Object.keys(icons)) {
      const registeredIcon = registeredIcons.get(key);
      if (registeredIcon!.referenceCount === 1) {
        registeredIcons.delete(key);
      } else {
        registeredIcon!.referenceCount--;
      }
    }
  });

  return iconMap;
};

const getIcon = (key: string): SafeHtml | undefined => registeredIcons.get(key)?.content;

@Injectable({ providedIn: 'root' })
export class IconService {
  private themeService = inject(SiThemeService);

  getIcon(name: string): SafeHtml | undefined {
    const camelCaseName = this.kebabToCamelCase(name);
    return this.themeService.themeIcons()[camelCaseName] ?? getIcon(camelCaseName);
  }

  private kebabToCamelCase(str: string): string {
    return str.replace(/-./g, match => match.charAt(1).toUpperCase());
  }
}
