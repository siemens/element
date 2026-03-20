# Element Translate CLI

The CLI tool for the Siemens Element translation abstraction layer. It extracts
translatable keys from compiled Element library files and generates a TypeScript
keys interface and a default translations JSON file.

## Usage

Install the CLI as part of the `@siemens/element-translate-ng` workflow:

```sh
npm install --save-dev @siemens/element-translate-cli
```

### Extract translatable keys

Run the extraction after building your library:

```sh
npx update-translatable-keys
```

By default this reads the configuration from `element-translate.conf.json`. To use a
different config file, pass its path as the first argument:

```sh
npx update-translatable-keys path/to/my-config.json
```

### Configuration

Create an `element-translate.conf.json` file in your project root:

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

| Field               | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `files`             | Glob pattern for compiled library files to scan         |
| `name`              | Identifier for this config entry                        |
| `locationPrefix`    | Source path prefix used to match extraction locations   |
| `keysFile`          | Output path for the generated TypeScript keys interface |
| `keysInterfaceName` | Name of the generated TypeScript interface              |
| `messagesFile`      | Output path for the generated default translations JSON |

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](LICENSE.md).
