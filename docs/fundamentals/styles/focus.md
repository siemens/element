# Focus

Element applies a unified focus ring to interactive elements on [`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) by default. Use the focus utility classes and Sass mixins to adjust the focus ring position or delegate focus styling to child elements.

## Focus position

Control whether the focus outline appears outside, inside, or is hidden on a focused element:

- `.focus-inside`: Moves the focus outline inside the element on `:focus-visible`. Prefer adding padding to the container to keep the default outer focus ring visible. Only use `.focus-inside` when required, such as when an element is flush against container edges or inside an `overflow: hidden` container that cannot have padding.
- `.focus-none`: Removes the focus outline (`outline: none !important`). Only use this when another parent or child element visually indicates the focus state.
- `.focus-default`: Applies the standard outer focus outline on `:focus-visible` (applied to all elements by default).

```html
<!-- Only use .focus-inside when required and the container cannot have padding -->
<div class="overflow-hidden">
  <button type="button" class="btn btn-secondary focus-inside">Inside focus</button>
</div>

<!-- Suppress focus ring on the input when the parent container handles focus styling -->
<input type="text" class="focus-none" aria-label="Search query" />
```

## Using Sass mixins and variables

For custom components or selectors such as [`:focus-within`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-within) and [`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has), use the focus mixins and variables from `@siemens/element-theme/src/styles/variables`:

- `make-outline-focus()`: Applies the standard outer focus `outline` and `outline-offset`.
- `make-outline-focus-inside()`: Applies the inner focus `outline` with a negative `outline-offset`.
- `$focus-style-outline`: The shorthand outline value (`width`, `style`, and `color`).
- `$focus-style-outline-offset`: The standard outer outline offset.
- `$focus-style-outline-inside-offset`: The negative outline offset used for inner focus rings.

```scss
@use '@siemens/element-theme/src/styles/variables';

.custom-input-wrapper:focus-within {
  @include variables.make-outline-focus();
}

.custom-tile:focus-visible {
  @include variables.make-outline-focus-inside();
}
```
