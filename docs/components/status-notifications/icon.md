# Icon

Icon component for using the Element icons.

See also the [icons chapter](../../fundamentals/icons.md) in the fundamentals.

## Code ---

### Usage

```ts
import { SiIconComponent } from '@simpl/element-ng/icon';

@Component({
  imports: [SiIconComponent, ...]
})
```

The `si-icon` component includes a fallback alternative text to make icons more
accessible.

<si-docs-component example="si-icon/si-icon"></si-docs-component>

### Composite icons

Some symbols require overlapping of two icons. The example below shows how to
build event state icons and severity symbols with stacked icons.

<si-docs-component example="si-icon/si-icon-composite"></si-docs-component>

<si-docs-api component="SiIconComponent"></si-docs-api>

<si-docs-types></si-docs-types>
