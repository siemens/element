# TabsNext

Starting with Element v48, we are introducing `si-tab-next` as an experimental 
component that will eventually replace the current `si-tab` component. This new
implementation brings significant improvements in responsive behavior, ensuring
better adaptation across different screen sizes and devices. The component has been
rebuilt with a strong focus on accessibility standards, including enhanced ARIA
compliance and improved keyboard navigation.

## Code ---

### Usage

```ts
import { SiTabNextComponent, SiTabsetNextComponent } from '@siemens/element-ng/tabs-next';

@Component({
  imports: [
    SiTabNextComponent,
    SiTabsetNextComponent,
    ...
  ]
})
```

### TabsNext

<si-docs-component example="si-tabs/si-tabs-next"></si-docs-component>

### TabsNext - Routing

<si-docs-component example="si-tabs/si-tabs-next-routing"></si-docs-component>

### TabsNext - Icons

<si-docs-component example="si-tabs/si-tabs-next-icons"></si-docs-component>

<si-docs-api component="SiTabsetNextComponent"></si-docs-api>

<si-docs-api component="SiTabNextComponent"></si-docs-api>

<si-docs-api component="SiTabNextLinkComponent"></si-docs-api>

<si-docs-types></si-docs-types>
