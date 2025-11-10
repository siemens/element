# Language switcher

## Code ---

This component provides a dropdown to switch the current language used by the
configured translation framework.
All properties are optional, by default the available languages will be
automatically queried from the translation service and translated using the
`LANGUAGE` key prefix.

### Usage

```ts
import { SiLanguageSwitcherComponent } from '@siemens/element-ng/language-switcher';

@Component({
  imports: [SiLanguageSwitcherComponent, ...]
})
```

### Language switcher - standard

The language names can either be passed as pre-translated strings or as
translation keys: `{ value: 'en', name: 'LANGUAGES.EN'}`

<si-docs-component example="si-language-switcher/si-language-switcher"></si-docs-component>

### Language switcher - alternative

The `translationKey` can be set to the translation group, e.g. `"LANGUAGE"`
which provides the language names. Make sure that the translation keys for the
languages are set to the ISO language codes as uppercase:

```json
"LANGUAGE": {
  "EN": "English",
  "DE": "Deutsch",
  "FR": "Français"
}
```

<si-docs-component example="si-language-switcher/si-language-switcher-string-array"></si-docs-component>

<si-docs-api component="SiLanguageSwitcherComponent"></si-docs-api>

<si-docs-types></si-docs-types>
