# Flex

Flexbox is a powerful one-dimensional layout system that provides efficient ways to align, distribute, and manage space among items in a container, even when their sizes are unknown or dynamic. Element provides a comprehensive suite of utility classes to create responsive layouts quickly without writing custom CSS.

The document covers the following flexbox capabilities:

- **Display & Direction** - Create flex containers and control item flow direction
- **Alignment** - Align items along the main and cross axes
- **Spacing & Sizing** - Control how items grow, shrink, and fill available space
- **Ordering & Wrapping** - Reorder items visually and control multi-line behavior

All utilities support responsive variations using breakpoint modifiers (e.g., `.d-{breakpoint}-flex`), allowing you to adapt layouts across different screen sizes.

## Enable flex behaviors

Use display utility classes to turn an element into a flex container, making its direct children flex items. Once a flex container is established, you can further customize its behavior and the layout of its items using additional flexbox utility classes.

```html
<div class="d-flex p-2">This is a flexbox container!</div>
```

```html
<div class="d-inline-flex p-2">This is a inline flexbox container!</div>
```

For faster mobile-friendly development, use responsive variations for `.d-flex` and `.d-inline-flex` based on breakpoints:

- `.d-{breakpoint}-flex`
- `.d-{breakpoint}-inline-flex`

## Align items

Use `align-items` utility classes on flex containers to control how flex items are aligned along the cross axis (vertically by default, or horizontally when using `flex-direction: column`).
Available options include `start`, `end`, `center`, `baseline`, and `stretch` (the default).

```html
<div class="d-flex align-items-start">...</div>
<div class="d-flex align-items-end">...</div>
<div class="d-flex align-items-center">...</div>
<div class="d-flex align-items-baseline">...</div>
<div class="d-flex align-items-stretch">...</div>
```

<si-docs-component example="flex/flex-align-items" height="150"></si-docs-component>

| Class                   | Responsive variation                 |
| ----------------------- | ------------------------------------ |
| `.align-items-start`    | `.align-items-{breakpoint}-start`    |
| `.align-items-end`      | `.align-items-{breakpoint}-end`      |
| `.align-items-center`   | `.align-items-{breakpoint}-center`   |
| `.align-items-baseline` | `.align-items-{breakpoint}-baseline` |
| `.align-items-stretch`  | `.align-items-{breakpoint}-stretch`  |

## Align self

Use `align-self` utility classes on individual flex items to override the container’s cross-axis alignment for that item only.
Available options include `start`, `end`, `center`, `baseline`, and `stretch` (the default).
The cross axis is vertical by default, or horizontal when using `flex-direction: column`.

```html
<div class="align-self-start">Aligned flex item</div>
<div class="align-self-end">Aligned flex item</div>
<div class="align-self-center">Aligned flex item</div>
<div class="align-self-baseline">Aligned flex item</div>
<div class="align-self-stretch">Aligned flex item</div>
```

<si-docs-component example="flex/flex-align-self" height="150"></si-docs-component>

## Auto margins

Auto margins in flexbox are a convenient way to control spacing and alignment of flex items within a container.
By applying margin utilities such as `.me-auto` (margin-end auto) or `.ms-auto` (margin-start auto) to specific flex items, you can easily push items to one side or distribute available space between them.
The examples below demonstrate: the default layout with no auto margins, using `.me-auto` to push subsequent items to the right, and using `.ms-auto` to push the last item to the far right.
These techniques help you achieve common layout patterns without custom CSS.

```html
<div class="d-flex mb-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
<div class="d-flex mb-3">
  <div class="me-auto">Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
<div class="d-flex mb-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div class="ms-auto">Item 3</div>
</div>
```

<si-docs-component example="flex/flex-auto-margins" height="150"></si-docs-component>

## Align items with auto margins

To vertically position a specific flex item at the top or bottom of a flex container, combine `align-items`, `flex-direction: column`, and auto margins.
Applying `margin-top: auto` pushes an item to the bottom, while `margin-bottom: auto` pushes it to the top.
This technique lets you control vertical alignment of individual items without extra wrappers or custom CSS.

```html
<div class="d-flex align-items-start flex-column mb-3" style="height: 200px;">
  <div class="mb-auto">Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div class="d-flex align-items-end flex-column mb-3" style="height: 200px;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div class="mt-auto">Item 3</div>
</div>
```

<si-docs-component example="flex/flex-align-items-auto-margins" height="200"></si-docs-component>

## Align content

Use `align-content` utilities on flex containers to control how multiple rows of flex items are spaced along the cross axis. Options include `start` (default), `end`, `center`, `between`, `around`, and `stretch`.
These utilities are most effective when the container has wrapping enabled (`flex-wrap: wrap`) and contains enough items to create multiple rows.

> **Note:** `align-content` has no visible effect if your flex container only has a single row of items.

```html
<div class="d-flex align-content-start">...</div>
<div class="d-flex align-content-end">...</div>
<div class="d-flex align-content-center">...</div>
<div class="d-flex align-content-between">...</div>
<div class="d-flex align-content-around">...</div>
<div class="d-flex align-content-stretch">...</div>
```

<si-docs-component example="flex/flex-align-content" height="200"></si-docs-component>

| Class                    | Responsive variation                  |
| ------------------------ | ------------------------------------- |
| `.align-content-start`   | `.align-content-{breakpoint}-start`   |
| `.align-content-end`     | `.align-content-{breakpoint}-end`     |
| `.align-content-center`  | `.align-content-{breakpoint}-center`  |
| `.align-content-between` | `.align-content-{breakpoint}-between` |
| `.align-content-around`  | `.align-content-{breakpoint}-around`  |
| `.align-content-stretch` | `.align-content-{breakpoint}-stretch` |

## Fill

Apply the `.flex-fill` class to multiple sibling elements within a flex container to make each item expand and share the available horizontal space equally. This ensures that all items grow to fill the container, regardless of their content size, resulting in a balanced layout without custom CSS.

```html
<div class="d-flex">
  <div class="flex-fill">Item with a lot of content</div>
  <div class="flex-fill">Item</div>
  <div class="flex-fill">Item</div>
</div>
```

<si-docs-component example="flex/flex-fill" height="150"></si-docs-component>

| Class        | Responsive variation      |
| ------------ | ------------------------- |
| `.flex-fill` | `.flex-{breakpoint}-fill` |

## Direction

Control the direction in which flex items are laid out within a flex container using direction utility classes.
By default, flex containers use a horizontal (`row`) direction, but you may need to explicitly set or override this—especially for responsive designs or when reversing the item order.

- Use `.flex-row` to arrange items horizontally (left to right).
- Use `.flex-row-reverse` to arrange items horizontally in reverse order (right to left).
- Use `.flex-column` to stack items vertically (top to bottom).
- Use `.flex-column-reverse` to stack items vertically in reverse order (bottom to top).

These utilities help you quickly adapt layouts to different design requirements without writing custom CSS.

```html
<div class="d-flex flex-row mb-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
<div class="d-flex flex-row-reverse">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Use `.flex-column` to set a vertical direction, or `.flex-column-reverse` to start the vertical direction from the opposite side.

```html
<div class="d-flex flex-column mb-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
<div class="d-flex flex-column-reverse">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

| Class                  | Responsive variation                |
| ---------------------- | ----------------------------------- |
| `.flex-row`            | `.flex-{breakpoint}-row`            |
| `.flex-row-reverse`    | `.flex-{breakpoint}-row-reverse`    |
| `.flex-column`         | `.flex-{breakpoint}-column`         |
| `.flex-column-reverse` | `.flex-{breakpoint}-column-reverse` |

<si-docs-component example="flex/flex-direction" height="100"></si-docs-component>

## Grow and shrink

Use `.flex-grow-*` utilities to control how much a flex item expands to fill available space within a flex container.
Applying `.flex-grow-1` to an item allows it to grow and occupy any remaining space, while items without this class will only take up as much space as their content requires.

```html
<div class="d-flex">
  <div class="flex-grow-1">Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

Use `.flex-shrink-*` utility classes to control whether a flex item can shrink when there isn’t enough space in a flex container.
In the example below, the second flex item uses `.flex-shrink-1`, allowing it to shrink and wrap its contents onto a new line.
This makes more space available for the first flex item, which uses `.w-100` to take up the full width.

```html
<div class="d-flex">
  <div class="w-100">Item</div>
  <div class="flex-shrink-1">Item</div>
</div>
```

| Class                    | Responsive variation                  |
| ------------------------ | ------------------------------------- |
| `.flex-{grow\|shrink}-0` | `.flex-{breakpoint}-{grow\|shrink}-0` |
| `.flex-{grow\|shrink}-1` | `.flex-{breakpoint}-{grow\|shrink}-1` |

## Justify content

Use `justify-content` utility classes on flex containers to control how flex items are distributed along the main axis (horizontal by default, vertical if using `flex-direction: column`).
These classes let you align items to the start, end, center, or distribute them with equal spacing using `between`, `around`, or `evenly`.

```html
<div class="d-flex justify-content-start">...</div>
<div class="d-flex justify-content-end">...</div>
<div class="d-flex justify-content-center">...</div>
<div class="d-flex justify-content-between">...</div>
<div class="d-flex justify-content-around">...</div>
<div class="d-flex justify-content-evenly">...</div>
```

<si-docs-component example="flex/flex-justify-content" height="150"></si-docs-component>

| Class                      | Responsive variation                    |
| -------------------------- | --------------------------------------- |
| `.justify-content-start`   | `.justify-content-{breakpoint}-start`   |
| `.justify-content-end`     | `.justify-content-{breakpoint}-end`     |
| `.justify-content-center`  | `.justify-content-{breakpoint}-center`  |
| `.justify-content-between` | `.justify-content-{breakpoint}-between` |
| `.justify-content-around`  | `.justify-content-{breakpoint}-around`  |
| `.justify-content-evenly`  | `.justify-content-{breakpoint}-evenly`  |

## Order

Use `order` utility classes to visually rearrange the sequence of flex items within a container, independent of their order in the HTML markup.
These utilities are helpful for responsive layouts where you want to change the display order of items at different breakpoints, highlight specific content, or create more accessible tab flows.
The provided classes let you move an item to the first or last position, or reset it to its original DOM order.
For more granular control, you can assign integer values from 0 to 5; if you need additional values, add custom CSS.

```html
<div class="d-flex flex-nowrap">
  <div class="order-3 p-2">Item 1</div>
  <div class="order-2 p-2">Item 2</div>
  <div class="order-1 p-2">Item 3</div>
</div>
```

<si-docs-component example="flex/flex-order" height="150"></si-docs-component>

| Class      | Responsive variation    |
| ---------- | ----------------------- |
| `.order-0` | `.order-{breakpoint}-0` |
| `.order-1` | `.order-{breakpoint}-1` |
| `.order-2` | `.order-{breakpoint}-2` |
| `.order-3` | `.order-{breakpoint}-3` |
| `.order-4` | `.order-{breakpoint}-4` |
| `.order-5` | `.order-{breakpoint}-5` |

You can also use responsive `.order-first` and `.order-last` classes to move an element to the start (`order: -1`) or end (`order: 6`) of the flex container at specific breakpoints.

| Class          | Responsive variation        |
| -------------- | --------------------------- |
| `.order-first` | `.order-{breakpoint}-first` |
| `.order-last`  | `.order-{breakpoint}-last`  |

## Wrap

Control how flex items wrap within a flex container using wrap utilities. Use `.flex-nowrap` to keep all items on a single line (default browser behavior), which can cause items to overflow if there isn’t enough space.
Apply `.flex-wrap` to allow items to move onto multiple lines as needed, preventing overflow and improving responsiveness.
Use `.flex-wrap-reverse` to wrap items onto multiple lines in the reverse direction, which can be useful for specific layout requirements.

```html
<div class="d-flex flex-nowrap"> ... </div>
```

```html
<div class="d-flex flex-wrap"> ... </div>
```

```html
<div class="d-flex flex-wrap-reverse"> ... </div>
```

<si-docs-component example="flex/flex-wrap" height="150"></si-docs-component>

| Class                | Responsive variation              |
| -------------------- | --------------------------------- |
| `.flex-nowrap`       | `.flex-{breakpoint}-nowrap`       |
| `.flex-wrap`         | `.flex-{breakpoint}-wrap`         |
| `.flex-wrap-reverse` | `.flex-{breakpoint}-wrap-reverse` |
