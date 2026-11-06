/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { environmentValue, repositoryDirectory, skillFile, skillId } from './config';

export const noSkill = 'none';

export const variantId = (spec: string): string => spec.replace(/[^\w.-]+/g, '-');

export const variantSpecs = (): string[] => {
  const specs = (environmentValue('SKILL_EVAL_VARIANTS') ?? `working-tree,${noSkill}`)
    .split(',')
    .map(spec => spec.trim());
  if (!specs.every(spec => /^\w[\w./@^~-]*$/.test(spec))) {
    throw new Error('SKILL_EVAL_VARIANTS must list none, working-tree, or Git refs');
  }
  if (new Set(specs.map(variantId)).size !== specs.length) {
    throw new Error('SKILL_EVAL_VARIANTS must not contain the same variant twice');
  }
  return specs;
};

export const skillDirectory = (output: string, variant: string): string =>
  path.join(output, 'skills', variant);

export const writeSkillSnapshots = async (output: string): Promise<void> => {
  for (const spec of variantSpecs().filter(entry => entry !== noSkill)) {
    const skill =
      spec === 'working-tree'
        ? await readFile(path.join(repositoryDirectory, skillFile), 'utf8')
        : execFileSync('git', ['show', `${spec}:${skillFile}`], {
            cwd: repositoryDirectory,
            encoding: 'utf8'
          });
    const file = path.join(skillDirectory(output, variantId(spec)), skillId, 'SKILL.md');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, skill);
  }
};
