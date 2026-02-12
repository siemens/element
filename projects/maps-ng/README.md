# Element Maps

Element maps library based on OpenLayers.

## Usage

To use this library in other projects, add it to your dependencies using:

```sh
npm install --save @siemens/maps-ng

# Also install the needed peer dependencies
npm install --save ol@~10.2.0 ol-ext ol-mapbox-style
```

Add library assets and CommonJs dependencies in your _angular.json_ under the build options

```json
{
  "architect": {
    "build": {
      "options": {
        "assets": [
          // ... other assets
          {
            "glob": "**/*",
            "input": "./node_modules/@siemens/maps-ng/assets",
            "output": "/assets/"
          }
        ],
        // ... other options
        "allowedCommonJsDependencies": [
          "xml-utils/find-tags-by-name.js",
          "xml-utils/get-attribute.js",
          "web-worker",
          "pbf",
          "earcut",
          "rbush"
        ]
      }
    }
  }
}
```

Import openlayers styles into your main global stylesheet

```scss
@use 'ol/ol.css';
```

Add the library to the list of _imports_ in your Angular _AppModule_ like this:

```ts
// [...]

// Import this library and required dependencies
import { SiMapModule } from '@siemens/maps-ng';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,

    // Import this library
    SiMapModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Or simply _import_ the `SiMapComponent` in your standalone component.

```ts
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [SiMapComponent],
  templateUrl: './sample.component.html',
  host: { class: 'h-100' }
})
export class SampleComponent {}
```

And lastly, add the map to your template and add a MapTiler key.
Note, the map has not height per default and comes with a `block`
display. Set the height or put it in a related container.

The demo key works on localhost. It will be renewed regularly
to avoid missuses of the key. Contact the SiMPL team to receive
a key for your SI BP product.

```html
<si-map [maptilerKey]="'REPLACE_WITH_YOUR_MAPTILER_KEY'" style="height: 500px;"></si-map>
```

### Testing

Do **not** load map data (tiles) from maptiler in automated tests, to reduce the number of
payed requests to a minimum. E.g. during testing, you want to test your functions and not the
tile data provided by maptiler.

- **Unit tests:** Do simply **not** provide an API key during
- **Playwright tests:** Stub the `tiles.json` request (and some others) using [page.route(...)](playwright/e2e/simpl-element/maps/static.spec.ts).

### Running Unit Tests

Run `yarn maps:test` to perform the unit tests via [Karma](https://karma-runner.github.io).
You can set a seed for running the tests in a specific using an environment variable: `SEED=71384 yarn maps:test`

## License

The following applies for code and documentation of the git repository,
unless explicitly mentioned.

Copyright (c) Siemens 2016 - 2026

MIT, see [LICENSE.md](https://github.com/siemens/element/blob/main/LICENSE.md).
