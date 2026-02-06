# Datatable (ngx-datatable)

**Datatable** is the default solution for large and interactive tables.

## Usage ---

Datatable (`ngx-datatable`) is the recommended solution for large datasets
and interactive tables.

It supports sorting, filtering, paging, selection, virtualization, and keyboard interaction,
while remaining flexible about data handling.

![Datatable](images/datatable.png)

### When to use

- To handle large datasets.
- When sorting, filtering, paging, or selection is required.
- To support column reordering.
- To support empty states (client or server).
- To support server-side filtering and sorting.
- To support grouped or tree rows
- To support row dragging.
- To support sticky columns.

## Code ---

Element provides two different approaches for the implementation of tables and data grids:

1. **Bootstrap Table** based on the standard HTML `table` for small tables showing mostly static data
2. **Datatable** (`<ngx-datatable>`) for large data sets while supporting various user interactions

There are various advantages and disadvantages to each approach depending on context and requirements.
Please check the capabilities and limitations of each approach and make sure to consider both
architectural as well as UX requirements in your decision.

Following some constraints and limitations when using the Bootstrap table approach:

- Header title is not "sticky" to stay on top when using vertical scroll bars
- Column width cannot be manually resized by the user
- No pagination support
- No inherent support for DOM and/or data virtualization as supported by ngx-datatable
- Performance issues with higher number of rows (>500), but this also depends on DOM complexity and hardware specs

> **Note:** The ngx-datatable implements change detection based on immutable table data.
> E.g. when only the content of a particular cell has changed, this change is not detected by the ngx change detection.
> See also the [remark in the ngx-datatable documentation](https://siemens-com.gitbook.io/ngx-datatable/readme/cd).

### Usage

`ngx-datatable` is an Angular component for presenting large and complex data.
The table is designed to be flexible and light. It doesn't make any
assumptions about the data or how you filter, sort or page it.
Check out the [full documentation](https://siemens-com.gitbook.io/ngx-datatable/),
[demos](http://siemens.github.io/ngx-datatable/) and the [demo code](https://github.com/siemens/ngx-datatable/blob/master/src/app)
for more information!

<!-- markdownlint-disable MD044-->

??? info "Required Packages"

    - [@siemens/ngx-datatable](https://www.npmjs.com/package/@siemens/ngx-datatable)

```ts
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SI_DATATABLE_CONFIG, SiDatatableModule, provideSiDatatableConfig } from '@siemens/element-ng/datatable';

// standalone apps
export const APP_CONFIG: ApplicationConfig = {
  providers: [
    ...
    provideSiDatatableConfig()
    // For smaller row heights:
    // provideSiDatatableConfig({rowHeight: SI_DATATABLE_CONFIG.rowHeightSmall})
  ]
};

// module based apps
@NgModule({
  imports: [
    NgxDatatableModule.forRoot(SI_DATATABLE_CONFIG),
    // For smaller row heights:
    // NgxDatatableModule.forRoot({ ...SI_DATATABLE_CONFIG, rowHeight: SI_DATATABLE_CONFIG.rowHeightSmall }),
    SiDatatableModule,
    // ...
  ]
})
```

#### Style configuration

No additional configuration is necessary as everything is already provided in the Element theme.

### Keyboard interaction

To have the correct keyboard interaction, use the `siDatatableInteraction` directive.

### Right align columns

There is a small but powerful trick how to right align columns with `ngx-datatable`. Notice how the `Age` column is
right aligned in the example below. In the TypeScript code you can see that the table columns support two properties
called `headerClass` and `cellClass` that can be used to apply a CSS class to the column header as well as the column's
body cells:

```ts
{
  headerClass: 'justify-content-end', // right align column header
  cellClass: 'text-align-right-cell' // right align body cell
}
```

For the `headerClass` you can use the existing Bootstrap utility class `justify-content-end` to right align the column header.
For the `cellClass` you have to define your own custom class `text-align-right-cell` and add the following SCSS code
in your stylesheet:

```scss
::ng-deep {
  // center align datatable cell
  .text-align-right-cell .datatable-body-cell-label {
    flex: 1;
    text-align: end;
  }
}
```

<si-docs-component example="datatable/datatable-footer" height="750"></si-docs-component>

### Client-side paging, sorting and selection options

- Use `class="table-element"` on `<ngx-datatable>`.
- Use the [pagination](../layout-navigation/pagination.md) component as custom
  footer template with `ngx-datatable-footer` and map inputs and outputs.

<si-docs-component example="datatable/datatable" height="750"></si-docs-component>

### Server-side paging

Datatable component configured for server-side paging and lazy loading.

<si-docs-component example="datatable/datatable-paging" height="600"></si-docs-component>

### Vertical scroll

This example shows a table that grows to the maximum available height, using the
`layout-fixed-height` class (see also [Content Layouts](../../fundamentals/layouts/content.md)).
The property `scrollbarV` is used to enable vertical scrolling within the table.
Enabling `scrollbarVDynamic` removes the scrollbar width from the row width
only when actually needed.

<si-docs-component example="datatable/datatable-vertical-scrolling" height="450"></si-docs-component>

### Infinite scroll

Datatable component configured for server-side virtual paging. The data is loaded
in pages from the server.

<si-docs-component example="datatable/datatable-paging-virtual" height="450"></si-docs-component>

### Empty state

Use the `<si-empty-state></si-empty-state>` for an empty table.

<si-docs-component example="datatable/datatable-empty-custom" height="250"></si-docs-component>

### Selection

Datatable with a selection. Use the `datatableInteractionAutoSelect` input of the `siDatatableInteraction`
directive to have it automatically select on keyboard navigation.

<si-docs-component example="datatable/datatable-selection" height="600"></si-docs-component>

### Filter and sort

<si-docs-component base="datatable" height="300">
  <si-docs-tab example="datatable-filter-sort-server" heading="Server side"></si-docs-tab>
  <si-docs-tab example="datatable-filter" heading="Client side"></si-docs-tab>
</si-docs-component>

### Responsive

<si-docs-component example="datatable/datatable-responsive" height="600">
</si-docs-component>

### Fix height

<si-docs-component example="datatable/datatable-fixed-height" height="600">
</si-docs-component>

### Sticky columns with horizontal scroll

<si-docs-component example="datatable/datatable-sticky-columns" height="600">
</si-docs-component>

### Reordering rows using Angular CDK Drag and Drop

<si-docs-component example="datatable/datatable-row-dragging" height="600">
</si-docs-component>

### Column management

<si-docs-component example="datatable/datatable-column-reorder" height="600">
</si-docs-component>

### Resizing

Datatables do have a fixed, automatically updated size, assumed during their
initial rendering and refreshed during screen-size changes. However, they are
not automatically refreshed in case their parent container changes size. It is
the responsibility of a consuming application to invoke a recalculation if such
an event occurs. Such a recalculation can be initiated by using the
`recalculate()` function, exposed by the component.

```ts
// ...

@ViewChild(DatatableComponent) table?: DatatableComponent;

// ...

resizeTable() {
  setTimeout(() => this.table?.recalculate());
}
```

> **Note:** For the component to obtain the correct size information, the
> recalculation has to happen after the actual resizing event. To ensure that,
> the `setTimeout()` has to be used.

The recalculation can either be triggered whenever changes on the DOM are made
(e.g. when panels are collapsed/expanded) or by using Element's `siResizeObserver`
directive. If you use `siResizeObserver` directive ensure that you have imported
`SiResizeObserverDirective` in your standalone component or module.

```html
<ngx-datatable (siResizeObserver)="resizeTable()" ...></ngx-datatable>
```

### Bootstrap Table

For simple HTML tables the general [Bootstrap Tables](https://getbootstrap.com/docs/5.1/content/tables/)
documentation applies. Add the CSS class `table-hover` for row hover effect. The theme comes with the
following styling for `table`:

<si-docs-component example="datatable/bootstrap" height="600"></si-docs-component>

<si-docs-api component="DatatableComponent" hideImplicitlyPublic="true"></si-docs-api>

#### Methods

<si-docs-type name="DatatableComponent.recalculate"></si-docs-type>

<si-docs-api directive="SiDatatableInteractionDirective"></si-docs-api>

<si-docs-types></si-docs-types>
