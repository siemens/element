# Resize observer

The resize observer allows to react on element's size changes triggered by user interaction.

## Usage ---

## When to use

- Adapt an element's layout based on its own size, not just the viewport.
  For example, changing styles for a specific sidebar when its container is resized.
- When model changes are required or an adjustment via javascript is necessary.

## When not to use

Prefer a pure CSS solution e.g.:

- **Viewport-based responsiveness** CSS media queries provide a powerful alternative and the element CSS utils allow to apply different behaviors based on [breakpoints](../fundamentals/layouts/breakpoints.md).
- **Container-based responsiveness** [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) provide powerful alternative to build responsive layouts.

## Code ---

The resize observer APIs share one root-provided registry and one native `ResizeObserver` instance. Choose the API based on how the size is consumed:

- **Signal approach (experimental):** Use `elementSizeSignal` for components and directives that consume dimensions as signal state. It supports static and signal-based element sources and cleans up automatically.
- **Service approach:** Use the `ResizeObserverService` when an RxJS stream, throttling, or immediate emissions are required.
- **Directive approach:** Apply the `SiResizeObserverDirective` directly in your template to handle resize events declaratively. This is ideal for simple use cases where you want to bind resize logic directly to your component's view.

**Use the resize observer signal:**

```ts
import { computed, ElementRef, inject } from '@angular/core';
import { elementSizeSignal } from '@siemens/element-ng/resize-observer';

private readonly element = inject(ElementRef<HTMLElement>);
private readonly size = elementSizeSignal(this.element, { box: 'border-box' });
readonly inlineSize = computed(() => this.size()?.inlineSize);
```

The returned signal contains the logical `inlineSize` and `blockSize` of the configured box (`content-box` by default). It is `undefined` until the first observation, while a signal source has no element, after switching sources until the new element is measured, when the selected box has no reported fragments, and when `ResizeObserver` is unavailable. Do not fall back to a synchronous layout read while it is `undefined`; wait for the signal to update.

**Use the resize observer service:**

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeObserverService } from '@siemens/element-ng/resize-observer';

inject(ResizeObserverService)
  .observe(inject(ElementRef<HTMLElement>).nativeElement, 100)
  .pipe(takeUntilDestroyed())
  .subscribe(event => {
    /* Handle size change */
  });
```

**Use the resize observer directive:**

```ts
import { Component } from '@angular/core';
import { ElementDimensions, SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'sample',
  imports: [SiResizeObserverDirective],
  template: `<div (siResizeObserver)="resize($event)"></div>`
})
export class SampleComponent {
  resize(e: ElementDimensions): void {
    // Handle size changes
  }
}
```
