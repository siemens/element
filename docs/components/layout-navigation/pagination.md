# Pagination

Pagination is used for splitting up content or data into several pages, with a control for navigating to the next or previous page.

## Usage ---

![Pagination](images/pagination.png)

### When to use

Generally, pagination is used if there are more than 25 items displayed in one view. The default number displayed will vary depending on the context.

### When pagination may not help

Pagination should not be shown if only one page is available.

### Alternative

From an UX point of view an alternative and better approach is called "Load More" pagination.
When users scroll down to the bottom of the results page, they can consciously decide whether they want to see more results or not.
If they want to continue browsing, they simply need to click on the button “Load More”. New results will either be appended under the current page or the whole page will be refreshed with new results.

## Design ---

### Elements

![Pagination](images/pagination-usage-construction.png)

> 1. Navigation arrows, 2. Current page,  3. "More" indicator

### Number of Pages

A maximum of 7 pages or items can be displayed.

![Pagination](images/pagination-usage-7-elements.png)

When the total number of pages exceeds 7, then the remaining pages will be truncated. The navigation arrows should always be displayed.

![Pagination](images/pagination-usage-more-elements.png)

### Placement of pagination component

Pagination should be placed at the bottom right of the table.
![Pagination](images/pagination-usage-placement.png)

## Code ---

**Pagination** - provide pagination links for your site or app with the
multi-page pagination component, or the simpler pager alternative.

### Usage

```ts
import { SiPaginationComponent } from '@siemens/element-ng/pagination';

@Component({
  imports: [SiPaginationComponent, ...]
})
```

<si-docs-component example="si-pagination/si-pagination"></si-docs-component>

<si-docs-api component="SiPaginationComponent"></si-docs-api>

<si-docs-types></si-docs-types>
