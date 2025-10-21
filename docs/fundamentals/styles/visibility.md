# Visibility

Control the visibility of elements without affecting their layout using visibility utility classes.

The `.visible` and `.invisible` classes toggle the CSS [visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/visibility) property.
Unlike `display: none`, elements with `.invisible` remain in the document flow and still occupy space on the page.

Use `.visible` to make an element visible, or `.invisible` to hide it while preserving its layout space.

```html
<div class="invisible">...</div> <div class="visible">...</div>
```

<si-docs-component example="visibility/visibility" height="300"></si-docs-component>
