# Bootstrap table

**Bootstrap tables** are based on the native HTML table element and are intended for simple, mostly static data.

## Usage ---

Bootstrap table is the lowest-complexity option. Because it is based on the native HTML table element,
it comes with some inherent limitations.

- The header is not sticky when vertical scrolling is used.
- Column widths cannot be resized by users.
- Pagination is not supported.
- There is no built-in support for DOM or data virtualization, unlike ngx-datatable.
- Performance degrades with larger datasets (typically above ~500 rows), depending on DOM complexity and hardware.

![Bootstrap table](images/bootstrap-table.png)

### When to use

- Use it when the dataset is small.
- When the content is mostly read-only.
- When advanced interactions are not required.

## Code ---
