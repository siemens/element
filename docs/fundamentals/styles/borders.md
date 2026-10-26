# Borders

Customize the borders and border-radius of elements using border utility classes. These utilities are ideal for styling images, buttons, and various other components with minimal effort.

## Add borders

Add borders to elements:

```html
<span class="border"></span>
<span class="border-top"></span>
<span class="border-end"></span>
<span class="border-bottom"></span>
<span class="border-start"></span>
```

## Remove borders

Remove borders from elements:

```html
<span class="border border-0"></span>
<span class="border border-top-0"></span>
<span class="border border-end-0"></span>
<span class="border border-bottom-0"></span>
<span class="border border-start-0"></span>
```

## Radius

Add `4px` rounded corners to an element:

```html
<span class="rounded"></span>
<span class="rounded-top"></span>
<span class="rounded-end"></span>
<span class="rounded-bottom"></span>
<span class="rounded-start"></span>
```

Customize the radius using the following utils:

```html
<span class="rounded-0"></span>
<span class="rounded-1"></span>
<span class="rounded-2"></span>
<span class="rounded-circle">Circle</span>
<span class="rounded-pill">Rounded</span>
```

> **Note:** Since `rounded-2` is the default shape for _Element_, it is possible to use the shorthand `rounded` CSS class.

## AI gradient borders

Add a 1px gradient border to any element using the AI border utility classes.
The gradient border is rendered via a masked pseudo-element and works with both opaque and transparent backgrounds.

| Class                   | Description                                |
| ----------------------- | ------------------------------------------ |
| `.border-horizontal-ai` | Horizontal (left-to-right) gradient border |
| `.border-vertical-ai`   | Vertical (top-to-bottom) gradient border   |

The element must have a `border-radius` set for the gradient to follow the rounded shape.

```html
<span class="badge border-horizontal-ai">AI generated</span>
<div class="card border-vertical-ai">...</div>
```

## Examples

<si-docs-component example="borders/borders" height="300"></si-docs-component>

<si-docs-component example="shapes/shapes" height="300"></si-docs-component>

<si-docs-component example="ai-border/ai-border" height="300"></si-docs-component>
