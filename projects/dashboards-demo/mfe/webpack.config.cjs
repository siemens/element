const {
  shareAll,
  withModuleFederationPlugin
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'mfe',
  exposes: {
    './Download': './projects/dashboards-demo/mfe/src/app/download.component.ts',
    './Upload': './projects/dashboards-demo/mfe/src/app/upload.component.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  }
});
