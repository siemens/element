# Unauthorized page

This page can be used when user is authenticated but does not have required access permissions.

!!! warning "Deprecation warning"
    The `si-unauthorized-page` component has been deprecated and will be
    removed in the future. Use the [info page](./info-page.md) instead.
    It is a superset and supports the same and even more use cases.

## Usage ---

### When to use

- When an authenticated user opens an application or page without having the required permissions.

## Code ---

### Usage

```ts
import { RouterModule } from '@angular/router';
import { SiUnauthorizedPageModule } from '@spike-rabbit/element-ng';

@NgModule({
  imports: [SiUnauthorizedPageModule, RouterModule, ..],
})
```

Use the `<si-unauthorized-page [...]=...></si-unauthorized-page>` component on a page of
your application and set the input properties as needed. All input strings are sent to
the translate pipe by the component.

### One follow-up option

Configure an external link, internal router link or a custom action by the link object
to provide a follow-up option to leave the unauthorized page or to get additional help.

<si-docs-component example="si-unauthorized-page/si-unauthorized-page" height="250"></si-docs-component>

### Multiple follow-up options

Leave the link object `undefined` and use content projection to offer multiple options for the user.
For example, you can set multiple buttons.

<si-docs-component example="si-unauthorized-page/si-unauthorized-page-choice" height="250"></si-docs-component>

<si-docs-api component="SiUnauthorizedPageComponent"></si-docs-api>

<si-docs-types></si-docs-types>
