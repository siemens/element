import writerOpts from './writer-opts.js';
import { commitTypes, parserOpts, releaseRules } from './commit-config.js';

export const commitAnalyzerConfig = {
  preset: 'angular',
  releaseRules,
  parserOpts: {
    ...parserOpts,
    noteKeywords: ['BREAKING CHANGE']
  },
  presetConfig: {
    types: commitTypes
  }
};

export const releaseNotesGeneratorConfig = {
  preset: 'angular',
  parserOpts: {
    ...parserOpts,
    noteKeywords: ['BREAKING CHANGE', 'NOTE', 'DEPRECATED'],
    issuePrefixes: ['#', 'gh-', 'CVE-']
  },
  writerOpts
};
