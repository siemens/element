# Dynamic forms
<!-- markdownlint-disable MD007 MD046 -->

Element supports dynamic forms using [Angular Formly](https://formly.dev/)
which allows to generate forms from JSON data.

## Code ---

### Usage

??? info "Required Packages"
    - [@ngx-formly/core](https://www.npmjs.com/package/@ngx-formly/core)
    - [@ngx-formly/bootstrap](https://www.npmjs.com/package/@ngx-formly/bootstrap)

```ts
import { SiFormlyModule } from '@siemens/element-ng/formly';

@NgModule({
  imports: [SiFormlyModule, ...]
})
```

### Standalone support

Formly does not provide standalone support yet [see also](https://formly.dev/docs/guide/faq#formly-standalone-components-support).

However, starting from Element v46.5.0 you can use the workaround
provided in [comment](https://github.com/ngx-formly/ngx-formly/issues/3721#issuecomment-1602401526).

Include `SiFormlyModule` in your app configuration to register your custom types/validators/wrappers.

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { SiFormlyModule } from '@siemens/element-ng/formly';

const config: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      SiFormlyModule.forRoot({
        // optionally you can add following configurations
        types: [
          // register your custom types here
        ],
        validators: [
          // register your custom validators here
        ],
        wrappers: [
          // register your custom wrapper here
        ]
      })
    )
  ]
}
```

### SiFormlyComponent

The `SiFormlyComponent` is a wrapper around formly to generate dynamic forms.
Please note that if you don't use this wrapper your form items will not be themed correctly based on Element theme and you might have to manually manage theming which is not recommended.

<si-docs-component example="si-formly/si-dynamic-form-fields" height="500"></si-docs-component>

## Utilities

There are plenty of utilities custom-made for you to develop apps with dynamic forms using `SiFormly`.

### [Custom Types](https://formly.dev/docs/guide/custom-formly-field)

  In addition to prebuilt types from bootstrap, Element also provides you with a set of custom types that help you to easily make use of Element components in formly.
  The below types helps you to develop your dynamic forms app more easily.

#### Structural types

  These types can be used to achieve a specific layout or wrapper for your form elements.

- `object-grid`
    - Wraps your fields in a configurable bootstrap grid.
    - Use `gridConfig` property with props in [field config](https://formly.dev/docs/api/#formlyfieldconfig) to configure your grid.
- `array`
    - Wraps your form array together with add/remove buttons if needed.
    - Expects a field array type to be provided within the fields input.
- `accordion`
    - Wraps your input fields in an [accordion](../components/layout-navigation/accordion.md)
- `tabset`
    - Wraps your input fields in a [tabset](../components/layout-navigation/tabs.md)

#### Field types

  In addition to the formly bootstrap types, the following custom types can be used to enable use of Element form components with formly.

- `checkbox`
- `button`

    Use `btnType` property with props in [field config](https://formly.dev/docs/api/#formlyfieldconfig) to configure following supported button types:

      - primary
      - secondary
      - tertiary
      - danger
      - warning

- `boolean`
- `date`

    The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:

      - autoClose
      - dateConfig

- `date-range`

    The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:

      - ariaLabelCalendarButton
      - autoClose
      - debounceTime
      - endDatePlaceholder
      - endTimeLabel
      - siDatepickerConfig
      - startDatePlaceholder
      - startTimeLabel

- `datetime`
  
    The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:

      - autoClose
      - dateConfig

- `email`
- `enum`
- `integer`
- `number`

    The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:

      - numberStep
      - showButtons
      - unit

- `password`

    The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:

      - digits
      - lowerCase
      - minLength
      - special
      - upperCase

- `si-select`
      - use `multi` property with props in [field config](https://formly.dev/docs/api/#formlyfieldconfig) to enable multi selection mode.

- `string`
- `textdisplay`
      - use `prefix` property with props in [field config](https://formly.dev/docs/api/#formlyfieldconfig) to add prefix before text.
      - use `suffix` property with props in [field config](https://formly.dev/docs/api/#formlyfieldconfig) to add suffix after text.

- `textarea`
- `time`

    The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:

      - hideLabels
      - showMeridian
      - showMilliseconds
      - showMinutes
      - showSeconds

### [Custom wrappers](https://formly.dev/docs/guide/custom-formly-wrapper)
  
  Use following wrappers to wrap your form fields with specific Element components.

- `form-field`
      - uses `SiFormItemComponent` to wrap your form fields
- `form-fieldset`
      - uses `SiFormFieldsetComponent`
- `form-field-horizontal`
      - wraps your form field and label in a horizontal layout.
- `icon-wrapper`
      - wraps your form field with an icon displayed at the end.
      - The following inputs can be passed as [field config](https://formly.dev/docs/api/#formlyfieldconfig) props:
        - `icon`
            - the icon to be displayed at the end of the form field.
        - `iconSize`
            - the size of the icon to be displayed in pixels.
        - `iconTooltip`
            - Tooltip for the icon to be displayed.

### Grid layout

`SiFormly` also supports rendering form with multi column grid layout.

<si-docs-component example="si-formly/si-dynamic-form-grid" height="350"></si-docs-component>

### Tabs

`SiFormly` also supports rendering form in multiple tabs. It uses `SiTabsetComponent` internally for displaying tabs.

<si-docs-component example="si-formly/si-dynamic-form-tabs" height="350"></si-docs-component>

### Accordion

`SiFormly` also supports rendering forms in accordions. It makes use of `SiAccordionComponent` internally.

<si-docs-component example="si-formly/si-dynamic-form-accordion" height="350"></si-docs-component>

### i18n support

`SiFormly` internally uses a [custom extension](https://formly.dev/docs/guide/custom-formly-extension) `translate` to internationalize your forms.  
It is configured similar to [this doc on formly](https://formly.dev/docs/examples/advanced/i18n-alternative) but without the hard dependency to `ngx-translate` library.

<si-docs-api component="SiFormlyComponent"></si-docs-api>

<si-docs-types></si-docs-types>
