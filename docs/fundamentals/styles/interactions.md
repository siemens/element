# Interactions

Utility classes that modify user interaction with website content, enabling control over text selection and pointer events.

## Text selection

Element provides utility classes to control how users can select text on your website.

- `.user-select-all`: Makes the entire element selectable when clicked.
- `.user-select-auto`: Applies the browser’s default selection behavior.
- `.user-select-none`: Prevents the element from being selected.

Use these classes to customize text selection for paragraphs, headings, or any other content as needed.
Change the way in which the content is selected when the user interacts with it.

```html
<p class="user-select-all">This paragraph will be entirely selected when clicked by the user.</p>
<p class="user-select-auto">This paragraph has default select behavior.</p>
<p class="user-select-none">This paragraph will not be selectable when clicked by the user.</p>
```

<si-docs-component example="interactions/text-selections" height="300"></si-docs-component>

## Pointer events

[Pointer event](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) utilities allow to prevent or add element interactions:

- `.pe-none` prevents interactions with a pointer (mouse, stylus, touch)
- `.pe-auto` the element behaves as it would if the pointer-events property were not specified.

```html
<p>
  <a href="#" class="pe-none" tabindex="-1" aria-disabled="true">This link</a> can not be clicked.
</p>
<p> <a href="#" class="pe-auto">This link</a> can be clicked (this is default behavior). </p>
<p class="pe-none">
  <a href="#" tabindex="-1" aria-disabled="true">This link</a> can not be clicked because the
  <code>pointer-events</code> property is inherited from its parent. However,
  <a href="#" class="pe-auto">this link</a> has a <code>pe-auto</code> class and can be clicked.
</p>
```

<si-docs-component example="interactions/pointer-events" height="300"></si-docs-component>

## Accessibility considerations

When disabling pointer events, remember that `.pe-none` only affects mouse, touch, and stylus interactions. Keyboard users may still be able to focus and activate these elements unless additional steps are taken.

To fully disable interactive elements for all users:

- **Form controls:** Use the native `disabled` attribute.
- **Links:** Remove the `href` attribute to make the link non-interactive, or add `tabindex="-1"` and `aria-disabled="true"` to prevent keyboard focus and indicate the disabled state to assistive technologies.
- Add the HTML `inert` attribute to an element to disable any kind of interaction for the element and its inner DOM

For complete accessibility, consider using JavaScript to block any remaining actions if necessary.

**Example:**

```html
<!-- Disabled link for all users -->
<a tabindex="-1" aria-disabled="true">Disabled link</a>

<!-- Disabled button using native attribute -->
<button disabled>Disabled button</button>
```
