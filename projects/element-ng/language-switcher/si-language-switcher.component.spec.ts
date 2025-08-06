/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SiTranslateNgxTModule } from '@spike-rabbit/element-translate-ng/ngx-translate';

import { IsoLanguageValue, SiLanguageSwitcherComponent } from './index';

@Component({
  imports: [SiLanguageSwitcherComponent, SiTranslateNgxTModule],
  template: `<si-language-switcher
    [translationKey]="translationKey"
    [languageSwitcherLabel]="languageSwitcherLabel"
    [availableLanguages]="availableLanguages"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  availableLanguages: string[] | IsoLanguageValue[] = [
    { value: 'en', name: 'English' },
    { value: 'de', name: 'Deutsch' }
  ];
  languageSwitcherLabel = 'language switcher';
  translationKey = 'LANGUAGE';
}
describe('SiLanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let ngxTranslate: TranslateService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiTranslateNgxTModule, TranslateModule.forRoot(), TestHostComponent]
    })
  );

  beforeEach(() => {
    ngxTranslate = TestBed.inject(TranslateService);
    ngxTranslate.addLangs(['en', 'de']);
    ngxTranslate.use('en');

    ngxTranslate.setTranslation('en', {
      LANGUAGE: {
        EN: 'English',
        DE: 'Deutsch'
      }
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.languageSwitcherLabel = 'language switcher';
  });

  const languageOptions = (): string[] => {
    const options = [].slice.call(fixture.nativeElement.querySelectorAll('select option'));
    return options.map(option => (option as any).textContent.trim());
  };

  it('shows all available languages as options', () => {
    fixture.detectChanges();
    expect(languageOptions()).toEqual(['English', 'Deutsch']);
  });

  it('changes the language when selecting an option', () => {
    fixture.detectChanges();
    expect(ngxTranslate.currentLang).toBe('en');

    const select = fixture.nativeElement.querySelector('select');
    select.options[1].selected = true;
    select.dispatchEvent(new Event('change'));

    expect(ngxTranslate.currentLang).toBe('de');
  });

  it('uses the provided available languages', () => {
    component.availableLanguages = ['de', 'fr'];
    fixture.detectChanges();

    expect(languageOptions()).toEqual(['Deutsch', 'LANGUAGE.FR']);
  });

  it('uses the provided translation key', () => {
    component.translationKey = 'MY.APP';
    fixture.detectChanges();

    expect(languageOptions()).toEqual(['English', 'Deutsch']);
  });

  it('accepts IsoLanguageValues as well as strings', () => {
    component.availableLanguages = [
      { value: 'en', name: 'English' },
      { value: 'de', name: 'Deutsch' }
    ];
    fixture.detectChanges();

    expect(languageOptions()).toEqual(['English', 'Deutsch']);
  });

  describe('when no translation key is provided', () => {
    beforeEach(() => {
      component.translationKey = '';
      component.availableLanguages = ['English', 'Deutsch', 'Français'];
    });

    it('shows available languages without translation key', () => {
      fixture.detectChanges();
      expect(languageOptions()).toEqual(['English', 'Deutsch', 'Français']);
    });

    it('does not trigger translation on language change', () => {
      fixture.detectChanges();
      expect(ngxTranslate.currentLang).toBe('en');

      const select = fixture.nativeElement.querySelector('select');
      select.options[1].selected = true;
      select.dispatchEvent(new Event('change'));

      expect(ngxTranslate.currentLang).toBe('en');
    });
  });
});
