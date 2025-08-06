# Localization

Localization or internationalization (i18n) is the process of designing and preparing your app to be usable in different locales around the world.
Localization includes the support for different languages as well as different formats for entities like dates, time, decimals, currency, etc.

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
[DecimalPipe](https://angular.dev/api/common/DecimalPipe) and [PercentPipe](https://angular.dev/api/common/PercentPipe) are pure pipes. Pure pipes ony re-render when
the inputs changes. This means they do not re-render when the `LOCALE_ID` changes. They load the `LOCALE_ID` only once at load time and caches the value.

We recommend to follow the same behavior as users changes to locales are seldom. As a consequence we need to reload the web application on locale changes.

<si-docs-component example="si-localization/si-localization" height="650"></si-docs-component>

## Locales in Element

Element provides the service `SiLocaleService` to set the current locale like `en`, `fr` or a
variant like `fr-CA` or `en-GB` as well as the available locales of the application. The service is
configured by an in injected `SiLocaleConfig` object in the main module.

In addition you need to register and initialize the locale packages for Angular. The following shows a
generic example that only loads the selected Angular locale into the applications.

Note, the `/* webpackInclude: /(en|de|fr)\.js$/ */` statement that need to match the supported locales.

``` ts

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
}

const localeConfig: SiLocaleConfig = {
  availableLocales: ['en', 'de', 'fr'],
  defaultLocale: 'en',
  localeInitializer: genericLocaleInitializer,
  dynamicLanguageChange: false,
  fallbackEnabled: false
};

:
:
providers: [
  { provide: LOCALE_ID, useClass: SiLocaleId, deps: [SiLocaleService] },
  { provide: SI_LOCALE_CONFIG, useValue: localeConfig }
  // , { provide: APP_INITIALIZER, useFactory: appLoadFactory, multi: true, deps: [DemoLocaleService] },
  // { provide: SiLocaleStore, useClass: DemoLocaleService }
],
```

In addition, `fallbackEnabled` enable ngx-translate to use the translation from the `defaultLocale` language when a translate value is missing.

## Persisting locales using SiLocaleStore

Setting the `SiLocaleService.locale = 'fr'` changes the language and forces a reload of the browser window. The service uses
the `SiLocaleStore` to persist the new locale. After reloading the application, the service uses the `SiLocaleStore` to load
the changed locale. As default, a localStorage implementation is used. You can implement your own store to load and
persis the user preferred locale from a setting backend that is shared across applications.

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
providers: [
  { provide: LOCALE_ID, useClass: SiLocaleId, deps: [SiLocaleService] },
  { provide: SI_LOCALE_CONFIG, useValue: localeConfig },
  { provide: APP_INITIALIZER, useFactory: appLoadFactory, multi: true, deps: [DemoLocaleService] },
  { provide: SiLocaleStore, useClass: DemoLocaleService }
],
```

You can also combine a Store that caches the last value in the localStore and loads in parallel the current value from a backend.

## Runtime locales changes using impure pipes

If you need to support locale changes without reloading, we recommend to extend the Angular pipes and set the `pure` property to false.

``` ts
@Pipe({
  name: 'dateImpure',
  pure: false // eslint-disable-line @angular-eslint/no-pipe-impure
})
export class DateImpurePipe extends DatePipe implements PipeTransform {}
```

## Translation in Element

Element >= v43 includes a translation abstraction layer which allows us to support multiple translation frameworks.
There is no hard dependency to a specific translation library anymore. Therefore, by default, translation keys
(`TranslatableString`) will no longer be translated.

### Supported Frameworks

If a translation framework is used, Element must be configured to use this framework as well.
For module-based applications, the respective module must be imported in the root module.
For standalone applications, the respective provider factory must be imported in the application configuration.

Supported frameworks:

<!-- markdownlint-disable MD013 -->
| Framework           | Path                                 | Module                        | Provider factory                | Remarks                                                                                                        |
|---------------------|--------------------------------------|-------------------------------|---------------------------------|----------------------------------------------------------------------------------------------------------------|
| `ngx-translate`     | `@spike-rabbit/element-translate-ng/ngx-translate`    | `SiTranslateNgxTModule`       | `provideNgxTranslateForElement` |                                                                                                                |
| `@angular/localize` | `@spike-rabbit/element-translate-ng/angular-localize` | `SiTranslateNgLocalizeModule` | `provideNgLocalizeForElement`   | The support is experimental. Please reach out to us via an issue, if you plan to use this in a productive app. |
<!-- markdownlint-enable MD013 -->

Remember, this is only the activation of the respective layer for Element, you still need to import and configure
the framework in your application as you would normally do.

If no framework is configured, Element will fall back to English.

!!! info "Support for other translation frameworks"
    Support for `@ngneat/transloco` and other frameworks might be added in the future on request.

### Overriding default text keys globally

Element provides the possibility to override text keys on a global level. This can be used to change the default value of
text keys that are used multiple times within an application but have most likely the same value. This is usually the case
for static labels like `Close`, `Ok`, ...

All keys that can be overridden can be found [here.](https://element.siemens.io/api/element-ng/types/SiTranslatableKeys)

The overriding of text keys is available for every framework except `@angular/localize` due to technical limitations.

Overrides are declared like this:

```ts
import { provideSiTranslatableOverrides } from '@spike-rabbit/element-ng/translate';

@NgModule({
  providers: [
    provideSiTranslatableOverrides({
      'SI-TOAST.CLOSE': 'MY-CUSTOM-CLOSE'
    })
  ]
})
export class AppModule {}
```

### How it works

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

### Adding Cache busting feature to the translation *.json files

By default, the `*.json` files used for translation, are not hashed by Webpack during the build and may cause caching issues when newer versions of the applications are deployed.
To counter this, we can either use the bundler to load translations
OR
we could simply provide a randomly generated string as a query parameter to the `GET` HTTP call, which fetches the `*.json` from the server.

- Define a random hash key in `environment.ts` file for each environment

```ts
export const environment = {
  production: false,
  hash:`${new Date().valueOf()}`
};
```

- When you initialize `TranslateHttpLoader` in your application, just append the below query parameter at the end:

```ts
export const createTranslateLoader = (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json?hash=' + environment.hash)
```

Note that this hash key will only be appended to the translation based JSON files which will be loaded by the `TranslateHttpLoader` and rest of the API calls will be working as usual.

<si-docs-api injectable="SiLocaleService"></si-docs-api>

<si-docs-types></si-docs-types>

### Translatable keys in Element

<si-docs-type name="SiTranslatableKeys"></si-docs-type>
