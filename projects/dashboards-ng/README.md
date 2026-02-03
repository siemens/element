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

The library supports standalone components and modules.

### Standalone

Import and include the `SiFlexibleDashboardComponent` in the component that shall provide the dashboard.
Optionally, configure the grid and the widget storage in the global app configuration providers.

```ts
providers: [
  provideRouter(routes, withHashLocation()),
  { provide: SI_WIDGET_STORE, useClass: AppWidgetStorage },
  { provide: SI_DASHBOARD_CONFIGURATION, useValue: config },
  provideTranslateService({
    loader: {
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [HttpBackend]
    },
    missingTranslationHandler: provideMissingTranslationHandlerForElement()
  }),
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
    SiDashboardsNgModule
  ],
  providers: [
    provideNgxTranslateForElement()
  ]
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Add `gridstack` CSS files to your application by editing
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
have to be provided by an Angular module or standalone and described by a `Widget` object, that includes
the meta information and the Angular widget instance component and editor names that are
used to instantiate the widget at runtime.

The widget instance component must implement the `WidgetInstance` interface and the
editor must implement the `WidgetInstanceEditor` interface. You must provide either
a module loader function with module name or a component loader function for standalone components
that is used to load the widget when needed.

The library ships with a [hello-widget](https://github.com/siemens/element/blob/main/projects/dashboards-demo/src/app/widgets/hello-widget/) example for illustration.

E.g. a widget implements a user interface that is added at runtime into the body of a dashboard card.
Optionally, the widget template may include a `<ng-template/>` to provides a footer implementation like
`<ng-template #footer><a [siLink]="link">Go to issues</a></ng-template>` in the [value-widget](https://github.com/siemens/element/blob/main/projects/dashboards-demo/src/app/widgets/charts/value-widget.component.ts).
The Angular component should export the template as the public attribute `footer`.

```ts
@ViewChild('footer', { static: true }) footer?: TemplateRef<unknown>;
```

### Remote Widget Loading (Microfrontends)

The flexible dashboard supports loading widgets as remote microfrontends, allowing widgets to be deployed and updated independently from the host application. Three integration options are available:

#### Pure Module Federation (Webpack-based)

Uses `@angular-architects/module-federation` to share code between host and remote applications. Both host and remotes must use Webpack as the bundler.

Register the loader in your application bootstrap:

```ts
import { registerModuleFederatedWidgetLoader } from '@siemens/dashboards-ng/module-federation';

registerModuleFederatedWidgetLoader();
```

```
+-------------------------+       +----------------------------------+
| Host App                |       | @angular-architects/             |
| Module Federation       |------>| module-federation                |
| (webpack)               |       |                                  |
+------------+------------+       +---------------^------------------+
             |                                    |
  registerModuleFederatedWidgetLoader             |
             |                                    |
+------------v------------+       +---------------+------------------+
| @siemens/dashboards-ng/ |       | Remote Widget                    |
| module-federation       |       | Module Federation                |
+-------------------------+       | (webpack)                        |
                                  +----------------------------------+
```

#### Pure Native Federation (ESM-based)

Uses `@angular-architects/native-federation` with ES Module-based federation, independent of the bundler. Works with any build tool (esbuild, Vite, Webpack). Recommended for modern Angular applications.

Register the loader in your application bootstrap:

```ts
import { registerNativeFederatedWidgetLoader } from '@siemens/dashboards-ng/native-federation';

registerNativeFederatedWidgetLoader();
```

```
+-------------------------+       +----------------------------------+
| Host App                |       | @angular-architects/             |
| Native Federation       |------>| native-federation                |
| (esbuild/Vite/webpack)  |       |                                  |
+------------+------------+       +---------------^------------------+
             |                                    |
  registerNativeFederatedWidgetLoader             |
             |                                    |
+------------v------------+       +---------------+------------------+
| @siemens/dashboards-ng/ |       | Remote Widget                    |
| native-federation       |       | Native Federation                |
+-------------------------+       | (esbuild)                        |
                                  +----------------------------------+
```

#### Hybrid/Bridge (Native Federation + Module Federation)

Enables a Native Federation shell to load Module Federation remotes using `@module-federation/runtime`. Useful for gradual migration or when integrating existing Webpack-based remotes into a modern ESM-based host.

Register the loader with your Module Federation instance:

```ts
import { registerModuleFederatedWidgetLoader } from '@siemens/dashboards-ng/native-federation/mf-bridge';

registerModuleFederatedWidgetLoader(mfInstance);
```

```
+-------------------------+       +----------------------------------+
| Host App                |       | @angular-architects/             |
| Native Federation       |------>| native-federation                |
| (esbuild)               |       |                                  |
+------------+------------+       +----------------------------------+
             |
             | registerModuleFederatedWidgetLoader(mfInstance)
             |
+------------v-----------------------+
| @siemens/dashboards-ng/            |
| native-federation/mf-bridge        |
+------------+-----------------------+
             |
             | loads
             |
+------------v------------+       +----------------------------------+
| @module-federation/     |       | Remote Widget                    |
| runtime                 |------>| Module Federation                |
+-------------------------+       | (webpack)                        |
                                  +----------------------------------+
```

For more details, refer to [Combining Native Federation and Module Federation](https://www.angulararchitects.io/blog/combining-native-federation-and-module-federation/).

#### Running the Demo Application

The [dashboard demo project](https://github.com/siemens/element/blob/main/projects/dashboards-demo/) includes examples of all microfrontend modes. Use these npm scripts to run locally:

```sh
# Module Federation mode (Webpack-based host and remotes)
npm run dashboards-demo:run-all:local

# Native Federation mode with Hybrid/Bridge support (ESM-based host with both Native and Module Federation remotes)
npm run dashboards-demo:run-all:esm:local
```

### Widget instance ID generation

Each widget instance on a dashboard requires a unique ID for identification and persistence. The library
provides a flexible system for generating these IDs through the `SiWidgetIdProvider` abstract class.

#### Default ID generation

By default, the library uses `SiWidgetDefaultIdProvider`, which generates unique IDs using
a RFC4122 version 4 UUID (e.g.,`'550e8400-e29b-41d4-a716-446655440000'`). This default implementation
uses `crypto.randomUUID()` to ensure cryptographically secure uniqueness with 122 bits of entropy.

#### Custom ID generation

To implement custom ID generation logic (e.g., UUID-based, sequential or
context-aware IDs), create a class that extends `SiWidgetIdProvider` and implement the
`generateWidgetId` method:

```ts
import { Injectable } from '@angular/core';
import { SiWidgetIdProvider } from '@siemens/dashboards-ng';

@Injectable()
export class CustomWidgetIdProvider extends SiWidgetIdProvider {
  override generateWidgetId(widget: WidgetConfig, dashboardId?: string): string {
    // Example: Create a composite ID from dashboard and widget type
    const prefix = dashboardId ?? 'default';
    const timestamp = Date.now();
    return `${prefix}-${widget.widgetId}-${timestamp}`;
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
your module providers or application config.

```ts
providers: [{ provide: SI_WIDGET_STORE, useClass: CustomWidgetStorage }];
```

### Configuration

The dashboard is configurable through the Angular inputs of the exposed components and by
the usage of the configuration object `Config`, which includes a `GridConfig` and including
the [GridStackOptions](https://github.com/siemens/element/blob/main/projects/dashboards-ng/src/model/gridstack.model.ts).

To configure all dashboard instances, you can leverage dependency injection by providing
the `SI_DASHBOARD_CONFIGURATION` token in your providers.
Alternatively, you have the option to configure individual dashboard instances by setting
the input property `SiFlexibleDashboardComponent.config = {...}`.

Here is the [demo](https://github.com/siemens/element/blob/main/projects/dashboards-demo/src/app/pages/fixed-widgets-dashboard/fixed-widgets-dashboard.component.ts)

## License

Code and documentation Copyright (c) Siemens 2016 - 2025

See [LICENSE.md](https://github.com/siemens/element/blob/main/LICENSE.md).
