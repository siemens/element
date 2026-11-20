# Translation abstraction

!!! warning "For Element contributors only"

    This guide is only for developing Element itself, not for applications using Element.
    Application developers should follow the [translation guide](../fundamentals/translation.md) and must not use the internal APIs described here.

Element uses `@siemens/element-translate-ng` to support different translation frameworks without depending on one within its components.
This guide describes the abstraction and how to add translatable text when developing Element components.
For application configuration, see [translation](../fundamentals/translation.md).

## Building blocks

| Building block               | Responsibility                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `TranslatableString`         | Marks text that can be a translation key or already-translated text. It behaves like a normal string. |
| `t(...)`                     | Wraps a `$localize` declaration and resolves the value for the configured framework.                  |
| `SiTranslatableService`      | Registers default text and resolves global overrides, keys, or default text.                          |
| `SiTranslateService`         | Defines the adapter contract for translation and language selection.                                  |
| `SiTranslateServiceBuilder`  | Resolves the adapter for the current injector.                                                        |
| `injectSiTranslateService()` | Obtains the adapter through its builder.                                                              |
| `SiTranslatePipe`            | Renders text through the adapter and handles asynchronous results.                                    |

The service, builder, `t` function, and pipe are internal APIs for Element development.
Applications should use their translation framework directly and configure the Element adapter through its provider factory.

## How it works

Translatable text is declared using a syntax based on `@angular/localize`:

```ts
readonly closeLabel = t(() => $localize`:Close button label@@SI_EXAMPLE.CLOSE:Close`);
```

- **description:** `Close button label` provides context for translators. It can be omitted.
- **id:** `SI_EXAMPLE.CLOSE` is the key passed to the translation framework.
- **default text:** `Close` is used when no framework is configured or as an optional ngx-translate fallback.

The `$localize` syntax allows Angular's extraction tools to find the key and default text even when a runtime framework is used.
Always wrap the call in `t(...)`. It requires an Angular injection context, such as a component field initializer or constructor.
Do not declare these values at module scope or initialize them in lifecycle hooks.

### Without a translation framework

1. `t(...)` temporarily uses Element's `$localize` implementation to read the declaration.
2. `SiTranslatableService` resolves an override, if provided, or the default text `Close`.
3. `SiNoTranslateService` passes the text through when the pipe renders it.

No translation files are needed.

### With ngx-translate

1. `t(...)` reads the declaration in the same way.
2. The root-scoped `SiTranslatableService` registers `Close` with the root adapter's Element missing-translation handler, if configured.
3. The resolver returns an override, if provided, or the key `SI_EXAMPLE.CLOSE`.
4. `SiTranslatePipe` passes the result to the ngx-translate adapter and subscribes to its translation stream.
5. The pipe updates the rendered text when the stream emits, including on language changes.

Overrides replace the key before translation. The default text remains registered under the original key.
For fallback-language and missing-translation configuration, see [default text with ngx-translate](../fundamentals/translation.md#default-text-with-ngx-translatecore).

### With Angular localize

The Angular localize adapter prevents `t(...)` from replacing Angular's `$localize` implementation.
Translation is left to Angular's localization processing, and the adapter uses the pass-through service rather than a runtime translation lookup.
This integration is experimental and does not support global text-key overrides.
The current `t(...)` implementation expects the key and default-text metadata to remain available at runtime.
Validate the localized build before relying on this experimental adapter.

## Adding translatable text

Use a stable, component-specific key with the `SI_` prefix and provide meaningful default English text.
For configurable labels, type the input as `TranslatableString` and render it through `SiTranslatePipe`:

```ts
import { Component, input } from '@angular/core';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-example',
  imports: [SiTranslatePipe],
  template: `<button type="button">{{ closeLabel() | translate }}</button>`
})
export class SiExampleComponent {
  readonly closeLabel = input<TranslatableString>(t(() => $localize`:@@SI_EXAMPLE.CLOSE:Close`));
}
```

Use this pipe within Element instead of the translation framework's pipe.
It also supports attribute and property bindings, for example `[attr.aria-label]="closeLabel() | translate"`.
Element's library TypeScript configurations include `@siemens/element-translate-ng/localize-types` in `compilerOptions.types` to declare `$localize`.

### Parameters

Use `{{parameter}}` placeholders in the default text and pass the values to the pipe:

```ts
readonly resultText = t(() => $localize`:@@SI_EXAMPLE.RESULTS:Results: {{count}}`);
```

```html
<p>{{ resultText | translate: { count: resultCount() } }}</p>
```

Do not use JavaScript template interpolation (`${value}`) in these `$localize` calls.
Element's replacement implementation does not support it.
Parameter replacement works without a framework and with ngx-translate; do not assume the same syntax is handled by Angular localize.

### Programmatic translation

When a template binding is not possible, obtain the adapter in an injection context:

```ts
private readonly translate = injectSiTranslateService();
```

Import `injectSiTranslateService` from `@siemens/element-translate-ng/translate`.
Use `translateAsync(key, params)` for an observable that emits translated text and updates on language changes supported by the adapter.
Use the async pipe or `takeUntilDestroyed()` to manage the subscription.

`translate(key, params)` may return either a value or an observable, depending on the adapter.
Only use `translateSync(key, params)` when the required translation files are already loaded.

## Adapter selection and scope

The application provider, for example `provideNgxTranslateForElement()`, registers a `SiTranslateServiceBuilder`.
`injectSiTranslateService()` passes the current injector to this builder.
If no builder is configured, it uses the no-translation builder.

The ngx-translate builder obtains `TranslateService` from that injector and caches an adapter for each service instance.
This supports isolated translation services in lazy child routes: the pipe and programmatic translation use the service available in their route instead of always using the root service.
Default-text registration is separate: `SiTranslatableService` uses the root adapter.
Separately provided missing-translation handlers in isolated routes do not automatically receive these defaults.
Do not inject `SiTranslateService` directly or create a single application-wide adapter manually.

## Extracting translatable keys

The `@siemens/element-translate-cli` package extracts translatable keys as a TypeScript interface and default text as a JSON messages file.

- The TypeScript interface (`SiTranslatableKeys` in Element) provides type checking and editor completion for global text-key overrides through `provideSiTranslatableOverrides()`.
- The JSON file (`template-i18n.json` in Element packages) contains the keys and their default English text. Applications can use it as a starting point for their translation files.

Install the CLI as a dev dependency if it is not already available:

```sh
npm install --save-dev @siemens/element-translate-cli
```

The extraction runs on compiled files and uses Angular's `localize-extract` command.
Make sure the Angular localization tooling is available and build the affected libraries first.
Then run:

```sh
npx update-translatable-keys
```

By default, the command reads `element-translate.conf.json`.
To use a different configuration file, pass its path as the only argument.

```json
{
  "files": "dist/@siemens/**/fesm2022/**/*.mjs",
  "configs": [
    {
      "name": "element",
      "locationPrefix": "projects/element-ng",
      "keysFile": "projects/element-ng/translate/si-translatable-keys.interface.ts",
      "keysInterfaceName": "SiTranslatableKeys",
      "messagesFile": "dist/@siemens/element-ng/template-i18n.json"
    }
  ]
}
```

- `files` is the glob pattern for the compiled files to scan.
- `configs` separates the output for libraries in a monorepo. All fields are required:
  - `name` is a unique name.
  - `locationPrefix` is the source path prefix used to assign messages to a library.
  - `keysFile` is the generated TypeScript interface file.
  - `keysInterfaceName` is the generated interface name.
  - `messagesFile` is the generated JSON messages file.

In this repository, build the translation layer before dependent libraries, then update the generated files:

```sh
pnpm translate:build
pnpm lib:build
pnpm build:all:update-translatable-keys
```

Use `dashboards:build` or `maps:build` as well if their text has changed.
Do not edit the generated key interfaces manually.

## Testing

Test rendered text through the component's public API and DOM.
Cover default text without a framework, configured translations, input overrides, and parameters where applicable.
When changing an adapter, also cover missing translations, language changes, and isolated service scopes.

For tests that need a controlled adapter, use `provideMockTranslateServiceBuilder` from `@siemens/element-translate-ng/translate`:

```ts
TestBed.configureTestingModule({
  providers: [
    TestTranslateService,
    provideMockTranslateServiceBuilder(injector => injector.get(TestTranslateService))
  ]
});
```

`TestTranslateService` is an injectable test implementation of `SiTranslateService`.
Use `TestBed.createComponent()` and wait for `fixture.whenStable()` after asynchronous changes.
Run the translation-layer tests with:

```sh
CI=true pnpm translate:test
```

For component changes, run the matching library's unit tests as well.

## Adapter extension points

An adapter implements `SiTranslateService` and supplies a builder through `SiTranslateServiceBuilder`.
It defines language selection, available languages, translation methods, and change notifications.
The optional `setTranslation` method registers default text without replacing existing translations.
`translationChange` emits changes without an initial emission.

These are internal extension points, not a supported application-level custom-adapter API.
When adding framework support to Element, verify the declaration, rendering, fallback, extraction, and scoped-service behavior together.
