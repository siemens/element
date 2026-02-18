# Z-Index

The low-level z-index utilities allow to change the stack level of an element or component.

## Example

Apply `z-index` utilities to layer elements above or below each other. These classes require the element to have a positioning context other than `static`, which you can set using custom styles or the provided position utilities.

```html
<div class="z-3 position-absolute p-5 rounded-3"><span>z-3</span></div>
<div class="z-2 position-absolute p-5 rounded-3"><span>z-2</span></div>
<div class="z-1 position-absolute p-5 rounded-3"><span>z-1</span></div>
<div class="z-0 position-absolute p-5 rounded-3"><span>z-0</span></div>
<div class="z-n1 position-absolute p-5 rounded-3"><span>z-n1</span></div>
```

<si-docs-component example="z-index/z-index" height="300"></si-docs-component>
