import { withNativeFederation, share } from '@angular-architects/native-federation/config';
export default withNativeFederation({
  name: 'dashboards-demo-esm',

  shared: share({
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/forms': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    'gridstack': { singleton: true, strictVersion: true, requiredVersion: 'auto' }
  }),

  // Don't share any mapped paths - bundle them into the app instead
  sharedMappings: [],

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@siemens/ngx-datatable',
    // Use RegExp to skip ALL entry points!
    /^@angular\/platform-browser\/animations/,
    '@meteocons/svg-static',
    /^@module-federation/,
    /^@ngx-formly/,
    /^ol/,
    /^ngx-image-cropper/,
    /^google-libphonenumber/,
    /^echarts/,
    // Skip packages with assets that can't be bundled for browser
    'flag-icons'
    // Add further packages you don't need at runtime
  ],

  features: {
    // Disabled because sheriff-core doesn't support wildcard path mappings
    // like @siemens/element-ng/*: projects/element-ng/*/index.ts in tsconfig
    ignoreUnusedDeps: false
  }
});
