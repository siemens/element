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

An important part of the library is the extraction of translatable keys as a TypeScript interface
as well as extracting a JSON messages file with default translations. The extraction happens on
compiled files. I.e. make sure to run the build first. Then, to run these extractions

```sh
npx update-translatable-keys
```

By default, this will pick of the configuration from a file `element-translate.conf.json`. To
use a different config file, pass as the only argument to the command.

The config file looks like this

```json
{
  "files": "dist/@simpl/**/fesm2022/**/*.mjs",
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

- `files` is a glob pattern for defining the files to scan
- `configs` is an array of configs. For mono-repos building multiple libraries, they can be
  separated into different configs. All keys are required:
  - `name` is a unique name
  - `locationsPrefix` defines the path prefix of the source files, important to distinguish
    between different libraries in a mono-repo
  - `keysFile` defines the path of the generated TypeScript interfaces file
  - `keysInterfaceName` defines the name of the TypeScript `interface`
  - `messagesFile` defines the path of the generated messages JSON file

## Testing

Run `yarn translate:test` to perform the unit tests via [Karma](https://karma-runner.github.io).
You can set a seed for running the tests in a specific using an environment variable: `SEED=71384 yarn translate:test`

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2025

MIT, see [LICENSE.md](LICENSE.md).
