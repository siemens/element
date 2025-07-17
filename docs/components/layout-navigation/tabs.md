# Tabs

Tabs are used to separate information into logical sections in the context of a single page and to quickly navigate between them.

## Usage ---

![Tabs](images/tabs.png)

### When to use

- Use tabs to group content that belongs to the same category.
- Use tabs when there is a large amount of content that can be separated.
- Use tabs to make the content accessible without navigating across pages or compromising on space.
- Different tab-panes should be logically related but mutually exclusive. A content element should only be in one tab at a time.

### Best practices

- Don't mix different content types within the same tab structure.
- Avoid nested tabs (2 levels of tabs stacked on top of each other) since they add visual complexity, and are harder to navigate.

## Design ---

### Elements

![Tabs](images/tabs-elements.png)

> 1. Active tab, 2. Badge (optional), 3. Default tab, 4. Overflow menu

### Tab label

![Tabs](images/tabs-usage-behavior-long-label.png)

- The label describes the content contained within it.
- Labels are concise and use no more than two words.
- Tab labels should be written in title case and all words should be proper nouns.
- The label will not be truncated and uses the space it needs.
- The minimum width of a tab is `124px`.

### Number of tabs

In most scenarios, you should use no more than six tabs. This ensures an uncluttered UI and reduces cognitive load for users.
If more than six tabs are needed, consider other navigation patterns.

### Order

The order of all tabs should be consistent across all pages. Tabs with related content should be grouped adjacent to each other. The most important tab should be the first.

### Badge

![Tabs](images/tabs-usage-badge.png)

A small badge (dot) can be displayed in tabs to indicate when new information is available. The badge can also contain a number to display the amount of notifications.

### Icon tabs

![Tabs](images/tabs-usage-icons.png)

If there is not enough space to display meaningful labels, a tab version with icons can be used.

> **Note:** This version only works with meaningful icons!

### Closable tabs

![Tabs closable](images/tabs-closable.png)

This variation allows users to open multiple tabs for multitasking or comparing information side by side, and subsequently close them as needed. They can be used in combination with badges.

> **Note:** Closable tabs cannot be used in combination with icons.

### Responsive behavior

When there isn’t enough space to display all the tabs, the ones that no longer fit collapse into a menu.
This menu contains all the tabs in the same order, ensuring consistent navigation while optimizing space.

![Tabs](images/tabs-responsive.png)

## Code ---

Element provides its own tab component to allow for the desired responsive
behavior.

### Usage

`si-tabs` can be imported using the module

```ts
import { SiTabsModule } from '@siemens/element-ng/tabs';

@NgModule({
  imports: [SiTabsModule, ...]
})
```

or as a standalone component:

```ts
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';

@Component({
  imports: [
    SiTabComponent,
    SiTabsetComponent,
    ...
  ]
})
```

### Tabs - Basic

<si-docs-component example="si-tabs/si-tabs"></si-docs-component>

### Tabs - Responsive Behavior

<si-docs-component example="si-tabs/si-tabs-arrow"></si-docs-component>

<si-docs-api component="SiTabsetComponent"></si-docs-api>

<si-docs-api component="SiTabComponent"></si-docs-api>

<si-docs-types></si-docs-types>
