// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  const sharedConfig = require('../../karma.shared.cjs').buildConfig(config, {
    name: 'dashboards-ng',
    testSuite: '@siemens/dashboards-ng'
  });
  config.set({
    ...sharedConfig,
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [...sharedConfig.plugins, require('@angular-devkit/build-angular/plugins/karma')]
  });
};
