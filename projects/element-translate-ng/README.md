# Element Translate

`element-translate-ng` is a translation abstraction layer. It can be used with

- `ngx-translate`
- Angular localize
- Other frameworks in the future

See [here](https://element.siemens.io/fundamentals/localization/#translation-in-element)
for details how it works and how to use it.

## Usage

Install the library as follows:

```sh
npm install --save @siemens/element-translate-ng
```

An important part of the translation tooling is the extraction of translatable keys as a TypeScript
interface as well as extracting a JSON messages file with default translations. This is provided by
the separate `@siemens/element-translate-cli` package via the `update-translatable-keys` CLI. See
[Extracting translatable keys](https://element.siemens.io/fundamentals/localization/#extracting-translatable-keys)
for details on how to run it and how to configure it.

## Testing

Run `npm run translate:test` to perform the unit tests via [Vitest](https://vitest.dev/).

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](LICENSE.md).
