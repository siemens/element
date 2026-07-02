# Element Theme

The CSS/SCSS theme package for Siemens Element, implementing the Siemens Design Language.

## Usage

To use the Element Theme in your project, add it to your dependencies by running:

```sh
npm install --save @siemens/element-theme
```

### Add the theme to your Angular application

Import the theme in your application's global stylesheet (e.g. `src/styles.scss`):

```scss
@use '@siemens/element-theme/theme';
```

This imports Bootstrap-based layout utilities, all component styles, and the default
Siemens Element color theme.

### Using SCSS variables and mixins

The package also exports SCSS variables and mixins that you can use in your own styles:

```scss
@use '@siemens/element-theme/src/styles/variables';

.my-component {
  color: variables.$element-text-primary;
  background-color: variables.$element-base-1;
}
```

### Custom theming

To apply a different theme variant, configure the theme before importing:

```scss
@use '@siemens/element-theme/theme' with (
  $element-theme-default: 'element-dark'
);
```

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](LICENSE.md).
