# Breadcrumb

**Breadcrumbs** help users to see their current location in relation to the rest of the website or application.

## Usage ---

Breadcrumbs display the user's location within a hierarchical structure,
showing the path from the highest-level entity (root) to the current page or content, one step at a time.

They typically begin with the root page and progress to the active page,
helping users understand where they are and navigate back to higher levels.

![Breadcrumb](images/breadcrumb.png)

### When to use

- Use breadcrumbs when the user is most likely to have landed on the page from an external source.
- Use for applications that have that have a large amount of content organized in a hierarchy of more than two levels.

### Best practices for breadcrumb

- Avoid using breadcrumbs on single-level sites or applications without a meaningful hierarchy.
- All breadcrumb items should be clickable.
- Breadcrumbs are secondary navigation, they should never replace the primary navigation.
- Use consistent naming that matches page titles or navigation labels.

## Design ---

### Elements

A breadcrumb consists of the following elements:

![Breadcrumb](images/breadcrumb-usage-construction.png)

1. **Root element:** Highest entity level, displayed with an icon or a text.
2. **Entity name:** An entity represents a section or page within the product or page. Entity names use a button link that uses the section or page title to link to that section or page.
3. **Separator:** Provides a visual distinction between individual entities using the same font as the rest of the breadcrumb (not icons).
4. **Current page or content:** Indicates the current position. It's not a link.

### Root element

The root element can either be the default icon `element-breadcrumb-root` or a meaningful text, like `Startpage`.

![Breadcrumb variants](images/breadcrumb-usage-variants.png)

### Responsive behavior

The default rule is to show as much of the path as possible in the available real estate.
Entities will be truncated if the available space is not sufficient to show the entire breadcrumb.

### Truncation

![Breadcrumb](images/breadcrumb-usage-truncation.png)

Super long entity names are truncated.

![Breadcrumb](images/breadcrumb-usage-truncation-dropdown.png)

In order to see the full entity label, the user can click on it and the full label will be shown, as a clickable menu element. Clicking somewhere on the screen will hide the menu.

### Long breadcrumb

![Breadcrumb](images/breadcrumb-usage-responsive-behavior.png)

When a path contains more levels of entities that can be displayed, the breadcrumb auto-collapses and uses ellipses to indicate more information.
It's best practice to show at least the first and last entity when collapsing.
Users expand the breadcrumb by clicking on the ellipses.

## Code ---

The first entry will be used as the root element and won't show the title but will be represented as an icon.

The `items` parameter takes an array of `BreadcrumbItem` entries. They contain a
`title` and `link` property. The `link` property can be an array or a string and
will be used as a `routerLink`.

### Usage

```ts
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb';

@Component({
  imports: [SiBreadcrumbRouterComponent,...]
})
```

<si-docs-component example="si-breadcrumb/si-breadcrumb"></si-docs-component>

### Breadcrumb Router

The `si-breadcrumb-router` component displays a breadcrumb according to the
Angular router hierarchy of the current route. The breadcrumb titles and
links are configurable by enriching the Angular route configuration with addition
data. The component uses the default implementation `SiBreadcrumbDefaultResolverService`
of the `SiBreadcrumbResolverService` interface, which reads the router configuration
and provides the `BreadcrumbItem` objects. Using the injector token
`SI_BREADCRUMB_RESOLVER_SERVICE` you can provide your own `SiBreadcrumbResolverService`
implementation.

```ts
import { SI_BREADCRUMB_RESOLVER_SERVICE, SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';

...

@Component({
  imports: [
    ...
    SiBreadcrumbRouterComponent,
  ],
  providers: [
    {
      provide: SI_BREADCRUMB_RESOLVER_SERVICE,
      useClass: YourBreadcrumbResolverService,
    }
  ]
  ...
})
```

When using the default resolver service you need to enrich the Angular route
configuration with breadcrumb information. The default resolver iterates
through the route hierarchy to construct the breadcrumb items. The breadcrumb
item title is taken from the path element or from a `title` property of the
`data` configuration object. For a custom configuration that deviate from
the route hierarchy, use a `siBreadcrumb` object in the `data` object that
provides the complete breadcrumb item information for that route. Configure
`title` and an optional `link`. The following example shows the variations:

- `title` configuration in `data` object
- `title` with route parameter configuration in `data` object
- `title` and `link` configuration in nested `siBreadcrumb` object

The `title` can also be a translation key and gets translated. Unfortunately,
translation does currently not work in combination with route parameter.

```ts
import { Route } from '@angular/router';

export const routes: Route[] = [
  {
    path: 'test',
    data: {
      title: 'Test' // Title is displayed in the breadcrumb
    },
    children: [
      {
        path: ':id',
        data: {
          title: 'Test - {id}' // id will be resolved with the current parameter value
        }
      }
    ]
  },
  {
    path: 'test/sub-test',
    data: {
      /*
      * In this scenario the automatic calculation of the route is broken because
      * test/sub-test is handled as one UrlSegment. Therefore, only one breadcrumb
      * link would be rendered. Providing the links manually solves this problem.
      * It is not possible to define wildcards in the link names here.
      */
      siBreadcrumb: [
        { title: 'Test', link: '/test' },
        { title: 'Sub-Test', link: '/test/sub-test' }
      ]
    }
  },
  {
    path: 'protocol/:idprotocol/run/:idrun',
    component: RunComponent,
    data: {
      siBreadcrumb: [
        { title: 'Protocol ({idprotocol})', link: 'protocol/:idprotocol' },
        { title: 'Run ({idrun})' } // current route is used if no path is provided
      ]
    }
  }
];
```

The `siBreadcrumb` object is an array of `BreadcrumbRouterLink` objects.

<si-docs-type name="BreadcrumbRouterLink"></si-docs-type>

See [Angular docs](https://angular.dev/api/router/Resolve) to learn how to resolve
route data with the Angular router resolvers.

<si-docs-component example="si-breadcrumb-router/si-breadcrumb-router"></si-docs-component>

### Custom Breadcrumb Resolver

There are scenarios where the default resolver is not sufficient. In those cases you can write a custom resolver like this:

```ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BreadcrumbItem } from '@siemens/element-ng/breadcrumb';
import { SiBreadcrumbDefaultResolverService } from '@siemens/element-ng/breadcrumb-router';
import { Observable } from 'rxjs';

@Injectable()
export class CustomBreadcrumbResolverService extends SiBreadcrumbDefaultResolverService {

  resolve(route: ActivatedRouteSnapshot): BreadcrumbItem[] | Observable<BreadcrumbItem[]> {
    return super.resolve(route)
      .map((link: BreadcrumbItem) => ({ ...link, title: rewriteName(link.name) }));
  }

}
```

The resolver uses the following type:

<si-docs-type name="SiBreadcrumbResolverService"></si-docs-type>

Afterwards you need to provide the custom resolver, instead of the default resolver, in your `app.module.ts`:

```ts
import { SI_BREADCRUMB_RESOLVER_SERVICE, SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';

...

@Component({
  imports: [
    ...
    SiBreadcrumbRouterComponent,
  ],
  providers: [
    {
      provide: SI_BREADCRUMB_RESOLVER_SERVICE,
      useClass: CustomBreadcrumbResolverService,
    }
  ]
  ...
})

export class AppComponent {
}
```

<si-docs-api component="SiBreadcrumbComponent"></si-docs-api>

<si-docs-api component="SiBreadcrumbRouterComponent"></si-docs-api>

<si-docs-types></si-docs-types>
