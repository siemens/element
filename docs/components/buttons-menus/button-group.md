# Button group

A **button group** visually organizes related buttons into a single, cohesive control, helping users understand that they belong to the same context or task.

## Usage ---

Button groups can contain standard buttons that perform **actions**, or **selection** buttons that represent modes or states.

### Action button group

An **action button group** organizes related commands that belong to the same workflow or functional area.
Each button performs its own action, and several buttons can be used in sequence.

![Button group](images/button-group.png)

An action button group is a simple row of independent buttons with no collapsing or overflow menu.
Unlike the [content action bar](../buttons-menus/content-actions.md), a unified responsive menu bar treated as one navigable unit,
each button in a button group receives focus individually when tabbing.

Use it for 2–4 direct, peer-level actions (e.g., Expand/Collapse)
when distinct focus and a fixed layout are required instead of unified menu behavior.

### Split button

A **split button** combines a primary action with a secondary dropdown of related options.
It is useful when one action is the default or most common, but additional alternatives are available.

Use it to provide a quick “default” action while still offering variations (e.g., Save / Save as…)

![Split button](images/button-group-split.png)

### Selection button

A **selection button** is used for switching between views, modes, or states, rather than executing direct actions.
The group visually connects related choices and communicates a selection state instead of triggering independent commands.

![Selection buttons](images/button-group-selection.png)

It supports both single and multi-selection, depending on the context:

- **Single selection:** only one option can be active at a time (radio behavior),
  e.g., switching between different views such as `All`, `Read` and `Unread`.
- **Multi-selection:** several options can be active simultaneously (checkbox behavior),
  e.g., filtering by `Temperature`, `Pressure`, and `Voltage`.

![Selection button](images/button-group-selection-modes.png)

### Best practices

- For binary options, such as `yes/no` or `on/off` use a [switch](../forms-inputs/switch.md) component.
- If there are more than five options or not enough horizontal space, use
  the [select](../forms-inputs/select.md) component.
- For multi-select scenarios with unrelated options, prefer the
  [checkbox](../forms-inputs/checkbox.md) component.
- When switching between distinct content areas, such as sub-pages, use
  [tabs](../layout-navigation/tabs.md) component.
- Labels should use nouns or concise noun phrases that clearly describe the action or choice. Keep the text on a single line; avoid wrapping.

## Design ---

### Variants

Button group supports label+icon, label only and icon only.

![Button group variants](images/button-group-variants.png)

### Styles

The **action button group** and **split button**, inherits the same visual style and interaction states as
[standard buttons](../buttons-menus/buttons.md).

![Button group styles](images/button-group-styles.png)

Although different hierarchies (e.g., primary, secondary, tertiary, or danger) can technically be
combined within the same group, this is not recommended.
**All items in a button group should share the same visual style** to ensure cohesion and clarity.

![Button group do and donts](images/button-group-do-and-donts.png)

The **selection button** has a dedicated style and is only available in this variant.

![Selection button states](images/button-group-selection-button-states.png)

### Sizes

The button group follows the same sizing system as standard buttons.
The default height size is `32px`, matching the default button height.

A large size at `40px` is also available for layouts that require increased prominence or touch-friendly targets.

A `24px` small size supports dense, desktop-focused interfaces.
Avoid using it in touch contexts (mobile or tablet) where larger tap areas are required.

### Responsive behavior

The button group component is inherently horizontal and cannot be wrapped or stacked. To prevent overflow on smaller screens, keep the number of items minimal.

Alternatively, actions can be collapsed under a menu or replaced with a [select](../forms-inputs/select.md),
[radio](../forms-inputs/radio.md), or [checkboxes](../forms-inputs/checkbox.md) component,
depending on the interaction type.

## Code ---

Button groups are created using CSS classes. The button group component is CSS-only and does not require any Angular components.

### Usage

Wrap buttons in a `btn-group` container with the appropriate `role` and `aria-label` attributes for accessibility.

```html
<div class="btn-group" role="group" aria-label="Basic example">
  <button type="button" class="btn btn-secondary">Left</button>
  <button type="button" class="btn btn-secondary">Middle</button>
  <button type="button" class="btn btn-secondary">Right</button>
</div>
```

### Button group sizes

Button groups support three sizes: small (`btn-sm`), default, and large (`btn-lg`).

```html
<!-- Large group -->
<div class="btn-group" role="group" aria-label="Large group">
  <button type="button" class="btn btn-lg btn-secondary">Large</button>
  <button type="button" class="btn btn-lg btn-secondary">Group</button>
</div>

<!-- Default group -->
<div class="btn-group" role="group" aria-label="Default group">
  <button type="button" class="btn btn-secondary">Default</button>
  <button type="button" class="btn btn-secondary">Group</button>
</div>

<!-- Small group -->
<div class="btn-group" role="group" aria-label="Small group">
  <button type="button" class="btn btn-sm btn-secondary">Small</button>
  <button type="button" class="btn btn-sm btn-secondary">Group</button>
</div>
```

### Icon-only buttons

For icon-only button groups, use the `btn-icon` class along with appropriate `aria-label` attributes.

```html
<div class="btn-group" role="group" aria-label="Icon button group">
  <button type="button" class="btn btn-icon btn-secondary" aria-label="Edit">
    <i class="icon element-edit"></i>
  </button>
  <button type="button" class="btn btn-icon btn-secondary" aria-label="Copy">
    <i class="icon element-copy"></i>
  </button>
  <button type="button" class="btn btn-icon btn-secondary" aria-label="Delete">
    <i class="icon element-delete"></i>
  </button>
</div>
```

### Action button group example

<si-docs-component example="buttons/button-groups" height="400"></si-docs-component>

### Split button

A split button combines a primary action with a dropdown menu of related options.

```html
<div class="btn-group" role="group" aria-label="Split button">
  <button type="button" class="btn btn-primary">
    <i class="icon element-download"></i>
    Download
  </button>
  <button
    type="button"
    class="btn btn-primary btn-icon dropdown-toggle"
    aria-label="Dropdown toggle"
    [cdkMenuTriggerFor]="dropdownMenu"
  >
    <i class="dropdown-caret icon element-down-2"></i>
  </button>
</div>
```

<si-docs-component example="buttons/split-button" height="300"></si-docs-component>

### Selection button

For selection-based button groups that represent different states or views, use radio buttons or checkboxes with button styling.

**Single-select:**

```html
<div class="btn-group" role="group" aria-label="View selection">
  <input type="radio" class="btn-check" name="view" id="view-all" checked />
  <label class="btn" for="view-all">All</label>

  <input type="radio" class="btn-check" name="view" id="view-read" />
  <label class="btn" for="view-read">Read</label>

  <input type="radio" class="btn-check" name="view" id="view-unread" />
  <label class="btn" for="view-unread">Unread</label>
</div>
```

**Multi-select:**

```html
<div class="btn-group" role="group" aria-label="Filter options">
  <input type="checkbox" class="btn-check" id="filter-temp" />
  <label class="btn" for="filter-temp">Temperature</label>

  <input type="checkbox" class="btn-check" id="filter-pressure" />
  <label class="btn" for="filter-pressure">Pressure</label>

  <input type="checkbox" class="btn-check" id="filter-voltage" />
  <label class="btn" for="filter-voltage">Voltage</label>
</div>
```

**Composition variants**

There are two ways to compose a selection button:

**Input wrapped inside label** — nest the input directly inside a `<label>` element, removing the need for `for`/`id`.
This variant is required for icon-only buttons to support and display **tooltips** correctly:

```html
<div class="btn-group" role="group" aria-label="Layout selection">
  <label>
    <input type="checkbox" class="btn-check" aria-label="One pane" siTooltip="One pane" checked />
    <si-icon class="btn btn-icon icon" icon="element-layout-pane-1" />
  </label>

  <label>
    <input type="checkbox" class="btn-check" aria-label="Two panes" siTooltip="Two panes" />
    <si-icon class="btn btn-icon icon" icon="element-layout-pane-2" />
  </label>
</div>
```

**`for` / `id` linking** — place the input before the label and connect them via matching `for` and `id` attributes.
This is the standard HTML pattern and works well for text labels:

```html
<div class="btn-group" role="group" aria-label="View selection">
  <input type="radio" class="btn-check" name="view" id="view-day" checked />
  <label class="btn" for="view-day">Day</label>

  <input type="radio" class="btn-check" name="view" id="view-week" />
  <label class="btn" for="view-week">Week</label>

  <input type="radio" class="btn-check" name="view" id="view-month" />
  <label class="btn" for="view-month">Month</label>
</div>
```

<si-docs-component example="buttons/selection-buttons" height="350"></si-docs-component>
