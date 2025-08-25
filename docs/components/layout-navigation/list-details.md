# List-Details

**List-Details** (formerly Main-detail container) is a layout pattern that shows a list of items and the corresponding
details of the selected item.
It allows users to stay focused on the main content (list) while accessing and editing
related details without losing context.

## Usage ---

Use this layout when viewing details from an item in a large list or group on the same page is required.

The content in the list pane such as list, data table or simple navigation is used to
control the information shown in the details pane.

Selecting an item from the list pane opens the details pane.
The user can select another item from the list pane to switch content of the details pane.

List-details layouts are optimized for wider screens, while also incorporating a
responsive behavior to adapt to various screen sizes.

![List-details](images/list-details.png)

### When to use

- For navigating through hierarchical data structures, making it easier for users to explore and understand content.
- When there's a need to navigate through large amounts of data or items but only focus on one item at a time.
- In scenarios where users might need to switch quickly between items without losing context.

## Design ---

### Elements

![List-details elements](images/list-details-elements.png)

1. **List pane:** Displays content types such as lists, tables or trees.
1. **List actions (optional):** These are the functions that a user can perform within the list pane.
1. **Details pane:** Displays information from the selected node, such as tables, forms or KPIs.
1. **Details title (optional):** It provides context about the information displayed, e.g. name of the selected item
1. **Details actions (optional):** Functions that can be performed within the details pane.

### Resizing the panes

The two sections can be dynamically resizable: when users hover over the dividing area,
the cursor turns into a double-sided arrow, allowing for size adjustments.

![List-details resize](images/list-details-resize.png)

### Edit mode

An 'Edit mode' can be optionally enabled in the details pane, allowing content modifications.
When active, 'Save' and 'Cancel' actions are displayed in a footer.

The main content area is scrollable independently of the footer.
This way, the footer remains visible and accessible even when the content overflows.

![List-details edit](images/list-details-edit.png)

### Search and actions in list

These actions are designed to manipulate data in the list pane.

They are context-specific, meaning they directly affect the item in the list pane.
For example, a bulk action to "Update user permissions" to modify settings
for multiple users at once, or "Adjust settings for multiple zones"
enables uniform changes across different areas in a single step.

Any button type can be used as an action.
However, if more than one action is needed, they should be collapsed over a menu, or reconsidered as global actions.

![List-details actions](images/list-actions.png)

### Filtering in the list

If filters are needed in the list, a filter button can be placed above the content.
Applied filters can be represented with a filter bar.

If the action next to the search bar is used for another purpose, the filter button can be placed next to the applied filters.

![List-details filters](images/list-filters.png)

Filters in the list pane can overlay the content to show filtering options.
When activated, a panel appears, allowing users to select criteria, and then retracts
to update the displayed content based on the selected filters.

![List-details filters flow](images/list-details-filters-flow.png)

### Global search and actions

Unlike the actions that are exclusive to the 'List' or 'Details',
global actions transcend specific areas and provide functionality that
is consistently relevant regardless of the user's current focus.
E.g.: A 'Create' button that initiates the process to create a new entry to the list pane.

![List-details global actions](images/list-details-global-actions.png)

### Bulk actions

When multiple items can be selected, the details pane will display an [empty state](../status-notifications/empty-state.md)
guiding users to either perform an action or clear the selection.

![List-details bulk actions](images/list-details-bulk-action.png)

### Initial interaction

Consider the initial interaction: It can either feature a preselected item, displaying its details,
or be user-initiated, where the details pane relists empty until an item is selected or created.

There can also be situations where the list pane itself is not populated until the user creates or adds an item.

In instances, where no data is immediately available, use an [empty state](../status-notifications/empty-state.md)
to guide the user.

![List-details initial interaction](images/list-details-initial-interaction.png)

### Responsive behavior

In responsive mode, the List-details splits into two screens: first displaying the main content,
then the details of a selected node with a 'Back' button.

![List-details responsive](images/list-details-responsive.png)

## Code ---

### Usage

```ts
import { SiListDetailsComponent } from '@siemens/element-ng/list-details';

@Component({
  imports: [SiListDetailsComponent, ...]
})
```

The `<si-list-details>` represents the layout used to organize the different elements.
Inside it different child template components are used to assign the content to the correct position
in the list-details layout and enable the correct responsive styling, the `<si-list-pane>` and `<si-details-pane>`.

Inside the `<si-list-pane>` the following child components can be used:
- `<si-list-pane-header>`: Header of the list pane, typically containing search and actions.
- `<si-list-pane-body>`: Body of the list pane, typically containing the list or table.

Inside the `<si-details-pane>` the following child components can be used:
- `<si-details-pane-header>`: Header of the details pane, typically containing the title and actions.
- `<si-details-pane-body>`: Body of the details pane, typically containing the details content.
- `<si-details-pane-footer>`: Footer of the details pane, typically containing save and cancel actions.

It is highly advised to use at least the `<si-details-pane-header>` to show the back button in a responsive (mobile) view.

If the content may exceed the available space, the `overflow-auto` class should be applied
to the body components or a child inside them.

In the standard layout, the `card` class should be applied to both the `<si-list-pane>` and `<si-details-pane>`,
though it can also be moved to suite the design needs.

<si-docs-component example="si-list-details/si-list-details" height="500"></si-docs-component>

<si-docs-api component="SiListDetailsComponent"></si-docs-api>

<si-docs-api component="SiListPaneComponent"></si-docs-api>

<si-docs-api component="SiListPaneHeaderComponent"></si-docs-api>

<si-docs-api component="SiListPaneBodyComponent"></si-docs-api>

<si-docs-api component="SiDetailsPaneComponent"></si-docs-api>

<si-docs-api component="SiDetailsPaneHeaderComponent"></si-docs-api>

<si-docs-api component="SiDetailsPaneBodyComponent"></si-docs-api>

<si-docs-api component="SiDetailsPaneFooterComponent"></si-docs-api>

<si-docs-types></si-docs-types>

## Code (legacy) ---

### Usage

```ts
import { SiMainDetailContainerComponent } from '@siemens/element-ng/main-detail-container';

@Component({
  imports: [SiMainDetailContainerComponent, ...]
})
```

The `<si-main-detail-container>` represents the layout container used to organize the different elements.
The `slot` attribute on the child elements is used to assign them to the correct position in the list-details layout.

The `slot` attribute accepts one of the following values:

- `mainSearch`: Search field for the main list
- `mainActions`: Content actions for the main list
- `mainData`: List/table to show the main data
- `details`: Details pane
- `detailActions`: Content actions for the details pane

<si-docs-component example="si-main-detail-container/si-main-detail-container" height="500"></si-docs-component>

<si-docs-api component="SiMainDetailContainerComponent"></si-docs-api>
