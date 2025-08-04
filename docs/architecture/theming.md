# Theming

Element provides a default `element` theme with `light` and `dark` theme types
as well as supports the definition of custom themes. A custom theme can support either
`light`, `dark`, or both theme types.

## How it works

Element uses CSS variables to implement theming, as they can be changed at runtime in the browser without page reload.
The [semantic color tokens](../fundamentals/colors/ui-colors.md) in the design system are set
to CSS variables instead of direct color codes, e.g. `$element-ui-0: var(--element-ui-0);`
and are changed at runtime by either applying the `.app--dark` CSS class or by changing the value
using the service `SiThemeService`.

The SCSS variables are also set or overwritten to use those semantic tokens
including the base font. Besides that, assets like the brand logo can also be overwritten
using CSS variables.

## Dark mode

Element supports a `light` and `dark` theme mode, which applies to the
theme itself as well as all components. A user can choose either `light` or
`dark` mode, while the default is being derived from the browser or operating
system configuration.

### Applying dark mode

Switching dark mode is done by adding the class `app--dark` to the `<html>` tag.
This will then switch the CSS variables to the value for the dark theme.

This process is automated using the `SiThemeService` service. Inject the service
in your component and use `applyThemeType('dark' | 'light' | 'auto')`:

<si-docs-component example="si-theme/theme-switcher" height="140"></si-docs-component>

> **Note:** It is recommended to call `themeService.applyThemeType('auto')` during
> initialization of the app (e.g. within `app.component.ts`) as this derives the
> theme choice from the user's browser or operating system configuration, allowing
> a coherent experience across different apps.

### Preparing application for dark mode support

The dark theme works out of the box, if you use the [semantic tokens](../fundamentals/colors/ui-colors.md)
and follow these few steps:

- In the application's SCSS, make sure to use the semantic tokens everywhere,
  i.e. use `$element-ui-4` for border colors instead of `$element-gray-200`.

- In some cases using the `$element-ui-*` tokens will fails, e.g. for things
  like `background-color: rgba($element-ui-4, 0.5)`.

## Custom themes

The SiThemeService is responsible for all theming topics.

- At startup, it tries to load a custom active theme from the SiThemeStore.
- If available, it applies the custom theme. Otherwise, the default Element theme is used.

<si-docs-type name="SiThemeStore"></si-docs-type>

The `SiDefaultThemeStore` is a [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
based implementation of the `SiThemeStore`, which is used by default. To provide custom themes using other means
than a localStorage like e.g. a backend service, you can implement your own `SiThemeStore` and load a `Theme` custom
theme object.

You need to provide your implementation in the main app module:

```ts
{ provide: SiThemeStore, useClass: YourThemeStoreImpl }
```

<si-docs-api injectable="SiThemeService"></si-docs-api>

## Build time custom theme

It's also possible to use custom themes at build time. This option is mostly for OEM theming. To
use a theme at build time, first set up a SCSS file with the theme definitions. These are a SCSS
map. For the required keys, please see the the
[Siemens Brand](https://github.com/siemens/element/tree/main/projects/element-theme/src/styles/variables/siemens-brand/_theme-siemens-brand.scss)
definitions.

For example, create `_theme-oem.scss` with this:

```scss
$theme-oem: (
  // definitions, see above
);
```

Then, to include this theme and build it as the default, change the main style sheets:

```scss
// first configure the element-theme by not building the 'siemens-brand' theme
@use '@siemens/element-theme/src/theme' with (
  $element-theme-default: 'oem', // the default is 'siemens-brand';
  $element-themes: ('oem'), // themes to build.
);
@use '@siemens/element-ng/element-ng';

// build the OEM theme
@use '@siemens/element-theme/src/styles/themes';
@use './theme-oem';
@include themes.make-theme(theme-oem.$theme-oem, 'oem', false);
```

The list `$element-themes` doesn't need to include the value set as `$element-theme-default`.
`$element-theme-default` determines the name of the theme used as default, i.e. the one that
is active w/o setting any additional class on the root element.

To use e.g. the `siemens-brand` theme by default but also allow a `oem` theme as opt-in,
use `$element-theme-default: 'siemens-brand'` or completely emit this configuration and provide
`$element-themes: ('oem')`. The additional `oem` theme is built and can be activated by applying
the class `theme-oem` to the `<html>` tag.

If both a light and a dark mode version are desired, defines two maps, e.g.

```scss
$theme-oem-light: (
  // light mode and shared definitions
);

$theme-oem-dark: (
  // dark mode definitions
);
```

Then, use `themes.make-theme()` like this:

```scss
@include themes.make-theme(theme-oem.$theme-oem-light, 'oem', false);
@include themes.make-theme(theme-oem.$theme-oem-dark, 'oem', true);
```

!!! warning "Important info"
    The required keys in the map might change in future versions of Element, so forward compatibility is not guaranteed.
    Topic like usability and accessibility and not guaranteed that way so please always involve UX when using this feature.

<si-docs-types></si-docs-types>
