# Message loader

Use the **message loader** inside a [chat message](chat-message.md) to indicate that a reply is
being generated or fetched. The three dots signal that a response is pending, not how much of the
request has completed.

## Usage ---

Use the message loader only for pending chat messages. For general page, section, or control
loading outside of a chat conversation, use a [spinner](../progress-indication/spinner.md) or
[skeleton](../progress-indication/skeleton.md) instead.

Place the loader at the start of the expected reply. Replace it as soon as the first content
arrives, even if the rest is still streaming. On failure, replace it with an error message;
on cancellation, remove it. Keep focus on the user's current control.

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

<si-docs-component example="si-chat-messages/si-message-loader" height="100"></si-docs-component>

<si-docs-api component="SiMessageLoaderComponent"></si-docs-api>
