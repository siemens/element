# Position

The position utilities allow you to control how elements are placed within the document flow. Each class corresponds to a value of the CSS [position](https://developer.mozilla.org/en-US/docs/Web/CSS/position) property:

- `.position-static`: Positions the element according to the normal document flow (default behavior).
- `.position-relative`: Keeps the element in the normal flow, but allows it to be offset relative to itself using `top`, `right`, `bottom`, or `left`.
- `.position-absolute`: Removes the element from the normal flow and positions it relative to its nearest positioned ancestor or the initial containing block.
- `.position-fixed`: Removes the element from the normal flow and positions it relative to the viewport, so it stays in place when scrolling.
- `.position-sticky`: Positions the element based on the normal flow, but switches to fixed positioning when it reaches a defined scroll position within its nearest scrolling ancestor.

```html
<div class="position-static">...</div>
<div class="position-relative">...</div>
<div class="position-absolute">...</div>
<div class="position-fixed">...</div>
<div class="position-sticky">...</div>
```

## Arrange elements

Arrange elements using edge positioning utilities with the notation `{property}-{position}`.

**Property** specifies the edge to position against:

- `top` – aligns to the top edge
- `start` – aligns to the left edge (in LTR layouts)
- `bottom` – aligns to the bottom edge
- `end` – aligns to the right edge (in LTR layouts)

**Position** defines the offset from that edge:

- `0` – positions at 0% (flush with the edge)
- `50` – positions at 50% (centered along that axis)
- `100` – positions at 100% (opposite edge)

Combine these utilities to precisely control element placement within a container.

```html
<div class="position-relative">
  <div class="position-absolute top-0 start-0"></div>
  <div class="position-absolute top-0 end-0"></div>
  <div class="position-absolute top-50 start-50"></div>
  <div class="position-absolute bottom-50 end-50"></div>
  <div class="position-absolute bottom-0 start-0"></div>
  <div class="position-absolute bottom-0 end-0"></div>
</div>
```

<si-docs-component example="position/position-arrangement" height="300"></si-docs-component>

## Center elements

To center elements within a container, use the `.translate-middle` utility class. This class applies both `translateX(-50%)` and `translateY(-50%)` transforms, enabling perfect centering when combined with edge positioning utilities like `top-50` and `start-50`.

For centering along only one axis, use `.translate-middle-x` to center horizontally or `.translate-middle-y` to center vertically. These classes apply `translateX(-50%)` or `translateY(-50%)` respectively, allowing for flexible alignment based on your layout needs.

```html
<div class="position-relative">
  <div class="position-absolute top-0 start-0 translate-middle"></div>
  <div class="position-absolute top-0 start-50 translate-middle"></div>
  <div class="position-absolute top-0 start-100 translate-middle"></div>
  <div class="position-absolute top-50 start-0 translate-middle"></div>
  <div class="position-absolute top-50 start-50 translate-middle"></div>
  <div class="position-absolute top-50 start-100 translate-middle"></div>
  <div class="position-absolute top-100 start-0 translate-middle"></div>
  <div class="position-absolute top-100 start-50 translate-middle"></div>
  <div class="position-absolute top-100 start-100 translate-middle"></div>
</div>
```

```html
<div class="position-relative">
  <div class="position-absolute top-0 start-0"></div>
  <div class="position-absolute top-0 start-50 translate-middle-x"></div>
  <div class="position-absolute top-0 end-0"></div>
  <div class="position-absolute top-50 start-0 translate-middle-y"></div>
  <div class="position-absolute top-50 start-50 translate-middle"></div>
  <div class="position-absolute top-50 end-0 translate-middle-y"></div>
  <div class="position-absolute bottom-0 start-0"></div>
  <div class="position-absolute bottom-0 start-50 translate-middle-x"></div>
  <div class="position-absolute bottom-0 end-0"></div>
</div>
```

<si-docs-component example="position/position-center" height="300"></si-docs-component>
