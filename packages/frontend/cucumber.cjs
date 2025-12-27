const STEPS_IMPORT = ['src/features/steps-ts/preload.ts', 'src/features/steps-ts/setup.ts', 'src/features/steps-ts/**/*.steps.ts'];
const FEATURE_PATHS = '../specifications/**/*.feature';
const REPORT_PATH = 'tests/cucumber/reports/cucumber-report.json';

module.exports = {
  default: {
    import: STEPS_IMPORT,
    paths: [FEATURE_PATHS],
    tags: 'not @skip',
    format: ['progress', 'json:cucumber-results.json'],
    publishQuiet: true,
  },
  coverage: {
    import: STEPS_IMPORT,
    paths: [FEATURE_PATHS],
    tags: 'not @skip',
    format: ['progress', `json:${REPORT_PATH}`],
    publishQuiet: true,
  },
  all: {
    import: STEPS_IMPORT,
    paths: [FEATURE_PATHS],
    format: ['progress'],
    publishQuiet: true,
  },
};
