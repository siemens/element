# Search bar

The **search bar** allows users to quickly find content using free text.

## Usage ---

![Search bar](images/search-bar.png)

### When to use

- Use it if a full text search is required.

### Best practices

- Ignore punctuation within searches.
- Combine with the [typeahead behavior](../sorting-filtering/typeahead.md) to
  assist users when searching.
- Don't use wildcard encoding for more complex search statements.
- Consider adding other search capabilities according to project needs (e.g. use
  quotes to search for exact matches).
- The placement of the _Search Bar_ depends on the layout of the viewport. See
  the [list-details](../layout-navigation/list-details.md)
  for placement guidance. See [data table](../lists-tables-trees/overview.md)
  for search placement within a data table.

## Design ---

### Elements

![Search bar elements](images/search-bar-elements.png)

> 1. Search icon, 2. Content, 3. Container, 4. Clear button

### Interaction states

The search bar container color should always be in contrast with its
surrounding background. Use `background-2` or `background-1` accordingly.

![search bar states](images/search-bar-states.png)

## Code ---

Use a native input with `siSearchBarInput` inside `si-search-bar`. Bind a reactive
`FormControl` or a Signal Forms field to the input to manage its value, validation,
and disabled state. Observe form value changes to trigger searches and debounce
them in application code when needed.

Set `[showIcon]="true"` on `si-search-bar` to display a search icon. The icon is
hidden by default.

### Usage

```ts
import {
  SiSearchBarComponent,
  SiSearchBarInputDirective
} from '@siemens/element-ng/search-bar';

@Component({
  imports: [SiSearchBarComponent, SiSearchBarInputDirective, ...]
})
```

<si-docs-component example="si-search-bar/si-search-bar"></si-docs-component>

### Projected input

Apply input settings directly to the projected input. Keep appearance settings,
such as `showIcon` and `colorVariant`, on `si-search-bar`:

```html
<si-search-bar [showIcon]="true">
  <input
    siSearchBarInput
    aria-label="Search users"
    placeholder="Search users"
    maxlength="40"
    [readonly]="readonly"
    [disabled]="disabled"
  />
</si-search-bar>
```

Provide an accessible name with `aria-label` or an associated `<label>`;
the placeholder does not replace a label. Native attributes such as `autocomplete`
can also be set directly on the input.

When using Signal Forms, configure disabled state in the form schema instead of
binding `[disabled]` on the input.

The `placeholder`, `maxlength`, `readonly`, and `disabled` inputs on `si-search-bar`
are deprecated. For compatibility, omitted settings on the projected input fall
back to the corresponding search bar settings. Explicit `false` values for
`readonly` and `disabled` override `true` values on the search bar.

### Migrate deprecated inputs and outputs

Run the following schematic to migrate the deprecated inputs and outputs of
`si-search-bar` to a projected input. Use `--path` to limit the migration to a directory.

```sh
ng g @siemens/element-ng:migrate-search-bar
```

The schematic:

- Moves `placeholder`, `maxlength`, `readonly`, `disabled`, and `value`, as well as form,
  typeahead, and `aria-*` bindings, to a projected `<input siSearchBarInput>`.
- Replaces `(searchChange)` with a Signal Forms field in the component class. The
  `debounce` rule replaces `debounceTime`, the `pattern` rule replaces
  `prohibitedCharacters`, and an `effect` calls the former handler when the search term
  changes.
- Adds `SiSearchBarInputDirective`, and `FormField` if needed, to the imports of the
  component or NgModule.

By default, the search bar debounces form value changes by 400 ms. A projected input
updates its form value immediately, so the schematic logs each migrated search bar with
a form binding that loses this debounce. Debounce the value changes in your code where
needed.

The schematic also logs search bars that need a manual migration, for example if the
`(searchChange)` handler uses template variables or the search bar is inside a `@for`
block.

### Search Bar - Input Value

Set the initial value on the projected input's `FormControl` or Signal Forms
model. The clear button resets the bound form value to an empty string.

<si-docs-component example="si-search-bar/si-search-bar-value"></si-docs-component>

<si-docs-api component="SiSearchBarComponent"></si-docs-api>

<si-docs-types></si-docs-types>
