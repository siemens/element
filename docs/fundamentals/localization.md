<!-- markdownlint-disable MD033 MD046 -->

# Localization

Internationalization (i18n) is the process of designing and developing a product for localization (l10n) into specific languages and regions.

## Introduction ---

### Internationalization (i18n)

Internationalization is the entire process of designing and developing a product that can be adapted to different languages and regions.
Internationalization is the foundation for high-quality and efficient [localization](#localization-l10n).

### Localization (l10n)

Localization is the process of adapting a product to the language and cultural norms of a specific target market so that it feels natural to local users. This goes beyond [simple translation](#translation) and includes script direction ([LTR](#ltr-left-to-right)/[RTL](#rtl-right-to-left)), formatting numbers, times, dates, and addresses, and adapting illustrations.

This example shows how values, dates, and times should be displayed after the product has been localized.
<si-docs-component example="si-localization/si-localization" height="650"></si-docs-component>

Localization requires an [internationalized](#internationalization-i18n) product and must be performed for each target market.

### Translation

Translation is the central linguistic component of [localization](#localization-l10n), whereby the tone must be adapted to local requirements and the meaning must be conveyed accurately.

It is important to consider that languages differ in terms of word order, plural rules, and punctuation.
In addition, an English word can have multiple meanings and be translated into other languages using different words.

### LTR (Left-to-Right)

LTR refers to languages (e.g., English, German, French, Spanish) and scripts that are written and read from left to right.

### RTL (Right-to-Left)

RTL refers to languages (e.g., Arabic, Hebrew, Persian) and writing systems that are written and read from right to left.

It is important to consider that often the entire user interface must be mirrored, which imposes significant demands on [internationalization](#internationalization-i18n).

## UX Writing ---

UX writers are the text experts in the product development team and therefore ideal ambassadors for internationalization.
They need to be aware of the challenges of localization and understand how they can support UX designers in creating localization-friendly designs (e.g., [space for translation](#manage-space-for-translations)).

In addition, translation-friendly texts should be defined by thinking like a translator: “Is the text understandable without the visual context?”

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- `Delete the template for tool instance IDs`

</div>
<div class="donts" markdown>

- `Delete complete tool instance ID naming`Deleting a tool instance?<br>Naming something?<br>Is "complete" an adjective or a verb?

</div>
</div>

User interface texts are stand-alone, short, and to the point, but they provide little to no context on their own. Thus, translators and AI can only produce a reliable translation if the terms are

- [Predominant](#terms-in-various-uses)
- [Precise](#domain-terminology)
- [Unambiguous](#avoid-misunderstandings)

UX writing combines terminology, style and form to ensure a consistent UI for specific use cases of a target audience.

<!-- markdownlint-disable MD051 -->

The handover documentation to development must include the UX writing specifications (e.g., [placeholder names](#define-named-placeholders) or [grouping of texts](#grouping-of-texts)) as a basis for [implementing internationalization](#code).

<!-- markdownlint-enable MD051 -->

### Domain terminology

- The terms are defined by experts (physicists, engineers, lawyers, etc.) from universities and various global companies specializing in specific domains.
- Standardization bodies (e.g., [ISO](https://iso.org), [EN](https://cen.eu), [UL](https://ul.com), [IEC](https://iec.ch)) are standardizing common terms.
- Avoid terms from quasi-industrial standards until they have been harmonized with official standardization bodies and are generally accepted.

Common language serves multiple purposes:

- Clarity of communication, common understanding between people and companies
- Applicability across multiple systems/tools/hardware…
- Openness to third parties, breaking up of silos
- Foundation for artificial intelligence

#### Terms in various uses

Many terms have various meanings related to a specific context or domain.

Use the terminology database of domain to maintain a common language.
UX writers are asked to request terms from the terminology maintainers of the domain (via the terminology database) if the term is not yet defined.
Review the UI texts together with domain experts, and ensure that translations are done by translators with domain knowledge.

!!! info "Meaning of the term `title`"

    A subset of meanings of `title`:

    - predominant meaning: an appellation of dignity, honor, distinction, or preeminence attached to a person or family by virtue of rank, office, precedent, privilege, attainment, or lands
    - descriptive name : [appellation](https://www.merriam-webster.com/dictionary/appellation)
    - a person holding a title especially of nobility
    - a similar distinguishing name of a musical composition or a work of art
    - all the elements constituting legal ownership
    - a descriptive or general heading (as of a chapter in a book)

    See [Merriam Webster](https://www.merriam-webster.com/dictionary/title) for details

One meaning always dominates regardless of context. That is the meaning that can be used without creating confusion. However, if this dominating meaning does not fit the context, an alternative term (unambiguous synonym) must be used to eliminate misunderstandings.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- Academic title
- Heading
- Name
- Ownership

</div>
<div class="donts" markdown>

- Title (professor, doctor xyz)
- Title of a book (War and peace)
- Title of an object (Intelligent Valve)
- Title to an asset (Owned by Mr./Ms. xyz)

</div>
</div>

In addition, the alternative term substantially increases the probability of correct interpretation by artificial intelligence (as part of translation, machine learning, or any other use).

### Avoid misunderstandings

Avoid possible causes of misunderstandings by

- grouping the texts by use cases
- only using the [predominant meaning](#terms-in-various-uses) of the term
- annotating texts with a description (if supported by translation framework and file format)

#### Grouping of texts

Translators translate texts individually.
In order to understand the context and maintain consistency, it is necessary to have related texts close together.
Related texts can be brought together by grouping texts based on use cases (e.g., My account → Theme selection) along with meaningful (key) names.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- `ACCOUNT.LOGOUT.CANCEL:` Cancel
- `ACCOUNT.LOGOUT.HEADING:` Log out
- `ACCOUNT.LOGOUT.LOG_OUT_NOW:` Log out now?
- `ACCOUNT.LOGOUT.LOGGING_OUT:` Logging out…
- `ACCOUNT.SETTINGS.HEADING:` Settings
- `ACCOUNT.SETTINGS.THEME:` Theme
- `ACCOUNT.SETTINGS.THEME_OPTIONS.AUTO:` Auto
- `ACCOUNT.SETTINGS.THEME_OPTIONS.DARK:` Dark
- `ACCOUNT.SETTINGS.THEME_OPTIONS.LIGHT:` Light
- `LEGAL.ABOUT:` About
- `LEGAL.IMPRINT:` Corporate Information
- `LEGAL.PRIVACY_POLICY:` Privacy Notice
- `LEGAL.VERSION:` Version `{{version}}`

</div>
<div class="donts" markdown>

- `ABOUT:` About
- `AUTO:` Auto
- `CANCEL:` Cancel
- `DARK:` Dark
- `IMPRINT:` Corporate Information
- `LIGHT:` Light
- `LOG_OUT_NOW:` Log out now?
- `LOGGING_OUT:` Logging out…
- `LOGOUT:` Log out
- `PRIVACY_POLICY:` Privacy Notice
- `SETTINGS:` Settings
- `THEME:` Theme
- `VERSION:` Version `{{version}}`

</div>
</div>

### Manage space for translations

Design user interfaces by following these steps to ensure that translations have space in the user interface.

1. Design UI by prioritizing flexible layouts, identify areas with limited text space, and always allocate more space than you think you'll need.
1. Write English texts, keeping conciseness in mind from the start.
1. Determine reasonable limits and provide it to the translation management.
1. Request translations
1. Test every screen with translated texts  
   Revisit the UI design or the original texts if a translator cannot convey the meaning within the limit.

Fixing UI issues caused by long translations late in the development cycle is expensive and time-consuming.

#### Awareness for length increase

Always design with translation in mind, assuming text will grow.

- Layout breakage  
  Fixed-width elements may not accommodate longer text, which can result in overflows, line breaks in awkward places, or text disappearing completely.
- Truncation  
  If text is truncated, important instructions or information may be invisible, which can lead to frustration and misuse.
- UI inconsistency  
  Different languages require different amounts of space, which makes it difficult to maintain a consistent look and feel.

UX writers are ambassadors of internationalization and are asked to support UX designers in creating localization-friendly designs.

#### Required space for translation

The exact length of a translation cannot be predicted.
Some generally accepted rules of thumb:

- Short texts (1-10 characters)  
  These can often increase by 200-300%. (E.g., `EN:`"On" → `DE:`"Eingeschaltet")
- Medium texts (11-20 characters)  
  Expect an increase of 100-200%. (E.g., `EN:`"Withdraw request" → `DE:`"Anfrage zurückziehen")
- Longer texts (21-50 characters)  
  Expect an increase of 50-100%.
- Very Long texts (50+ characters)  
  Depending on the conciseness of the language, the paragraphs can be 30-50% longer, but sometimes also shorter than the original.

Consider German, Finnish, Greek, and some Slavic languages, which are known for their long translations.

#### Limit space if required

Identify UI elements which truly offer limited space, even if a flexible design is the preferred choice.
The following UI elements may require text length restrictions:

- Buttons
- Tab labels
- Navigation menu items
- Table headers
- Input field labels

Texts can be limited by the translation management tool in terms of character count or pixel width.

### Reuse texts

Before writing a new text, check whether one with the exact same meaning already exists.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- `COMMON.SAVE:` Save

</div>
<div class="donts" markdown>

- `USERS.EDIT_USER.SAVE:` Save
- `DEVICES.EDIT_DEVICE.SAVE:` Save

</div>
</div>

Reusing the same instance of text…

- …reduces the volume sent to translators and lowers cost.
- …increases the efficiency of product development and maintenance.
- …keeps translation unique in every supported language.
- …helps identifying duplicated functionality.

However, be careful when changing approved, reused texts to ensure that their meaning is preserved.

An English text may require different translations in different contexts.
In such cases, a separate text must be created.

<!-- markdownlint-disable MD038 -->

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- `COMMON.CANCEL:` "Cancel" for processes only
- Translation to German: "Abbrechen"
- Add `CONTRACT.CANCEL:` "Cancel" for contracts
- Translation to German: "Stornieren"

</div>
<div class="donts" markdown>

- `CANCEL:` "Cancel" in context of process and contract
- Translation to German: "Abbrechen" or "Stornieren"?

</div>
</div>

<!-- markdownlint-enable MD038 -->

If in doubt, create a separate text for each use, even if the English text appears to be identical.

### Use translation libraries

Packages based on the [Unicode CLDR](https://cldr.unicode.org/) like `@angular/common` and built-in runtime objects like `Intl` provide complete and high quality translations for:

- language and script names
- countries and regions
- currencies
- months, weekdays and time zones

Use these sources to avoid superfluous translation efforts.

### Avoid directional terms on UI

Directional terms might get incorrect if the user interface is mirrored for [RTL languages](#rtl-right-to-left).
Use direction agnostic texts instead.

<!-- markdownlint-disable MD038 -->

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- Site pane
- Vertical navigation

</div>
<div class="donts" markdown>

- Right pane
- Left navigation

</div>
</div>

<!-- markdownlint-enable MD038 -->

### Avoid text concatenations

Building sentences from fragments prevents correct grammar in many languages.
Keep sentences as one unit with placeholders.

<!-- markdownlint-disable MD038 -->

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- EN: `Select site {site} of {company}?`
- DE: `Standort {site} von {company} auswählen?`

</div>
<div class="donts" markdown>

- EN: `Select site ` + `{site}` + `of` + `{company}` + `?`
- DE: `Standort auswählen ` + `{site}` + `von` + `{company}` + `?`

</div>
</div>

<!-- markdownlint-enable MD038 -->

The verb (`EN:`"select" / `DE:`"auswählen") is at the beginning of the sentence in English but at the end in German.

### Define named placeholders

Keep sentences understandable even with placeholders.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- `Reactivating site {name} within activation period: {startDate} – {endDate}`

</div>
<div class="donts" markdown>

- `Reactivating site {1} within activation period: {2} – {3}`

</div>
</div>

### Avoid hard-coding formats

<!-- markdownlint-disable MD051 -->

Use locale-aware formatting (see [Code tab](#code)), and avoid UX writing depending on a single format.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- Use the localization framework (see [Code tab](#code))
- Use [placeholders](#define-understandable-placeholders) in text: `Saved on {date}`

</div>
<div class="donts" markdown>

- `02/03/2026` (ambiguous)
- `1,234` in all languages (ambiguous, less or greater than 2?)

</div>
</div>

<!-- markdownlint-enable MD051 -->

### Pluralization

Each language has its own grammatical rules that specify how texts containing numbers must be presented.
It is important to consider these different rules early in the UX writing and implementation process to ensure that the product can be localized correctly.

!!! info "Pluralization examples"

    Pluralization of the `English` term «apple»:

    - 0: «I own no apple.»
    - 1: «I own one apple.»
    - n: «I own four apples.»

    Pluralization of the `Polish` term «Plik» (`English`: «file»):

    - 1 plik
    - 2, 3, 4 pliki
    - 5-21 plików
    - 22-24 pliki
    - 25-31 plików

#### Linguistic rules

Depending on the language there might be up to 6 forms. Following language specific variability does exist:

| Forms | Grammatical rules                                                                                                   | Languages      |
| :---: | ------------------------------------------------------------------------------------------------------------------- | -------------- |
|   1   | No distinction between the singular and plural form                                                                 | e.g. Japanese  |
|   2   | Singular used for one only                                                                                          | e.g. English   |
|   2   | Singular used for zero and one                                                                                      | e.g. French    |
|   3   | Special case for zero                                                                                               | Latvian        |
|   3   | Special cases for one and two                                                                                       | Gaelic (Irish) |
|   3   | Special case for numbers ending in `00` or `[2-9][0-9]`                                                             | Romanian       |
|   3   | Special case for numbers ending in `1[2-9]`                                                                         | Lithuanian     |
|   3   | Special cases for numbers ending in `1` and `2`, `3`, `4`, except those ending in `1[1-4]`                          | e.g. Russian   |
|   3   | Special cases for `1` and `2`, `3`, `4`                                                                             | e.g. Czech     |
|   3   | Special case for one and some numbers ending in `2`, `3`, or `4`                                                    | Polish         |
|   4   | Special case for one and all numbers ending in `02`, `03`, or `04`                                                  | Slovenian      |
|   6   | Special cases for one, two, all numbers ending in `02`, `03`, … `10`, all numbers ending in `11` … `99`, and others | Arabic         |

The [plural rules specification from the Unicode CLDR project](https://cldr.unicode.org/index/cldr-spec/plural-rules) contains a detailed linguistic analysis.

#### Use localization to handle pluralization

Pluralization cannot be handled by product code or writing style. Use localization (e.g., ICU or framework plural rules) instead.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- `Delete {count} rows?`
- `Delete {rowName}?`

</div>
<div class="donts" markdown>

- `Delete {count} row(s)?`
- if (count == 1) {`1 row`} else {`{count} rows`}

</div>
</div>

### Provide user-friendly language selection

Provide each language name in the target language for the language switcher.

<div class="dos-and-donts" markdown>
<div class="dos" markdown>

- English
- Deutsch
- Français
- Italiano
- Ελληνικά
- 中文

</div>
<div class="donts" markdown>

- 英语
- 德语
- 法语
- 意大利语
- 希腊
- 中文

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
