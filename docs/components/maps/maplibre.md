# MapLibre

**MapLibre** is an open-source library for rendering interactive vector maps with WebGL.
Element supports Angular applications that use
[`@maplibre/ngx-maplibre-gl`](https://github.com/maplibre/ngx-maplibre-gl) with
control styles, a theme-aware map style, and translated control labels.

## Usage ---

MapLibre exposes its map, controls, sources, and layers as composable Angular components
and directives. Applications remain responsible for configuring and composing the map.

### When to use

- When direct access to MapLibre features, sources, and layers is required.
- When map controls and behavior need to be composed for a specific use case.
- When vector-map rendering and MapLibre's ecosystem are preferred.
- When the high-level [Element Maps](element-maps.md) component does not provide enough flexibility.

## Code ---

See the [ngx-maplibre-gl documentation](https://github.com/maplibre/ngx-maplibre-gl)
and the [MapLibre GL JS documentation](https://maplibre.org/maplibre-gl-js/docs/)
for the complete APIs and configuration options.

??? info "Required Packages"

    - [@maplibre/ngx-maplibre-gl](https://www.npmjs.com/package/@maplibre/ngx-maplibre-gl)
    - [maplibre-gl](https://www.npmjs.com/package/maplibre-gl)

```sh
npm install --save @siemens/element-ng @siemens/map-styles @siemens/element-translate-ng
npm install --save @maplibre/ngx-maplibre-gl maplibre-gl
```

### Configure the MapLibre worker

MapLibre GL JS 6 loads its web worker from a separate file. Add the worker and its
shared module to the application assets in `angular.json`:

```json
{
  "architect": {
    "build": {
      "options": {
        "assets": [
          {
            "glob": "maplibre-gl-{worker,shared}.mjs",
            "input": "node_modules/maplibre-gl/dist",
            "output": "/assets/maplibre/"
          }
        ]
      }
    }
  }
}
```

Register the worker in the application configuration before creating a map:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideMaplibreWorker } from '@maplibre/ngx-maplibre-gl/config';

export const appConfig: ApplicationConfig = {
  providers: [provideMaplibreWorker('assets/maplibre/maplibre-gl-worker.mjs')]
};
```

### Apply Element control styles

Import the Element MapLibre stylesheet in the application's global stylesheet. It
provides the required MapLibre layout styles and applies Element styling to controls,
popovers, markers, and other map UI.

```scss
@use '@siemens/element-ng/maplibre/styles';
```

Use this stylesheet instead of importing `maplibre-gl/dist/maplibre-gl.css` separately.

### Apply the Element map style

`injectSiMapStyle()` creates a signal containing the Element MapLibre style. Pass a
MapTiler API key to the function and bind the signal value to the map's `mapStyle`
input. The style updates automatically when the Element theme changes.

The function must be called in an Angular injection context, such as a component field
initializer.

```ts
import { Component } from '@angular/core';
import { MapComponent } from '@maplibre/ngx-maplibre-gl';
import { injectSiMapStyle } from '@siemens/element-ng/maplibre';

@Component({
  selector: 'app-map',
  imports: [MapComponent],
  template: '<mgl-map class="h-100" [mapStyle]="mapStyle()" />'
})
export class AppMapComponent {
  protected readonly mapStyle = injectSiMapStyle('REPLACE_WITH_YOUR_MAPTILER_KEY');
}
```

### Apply translations

`injectSiMapTranslations()` creates a signal containing translated MapLibre locale
strings. It uses the configured Element translation service and updates when the active
language changes. Bind the signal value to the map's `locale` input:

```ts
import { Component } from '@angular/core';
import { MapComponent } from '@maplibre/ngx-maplibre-gl';
import { injectSiMapTranslations } from '@siemens/element-ng/maplibre';

@Component({
  selector: 'app-map',
  imports: [MapComponent],
  template: '<mgl-map class="h-100" [locale]="mapTranslations()" />'
})
export class AppMapComponent {
  protected readonly mapTranslations = injectSiMapTranslations();
}
```

### MapLibre example

The following example combines the Element map style and translations with MapLibre controls.

<si-docs-component example="maplibre/maplibre" height="580"></si-docs-component>
