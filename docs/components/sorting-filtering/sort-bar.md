# Sort Bar

Used for sorting tables, lists, etc. This component serves as visual component,
and always maintains the state of current active sorts.

It also has a callback, which can be seen in the example as call to `getData()`,
which triggers every time user changes sort. It returns a list of current sorts.

## Code ---

### Usage

```ts
import { SiSortBarComponent } from '@siemens/element-ng/sort-bar';

@Component({
  imports: [SiSortBarComponent, ...]
})
```

<si-docs-component example="si-sort-bar/si-sort-bar"></si-docs-component>

<si-docs-api component="SiSortBarComponent"></si-docs-api>

<si-docs-types></si-docs-types>
