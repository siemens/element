# Gutters

Gutters are the paddings between columns in the [grid system](./grid.md#overview),
providing responsive separation and alignment for the content.

## Overview

- Gutters refer to the horizontal gaps between column content, achieved by applying padding to the start and end of each column. Negative margins on the row ensure content remains properly aligned at the edges.
- By default, gutters are `1rem` (`16px`) wide, matching the grid’s spacing scale for consistent layout.
- Gutters can be adjusted responsively using breakpoint-specific classes, allowing you to control horizontal, vertical, or both types of spacing as needed.

## Horizontal gutters

Use `.gx-*` classes to adjust the horizontal spacing between columns.
When applying larger gutter widths, you may need to increase the horizontal padding on the parent `.container` or `.container-fluid` to prevent content overflow.
For instance, in the example below, `.px-4` is added to the container to match the gutter size and maintain proper alignment.

```html
<div class="container px-4 text-center">
  <div class="row gx-5">
    <div class="col">
      <div class="p-3">Custom column padding 1</div>
    </div>
    <div class="col">
      <div class="p-3">Custom column padding 2</div>
    </div>
  </div>
</div>
```

Alternatively, you can wrap the `.row` element with a parent that uses the `.overflow-hidden` class.
This approach ensures that any overflow caused by increased gutter spacing is clipped, maintaining a clean and aligned layout.

```html
<div class="container overflow-hidden text-center">
  <div class="row gx-5">
    <div class="col">
      <div class="p-3">Custom column padding 1</div>
    </div>
    <div class="col">
      <div class="p-3">Custom column padding 2</div>
    </div>
  </div>
</div>
```

## Vertical gutters

Use `.gy-*` classes to adjust the vertical spacing between rows when columns wrap onto new lines.
Vertical gutters help maintain consistent separation and alignment throughout your grid layout.

Similar to horizontal gutters, larger vertical gutters may result in overflow below the `.row`, especially at the bottom of a page.
To prevent unwanted overflow, wrap the `.row` with a parent element that uses the `.overflow-hidden` class:

```html
<div class="container overflow-hidden text-center">
  <div class="row gy-5">
    <div class="col-6">
      <div class="p-3">Custom column padding 1</div>
    </div>
    <div class="col-6">
      <div class="p-3">Custom column padding 2</div>
    </div>
    <div class="col-6">
      <div class="p-3">Custom column padding 3</div>
    </div>
    <div class="col-6">
      <div class="p-3">Custom column padding 4</div>
    </div>
  </div>
</div>
```

## Horizontal & vertical gutters

To adjust both horizontal and vertical spacing between grid columns and rows, use the `.g-*` classes.
These classes apply equal gutter widths in both directions, simplifying layout management.
In the example below, a smaller gutter size is used, so the `.overflow-hidden` wrapper is not necessary.

```html
<div class="container text-center">
  <div class="row g-2">
    <div class="col-6">
      <div class="p-3">Custom column padding 1</div>
    </div>
    <div class="col-6">
      <div class="p-3">Custom column padding 2</div>
    </div>
    <div class="col-6">
      <div class="p-3">Custom column padding 3</div>
    </div>
    <div class="col-6">
      <div class="p-3">Custom column padding 4</div>
    </div>
  </div>
</div>
```

## Gutters with row columns

You can apply gutter classes to [row columns](./grid.md#row-columns) for flexible spacing in responsive layouts. In the example below, both row column and gutter classes are used with breakpoint-specific options to control the number of columns and gutter size across different screen sizes.

```html
<div class="container text-center">
  <div class="row row-cols-2 row-cols-lg-5 g-2 g-lg-3">
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
    <div class="col">
      <div class="p-3">Row column</div>
    </div>
  </div>
</div>
```

This approach lets you easily adjust both the number of columns and the gutter spacing at different breakpoints, ensuring your grid remains visually balanced and responsive.

## No gutters

To create layouts without any spacing between columns, use the `.g-0` class. This removes both the negative margins from the `.row` and the horizontal padding from its immediate column children, resulting in a seamless, edge-to-edge grid.

If you want a true edge-to-edge design, omit the parent `.container` or `.container-fluid` and add `.mx-0` to the `.row` to eliminate any horizontal overflow.

You can combine `.g-0` with other grid classes, such as column widths, responsive breakpoints, and reordering utilities, for flexible and precise layouts.

```html
<div class="row g-0 text-center">
  <div class="col-sm-6 col-md-8">.col-sm-6 .col-md-8</div>
  <div class="col-6 col-md-4">.col-6 .col-md-4</div>
</div>
```

## Examples

<si-docs-component example="grid-system/gutters" height="150"></si-docs-component>
