<!-- markdownlint-disable MD024 MD033 MD046 -->

# Localization

Localization (l10n) or internationalization (i18n) is the process of designing and implementing a product for a **specific language and region**.

## Introduction ---

!!! tip "Localization is more than just translate the text"

    - It covers translation, but also **formats** (date/time/number), **script direction** (LTR/RTL), and UI behavior in different languages.
    - The **same English word** can require different words in other languages depending on meaning (ambiguity).
    - Languages differ in **word order**, **plural rules**, and **punctuation**.
    - UI text can **grow** (sometimes a lot), wrap, or break layouts.

<si-docs-component example="si-localization/si-localization" height="650"></si-docs-component>

## UX Writing ---

<!-- markdownlint-disable MD051 -->
Localization is mainly a [development task](#code) but UX writers can support developers.
<!-- markdownlint-enable MD051 -->

User interface texts are stand-alone, short and to the point, but without context. Thus, AI can produce a reliable translation only, the terms must be

- [Dominant](#terms-in-various-uses)
- [Precise](#terminology)
- [Unambiguous](#remove-ambiguity)

UX writing *combines* terminology, style, and form…

- to apply *consistent terms* on a UI
- to apply a *consistent style* on a UI
- to apply a *consistent form* on a UI

…for specific *use cases*, fully focused on the *target audience* (personas)

!!! tip "Think like a translator"

    Every string will be translated without access to the surrounding UI. Ask yourself: is this text understandable **without visual context**?

    <div class="dos-and-donts" markdown>
    <div class="dos" markdown>
    
    #### Do's

    - `Delete template for tool instance IDs`

    </div>
    <div class="donts" markdown>
    
    #### Don'ts

    - `Delete complete tool instance ID naming`Deleting a tool instance?<br>Naming something?<br>Is "complete" an adjective or a verb?
    
    </div>
    </div>

### Terminology

- Terms are defined by experts in the related fields (physicists, engineers…), universities teaching/researching specific domains, legal fields, experts at various companies worldwide specializing in specific domains (e.g. Siemens, Honeywell, etc.).
- Standardization bodies (e.g., ISO, EN, UL, BS, DIN, ASHRAE, BACnet), comprised of corporate experts and universities are standardizing common terms.
- Quasi-industrial standards from individual sources (Haystack, Bric etc.) become international standards only if aligned to official organizations. If not aligned, setting a standard remains wishful thinking.

Common language serves multiple purposes:

- *Clarity of communication*, common understanding between people and companies
- *Applicability* across multiple systems/tools/hardware…
- *Openness* to third parties, breaking up of silos
- Foundation for *artificial intelligence*

!!! warning "Usage of terminology databases"

    - Select the terminology of your business.
    - Identify terms not yet defined and request them.
    
#### Terms in various uses

Many terms have various meanings related to a specific context or domain.

*One meaning always dominates* regardless of context. That is the meaning that can be used without creating confusion. However, if that meaning does not fit the context, an alternative term (unambiguous synonym) must be used to eliminate misunderstandings

In addition, the alternative term increases substantially the probability of correct interpretation by artificial intelligence (as part of translation, machine learning, or any other use)

### Remove ambiguity

The ambiguity can be removed by

- grouping the texts by use cases (namespaces)
- only using [dominant meaning](#terms-in-various-uses) of term

#### Grouping of texts

Group texts by use case and provide meaningful (key) names.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- `"ACCOUNT.LOGOUT.CANCEL":` "Cancel",
- `"ACCOUNT.LOGOUT.HEADING":` "Log out",
- `"ACCOUNT.LOGOUT.LOG_OUT_NOW":` "Log out now?",
- `"ACCOUNT.LOGOUT.LOGGING_OUT":` "Logging out…",
- `"ACCOUNT.SETTINGS.HEADING":` "Settings",
- `"ACCOUNT.SETTINGS.THEME":` "Theme",
- `"ACCOUNT.SETTINGS.THEME_OPTIONS.AUTO":` "Auto",
- `"ACCOUNT.SETTINGS.THEME_OPTIONS.DARK":` "Dark",
- `"ACCOUNT.SETTINGS.THEME_OPTIONS.LIGHT":` "Light",
- `"LEGAL.ABOUT":` "About",
- `"LEGAL.IMPRINT":` "Corporate Information",
- `"LEGAL.PRIVACY_POLICY":` "Privacy Notice",
- `"LEGAL.VERSION":` "Version {{version}}"

</div>
<div class="donts" markdown>

#### Don'ts

- `"ABOUT":` "About",
- `"AUTO":` "Auto",
- `"CANCEL":` "Cancel",
- `"DARK":` "Dark",
- `"IMPRINT":` "Corporate Information",
- `"LIGHT":` "Light",
- `"LOG_OUT_NOW":` "Log out now?",
- `"LOGGING_OUT":` "Logging out…",
- `"LOGOUT":` "Log out",
- `"PRIVACY_POLICY":` "Privacy Notice",
- `"SETTINGS":` "Settings",
- `"THEME":` "Theme",
- `"VERSION":` "Version {{version}}"

</div>
</div>

### Reuse strings

Before writing a new string, check whether one with the exact meaning already exists.

Reusing strings…

- …reduces the volume sent to translators and lowers cost.
- …gains efficiency.
- …keeps translation unique in every supported language.
- …supports the `ONE Tech company` initiative.

!!! warning "Context-dependent strings"

    A single string reused across different contexts may require different translations in different languages.
    
    In doubt, create a separate string for each use even if the English text looks the same.

### Use translation libraries

[Unicode CLDR](https://cldr.unicode.org/) provides high quality translations for:

- language and script names
- countries and regions
- currencies
- months, weekdays and time zones

Use these sources to avoid superfluous translate effort.

### Provide user-friendly language selection

Provide the languages in the target language for the language switcher.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- English
- Deutsch
- Français
- Italiano
- Ελληνικά
- 中文

</div>
<div class="donts" markdown>

#### Don'ts

- 英语
- 德语
- 法语
- 意大利语
- 希腊
- 中文

</div>
</div>

### Avoid string concatenations

Building sentences from fragments prevents correct grammar in many languages.
Keep sentences as one unit with placeholders.

<!-- markdownlint-disable MD038 -->

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- EN: `Select site {site} of {company}?`
- DE: `Standort {site} von {company} auswählen?`

</div>
<div class="donts" markdown>

#### Don'ts

- EN: `Select site ` + `{site}` + ` of ` + `{company}` + `?`
- DE: `Standort auswählen ` + `{site}` + ` von ` + `{company}` + `?`

</div>
</div>

<!-- markdownlint-enable MD038 -->

### Define understandable placeholders

Keep sentence understandable even with placeholders.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- `Reactivating site {name} within activation period: {startDate} – {endDate}`

</div>
<div class="donts" markdown>

#### Don'ts

- `Reactivating site {1} within activation period: {2} – {3}`

</div>
</div>

### Avoid hard-coding formats

<!-- markdownlint-disable MD051 -->
Use locale-aware formatting (see [Code tab](#code)), and avoid UX writing depending on a single format.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- Use localization framework (see [Code tab](#code))
- Use [placeholders](#define-understandable-placeholders) in text: `Saved on {date}`

</div>
<div class="donts" markdown>

#### Don'ts

- `02/03/2026` (ambiguous)
- `1,234.56` everywhere

</div>
</div>

<!-- markdownlint-enable MD051 -->

### Pluralization

The correct translation of texts which relate to a count differs in different languages.

Pluralization of the `English` term «apple»:

- 1: «I own one apple.»
- n: «I own four apples.»

Pluralization of the `Polish` term «Plik» (`English`: «file»):

- 1 plik
- 2, 3, 4 pliki
- 5-21 plików
- 22-24 pliki
- 25-31 plików

#### Handling of zero

The count 0 is handled differently in several languages.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- Ich besitze keinen Apfel. («Apfel» | `EN`: «apple» in singular)

</div>
<div class="donts" markdown>

#### Don'ts

- Ich besitze 0 Äpfel («Äpfel» | `EN`: «apples» in plural)

</div>
</div>

#### Linguistic rules

Depending on the language there might be up to 6 forms. Following language specific variability does exist:

| Forms | Grammatical rules                                                                                                   | Languages       |
|:-----:|---------------------------------------------------------------------------------------------------------------------|-----------------|
| 1     | No distinction between the singular and plural form                                                                 | e.g. Japanese   |
| 2     | Singular used for one only                                                                                          | e.g. English    |
| 2     | Singular used for zero and one                                                                                      | e.g. French     |
| 3     | Special case for zero                                                                                               | Latvian         |
| 3     | Special cases for one and two                                                                                       | Gaelic (Irish)  |
| 3     | Special case for numbers ending in `00` or `[2-9][0-9]`                                                             | Romanian        |
| 3     | Special case for numbers ending in `1[2-9]`                                                                         | Lithuanian      |
| 3     | Special cases for numbers ending in `1` and `2`, `3`, `4`, except those ending in `1[1-4]`                          | e.g. Russian    |
| 3     | Special cases for `1` and `2`, `3`, `4`                                                                             | e.g. Czech      |
| 3     | Special case for one and some numbers ending in `2`, `3`, or `4`                                                    | Polish          |
| 4     | Special case for one and all numbers ending in `02`, `03`, or `04`                                                  | Slovenian       |
| 6     | Special cases for one, two, all numbers ending in `02`, `03`, … `10`, all numbers ending in `11` … `99`, and others | Arabic          |

#### Use localization to handle pluralization

Pluralization cannot be handled by product code or writing style. Use localization (e.g., ICU or framework plural rules) instead.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- `{count} rows`

</div>
<div class="donts" markdown>

#### Don'ts

- `{count} row(s)`
- if (count == 1) {`1 row`} else {`{count} rows`}

</div>
</div>

## Code ---

Angular supports localization as described in the [i18n](https://angular.dev/guide/i18n) guide and is supported by [pipes](https://angular.dev/guide/templates/pipes).
Angular applies a compile time localization concept. It does not support the change of locales (language and formats) at runtime. Instead, for each locale
it generates a new web application that supports exactly one locale. It replaces text in the HTML templates with the translations and sets a fixed
[LOCALE_ID](https://angular.dev/guide/i18n/locale-id) which is used by the pipes. Changing locales is realized by changing the web application.

Element localization supports a single web application with many languages and formats by dynamically loading languages by using [ngx-translate](https://github.com/ngx-translate/core).
We localize formats by following the angular [pipes](https://angular.dev/guide/templates/pipes) concept and reuse the locale and region definitions
from [Angular common locales](https://github.com/angular/angular/tree/master/packages/common/locales). This is sufficient and standard conform for
most applications. For example, if you want to display a date in a compact format use the date pipe like `{{ date | date:'short' }}`.
You will get the format 'M/d/yy' (6/15/15) for English. If required, applications may extend and specialize the formats and pipes.

The Angular pipes that uses the locale information like the [DatePipe](https://angular.dev/api/common/DatePipe), [CurrencyPipe](https://angular.dev/api/common/CurrencyPipe),
[DecimalPipe](https://angular.dev/api/common/DecimalPipe) and [PercentPipe](https://angular.dev/api/common/PercentPipe) are pure pipes. Pure pipes only re-render when
the inputs changes. This means they do not re-render when the `LOCALE_ID` changes. They load the `LOCALE_ID` only once at load time and caches the value.

We recommend to follow the same behavior as users changes to locales are seldom. As a consequence we need to reload the web application on locale changes.

### Locales in Element

Element provides the service `SiLocaleService` to set the current locale like `en`, `fr` or a
variant like `fr-CA` or `en-GB` as well as the available locales of the application. The service is
configured by an in injected `SiLocaleConfig` object in the main module.

In addition you need to register and initialize the locale packages for Angular. The following shows a
generic example that only loads the selected Angular locale into the applications.

Note, the `/* webpackInclude: /(en|de|fr)\.js$/ */` statement that need to match the supported locales.

```ts
// On locale change, we dynamically reload the locale definition
// for angular. With this configuration, we only load the current
// locale into the client and not all application locales.
const genericLocaleInitializer = (localeId: string): Promise<any> => {
  console.log('Registering locale data for ' + localeId);
  return import(
    // The following trick only includes en, de and fr.
    // Applications need to set their locales in the regex.
    // note: the `/node_modules/` is due to a webpack bug: webpack/webpack#13865
    /* webpackInclude: /(en|de|fr)\.m?js$/ */
    `/node_modules/@angular/common/locales/${localeId}`
  ).then(module => {
    registerLocaleData(module.default);
  });
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
    { provide: LOCALE_ID, useClass: SiLocaleId, deps: [SiLocaleService] },
    { provide: SI_LOCALE_CONFIG, useValue: localeConfig }
    // , { provide: APP_INITIALIZER, useFactory: appLoadFactory, multi: true, deps: [DemoLocaleService] },
    // { provide: SiLocaleStore, useClass: DemoLocaleService }
  ]
};
```

In addition, `fallbackEnabled` enables ngx-translate to use the translation from the `defaultLocale` language when a translate value is missing.

### Persisting locales using SiLocaleStore

Setting the `SiLocaleService.locale = 'fr'` changes the language and forces a reload of the browser window. The service uses
the `SiLocaleStore` to persist the new locale. After reloading the application, the service uses the `SiLocaleStore` to load
the changed locale. By default, a localStorage implementation is used. You can implement your own store to load and
persist the user preferred locale from a setting backend that is shared across applications.

We implemented a [demo store](https://github.com/siemens/element/tree/main/src/app/examples/si-localization/demo-locale.service.ts)
that loads a locale from a backend before the angular application initializes. The store is configured in the providers of the main
module definition. In the following you find the key code snippets.

```ts
// Load the locale from a backend service before the app initializes
export function appLoadFactory(service: DemoLocaleService) {
  return () => service.loadConfig().toPromise();
}
```

```ts
// Configure the APP_INITIALIZER provider and configure to use the
// DemoLocaleService as a locale store.
export const APP_CONFIG: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useClass: SiLocaleId, deps: [SiLocaleService] },
    { provide: SI_LOCALE_CONFIG, useValue: localeConfig },
    {
      provide: APP_INITIALIZER,
      useFactory: appLoadFactory,
      multi: true,
      deps: [DemoLocaleService]
    },
    { provide: SiLocaleStore, useClass: DemoLocaleService }
  ]
};
```

You can also combine a Store that caches the last value in the localStore and loads in parallel the current value from a backend.

### Runtime locales changes using impure pipes

If you need to support locale changes without reloading, we recommend to extend the Angular pipes and set the `pure` property to false.

```ts
@Pipe({
  name: 'dateImpure',
  pure: false // eslint-disable-line @angular-eslint/no-pipe-impure
})
export class DateImpurePipe extends DatePipe implements PipeTransform {}
```

### Translation in Element

Element >= v43 includes a translation abstraction layer which allows us to support multiple translation frameworks.
There is no hard dependency to a specific translation library anymore. Therefore, by default, translation keys
(`TranslatableString`) will no longer be translated.

#### Supported Frameworks

If a translation framework is used, Element must be configured to use this framework as well.
For module-based applications, the respective module must be imported in the root module.
For standalone applications, the respective provider factory must be imported in the application configuration.

Supported frameworks:

<!-- markdownlint-disable MD013 -->

| Framework           | Path                                             | Module                        | Provider factory                | Remarks                                                                                                        |
| ------------------- | ------------------------------------------------ | ----------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ngx-translate`     | `@siemens/element-translate-ng/ngx-translate`    | `SiTranslateNgxTModule`       | `provideNgxTranslateForElement` |                                                                                                                |
| `@angular/localize` | `@siemens/element-translate-ng/angular-localize` | `SiTranslateNgLocalizeModule` | `provideNgLocalizeForElement`   | The support is experimental. Please reach out to us via an issue, if you plan to use this in a productive app. |

Remember, this is only the activation of the respective layer for Element, you still need to import and configure
the framework in your application as you would normally do.

If no framework is configured, Element will fall back to English.

!!! info "Support for other translation frameworks"

    Support for `@ngneat/transloco` and other frameworks might be added in the future on request.

#### Overriding default text keys globally

Element provides the possibility to override text keys on a global level. This can be used to change the default value of
text keys that are used multiple times within an application but have most likely the same value. This is usually the case
for static labels like `Close`, `Ok`, ...

See [overridable strings from Element](https://element.siemens.io/api/element-ng/types/SiTranslatableKeys) for details.

The overriding of text keys is available for every framework except `@angular/localize` due to technical limitations.

Overrides are declared like this:

```ts
import { provideSiTranslatableOverrides } from '@siemens/element-ng/translate';

@NgModule({
  providers: [
    provideSiTranslatableOverrides({
      'SI-TOAST.CLOSE': 'MY-CUSTOM-CLOSE'
    })
  ]
})
export class AppModule {}
```

#### How it works

Within Element, a `TranslatableString` is declared using a syntax based on `@angular/localize`:

```ts
const value = $localize`:description@@id:default-value`;
```

- **description:** A description for a translator. Can be omitted.
- **id:** An id or key that will be passed to the translation framework.
- **default-value:** The default value will be used when no translation framework is used.

Unless `@angular/localize` is used for translation, Element provides its own implementation of `$localize`. In addition,
Element has its own translate pipe. Both, `$localize` and the `translate` pipe are needed for translation.

`$localize` resolves its input either to the id, if a translation framework is used, or to the default value, if no
translation framework is used. In addition, a key can
be [overridden by a global provider](#overriding-default-text-keys-globally).

The `translate` pipe is needed for frameworks like `ngx-translate` where translation happens at runtime.
It resolves a `TranslatableString` generated by `$localize` using an actual translation framework.

#### Default text with @ngx-translate/core

During application development, translations may be missing for certain translation keys, especially when adding new features or supporting additional languages. Without proper handling, missing translations can result in translation keys being displayed directly to users instead of meaningful text.

Element provides default text values for all translatable strings used in its components and directives. These default values serve as fallbacks when a translation is not available in your application's translation files, ensuring a better user experience during development and preventing broken UI text in production.

To enable default text fallbacks for missing translation keys, configure the `provideMissingTranslationHandlerForElement` provider function as the `missingTranslationHandler` when setting up `@ngx-translate/core` in your application.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideMissingTranslationHandler, provideTranslateService } from '@ngx-translate/core';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslateService({
      // Enable default text values for missing translations
      // Without custom handler by your application
      missingTranslationHandler: provideMissingTranslationHandlerForElement(),
      // With custom handler by your application
      missingTranslationHandler: provideMissingTranslationHandlerForElement(
        provideMissingTranslationHandler(MyMissingTranslationHandler)
      )
    }),
    // Activate Element translation support for @ngx-translate/core
    provideNgxTranslateForElement()
  ]
};
```

#### Adding Cache busting feature to the translation \*.json files

By default, the `*.json` files used for translation, are not hashed by Webpack during the build and may cause caching issues when newer versions of the applications are deployed.
To counter this, we can either use the bundler to load translations
OR
we could simply provide a randomly generated string as a query parameter to the `GET` HTTP call, which fetches the `*.json` from the server.

- Define a random hash key in `environment.ts` file for each environment

```ts
export const environment = {
  production: false,
  hash: `${new Date().valueOf()}`
};
```

- When you initialize `TranslateHttpLoader` in your application, just append the below query parameter at the end:

```ts
export const createTranslateLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json?hash=' + environment.hash);
```

Note that this hash key will only be appended to the translation based JSON files which will be loaded by the `TranslateHttpLoader` and rest of the API calls will be working as usual.

<si-docs-api injectable="SiLocaleService"></si-docs-api>

<si-docs-types></si-docs-types>

#### Translatable keys in Element

<si-docs-type name="SiTranslatableKeys"></si-docs-type>
