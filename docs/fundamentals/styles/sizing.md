# Sizing

Apply dimensional constraints to elements through sizing utility classes that manage width and height properties.

## Parent-relative dimensions

Sizing utilities allow elements to scale proportionally based on their containing element's size.
Available presets include `25%`, `50%`, `75%`, `100%`, and `auto` sizing options.

```html
<div class="w-25 p-3 mb-5">Width 25%</div>
<div class="w-50 p-3 mb-5">Width 50%</div>
<div class="w-75 p-3 mb-5">Width 75%</div>
<div class="w-100 p-3 mb-5">Width 100%</div>
<div class="w-auto p-3 mb-5">Width auto</div>
```

```html
<div style="height: 100px;">
  <div class="h-25 d-inline-block" style="width: 120px;">Height 25%</div>
  <div class="h-50 d-inline-block" style="width: 120px;">Height 50%</div>
  <div class="h-75 d-inline-block" style="width: 120px;">Height 75%</div>
  <div class="h-100 d-inline-block" style="width: 120px;">Height 100%</div>
  <div class="h-auto d-inline-block" style="width: 120px;">Height auto</div>
</div>
```

<si-docs-component example="sizing/parent-relative-dimensions" height="300"></si-docs-component>

Maximum dimension constraints can be applied when needed to prevent elements from exceeding specific thresholds.

```html
<div style="inline-size: 50%; block-size: 100px">
  <div class="mw-100 p-3" style="inline-size: 200%">Max-width 100%</div>
</div>
```

```html
<div style="inline-size: 50%; block-size: 100px">
  <div class="mh-100 p-3" style="inline-size: 100px; block-size: 200px">Max-height 100%</div>
</div>
```

<si-docs-component example="sizing/max-size" height="300"></si-docs-component>

## Viewport-based dimensions

Dimension utilities can also reference the browser viewport dimensions, enabling elements to size themselves according to the visible screen area.

```html
<div class="min-vw-100">Min-width 100vw</div>
<div class="min-vh-100">Min-height 100vh</div>
<div class="vw-100">Width 100vw</div>
<div class="vh-100">Height 100vh</div>
```
