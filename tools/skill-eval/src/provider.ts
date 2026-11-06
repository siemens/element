/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  type ApiProvider,
  type CallApiContextParams,
  type GradingResult,
  type ProviderOptions,
  type ProviderResponse
} from 'promptfoo';

import { cases } from '../cases';
import { type EvaluationCase } from '../cases/types';
import { runSession, startOpenCode } from './agent/opencode';
import { type NormalizedResponse, normalizeTranscript } from './agent/transcript';
import { environmentValue, outputDirectory, requireTarget, skillId, timeouts } from './config';
import { createWorkspace, sourceChanges, sourceFiles } from './fixture/sources';
import { verifyBrowser } from './grading/browser';
import { verifyProject } from './grading/project';
import { type Check, createTemporaryDirectory, redact, writeJson } from './utils';
import { noSkill, skillDirectory } from './variants';

interface Trial {
  test: EvaluationCase;
  variant: string;
  repeat: number;
  prompt: string;
}

const grade = (pass: boolean, reason: string): GradingResult => ({
  pass,
  score: pass ? 1 : 0,
  reason
});

const isApplicationSource = (file: string): boolean =>
  file.startsWith(`src${path.sep}`) && !file.endsWith('.spec.ts');

const runTrial = async ({ test, variant, repeat, prompt }: Trial): Promise<ProviderResponse> => {
  const fixture = environmentValue('SKILL_EVAL_FIXTURE');
  if (!fixture) {
    throw new Error('SKILL_EVAL_FIXTURE is not set; run the evaluation with pnpm skills:eval');
  }
  const target = requireTarget();
  const output = outputDirectory();
  const id = `${test.id}-${variant}-${repeat}`;
  const logs = path.join(output, id);
  const root = await createTemporaryDirectory();
  const directory = path.join(root, 'app');
  const checks: Check[] = [];
  const grades: Record<string, GradingResult> = {};
  let response: NormalizedResponse | undefined;
  let error: string | undefined;
  let latencyMs = 0;
  await mkdir(logs, { recursive: true });
  try {
    const before = await createWorkspace(fixture, directory);
    const server = await startOpenCode({
      ...target,
      directory,
      home: path.join(root, 'home'),
      log: path.join(logs, 'opencode.log'),
      dependencies: path.join(fixture, 'node_modules'),
      skillDirectory: variant === noSkill ? undefined : skillDirectory(output, variant)
    });
    try {
      const started = Date.now();
      const session = await runSession(server.client, prompt, {
        directory,
        provider: target.provider,
        model: target.model,
        timeout: timeouts.agent
      });
      latencyMs = Date.now() - started;
      error = session.error;
      await writeFile(
        path.join(logs, 'transcript.json'),
        redact(JSON.stringify(session.transcript, undefined, 2))
      );
      const normalized = normalizeTranscript(session.transcript);
      response = normalized;
      if (variant !== noSkill) {
        const loaded = normalized.metadata.skillCalls.some(
          call => call.name === skillId && !call.is_error
        );
        grades.routing = grade(
          loaded,
          loaded ? 'Element skill was loaded' : 'Element skill was not loaded'
        );
      }
    } finally {
      await server.close();
    }
    const changes = sourceChanges(before, await sourceFiles(directory));
    await writeJson(path.join(logs, 'changes.json'), changes);
    const inScope = changes.every(change => isApplicationSource(change.file));
    checks.push({
      name: 'Change scope',
      pass: inScope,
      reason: `${changes.length} changed files; only application source may change`,
      artifact: 'changes.json'
    });
    if (inScope && !error) {
      const project = await verifyProject(directory, logs);
      checks.push(...project.checks);
      if (project.built) {
        checks.push(...(await verifyBrowser(directory, test, logs)));
      }
    }
  } catch (failure) {
    error = redact(String(failure));
  } finally {
    await rm(root, { recursive: true, force: true });
  }

  const failures = checks
    .filter(check => !check.pass)
    .map(check => `${check.name}: ${check.reason}`);
  const passed = !error && failures.length === 0;
  grades.task = grade(
    passed,
    error ?? (passed ? 'All independent project checks passed' : failures.join('; '))
  );
  const result: ProviderResponse = {
    output: response?.output ?? '',
    tokenUsage: response?.tokenUsage,
    cost: response?.cost,
    latencyMs,
    error,
    metadata: { ...response?.metadata, id, checks, grades }
  };
  await writeJson(path.join(logs, 'result.json'), result);
  return result;
};

export default class ElementSkillProvider implements ApiProvider {
  readonly config: { variant: string };

  constructor(options: ProviderOptions<{ variant: string }>) {
    if (!options.config) {
      throw new Error('Element skill provider configuration is required');
    }
    this.config = options.config;
  }

  id = (): string => this.config.variant;

  callApi = async (prompt: string, context?: CallApiContextParams): Promise<ProviderResponse> => {
    const test = cases.find(entry => entry.id === context?.vars.caseId);
    if (!test) {
      throw new Error(`Unknown evaluation case: ${String(context?.vars.caseId)}`);
    }
    return runTrial({
      test,
      variant: this.config.variant,
      repeat: (context?.repeatIndex ?? 0) + 1,
      prompt
    });
  };
}
