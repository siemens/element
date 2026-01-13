# Colors

Use color utility classes to convey meaning and enhance readability.

Apply color to text elements using the following classes:

```html
<!-- Default Text Color -->
<div class="text-body">default</div>

<!-- Text Color Classes -->
<hr />
<div class="text-secondary">text-secondary</div>
<div class="text-muted">text-muted</div>
<div class="text-primary">text-primary</div>

<!-- Inverse Color Classes -->
<hr />
<div class="text-inverse bg-secondary">text-inverse</div>

<!-- Context Color Classes -->
<hr />
<div class="text-success">text-success</div>
<div class="text-warning">text-warning</div>
<div class="text-caution">text-caution</div>
<div class="text-info">text-info</div>
<div class="text-danger">text-danger</div>
```

<si-docs-component example="typography/color-variants" height="380"></si-docs-component>

## Using SASS variables

For greater flexibility, apply color variants using SASS.
We recommend using [semantic color tokens](../colors/ui-colors.md):

```scss
@use '@siemens/element-theme/src/styles/variables';

/* Pick the tokens you need: */
color: variables.$element-text-primary;
background-color: variables.$element-base-warning;
```

For a complete list of available tokens, see [\_semantic-tokens](https://github.com/siemens/element/tree/main/projects/element-theme/src/styles/variables/_semantic-tokens.scss).
