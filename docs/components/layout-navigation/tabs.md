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

## Code (next) ---

Element implements tabset and tab components that provide the correct styling and responsive behavior.
It supports the usage combined with the Angular router (preferred way) or alternatively as plain components.

### Tabs with Angular Router

When using the tabs with the Angular router, each tab is just an anchor with a `routerLink`.
Make sure to nest the `<router-outlet />` inside the `si-tabset-next` component as the tabset applies some accessibility attributes.
No need to apply `routerLinkActive`, this is done automatically.

```html
<si-tabset-next>
  <a si-tab-next heading="Tab 1" routerLink="./tab-1"></a>
  <a si-tab-next heading="Tab 2" routerLink="./tab-2"></a>
  
  <router-outlet />
</si-tabset-next>
```

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiTabsetNextComponent, SiTabNextLinkComponent } from '@siemens/element-ng/tabs-next';

@Component({
  templateUrl: './my-component.html',
  imports: [
    SiTabsetNextComponent,
    SiTabNextLinkComponent,
    RouterLink
  ]
})
export class MyComponent { }
```

A corresponding route definition looks like this:

```ts
import { Route } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tab-1', pathMatch: 'full' }, // Select the first tab by default
  { path: 'tab-1', component: Tab1Component },
  { path: 'tab-2', component: Tab2Component },
]
```

<si-docs-component example="si-tabs/si-tabs-next-routing"></si-docs-component>

### Tabs with plain components

In general, using the tabs with the Angular router is preferred as the state is stored in the URL.
So deep-linking and bookmarking is supported.
In some cases, this might not be needed, e.g. when using the tabs to group simple information on a page.

In this case, you can use the `si-tabset-next` component with `si-tab-next` components as children.

```html
<si-tabset-next>
  <si-tab-next heading="Tab 1">Tab 1 content</si-tab-next>
  <si-tab-next heading="Tab 2" [active]="true">Tab 2 content</si-tab-next>
</si-tabset-next>
```

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiTabsetNextComponent, SiTabNextComponent } from '@siemens/element-ng/tabs-next';

@Component({
  templateUrl: './my-component.html',
  imports: [
    SiTabsetNextComponent,
    SiTabNextComponent
  ]
})
export class MyComponent { }
```

By default, no tab is active until the user clicks one.
You can set the `active` property to `true` on one of the tabs to make it active by default.
Ensure that only one tab has the `active` property set to `true`. 
Otherwise, the behavior is undefined.

### Closable tabs

Both tab variants can be used as a closable tab.
A tab that can be closed must be explicitly marked as closable by setting the `closable` property to `true`.

```html
<si-tabset-next>
  @if(showTab1) {
    <a si-tab-next heading="Tab 1" routerLink="./tab-1" closable (closeTriggered)="removeTab1()"></a>
  }
</si-tabset-next>
```

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiTabsetNextComponent, SiTabNextLinkComponent } from '@siemens/element-ng/tabs-next';

@Component({
  templateUrl: './my-component.html',
  imports: [
    SiTabsetNextComponent,
    SiTabNextLinkComponent,
    RouterLink
  ]
})
export class MyComponent {
  showTab1 = true;

  removeTab1() {
    this.showTab1 = false;
  }
}
```

The tabset does not automatically remove a closed tab.
When `closeTriggered` is emitted, you need to handle the removal of the tab in your component logic.

<si-docs-component example="si-tabs/si-tabs-next"></si-docs-component>

<si-docs-api component="SiTabsetNextComponent"></si-docs-api>

<si-docs-api component="SiTabNextLinkComponent"></si-docs-api>

<si-docs-api component="SiTabNextComponent"></si-docs-api>

<si-docs-types></si-docs-types>
