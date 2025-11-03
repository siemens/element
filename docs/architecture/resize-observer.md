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

The resize observer can be integrated into your application using either a service or a directive, depending on your requirements:

- **Service approach:** Use the `ResizeObserverService` to programmatically observe size changes on any element. This is useful when you need fine-grained control or want to react to changes in code.
- **Directive approach:** Apply the `SiResizeObserverDirective` directly in your template to handle resize events declaratively. This is ideal for simple use cases where you want to bind resize logic directly to your component's view.

Choose the method that best fits your application's architecture and complexity.

**Use resize observer service:**

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

**Use resize observer directive:**

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
