# Spinner

**Spinners** are visual indicators that an app is loading content or performing another process that
the user needs to wait for. They provide visual feedback that the system is working but don't
provide information about how long a user will have to wait.

## Usage ---

Spinners can be used in many different locations, e.g. cards, lists, empty screens etc.

### When to use

- To inform the user that something is happening.
- While handling asynchronous requests.

### Best practices

- Use spinners only for fast actions (2–10 seconds). A users will loose patience if it takes longer than that.
- Keep loading comments concise and short.
- Make the spinner visible, e.g. with a [backdrop](../../patterns/backdrop.md) if necessary, do not overlap with the content beneath.
- Keep the number of loading indicators on a single page to a minimum. Cluster them on a higher level (e.g. with a [backdrop](../../patterns/backdrop.md)) if needed.

## Code ---

### Usage

```ts
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';

@Component({
  imports: [SiLoadingSpinnerComponent, ...]
})
```

<si-docs-component example="si-loading-spinner/si-loading-spinner" height="200"></si-docs-component>

<si-docs-api component="SiLoadingSpinnerComponent"></si-docs-api>

### Spinner directive

You can use loading spinner directive to enable the spinner on a specific element.

<si-docs-component example="si-loading-spinner/si-loading-spinner-directive" height="200"></si-docs-component>

Additionally, you can enable semi-transparent overlay and initial loading time for the spinner to be displayed.

<si-docs-component example="si-loading-spinner/si-loading-spinner-delay" height="200"></si-docs-component>

<si-docs-api directive="SiLoadingSpinnerDirective"></si-docs-api>

### Loading button

Use the `si-loading-button` component when you need to show a loading indicator
on a button. The `si-loading-button` is implemented as a wrapper around a normal
HTML button. The most important button properties are routed through and are
accessible via the wrapper.

<si-docs-component example="si-loading-spinner/si-loading-button" height="200"></si-docs-component>

<si-docs-api component="SiLoadingButtonComponent"></si-docs-api>

<si-docs-types></si-docs-types>
