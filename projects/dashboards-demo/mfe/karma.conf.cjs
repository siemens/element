// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set(
    require('../../../karma.shared.cjs').buildConfig(config, {
      name: 'dashboards-demo-mfe',
      testSuite: '@siemens/dashboards-demo-mfe'
    })
  );
};
