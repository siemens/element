const {
  shareAll,
  withModuleFederationPlugin
} = require('@angular-architects/module-federation/webpack');

const config = withModuleFederationPlugin({
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  }
});

// Exclude native-federation packages from being processed by webpack
// These are ESM-only packages that cause issues with the webpack babel loader
config.externals = {
  ...config.externals,
  '@angular-architects/native-federation': 'commonjs @angular-architects/native-federation',
  '@softarc/native-federation-runtime': 'commonjs @softarc/native-federation-runtime'
};

module.exports = config;
