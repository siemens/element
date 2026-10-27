# Translation

Element provides a translation abstraction layer to support different translation frameworks without a hard dependency on a specific library.
This guide describes how to configure translation for Element components in an application.
For locale selection and date, number, and currency formats, see [localization](localization.md).

## Default behavior

Without a translation framework, Element components display their built-in English text.
Application-provided text is displayed as-is. Translation keys passed by the application are not translated.

## Supported frameworks

If a translation framework is used, Element must be configured to use this framework as well.
Import the respective provider factory once in the application configuration.
This only activates the adapter for Element. You still need to install and configure the framework in your application as you would normally do.

| Framework           | Import path                                      | Provider factory                |
| ------------------- | ------------------------------------------------ | ------------------------------- |
| `ngx-translate`     | `@siemens/element-translate-ng/ngx-translate`    | `provideNgxTranslateForElement` |
| `@angular/localize` | `@siemens/element-translate-ng/angular-localize` | `provideNgLocalizeForElement`   |

For module-based applications, import `SiTranslateNgxTModule` or `SiTranslateNgLocalizeModule` in the root module instead.

### ngx-translate

The following example loads translation files from `assets/i18n/` and enables Element's default text for missing translations:

```ts
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
      missingTranslationHandler: provideMissingTranslationHandlerForElement()
    }),
    provideNgxTranslateForElement()
  ]
};
```

Use the ngx-translate APIs to translate application text and select the active language.
If you use `SiLocaleService`, it synchronizes the configured locale with the translation framework.
With `fallbackEnabled: true`, it also sets the fallback language to `SiLocaleConfig.defaultLocale`, replacing the framework's `fallbackLang` setting.
With `fallbackEnabled: false`, it leaves the framework's fallback-language configuration unchanged.
See [localization](localization.md) for its configuration and reload behavior.

### Angular localize

!!! warning "Experimental support"

    Support for `@angular/localize` is experimental. Please reach out to us via an issue if you plan to use this in a production application.

Configure Angular localization as described in the [Angular i18n guide](https://angular.dev/guide/i18n), then activate the Element adapter:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgLocalizeForElement } from '@siemens/element-translate-ng/angular-localize';

export const appConfig: ApplicationConfig = {
  providers: [provideNgLocalizeForElement()]
};
```

This adapter leaves translation to Angular's `$localize` processing. It does not provide runtime language switching or global text-key overrides.

!!! info "Support for other translation frameworks"

    Support for other frameworks might be added in the future on request.

## Customizing component text

Element inputs typed as `TranslatableString` accept normal strings. With ngx-translate, these can be translation keys or literal text.
For example, the password toggle's `showLabel` input accepts either:

```html
<si-password-toggle #toggle showLabel="Show password">
  <input class="form-control" aria-label="Password" [type]="toggle.inputType" />
</si-password-toggle>
```

```html
<si-password-toggle #toggle showLabel="APP.SHOW_PASSWORD">
  <input class="form-control" aria-label="Password" [type]="toggle.inputType" />
</si-password-toggle>
```

In the second example, provide a translation for `APP.SHOW_PASSWORD` in your application's translation files.
Literal text passes through ngx-translate when no matching translation exists, unless a custom missing-translation handler changes this behavior.

For Angular localize, pass text translated by the application's Angular i18n configuration.
Use your framework's APIs for application text, not Element's internal translation service, `t` function, or `translate` pipe.

### Overriding default text keys globally

Element provides the possibility to override text keys on a global level.
This is useful for labels like `Close` or `Ok` that are used multiple times within an application.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideSiTranslatableOverrides } from '@siemens/element-ng/translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSiTranslatableOverrides({
      'SI_TOAST.CLOSE': 'MY_CUSTOM_CLOSE'
    })
  ]
};
```

With ngx-translate, add `MY_CUSTOM_CLOSE` to your translation files.
Without a translation framework, the override value is displayed directly.
Overrides are not supported with `@angular/localize`.

The `@siemens/dashboards-ng/translate` and `@siemens/maps-ng/translate` entry points provide the same function for their package-specific keys.

## Default text with @ngx-translate/core

Element provides default English text for its built-in translatable strings.
Configure `provideMissingTranslationHandlerForElement()` as shown above to use this text when a translation is missing.
Without this handler, missing keys may be displayed instead of meaningful text.

There are two separate fallback mechanisms:

- **Fallback language:** ngx-translate looks up the key in the configured fallback language if it is missing in the active language.
- **Element default text:** if the key is still missing, Element's missing-translation handler returns the built-in default text.

Element's default text only applies to its built-in keys, not arbitrary application keys.
If you override a key, provide a translation for the replacement key as well.

If your application has a custom missing-translation handler, pass its provider to the Element handler:

```ts
provideTranslateService({
  missingTranslationHandler: provideMissingTranslationHandlerForElement(
    provideMissingTranslationHandler(MyMissingTranslationHandler)
  )
});
```

Import `provideMissingTranslationHandler` from `@ngx-translate/core`.
Element defaults take precedence. Keys without an Element default are passed to the application handler, or returned unchanged if no handler is provided.

## Translatable keys in Element

All keys are members of the `SiTranslatableKeys` type of each package:

- [SiTranslatableKeys in @siemens/element-ng](../../api/siemens/element-ng/types/SiTranslatableKeys/)
- [SiTranslatableKeys in @siemens/dashboards-ng](../../api/siemens/dashboards-ng/types/SiTranslatableKeys/)
- [SiTranslatableKeys in @siemens/maps-ng](../../api/siemens/maps-ng/types/SiTranslatableKeys/)

The packages also include a `template-i18n.json` file with their keys and default text.
It can be used as a starting point for your application's translation files.
To extract keys when developing an Element component or library, see [extracting translatable keys](../architecture/translation.md#extracting-translatable-keys).

## Caching translation files

Translation JSON files copied as static assets are not automatically given content hashes.
To avoid outdated translations after a deployment, use a bundler-based loader or add a build version to the HTTP loader's suffix:

```ts
provideTranslateService({
  loader: provideTranslateHttpLoader({
    prefix: './assets/i18n/',
    suffix: '.json?v=' + environment.version
  })
});
```

Set `environment.version` during the build and change it with each deployment.
This only changes requests for translation files.

## Further reading

- [Localization and locale configuration](localization.md)
- [Language switcher](../components/forms-inputs/language-switcher.md)
- [Translation abstraction for Element contributors](../architecture/translation.md)
