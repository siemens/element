# Elevation

Elevation of a surface is represented by its distance from the page's background along the z-axis, creating a sense of depth and establishing content hierarchy within an application.

## Usage ---

In the Element Design System, elevation is achieved through a combination of layered **base colors** and **drop shadows**,
creating depth and spatial associations without unnecessary stylistic elements.

### Base color layers

At the core of the layering model are the **base-0** and **base-1** tokens:

- `base-0`: Is placed on the lowest position of the stack order, serving as the foundational background for the UI.
- `base-1`: Is placed on top of `base-0` and is the default layer for container elements like cards,
  vertical navigation, and side panels.
- `base-3`: Used to layer content above other content. It works best with shadows and is
  reserved for components like popovers and toasts to enhance depth in low-light environments.

![Elevation](images/elevation.png)

Complementary tokens like `base-1-hover` and `base-1-selected` are used
to indicate interaction states while maintaining the visual layering logic.
These are independent color tokens and are designed to work across all base layers.

![Elevation usage example](images/elevation-usage-example.png)

The system is intentionally designed to be mostly flat, minimizing unnecessary layers or
'boxes within boxes' to maintain clarity and ease of use.

![Elevation layers do's and don'ts](images/elevation-do-and-donts.png)

However, in specific cases where additional differentiation is necessary:

- Use an outline with `ui-4` to define boundaries between elements on the same layer,
  such as layout sections or grouped content
- Use `base-4` when a stronger distinction is needed, especially to highlight a container.

![Elevation exceptions example](images/elevation-exceptions.png)

### Shadows

Shadows are used selectively to indicate physical overlap between components.
Shadows are reserved for components that float above or overlap other content,
such as [menus](../components/buttons-menus/menu.md), modals, popover and toasts.

**Components without overlapping behavior, such as cards, must not have shadows.**

![Elevation with shadows component examples](images/elevation-shadows.png)

The `elevation` tokens represent increasing levels of shadows.

`elevation-2`: The active token used for overlapping components like menus, popovers, and toasts, establishing the standard elevation for floating elements.

The other tokens are retained for flexibility in custom visualizations, interactive
illustrations, or animations to enhance depth and spatial relationships.

- `elevation-1`: For minimal elevation effects and subtle layering.
- `elevation-3`: For elements requiring stronger visual prominence, such as multi-layered highlights.
- `elevation-4`: Reserved for rare or critical cases requiring maximum elevation distinction.

| Elevation | System token                |
| --------- | --------------------------- |
| Level 1   | `--si-sys-effects-shadow-1` |
| Level 2   | `--si-sys-effects-shadow-2` |
| Level 3   | `--si-sys-effects-shadow-3` |
| Level 4   | `--si-sys-effects-shadow-4` |

## Code ---

The 4 elevation levels (including `none`) in the form of `box-shadow` values can
be accessed directly by using CSS utility classes.

<si-docs-component example="elevation/elevation" height="120"></si-docs-component>

### System tokens

Use the system tokens directly when applying an elevation in a stylesheet.

```scss
box-shadow: var(--si-sys-effects-shadow-1);
box-shadow: var(--si-sys-effects-shadow-2);
box-shadow: var(--si-sys-effects-shadow-3);
box-shadow: var(--si-sys-effects-shadow-4);
```

The legacy elevation variables have been removed. Migrate to the corresponding
`--si-sys-effects-shadow-*` token:

- `$element-elevation-1`, `$element-elevation-2`, `$element-elevation-3`, `$element-elevation-4`
- `$element-elevation-inset-1`, `$element-elevation-inset-2`, `$element-elevation-inset-3`, `$element-elevation-inset-4`
- `$box-shadow`, `$box-shadow-sm`, `$box-shadow-lg`, `$box-shadow-inset`, `$input-box-shadow`
- `$popover-box-shadow`, `$modal-content-box-shadow-xs`, `$modal-content-box-shadow-sm-up`, `$thumbnail-box-shadow`

The `--element-box-shadow-color-1` and `--element-box-shadow-color-2` custom
properties have also been removed.
