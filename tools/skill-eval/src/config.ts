/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
export const repositoryDirectory = path.resolve(packageDirectory, '../..');

export const initializerVersion = '0.1.0-rc.2';
export const fixtureName = 'element-skill-eval';
export const skillId = 'element';
export const skillFile = 'skills/element/SKILL.md';
export const documentationOrigin = 'https://element.siemens.io';

export const timeouts = {
  agent: 600_000,
  command: 600_000,
  page: 10_000,
  serverStart: 30_000,
  serverRequest: 10_000,
  serverStop: 5000
};

export const maxAgentSteps = 24;
export const maxLoggedOutput = 65_536;
export const viewportWidths = [1280, 375];
export const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
export const verifierScripts = ['lint', 'lint:sass', 'lint:format', 'build', 'test'];
export const ignoredDirectories = [
  'node_modules',
  '.angular',
  'dist',
  '.git',
  '.agents',
  '.opencode'
];

export interface EvaluationTarget {
  provider: string;
  model: string;
  baseUrl?: string;
}

export const environmentValue = (name: string): string | undefined => {
  const value = process.env[name]?.trim();
  return value === '' ? undefined : value;
};

export const outputDirectory = (): string => {
  const output = path.resolve(
    environmentValue('SKILL_EVAL_OUTPUT') ??
      path.join(packageDirectory, 'results', new Date().toISOString().replaceAll(':', '-'))
  );
  process.env.SKILL_EVAL_OUTPUT = output;
  return output;
};

export const requireTarget = (): EvaluationTarget => {
  const provider = environmentValue('SKILL_EVAL_PROVIDER');
  const model = environmentValue('SKILL_EVAL_MODEL');
  if (!provider || !model || !environmentValue('SKILL_EVAL_API_KEY')) {
    throw new Error(
      'Set SKILL_EVAL_PROVIDER, SKILL_EVAL_MODEL, and SKILL_EVAL_API_KEY before evaluating'
    );
  }
  return { provider, model, baseUrl: environmentValue('SKILL_EVAL_BASE_URL') };
};
