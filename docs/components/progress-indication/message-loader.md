# Message loader

Use the message loader where a text response will appear: for example, an assistant reply,
a support message, or a generated summary in a panel. The three dots indicate that a response
is pending, not how much of the request has completed.

## Usage ---

Place the loader at the start of the expected reply. Replace it as soon as the first content
arrives, even if the rest is still streaming. On failure, replace it with an error message;
on cancellation, remove it. Keep focus on the user's current control.

For page or control loading that does not produce a message, use a [spinner](spinner.md) instead.
The loader announces its status to screen readers when it appears and stays still when animations
are disabled or reduced motion is requested. Set `loadingText` to a short, localized status when
the default wording is too generic.

## Code ---

Import `SiMessageLoaderComponent` from `@siemens/element-ng/message-loader` and render it
only while waiting for the reply:

```html
@if (awaitingReply()) {
  <si-message-loader />
}
```

<si-docs-component example="si-message-loader/si-message-loader" height="100"></si-docs-component>

<si-docs-api component="SiMessageLoaderComponent"></si-docs-api>