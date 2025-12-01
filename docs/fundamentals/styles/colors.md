# Colors

Use color utility classes to convey meaning and enhance readability.

Apply color to text elements using the following classes:

```html
<!-- Default Text Color -->
<h3 class="text-body">default</h3>

<!-- Text Color Classes -->
<hr />
<h3 class="text-secondary">text-secondary</h3>
<h3 class="text-muted" aria-disabled="true">text-muted</h3>
<h3 class="text-primary">text-primary</h3>

<!-- Inverse Color Classes -->
<hr />
<h3 class="text-inverse bg-secondary">text-inverse</h3>

<!-- Context Color Classes -->
<hr />
<h3 class="text-success">text-success</h3>
<h3 class="text-warning">text-warning</h3>
<h3 class="text-caution">text-caution</h3>
<h3 class="text-info">text-info</h3>
<h3 class="text-danger">text-danger</h3>
```

<si-docs-component example="typography/color-variants" height="380"></si-docs-component>

## Using SASS variables

For greater flexibility, apply color variants using SASS.
We recommend using semantic color tokens:

```scss
@use '@siemens/element-theme/src/styles/variables';

color: variables.$element-text-primary;
color: variables.$element-text-secondary;
color: variables.$element-text-disabled;
color: variables.$element-text-active;
background-color: variables.$element-base-warning;
background-color: variables.$element-base-danger;
color: variables.$element-status-danger-contrast;
background-color: variables.$element-status-danger;
```

For a complete list of available tokens, see [_semantic-tokens](https://github.com/siemens/element/tree/main/projects/element-theme/src/styles/variables/_semantic-tokens.scss).
