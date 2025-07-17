# Footer

The **footer** provides legal information like copyrights and further links to legal
artifacts to users.

## Usage ---

The footer is a part of an overarching concept for legal guidelines.

### When to use

The footer is mandatory in the following cases:

- On the [landing page](../pages/landing-page.md).
- On all other pages, where no [application header](../layout-navigation/application-header.md)
  is provided, which contains the legal information.

The footer **must not be used** on pages, where the [application header](../layout-navigation/application-header.md)
is provided, and contains the legal information.

## Design ---

### Elements

The footer contains the `Copyright Notice` and a link list to (legal) artifacts.

![Footer construction](images/footer-usage-construction.png)

 > 1. Link list, 2. Copyright notice

### Wide version

The wide representation of the footer has to be used if the `Copyright Notice`
and the links **do have enough space** on a single line.

![Footer - Wide](images/footer-usage-wide.png)

### Small version

The small representation of the footer has to be used if the `Copyright Notice`
and the links **do not have enough space** on a single line. The
`Copyright Notice` gets an own line always and a link must not contain a line
break.

![Footer - Small](images/footer-usage-small.png)

## Code ---

The `links` input allows 3 kinds of links.

- `action` perform a given function.
- `href` link to external websites.
- `link` link to an internal route.

The vertical padding of this component can be configured. Just set
`$page-footer-padding` (Default: 13px) to your desired value.

### Usage

```ts
import { SiFooterComponent } from '@siemens/element-ng/footer';

@Component({
  imports: [SiFooterComponent, ...]
})
```

<si-docs-component example="si-footer/si-footer"></si-docs-component>

<si-docs-api component="SiFooterComponent"></si-docs-api>

<si-docs-types></si-docs-types>
