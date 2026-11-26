# Toolbar

The **toolbar** groups frequently used actions in one compact container.
It is designed for editor and canvas-based applications, such as graphics editors,
engineering tools, builders and configuration environments.

## Usage ---

A toolbar provides quick access to the tools and commands users need while working on content,
for example selecting, drawing, aligning, zooming or undoing changes.
Related actions are organized in groups that are visually separated by dividers.

### When to use

- When users repeatedly access a set of related tools or commands while working on content, such as a canvas.
- When the actions should stay available at a fixed place without taking up much space.

### Best practices

- Group related actions, for example tools, history or alignment, and order the groups by importance.
- Use icon-only buttons with a tooltip and an accessible label for each action.
- Show the active tool of a group of mutually exclusive tools as selected.
- Keep the number of actions small. Move rarely used actions to a [menu](menu.md).
- Use a [button group](button-group.md) for a few related actions or selections within regular content.
- Use the [content action bar](content-actions.md) for actions that relate to a specific content item,
  such as a card or a list.

## Design ---

### Variants

The toolbar is available in two variants:

- **Floating**: an elevated container which floats above the content, for example centered at the bottom of a canvas.
  Multiple floating toolbars can be placed next to each other along an edge to separate unrelated sets of actions.
- **Docked**: a flat container which is attached to an edge of the content area and spans its full length.

### Orientation

Toolbars can be arranged **horizontally** (default) or **vertically**.
Use a horizontal toolbar at the top or bottom and a vertical toolbar at the left or right side of the content.

### Content

Each section of a toolbar can contain the following elements:

- Icon buttons, usually [tertiary buttons](buttons.md)
- Text buttons, for example secondary or danger buttons
- [Dropdown buttons](dropdowns.md) and [split buttons](button-group.md#split-button)
- [Select](../forms-inputs/select.md)
- [Selection buttons](button-group.md#selection-button)

Items behave in one of two ways:

- **Action items** trigger an action when clicked and return to their default state, for example undo and redo.
- **Persistent items** stay selected after being clicked, for example to show the active tool.
  A persistent item keeps its button style and displays its active state.

### Responsive behavior

A toolbar can have any number of sections, but at least one.
It never grows beyond its container, in both orientations.
The toolbar does not collapse its content automatically, so the content placed inside it is the responsibility of the application.
When the available space is limited, group related actions and move the less important ones into an **overflow menu**.

## Code ---

The toolbar implements the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
based on the [Angular Aria toolbar](https://angular.dev/guide/aria/toolbar).
Only one item of the toolbar is part of the tab sequence.
The arrow keys move the focus between the items, `Home` and `End` move it to the first and last item.

### Usage

```ts
import { ToolbarWidget } from '@angular/aria/toolbar';
import { SiToolbarComponent, SiToolbarGroupComponent } from '@siemens/element-ng/toolbar';

@Component({
  imports: [SiToolbarComponent, SiToolbarGroupComponent, ToolbarWidget, ...]
})
```

Structure the items in `si-toolbar-group` elements and mark each item with the `ngToolbarWidget` directive.
Provide an accessible name for the toolbar, the groups and each item.

```html
<si-toolbar aria-label="Drawing toolbar">
  <si-toolbar-group aria-label="History">
    <button
      type="button"
      class="btn btn-icon btn-tertiary-ghost"
      ngToolbarWidget
      value="undo"
      aria-label="Undo"
      (click)="undo()"
    >
      <si-icon class="icon" [icon]="icons.elementUndo" />
    </button>
    <button
      type="button"
      class="btn btn-icon btn-tertiary-ghost"
      ngToolbarWidget
      value="redo"
      aria-label="Redo"
      [disabled]="!canRedo()"
      (click)="redo()"
    >
      <si-icon class="icon" [icon]="icons.elementRedo" />
    </button>
  </si-toolbar-group>
</si-toolbar>
```

The `value` of each item must be unique within the toolbar, as `@angular/aria` versions before 22.2 require it.
It can be omitted when using `@angular/aria` 22.2 or later.

Use the `disabled` input of `ngToolbarWidget` instead of the native `disabled` attribute.
Disabled items stay focusable by default, so that users can discover them, but they cannot be activated.
Set `[softDisabled]="false"` on the toolbar to remove disabled items from the keyboard navigation.

Set `orientation="vertical"` for a vertical toolbar and `variant="docked"` for the docked variant.

Use the `placement` input (`top`, `bottom`, `start` or `end`) to attach the toolbar to an edge of its
closest positioned ancestor, for example a canvas container with the `position-relative` class.
A floating toolbar is positioned along that edge according to `alignment` (`start`, `center` or `end`,
centered by default), while a docked toolbar spans the full edge.
To keep a distance to the edge, add a margin on the respective sides, for example `mb-5` for the
`bottom` placement or `mb-5 ms-5` for `bottom` with `alignment="start"`.
Without a placement, the toolbar is part of the regular layout flow.

```html
<div class="position-relative">
  <canvas></canvas>
  <si-toolbar aria-label="Drawing toolbar" placement="bottom" alignment="start" class="mb-5 ms-5">
    ...
  </si-toolbar>
</div>
```

To combine multiple floating toolbars along the same edge, omit `placement` on the toolbars and
place them inside a shared positioned flex container. Use `pe-none` on the container and `pe-auto`
on each toolbar so clicks outside the toolbars pass through to the underlying content.

```html
<div class="position-relative">
  <canvas></canvas>
  <div
    class="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-4 mb-5 pe-none"
  >
    <si-toolbar class="pe-auto" aria-label="Editor toolbar">...</si-toolbar>
    <si-toolbar class="pe-auto" aria-label="Alignment toolbar">...</si-toolbar>
  </div>
</div>
```

### Floating and docked toolbar

The following example shows floating and docked toolbars within an application
with an application header and a vertical navigation.
Use the navigation to switch between the floating and the docked variant and change the placement
to attach the toolbar to another edge of the workspace.
In the floating variant, change **Alignment** to position the toolbar at the start, center or end
of the edge, or enable **Multiple toolbars** to combine two floating toolbars.
In the docked variant, enable **Dock to application layout** to place the toolbar directly in the
application layout next to the application header and vertical navigation in the regular layout flow.

<si-docs-component example="si-toolbar/si-toolbar" height="600"></si-docs-component>

### Toolbar content

Toolbar items can be any interactive element, such as buttons, dropdown and split buttons,
`si-select` or selection buttons. Mark each of them with `ngToolbarWidget`.
For persistent items, keep the button's variant class (for example `btn-tertiary-ghost`), toggle the `active` class, and set `aria-pressed`.

<si-docs-component example="si-toolbar/si-toolbar-content" height="400"></si-docs-component>

### Overflow

The toolbar never grows beyond its container. By default, items that do not fit are clipped.
The overflow behavior is controlled on `si-toolbar` itself, so it can be changed with regular CSS,
for example with the `overflow-auto` class to make the toolbar scrollable:

```html
<si-toolbar class="overflow-auto" aria-label="Drawing toolbar">...</si-toolbar>
```

The recommended approach is to move the less important actions into overflow menus, as shown in the following example. Change the workspace width to see
how the actions of the less important sections move into the overflow menus first.
Remove actions from the toolbar instead of only hiding them, so that they are not reachable via the keyboard.

<si-docs-component example="si-toolbar/si-toolbar-overflow" height="400"></si-docs-component>

<si-docs-api component="SiToolbarComponent"></si-docs-api>

<si-docs-api component="SiToolbarGroupComponent"></si-docs-api>

<si-docs-types></si-docs-types>
