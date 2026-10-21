# Switch

The **switch** component allows to toggle settings between two states.

## Usage ---

Switches immediately trigger an effect when being clicked.
Examples are: `On`/`Off`, `Online`/`Offline` or `Installed`/`Not installed`.

![Switch](images/switch.png)

### When to use

- When there is a binary state that the user should be able to toggle instantly.

### Best practices

- Use a stable label that describes the setting being controlled, not the action or current state.
- Let the switch communicate its state. Additional text such as On or Off may be displayed when
  explicit state information is needed.
- Do not change the label when the switch state changes.
- Switches apply changes immediately and must not require an additional submit button.

## Design ---

### Anatomy

![Switch elements](images/switch-usage-construction.png)

> 1\. Background, 2. Thumb

### Thumb position

- **On:** Positioned on the right.
- **Off:** Positioned on the left.
- **Indeterminate:** Positioned in the center. Used when multiple values have mixed
  states or when the setting has no defined value. Selecting the switch resolves it
  to `On` or `Off`.

## Code ---

In Element, switches are native `<input type="checkbox">` elements with extra styling.
They should be used together with the `si-form-item` component (see [here](forms.md)).

A checkbox is turned into a switch by applying the `form-switch` class to the `si-form-item` component:

```html
<si-form-item label="Switch" class="form-switch">
  <input type="checkbox" class="form-check-input" [formControl]="control" />
</si-form-item>
```

The class `form-check-input` and `type="checkbox"` must be applied to ensure correct visual appearance.
Instead of `formControl`, you can also use `ngModel`.

### Group switches

Use the `si-form-fieldset` component to group multiple switches together.
It will ensure a correct layout and apply the necessary accessibility attributes.

```html
<si-form-fieldset label="Group">
  <si-form-item label="Option 1" class="form-switch">
    <input type="checkbox" class="form-check-input" [formControl]="control1" />
  </si-form-item>
  <si-form-item label="Option 2">
    <input type="checkbox" class="form-check-input" [formControl]="control2" />
  </si-form-item>
</si-form-fieldset>
```

By default, the switches are stacked vertically.
To display them inline, apply the `form-check-inline` class to the `si-form-item`:

```html
<si-form-fieldset label="Group Inline">
  <si-form-item label="Option 1" class="form-check-inline form-switch">
    <input type="checkbox" class="form-check-input" [formControl]="control1" />
  </si-form-item>
  <si-form-item label="Option 2" class="form-check-inline form-switch">
    <input type="checkbox" class="form-check-input" [formControl]="control2" />
  </si-form-item>
</si-form-fieldset>
```

### Native HTML markup

If a `si-form-item` component cannot be used, it is also possible to use
a switch with native HTML elements only:

```html
<div class="form-check mb-2 form-switch">
  <input type="checkbox" id="check-id" class="form-check-input" />
  <label for="check-id" class="form-check-label">Switch</label>
</div>
```

In this case, all the attributes shown above must be set by an application.
Otherwise, the switch may appear broken.

To create an inline switch, additionally apply the `form-check-inline` class to the `form-check` div.

### Example

<si-docs-component example="si-switch/si-switch"></si-docs-component>
