# Localization

Localization or internationalization (i18n) is the process of designing and preparing your app to be usable in different locales around the world.
Localization includes the support for different languages as well as different formats for entities like dates, time, decimals, currency, etc.

This guide covers locale selection and formatting.
For translating Element component text, see [translation](translation.md).

Angular supports localization as described in the [i18n](https://angular.dev/guide/i18n) guide and is supported by [pipes](https://angular.dev/guide/templates/pipes).
Angular applies a compile time localization concept. It does not support the change of locales (language and formats) at runtime. Instead, for each locale
it generates a new web application that supports exactly one locale. It replaces text in the HTML templates with the translations and sets a fixed
[LOCALE_ID](https://angular.dev/guide/i18n/locale-id) which is used by the pipes. Changing locales is realized by changing the web application.

With a runtime translation framework such as [ngx-translate](https://github.com/ngx-translate/core), Element supports a single web application with many languages and formats.
We localize formats by following the angular [pipes](https://angular.dev/guide/templates/pipes) concept and reuse the locale and region definitions
from [Angular common locales](https://github.com/angular/angular/tree/master/packages/common/locales). This is sufficient and standard conform for
most applications. For example, if you want to display a date in a compact format use the date pipe like `{{ date | date:'short' }}`.
You will get the format 'M/d/yy' (6/15/15) for English. If required, applications may extend and specialize the formats and pipes.

The Angular pipes that uses the locale information like the [DatePipe](https://angular.dev/api/common/DatePipe), [CurrencyPipe](https://angular.dev/api/common/CurrencyPipe),
[DecimalPipe](https://angular.dev/api/common/DecimalPipe) and [PercentPipe](https://angular.dev/api/common/PercentPipe) are pure pipes. Pure pipes only re-render when
the inputs changes. This means they do not re-render when the `LOCALE_ID` changes. They load the `LOCALE_ID` only once at load time and caches the value.

We recommend to follow the same behavior as users changes to locales are seldom. As a consequence we need to reload the web application on locale changes.

<si-docs-component example="si-localization/si-localization" height="650"></si-docs-component>

## Locales in Element

Element provides the service `SiLocaleService` to set the current locale like `en`, `fr` or a
variant like `fr-CA` or `en-GB` as well as the available locales of the application. The service is
configured by an injected `SiLocaleConfig` object in the application configuration.

In addition you need to register and initialize the locale packages for Angular. The following shows a
generic example that only loads the selected Angular locale into the applications.

Use explicit imports so the bundler only includes the supported locales.

```ts
import { registerLocaleData } from '@angular/common';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { SI_LOCALE_CONFIG, SiLocaleConfig, SiLocaleId } from '@siemens/element-ng/localization';

const genericLocaleInitializer = async (localeId: string): Promise<void> => {
  switch (localeId) {
    case 'en':
      registerLocaleData((await import('@angular/common/locales/en')).default);
      break;
    case 'de':
      registerLocaleData((await import('@angular/common/locales/de')).default);
      break;
    case 'fr':
      registerLocaleData((await import('@angular/common/locales/fr')).default);
      break;
    default:
      throw new Error('Unsupported locale: ' + localeId);
  }
};

const localeConfig: SiLocaleConfig = {
  availableLocales: ['en', 'de', 'fr'],
  defaultLocale: 'en',
  localeInitializer: genericLocaleInitializer,
  dynamicLanguageChange: false,
  fallbackEnabled: false
};

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useClass: SiLocaleId },
    { provide: SI_LOCALE_CONFIG, useValue: localeConfig }
  ]
};
```

In addition, `fallbackEnabled` enables ngx-translate to use the translation from the `defaultLocale` language when a translate value is missing.
This is separate from [Element's default text fallback](translation.md#default-text-with-ngx-translatecore).

## Persisting locales using SiLocaleStore

Setting the `SiLocaleService.locale = 'fr'` changes the language and forces a reload of the browser window. The service uses
the `SiLocaleStore` to persist the new locale. After reloading the application, the service uses the `SiLocaleStore` to load
the changed locale. By default, a localStorage implementation is used. You can implement your own store to load and
persist the user preferred locale from a setting backend that is shared across applications.

We implemented a [demo store](https://github.com/siemens/element/tree/main/src/app/examples/si-localization/demo-locale.service.ts)
that loads a locale from a backend before the Angular application initializes.
The store is configured in the application providers. In the following you find the key code snippet.

```ts
import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer } from '@angular/core';
import { SI_LOCALE_CONFIG, SiLocaleId, SiLocaleStore } from '@siemens/element-ng/localization';
import { lastValueFrom } from 'rxjs';

// Load the locale before the application initializes, then use the demo store.
// DemoLocaleService is the application-specific store linked above.
export const APP_CONFIG: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useClass: SiLocaleId },
    { provide: SI_LOCALE_CONFIG, useValue: localeConfig },
    provideAppInitializer(() => lastValueFrom(inject(DemoLocaleService).loadConfig())),
    { provide: SiLocaleStore, useExisting: DemoLocaleService }
  ]
};
```

You can also combine a Store that caches the last value in the localStore and loads in parallel the current value from a backend.

## Runtime locales changes using impure pipes

If you need to support locale changes without reloading, we recommend to extend the Angular pipes and set the `pure` property to false.

```ts
@Pipe({
  name: 'dateImpure',
  pure: false // eslint-disable-line @angular-eslint/no-pipe-impure
})
export class DateImpurePipe extends DatePipe implements PipeTransform {}
```

<si-docs-api injectable="SiLocaleService"></si-docs-api>

<si-docs-types></si-docs-types>
