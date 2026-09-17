# Colors

Use color utility classes to convey meaning and enhance readability.

Apply color to text elements using the following classes:

```html
<!-- Default Text Color -->
<div class="text-primary">default</div>

<!-- Text Color Classes -->
<hr />
<div class="text-secondary">text-secondary</div>
<div class="text-disabled">text-disabled</div>
<div class="text-accent">text-accent</div>

<!-- Inverse Color Classes -->
<hr />
<div class="text-inverse background-neutral">text-inverse</div>

<!-- Context Color Classes -->
<hr />
<div class="text-success">text-success</div>
<div class="text-warning">text-warning</div>
<div class="text-caution">text-caution</div>
<div class="text-information">text-information</div>
<div class="text-danger">text-danger</div>
```

<si-docs-component example="typography/color-variants" height="840"></si-docs-component>

## Using SASS variables

For greater flexibility, apply color variants using SASS.
We recommend using [semantic color tokens](../colors/ui-colors.md):

```scss
@use '@siemens/element-theme/src/styles/variables';

/* Pick the tokens you need: */
color: variables.$si-sys-color-text-primary;
background-color: variables.$si-sys-color-background-warning-subtle;
```

For a complete list of system and reference tokens, see the
[@siemens-ux/design-tokens documentation](https://code.siemens.com/ux/sdl).
