# Icons

<!-- markdownlint-disable MD033 MD024-->

**Icons** are graphical representations that symbolize objects, functions, processes, or concepts.

## Usage ---

Icons are used to draw attention to high-priority elements or to convey information in a simple and recognizable manner.
If the necessity or clarity of an icon is uncertain, it is better to omit it.

![Icons](images/icons.png)

Visit the [common actions](../fundamentals/ux-text-style-guide/frequent-app-functions.md/#common-actions) for further
definitions of a common icon usage.

Icons are available in three predefined sizes.

- **Small (16px):** Used in dense UI or compact contexts, such as labels or inline helper actions
  (e.g., [help button](../components/buttons-menus/help-button.md)).
- **Default (20px):** The most common size and pairs well with `body` and `body-bold` text.
- **Large (24px):** Used for more prominent contexts and pairs well with `body-lg` and `body-bold-lg` text.

Additional sizes may be created in 4px increments only when necessary.

### When to use icons

- To draw attention to key elements of the interface, making them stand out.
- To convey intuitive visual cues (e.g., a downward chevron for opening a menu).
- To symbolically replace text when space is limited. For this use case, ensure that the icon is universally understood without labels.

### Best practices

- Icons should stay true to their meaning across the application.
- Use icons sparsely on a page to not overwhelm users.
- Avoid using icons as mere decorations; they must add functional value to the interface.
- Prevent redundancy, such as adding icons to actions like "Save" and "Cancel," where the value of an icon is minimal.

## Design ---

### Grid

Icons are built on a square grid that defines proportions, alignment, and stroke behavior to ensure visual
consistency and optical balance.

They are constructed on a `32×32px` grid as a scalable foundation,
with a built-in `2px` safe zone to preserve balance across all sizes.

![Icon grid](images/icon-grid.png)

The icon set is based on simple key shapes of squares, circles, and rectangles (portrait and landscape),
which provide a consistent structural foundation.

![Icon shapes](images/icon-shapes.png)

Icons use a uniform `2px` stroke width.
A flat front-facing style is preferred to avoid visual blur.

![Icons perspective](images/icon-perspective.png)

Rounded shapes have a consistent corner radius of `2px.`
Additional radius adjustments may be applied to better reflect the real-world form of the object.

![Icons radius](images/icon-radius.png)

### Style

**Outlined** icons are the default style for most UI elements.
Filled icons are used sparingly to highlight important actions or indicate active states.

![Icons style](images/icons-style.png)

### Colors

Icons should be used in a single, consistent color to maintain a cohesive look and ensure high contrast against the background.
Use tokens `$element-ui-1` and `$element-ui-2` as the default colors for their versatility and clarity.

With the exception of `$element-base-*` tokens, any color can be used for icons.
Be mindful of the purpose behind the color choice. Refer to the [color guidance](../fundamentals/colors/ui-colors.md) for further details.

### Supporting labels

Universal icons like delete, edit, and home can be used without labels due to their widely recognized meanings.
For all other icons, provide labels at least once to ensure that users understand their meanings.

Position labels either below or to the right (RTL languages) of the icons based on available space.

![Icons labels](images/icon-labels.png)

### Composite icons

Composite icons combine two overlapping icons with different colors to create better contrast and convey complex meanings,
e.g., event states or severity symbols.

![Icons composite](images/icon-composite.png)

## Code ---

Icons are available as SVGs or as an icon font.
Prefer SVGs unless you are working in an existing project that already uses the icon font. Stay consistent within a project.
SVGs were introduced to reduce bundle size, as the icon font is already above 100KB while typically only a few icons are used.

A list of icons can be found in the [icon overview](../icons.md).

### SVG

!!! info "Content Security Policy considerations"

    Element embedds icons as `data:image/svg+xml` URLs.
    Thus you need to allow the `data:` scheme ONLY for `img-src` in addition to the [Angular recommended values](https://angular.dev/best-practices/security#content-security-policy).
    ```http
      Content-Security-Policy: <...>; img-src 'self' data:;
    ```

Use the `si-icon` component to include SVG icons:

```ts
import { Component } from '@angular/core';
import { elementUser } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent],
  template: `<si-icon class="icon" [icon]="icons.elementUser" />`
})
export class SampleComponent {
  // addIcons returns a map of all names added to the library for typesafe use in the template.
  protected readonly icons = addIcons({ elementUser });
}
```

`addIcons` registers icons for use for as long as the component is alive.
The `icons` object enables type-safe use of added icons in the template.
You can also provide icon names as strings in camelCase (`elementUser`) or kebab-case (`element-user`).
If an icon is not found, the icon font class is rendered as a fallback (only works if the icon font is still loaded).

### Icon font

Use the CSS classes `element-*` to use the icon font with an `<i>` tag.

### Styling

Use the `icon` classes for the correct icon size:

- `.icon-sm` (16px): Used in dense UI or compact contexts, such as labels or inline helper actions
- `.icon` (20px): The most common size and pairs well with body and body-bold text.
- `.icon-lg` (24px): Used for more prominent contexts, such as large buttons, and pairs well with `body-lg` and `body-bold-lg` text.

Besides the `icon` classes, all other text utility classes (such as color utilities) can be used.

### Stacking

Use stacking with the `si-icon` component to combine multiple icons into a single symbol, such as event states or severities:

```html
<span class="icon icon-stack">
  <si-icon class="status-danger" [icon]="icons.elementAlarmFilled" />
  <si-icon class="text-secondary" [icon]="icons.elementAlarmTick" />
</span>
```

<si-docs-component example="icons/icons"></si-docs-component>
