import { execFileSync } from 'node:child_process';
import { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import semanticRelease from 'semantic-release';

import { commitAnalyzerConfig, releaseNotesGeneratorConfig } from './config.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const branch = execFileSync('git', ['branch', '--show-current'], {
  cwd: repositoryRoot,
  encoding: 'utf8'
}).trim();

if (!branch) {
  throw new Error('A checked-out Git branch is required to generate a release preview.');
}

const config = {
  branches: [branch],
  dryRun: true,
  ci: false,
  plugins: [
    ['@semantic-release/commit-analyzer', commitAnalyzerConfig],
    ['@semantic-release/release-notes-generator', releaseNotesGeneratorConfig]
  ]
};

const silentOutput = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  }
});
const result = await semanticRelease(config, {
  cwd: repositoryRoot,
  stdout: silentOutput,
  stderr: process.stderr
});

if (result) {
  process.stdout.write(result.nextRelease.notes);
} else {
  console.log('No release would be created from this branch.');
}
