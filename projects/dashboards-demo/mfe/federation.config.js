const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe',
  exposes: {
    './Download': './projects/dashboards-demo/mfe/src/app/download.component.ts',
    './Upload': './projects/dashboards-demo/mfe/src/app/upload.component.ts'
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Use RegExp to skip ALL entry points!
    /^@module-federation/,
    // Skip packages with assets that can't be bundled for browser
    'flag-icons'
    // Add further packages you don't need at runtime
  ],

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  }
});
