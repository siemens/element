/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from '@angular/core';
import { SiTranslateModule, SiTranslateService } from '@siemens/element-translate-ng/translate';

import { IsoLanguageValue } from './iso-language-value';

@Component({
  selector: 'si-language-switcher',
  templateUrl: './si-language-switcher.component.html',
  styleUrl: './si-language-switcher.component.scss',
  imports: [SiTranslateModule]
})
export class SiLanguageSwitcherComponent {
  /**
   * Key for translation.
   * If the key is set to an empty string, the language of the underlying translation framework will not be switched.
   *
   * @defaultValue 'LANGUAGE'
   */
  readonly translationKey = input('LANGUAGE');
  /**
   * Text for aria label for the language selector. Needed for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_LANGUAGE_SWITCHER.LABEL:Language switcher`
   * ```
   */
  readonly languageSwitcherLabel = input(
    $localize`:@@SI_LANGUAGE_SWITCHER.LABEL:Language switcher`
  );

  /**
   * List of all available languages in this application.
   *
   * @defaultValue null
   */
  readonly availableLanguages = input<(string | IsoLanguageValue)[] | null>(null);

  protected readonly translate = inject(SiTranslateService);

  protected readonly availableIsoLanguages = computed(() => {
    let languages = this.availableLanguages() ?? this.translate.availableLanguages;
    if (typeof languages[0] !== 'object') {
      languages = (languages as string[]).map(languageValue => {
        const translationKey = this.translationKey();
        return {
          value: languageValue,
          name: translationKey ? `${translationKey}.${languageValue.toUpperCase()}` : languageValue
        };
      });
    }
    return languages as IsoLanguageValue[];
  });

  protected switchLanguage(target: EventTarget | null): void {
    const language = (target as HTMLSelectElement)?.value;
    const translationKey = this.translationKey();
    if (!language || !translationKey || translationKey.length === 0) {
      return;
    }
    this.translate.setCurrentLanguage(language);
  }
}
