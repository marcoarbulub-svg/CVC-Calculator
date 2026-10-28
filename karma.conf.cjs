module.exports = function (config) {
  config.set({
    basePath: '', frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [require('karma-jasmine'), require('karma-chrome-launcher'), require('karma-jasmine-html-reporter'), require('karma-coverage'), require('@angular-devkit/build-angular/plugins/karma')],
    reporters: ['progress', 'coverage'],
    coverageReporter: { dir: require('path').join(__dirname, './coverage'), subdir: '.', reporters: [{ type: 'text-summary' }, { type: 'json-summary' }, { type: 'lcovonly' }] },
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: { ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] } },
    singleRun: true, restartOnFileChange: false
  });
};
