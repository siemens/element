# Siemens Dashboards

## Usage

Check out our [dashboard demo project](https://github.com/siemens/element/blob/main/projects/dashboards-demo/) for examples on how
to integrate the Siemens Dashboards library in your project.

### Install dependencies

To use the Siemens Dashboards in your project, add it to your dependencies
by executing:

```sh
npm install --save @siemens/dashboards-ng gridstack
```

### Add libraries to your project

The library supports standalone components and modules. However, the widgets when not using web components
or module federation still need a module definition.

### Standalone

Import and include the `SiFlexibleDashboardComponent` in the component that shall provide the dashboard.
Optionally, configure the grid and the widget storage in the global app configuration providers.

```ts
providers: [
  provideRouter(routes, withHashLocation()),
  { provide: SI_WIDGET_STORE, useClass: AppWidgetStorage },
  { provide: SI_DASHBOARD_CONFIGURATION, useValue: config },
  importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpBackend]
      }
    })
  ),
  provideAnimations(),
  provideNgxTranslateForElement(),
  provideHttpClient(withInterceptorsFromDi())
];
```

### Modules

Import the library to your Angular `AppModule`, mostly residing in your
`src/app/app.modules.ts` file as follows:

```ts
// [...]
// Import this library
import { SiDashboardsNgModule } from '@siemens/dashboards-ng';
// Import needed peer dependency
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,

    // Import this library
    SiDashboardsNgModule.forRoot({})
  ],
  providers: [
    provideNgxTranslateForElement()
  ]
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Add `gridstack` CSS files to you application by editing
the `angular.json` file.

```json
"styles": [
  "src/styles.scss",
  "node_modules/gridstack/dist/gridstack.css",
  "node_modules/gridstack/dist/gridstack-extra.css"
],
"allowedCommonJsDependencies": [
  "gridstack"
],
```

### Add the dashboard to your application

To add the dashboard to your application, add the `si-flexible-dashboard` component
to your template. Configure the widget catalog by setting the _widgetCatalog_ input
property.

The component expects to be added to a flex container with a defined height, as it grows in height
to the available space, following the [Fixed-height](https://element.siemens.io/fundamentals/layouts/content/#fixed-height)
concept.

For testing, set `style="display: flex; block-size: 800px;"` to the parent element. Please
note that the `si-flexible-dashboard` comes with the correct page margins.

```html
<div style="display: flex; block-size: 800px;">
  <si-flexible-dashboard heading="Sample Dashboard" [widgetCatalog]="[]">
    <div filters-slot><button class="btn btn-secondary">My Menu</button></div>
  </si-flexible-dashboard>
</div>
```

The correct approach is to use the full page height as explained at
[Fixed-height](https://element.siemens.io/fundamentals/layouts/content/#fixed-height).

```html
<div class="has-navbar-fixed-top si-layout-fixed-height h-100">
  <si-application-header> ... </si-application-header>
  <div class="si-layout-fixed-height">
    <si-flexible-dashboard heading="Sample Dashboard" [widgetCatalog]="[]">
      <div filters-slot><button class="btn btn-secondary">My Menu</button></div>
    </si-flexible-dashboard>
  </div>
</div>
```

### Translations

The dashboards comes with a couple of components with i18n support.
The library uses translation keys in the components and ships English
and German (`en.json`, `de.json`) translations for demonstration. The
files are located at the folder `node_modules/@siemens/dashboards-ng/assets/i18n/`
and provides you all used keys. You should include the keys in your translation
files and update the translations to your need.

For a quick test you can include the files from the library in your app.
Copy the files to your target by updated the `assets` definition in the `angular.json`
file.

```json
{
  "glob": "**/*",
  "input": "node_modules/@siemens/dashboards-ng/assets/i18n",
  "output": "./assets/i18n/dashboard/"
}
```

Use the `MultiTranslateHttpLoader` to load your and the library translation
files.

```ts
...
export function createTranslateLoader(_httpBackend: HttpBackend) {
  return new MultiTranslateHttpLoader(_httpBackend, ['/assets/i18n/', '/assets/i18n/dashboard/']);
}

...

TranslateModule.forRoot({
  loader: {
    provide: TranslateLoader,
    useFactory: (createTranslateLoader),
    deps: [HttpBackend]
  }
})
```

### Widget development

You can develop your own widgets that are managed by the dashboard. One or multiple widgets
have to be provided by an Angular module and described by a `Widget` object, that includes
the meta information and the Angular widget instance component and editor names that are
used to instantiate the widget at runtime.

The widget instance component has to implement the `WidgetInstance` interface and the
editor has to implement the `WidgetInstanceEditor` interface. You have to provide a
module loader function that is used to load the widget when needed.

The library ships with a [hello-widget](https://github.com/siemens/element/blob/main/projects/dashboards-demo/src/app/widgets/hello-widget/) example for illustration.

E.g. a widget implements a user interface that is added at runtime into the body of a dashboard card.
Optionally, the widget template may include a `<ng-template/>` to provides a footer implementation like
`<ng-template #footer><a [siLink]="link">Go to issues</a></ng-template>` in the [value-widget](https://github.com/siemens/element/blob/main/projects/dashboards-demo/src/app/widgets/charts/value-widget.component.ts).
The Angular component should export the template as the public attribute `footer`.

```ts
@ViewChild('footer', { static: true }) footer?: TemplateRef<unknown>;
```

### Widget instance ID generation

Each widget instance on a dashboard requires a unique ID for identification and persistence. The library
provides a flexible system for generating these IDs through the `SiWidgetIdProvider` abstract class.

#### Default ID generation

By default, the library uses `SiWidgetDefaultIdProvider`, which generates random alphanumeric IDs
(e.g., `'k3j9x2m'`) for each new widget instance. This default implementation ensures uniqueness
through randomization but doesn't provide predictable or meaningful IDs.

#### Understanding ID generation workflow

The library uses two types of IDs during the widget lifecycle:

1. **Transient IDs**: Temporary IDs assigned to widgets when they are added to the dashboard in edit mode but not yet saved. These are generated by the `transientWidgetIdResolver` method and are prefixed with `'transient-'` by default (e.g., `'transient-k3j9x2m'`).

2. **Persistent IDs**: Permanent IDs assigned when the dashboard is saved. These are generated by the `widgetIdResolver` method and replace the transient IDs during the save operation.

This two-phase approach allows widgets to be placed and configured on the dashboard immediately while deferring the final ID assignment (which might involve async operations like server calls) until save time.

#### Custom ID generation

To implement custom ID generation logic (e.g., UUID-based, sequential, server-generated, or
context-aware IDs), create a class that extends `SiWidgetIdProvider` and implement the
`widgetIdResolver` method:

```ts
import { Injectable } from '@angular/core';
import { SiWidgetIdProvider } from '@siemens/dashboards-ng';

@Injectable()
export class CustomWidgetIdProvider extends SiWidgetIdProvider {
  override widgetIdResolver(widget: WidgetConfig, dashboardId?: string): string | Promise<string> {
    // Example: Create a composite ID from dashboard and widget type
    const prefix = dashboardId ?? 'default';
    const timestamp = Date.now();
    return `${prefix}-${widget.widgetId}-${timestamp}`;
  }
}
```

For asynchronous ID generation (e.g., fetching from a backend service):

```ts
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ServerWidgetIdProvider extends SiWidgetIdProvider {
  private http = inject(HttpClient);

  override async widgetIdResolver(widget: WidgetConfig, dashboardId?: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<{ id: string }>('/api/widgets/generate-id', {
        widgetId: widget.widgetId,
        dashboardId
      })
    );
    return response.id;
  }
}
```

Optionally, you can also override the `transientWidgetIdResolver` method to customize how temporary IDs are generated:

```ts
@Injectable()
export class CustomWidgetIdProvider extends SiWidgetIdProvider {
  override widgetIdResolver(widget: WidgetConfig, dashboardId?: string): string | Promise<string> {
    // Your persistent ID logic
    return `${dashboardId ?? 'default'}-${widget.widgetId}-${Date.now()}`;
  }

  override transientWidgetIdResolver(
    widget: Omit<WidgetConfig, 'id'>,
    dashboardId?: string
  ): string {
    // Your custom transient ID logic
    return `temp-${dashboardId ?? 'default'}-${widget.widgetId}-${Date.now()}`;
  }
}
```

#### Providing a custom ID provider

To use your custom ID provider, register it in your application's providers:

```ts
// For standalone applications
providers: [{ provide: SI_WIDGET_ID_PROVIDER, useClass: CustomWidgetIdProvider }];

// For module-based applications
@NgModule({
  providers: [{ provide: SI_WIDGET_ID_PROVIDER, useClass: CustomWidgetIdProvider }]
})
export class AppModule {}
```

### Dashboard persistence

The library persists a dashboard configuration by the default `SiDefaultWidgetStorage` implementation
of the API [SiWidgetStorage](https://github.com/siemens/element/blob/main/projects/dashboards-ng/src/model/si-widget-storage.ts). The
`SiDefaultWidgetStorage` uses the `Storage` implementation `sessionStorage`. You can set a different
`Storage` like the `localStorage` by providing the `DEFAULT_WIDGET_STORAGE_TOKEN` in the related module.

```ts
providers: [..., { provide: DEFAULT_WIDGET_STORAGE_TOKEN, useValue: localStorage }],
```

For persistence in a backend service, you should implement your own
[SiWidgetStorage](https://github.com/siemens/element/blob/main/projects/dashboards-ng/src/model/si-widget-storage.ts) and provide it in
the library module definition.

```ts
SiDashboardsNgModule.forRoot({
  config: {},
  dashboardApi: {
    provide: SiWidgetStorage,
    useClass: CustomWidgetStorage
  }
});
```

### Configuration

The dashboard is configurable through the Angular inputs of the exposed components and by
the usage of the configuration object `Config`, which includes a `GridConfig` and including
the [GridStackOptions](https://github.com/siemens/element/blob/main/projects/dashboards-ng/src/model/gridstack.model.ts).

To configure all dashboard instances, you can leverage dependency injection when importing
the `SiDashboardsNgModule` using `SiDashboardsNgModule.forRoot({...})`.
Alternatively, you have the option to configure individual dashboard instances by setting
the input property `SiFlexibleDashboardComponent.config = {...}`.

Here is the [demo](https://github.com/siemens/element/blob/main/projects/dashboards-demo/src/app/pages/fixed-widgets-dashboard/fixed-widgets-dashboard.component.ts)

## License

Code and documentation Copyright (c) Siemens 2016 - 2025

See [LICENSE.md](https://github.com/siemens/element/blob/main/LICENSE.md).
