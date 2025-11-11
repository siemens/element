# Display

Responsive display utilities for controlling element visibility and layout behavior across breakpoints. Built on CSS [display](https://developer.mozilla.org/en-US/docs/Web/CSS/display) property with mobile-first responsive design and optimized for modern development workflows.

## How it works

Change the value of the display property with our responsive display utility classes. We purposely support only a subset of all possible values for display. Classes can be combined for various effects as you need.

## Notation

Display utility classes that apply to all breakpoints, from `xs` to `xxl`, have no breakpoint abbreviation in them. This is because those classes are applied from `min-width: 0;` and up, and thus are not bound by a media query. The remaining breakpoints, however, do include a breakpoint abbreviation.

As such, the classes are named using the format:

- `.d-{value}` for `xs`
- `.d-{breakpoint}-{value}` for `sm`, `md`, `lg`, `xl`, and `xxl`.

Supported display values:

| Class Suffix | CSS Property | Use Case |
|--------------|--------------|-----------|
| `none` | `display: none` | Hide elements completely |
| `block` | `display: block` | Block-level elements |
| `inline` | `display: inline` | Inline elements |
| `inline-block` | `display: inline-block` | Inline with block properties |
| `flex` | `display: flex` | Flexbox containers |
| `inline-flex` | `display: inline-flex` | Inline flexbox containers |
| `grid` | `display: grid` | CSS Grid containers |
| `inline-grid` | `display: inline-grid` | Inline grid containers |
| `table` | `display: table` | Table layout |
| `table-row` | `display: table-row` | Table row elements |
| `table-cell` | `display: table-cell` | Table cell elements |

The media queries affect screen widths with the given breakpoint or larger. For example, `.d-lg-none` sets `display: none;` on `lg`, `xl`, and `xxl` screens.

## Hiding elements

For faster mobile-friendly development, use responsive display classes for showing and hiding elements by device. Avoid creating entirely different versions of the same site, instead hide elements responsively for each screen size.

To hide elements simply use the `.d-none` class or one of the `.d-{sm,md,lg,xl,xxl}-none` classes for any responsive screen variation.

To show an element only on a given interval of screen sizes you can combine one `.d-*-none` class with a `.d-*-*` class, for example `.d-none` `.d-md-block` `.d-xl-none` will hide the element for all screen sizes except on medium and large devices.

| Screen size | Class |
| ----------- | ----- |
| Hidden on all | `.d-none` |
| Hidden only on xs | `.d-none` `.d-sm-block` |
| Hidden only on sm | `.d-sm-none` `.d-md-block` |
| Hidden only on md | `.d-md-none` `.d-lg-block` |
| Hidden only on lg | `.d-lg-none` `.d-xl-block` |
| Hidden only on xl | `.d-xl-none` `.d-xxl-block` |
| Hidden only on xxl | `.d-xxl-none` |
| Visible on all | `.d-block` |
| Visible only on xs | `.d-block` `.d-sm-none` |
| Visible only on sm | `.d-none` `.d-sm-block` `.d-md-none` |
| Visible only on md | `.d-none` `.d-md-block` `.d-lg-none` |
| Visible only on lg | `.d-none` `.d-lg-block` `.d-xl-none` |
| Visible only on xl | `.d-none` `.d-xl-block` `.d-xxl-none` |
| Visible only on xxl | `.d-none` `.d-xxl-block` |

```html
<div class="d-lg-none">hide on lg and wider screens</div>
<div class="d-none d-lg-block">hide on screens smaller than lg</div>
```

## Display in print

Optimize layouts for print media using dedicated print utilities:

- `.d-print-none`
- `.d-print-inline`
- `.d-print-inline-block`
- `.d-print-block`
- `.d-print-grid`
- `.d-print-table`
- `.d-print-table-row`
- `.d-print-table-cell`
- `.d-print-flex`
- `.d-print-inline-flex`

The print and display classes can be combined.

## Examples

<si-docs-component example="display/display" height="300"></si-docs-component>
