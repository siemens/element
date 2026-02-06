# AG Grid

**AG Grid** is intended for highly complex, enterprise-level data grid use cases.

## Usage ---

It should be used only when requirements exceed what [NGX-datatable](NGX-datatable.md) can reasonably support,
such as spreadsheet-like behavior, advanced cell logic, or highly customized interactions.

**AG Grid requires a paid license and introduces higher implementation and maintenance costs**
Adoption should be justified by clear functional needs.

For AG Grid, we provide a theme to ensure visual alignment with Element.
However, styling and behavior are partially constrained by AG Grid itself, so not all Element patterns
and interactions can be fully enforced.

![AG Grid](images/ag-grid.png)

## Code ---

<!-- markdownlint-disable MD044-->

??? info "Required Packages"

    - [ag-grid-community](https://www.npmjs.com/package/ag-grid-community)

First, register the AG Grid modules in your `main.ts`:

```ts
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
```

Then, add the Element AG Grid configuration provider in your `app.config.ts`:

```ts
import { provideSiAgGridConfig } from '@siemens/element-ng/ag-grid';

export const appConfig: ApplicationConfig = {
  providers: [provideSiAgGridConfig()]
};
```

You can also pass a density mode and custom grid options:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideSiAgGridConfig('compact', {
      rowHeight: 30,
      suppressMenuHide: true
    })
  ]
};
```

### Client side pagination

<si-docs-component example="ag-grid/ag-grid-pagination" height="450"></si-docs-component>

### Infinite scroll

<si-docs-component example="ag-grid/ag-grid-infinite" height="450"></si-docs-component>

### Empty state

<si-docs-component example="ag-grid/ag-grid-empty-state" height="350"></si-docs-component>

### Filter

<si-docs-component example="ag-grid/ag-grid-filter" height="450"></si-docs-component>

### Row pinning

<si-docs-component example="ag-grid/ag-grid-row-pinning" height="450"></si-docs-component>
