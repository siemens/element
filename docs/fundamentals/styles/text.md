# Text

Explore a variety of text utility classes to manage alignment, wrapping, font weight, and more.

## Text alignment

Quickly adjust text alignment using utility classes. Choose between `start`, `end`, or `center` alignment, with responsive options from `xs` to `xxl`:

- `.text-{value}` for `xs`
- `.text-{breakpoint}-{value}` for `sm`, `md`, `lg`, `xl`, and `xxl`

```html
<p class="text-start">Text aligned to the start on all screen sizes.</p>
<p class="text-center">Text centered on all screen sizes.</p>
<p class="text-end">Text aligned to the end on all screen sizes.</p>

<p class="text-sm-end">Text aligns to the end on small (SM) screens and larger.</p>
<p class="text-md-end">Text aligns to the end on medium (MD) screens and larger.</p>
<p class="text-lg-end">Text aligns to the end on large (LG) screens and larger.</p>
<p class="text-xl-end">Text aligns to the end on extra large (XL) screens and larger.</p>
<p class="text-xxl-end">Text aligns to the end on extra extra large (XXL) screens and larger.</p>
```

<si-docs-component example="text/text-alignment" height="150"></si-docs-component>

## Text wrapping and overflow

Control how text is wrapped inside an element using the [text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap) property.

- `.text-wrap` forces text to wrap onto multiple lines when it exceeds the container size.
- `.text-nowrap` prevents text from being wrapped to maintain a single line of text e.g. for buttons, labels or navigation items.

```html
<div class="text-wrap" style="width: 6rem;"> This text should wrap. </div>
<div class="text-nowrap" style="width: 8rem;"> This text should overflow the parent. </div>
```

<si-docs-component example="text/text-wrap" height="150"></si-docs-component>

## Word break

Use the `.text-break` utility to force long words or unbroken strings to wrap onto the next line, preventing layout issues caused by text overflow.

```html
<p class="text-break"
  >wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww</p
>
```

<si-docs-component example="text/text-word-break" height="150"></si-docs-component>

## Text transform

Transform text in components with text capitalization classes.

> **Note:** The .text-capitalize class only changes the first letter of each word, leaving the case of any other letters unaffected.

```html
<!-- lowercased text. -->
<p class="text-lowercase">Lowercased text.</p>
<!-- UPPERCASED TEXT. -->
<p class="text-uppercase">Uppercased text.</p>
<!-- CapiTaliZed Text. -->
<p class="text-capitalize">CapiTaliZed text.</p>
```

<si-docs-component example="text/text-transform" height="150"></si-docs-component>

## Font size

Adjust the font size of text using the utility classes `fs-1` to `fs-6`.
Unlike heading classes (such as `.h1`–`.h6`), which also set font weight and line height, these utilities affect only the font size.
The sizing scale aligns with HTML heading elements—lower numbers represent larger text, while higher numbers produce smaller text.

```html
<p class="fs-1">.fs-1 text</p>
<p class="fs-2">.fs-2 text</p>
<p class="fs-3">.fs-3 text</p>
<p class="fs-4">.fs-4 text</p>
<p class="fs-5">.fs-5 text</p>
<p class="fs-6">.fs-6 text</p>
```

<si-docs-component example="text/text-font-size" height="150"></si-docs-component>

## Font weight and italics

Adjust the `font-weight` and `font-style` of text using utility classes.
Use `.fw-*` for font weight and `.fst-*` for font style.
These classes provide a quick way to apply bold, light, normal, italic, or standard styles to your text elements.

```html
<p class="fw-bold">Bold text.</p>
<p class="fw-bolder">Bolder weight text (relative to the parent element).</p>
<p class="fw-normal">Normal weight text.</p>
<p class="fw-light">Light weight text.</p>
<p class="fw-lighter">Lighter weight text (relative to the parent element).</p>
<p class="fst-italic">Italic text.</p>
<p class="fst-normal">Text with normal font style.</p>
```

<si-docs-component example="text/text-font-weight" height="150"></si-docs-component>

## Line height

Control the vertical spacing of text lines using `.lh-*` utility classes.
These classes adjust the line height of your text, allowing you to create more compact or more spacious layouts as needed.
Choose from options like `.lh-1`, `.lh-sm`, `.lh-base`, and `.lh-lg` to achieve the desired look and readability.

```html
<p class="lh-1">
  This paragraph demonstrates how different line-height utility classes affect text spacing. Apply
  these classes directly to elements or their parent containers as needed.
</p>
<p class="lh-sm">
  This paragraph demonstrates how different line-height utility classes affect text spacing. Apply
  these classes directly to elements or their parent containers as needed.
</p>
<p class="lh-base">
  This paragraph demonstrates how different line-height utility classes affect text spacing. Apply
  these classes directly to elements or their parent containers as needed.
</p>
<p class="lh-lg">
  This paragraph demonstrates how different line-height utility classes affect text spacing. Apply
  these classes directly to elements or their parent containers as needed.
</p>
```

<si-docs-component example="text/text-line-height" height="150"></si-docs-component>

## Monospace

Apply a monospace font to your text using the `.font-monospace` utility class.
This class switches the font to a system monospace stack, making it ideal for displaying code, technical data, or any content where fixed-width characters are preferred.

```html
<p class="font-monospace">This is in monospace</p>
```

<si-docs-component example="text/text-monospace" height="150"></si-docs-component>

## Text decoration

Enhance the appearance of text using text decoration utility classes.
These classes allow you to underline text, add a line through it, or remove default text decorations—useful for customizing links, headings, and other elements.

```html
<p class="text-decoration-underline">
  This text is underlined using <code>.text-decoration-underline</code>.
</p>
<p class="text-decoration-line-through">
  This text displays a strikethrough effect with <code>.text-decoration-line-through</code>.
</p>
<a href="#" class="text-decoration-none">
  This link appears without an underline, thanks to <code>.text-decoration-none</code>.
</a>
```

<si-docs-component example="text/text-decoration" height="150"></si-docs-component>
