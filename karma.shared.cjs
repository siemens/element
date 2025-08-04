const headless = process.env.HEADLESS !== '0';
const seed = process.env.SEED;
const isCI = !!process.env.CI;
const isPW = !!process.env.PLAYWRIGHT_CONTAINER || !!process.env.PLAYWRIGHT;
const isFirefox = process.env.FIREFOX === '1';

const launcher =
  isCI || isPW
    ? require('./karma-playwright-launcher.cjs')
    : isFirefox
      ? require('karma-firefox-launcher')
      : require('karma-chrome-launcher');
const browsers =
  isCI || isPW
    ? ['PlaywrightChromiumHeadless', 'PlaywrightFirefoxHeadless']
    : headless
      ? isFirefox
        ? ['FirefoxHeadless']
        : ['ChromeHeadlessBigger']
      : isFirefox
        ? ['Firefox']
        : ['Chrome'];

module.exports.buildConfig = (config, { name, testSuite }) => ({
  basePath: '',
  hostname: 'localhost',
  frameworks: ['jasmine', '@angular-devkit/build-angular'],
  plugins: [
    require('karma-jasmine'),
    launcher,
    require('karma-jasmine-html-reporter'),
    require('karma-coverage'),
    require('karma-junit-reporter'),
    require('karma-spec-reporter'),
    require('karma-jasmine-seed-reporter'),
    require('@angular-devkit/build-angular/plugins/karma')
  ],
  client: {
    clearContext: false, // leave Jasmine Spec Runner output visible in browser
    jasmine: {
      seed
    }
  },
  jasmineHtmlReporter: {
    suppressAll: true // removes the duplicated traces
  },
  coverageReporter: {
    dir: require('path').join(__dirname, `./dist/coverage/${name}`),
    subdir: '.',
    reporters: [{ type: 'html' }, { type: 'cobertura' }, { type: 'text-summary' }],
    check: {
      global: {
        lines: 70 // TODO: increase once every test is migrated
      }
    }
  },
  junitReporter: {
    outputDir: require('path').join(__dirname, `./dist/reports/${name}`),
    suite: testSuite
  },
  specReporter: {
    suppressPassed: isCI,
    suppressSkipped: true
  },
  reporters: ['spec', 'kjhtml', 'junit', 'jasmine-seed'],
  port: 9876,
  colors: true,
  logLevel: config.LOG_INFO,
  autoWatch: !isCI,
  customLaunchers: {
    ChromeHeadlessBigger: {
      base: 'ChromeHeadless',
      flags: ['--window-size=1024,768']
    }
  },
  browsers,
  singleRun: isCI,
  browserNoActivityTimeout: 100000
});
