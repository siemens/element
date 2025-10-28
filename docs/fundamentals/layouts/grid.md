# Flexbox grid

The **flexbox grid** is used to create layouts of any complexity using a 12-column system, six responsive [breakpoints](./breakpoints.md), and a wide range of predefined utility classes. The grid system is based on the well-known and beloved Bootstrap grid.

## Overview

Here’s an overview of how the grid system functions:

- The grid features six responsive breakpoints, each defined by `min-width` media queries. Classes like `.col-sm-4` apply to the specified breakpoint and all larger ones (e.g., `sm`, `md`, `lg`, `xl`, and `xxl`), giving you granular control over container and column behavior at every screen size.
- **Containers** center your content and provide horizontal padding. Use `.container` for a responsive fixed width, `.container-fluid` for full-width layouts across all devices, or breakpoint-specific containers (e.g., `.container-md`) for a mix of fluid and fixed widths.
- **Rows** act as wrappers for columns and manage horizontal spacing (gutters) between columns. Negative margins on rows offset the column padding, ensuring content aligns neatly along the left edge. Rows also support modifier classes for consistent column sizing and customizable gutter spacing.
- **Columns** are highly flexible, with 12 available per row. You can combine columns in any configuration, and column classes (e.g., `.col-4`) specify how many columns an element should span. All widths are set in percentages, ensuring consistent relative sizing across breakpoints.
- **Gutters** the spaces between columns — are fully responsive and customizable. Use gutter utility classes like `.gx-*` for horizontal spacing, `.gy-*` for vertical spacing, or `.g-*` for both. To remove gutters entirely, use `.g-0`.

## Column layout

### Equal-width columns

By using the `.col` class, columns automatically divide available space evenly, adapting to any number of columns and all breakpoints.

```html
<div class="container text-center">
  <div class="row">
    <div class="col">Col 1</div>
    <div class="col">Col 2</div>
  </div>
  <div class="row">
    <div class="col">Col 1</div>
    <div class="col">Col 2</div>
    <div class="col">Col 3</div>
  </div>
</div>
```

### Setting column span

With the grid auto-layout, you can specify the width of one column while allowing the remaining columns to automatically adjust and share the available space.
This can be achieved using predefined grid classes (as shown below) or inline styles.
Regardless of the width you set for a specific column, its siblings will flexibly resize to fill the row, ensuring a balanced and responsive layout.

```html
<div class="container text-center">
  <div class="row">
    <div class="col">Col 1</div>
    <div class="col-6">Col 2 (wider)</div>
    <div class="col">Col 3</div>
  </div>
  <div class="row">
    <div class="col">Col 1</div>
    <div class="col-5">Col 2 (wider)</div>
    <div class="col">Col 3</div>
  </div>
</div>
```

### Variable width content

To automatically size columns according to their content, use the `col-{breakpoint}-auto` classes. These classes allow a column to expand just enough to fit its content, rather than occupying a fixed portion of the grid.
This is especially useful for layouts with variable-width elements, such as buttons or labels, ensuring your grid remains flexible and visually balanced across different screen sizes.

```html
<div class="container text-center">
  <div class="row justify-content-md-center">
    <div class="col col-lg-2">Col 1</div>
    <div class="col-md-auto">Variable width content</div>
    <div class="col col-lg-2">Col 3</div>
  </div>
  <div class="row">
    <div class="col">Col 1</div>
    <div class="col-md-auto">Variable width content</div>
    <div class="col col-lg-2">Col 3</div>
  </div>
</div>
```

## Responsive classes

The grid system provides six tiers of predefined classes, enabling you to build sophisticated layouts that adapt seamlessly across all device sizes.
You can tailor the width of your columns for extra small, small, medium, large, extra large, and extra extra large screens, ensuring optimal presentation on any device.

### All breakpoints

To create grids that maintain the same structure from the smallest to the largest screens, use the `.col` and `.col-*` classes. The `.col` class automatically distributes available space evenly among columns, while `.col-*` lets you specify the exact number of columns an element should span. Use numbered classes when you need precise control over column width; otherwise, `.col` provides a flexible, responsive layout.

```html
<div class="container text-center">
  <div class="row">
    <div class="col">col</div>
    <div class="col">col</div>
    <div class="col">col</div>
    <div class="col">col</div>
  </div>
  <div class="row">
    <div class="col-8">col-8</div>
    <div class="col-4">col-4</div>
  </div>
</div>
```

### Stacked to horizontal

By applying `.col-sm-*` classes, you can build a grid that stacks columns vertically on extra small screens and arranges them horizontally starting at the small (`sm`) breakpoint.
This approach ensures your layout is mobile-friendly by default, then transitions to a horizontal format as the viewport widens, providing a seamless and responsive experience across devices.

```html
<div class="container text-center">
  <div class="row">
    <div class="col-sm-8">col-sm-8</div>
    <div class="col-sm-4">col-sm-4</div>
  </div>
  <div class="row">
    <div class="col-sm">col-sm</div>
    <div class="col-sm">col-sm</div>
    <div class="col-sm">col-sm</div>
  </div>
</div>
```

### Mix and match

You can combine different grid classes across breakpoints to achieve complex, adaptive layouts. Instead of having columns stack or remain uniform at every screen size, apply unique class combinations for each tier to control how columns behave as the viewport changes.
The example below demonstrates how you can mix and match classes to create layouts that respond intelligently to different devices.

```html
<div class="container text-center">
  <!-- Stack the columns on mobile by making one full-width and the other half-width -->
  <div class="row">
    <div class="col-md-8">.col-md-8</div>
    <div class="col-6 col-md-4">.col-6 .col-md-4</div>
  </div>

  <!-- Columns start at 50% wide on mobile and bump up to 33.3% wide on desktop -->
  <div class="row">
    <div class="col-6 col-md-4">.col-6 .col-md-4</div>
    <div class="col-6 col-md-4">.col-6 .col-md-4</div>
    <div class="col-6 col-md-4">.col-6 .col-md-4</div>
  </div>

  <!-- Columns are always 50% wide, on mobile and desktop -->
  <div class="row">
    <div class="col-6">.col-6</div>
    <div class="col-6">.col-6</div>
  </div>
</div>
```

### Row columns

Easily control the number of columns in a row using responsive `.row-cols-*` classes. Unlike `.col-*` classes, which are applied to individual columns to set their width, `.row-cols-*` classes are added to the parent `.row` element to define how many columns should be displayed per row.

For example, `.row-cols-2` will automatically arrange child columns into two columns per row, regardless of how many `.col` elements are present.
The `.row-cols-auto` class allows columns to size themselves naturally based on their content, rather than enforcing a fixed number per row.

These classes are ideal for quickly building simple grid layouts or managing the arrangement of cards and other components, providing a flexible shortcut for responsive design.

```html
<div class="container text-center">
  <!-- Create 2 column grid -->
  <div class="row row-cols-2">...</div>
</div>
<div class="container text-center">
  <!-- Create 3 column grid -->
  <div class="row row-cols-3">...</div>
</div>
<div class="container text-center">
  <!-- Create 4 column grid -->
  <div class="row row-cols-4">...</div>
</div>
<div class="container text-center">
  <div class="row row-cols-auto">...</div>
</div>
```

<si-docs-component example="grid-system/grid-row-cols" height="150"></si-docs-component>

Create a grid that dynamically adapts the number of columns to the screen size using responsive `.row-cols-*` classes. These classes allow you to specify how many columns should be displayed at each breakpoint, ensuring your layout remains visually balanced and user-friendly across all devices.

For example, the following setup will display one column on extra small screens, two columns on small screens, and four columns on medium screens and above:

```html
<div class="container text-center">
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-4">
    <div class="col">Col</div>
    <div class="col">Col</div>
    <div class="col">Col</div>
    <div class="col">Col</div>
  </div>
</div>
```
