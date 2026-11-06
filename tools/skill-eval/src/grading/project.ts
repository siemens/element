/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import path from 'node:path';

import { verifierScripts } from '../config';
import { type Check, runCommand } from '../utils';

export interface ProjectVerification {
  checks: Check[];
  built: boolean;
}

const failureExcerpt = (output: string, directory: string): string => {
  const excerpt = output
    .replaceAll(`${directory}${path.sep}`, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('npm '))
    .slice(-6)
    .join(' ');
  return excerpt.length > 700 ? `${excerpt.slice(0, 697)}...` : excerpt;
};

export const verifyProject = async (
  directory: string,
  logs: string
): Promise<ProjectVerification> => {
  const checks: Check[] = [];
  let built = false;
  for (const script of verifierScripts) {
    const log = path.join(logs, `${script.replaceAll(':', '-')}.log`);
    const { check, output } = await runCommand('npm', ['run', script], directory, log);
    checks.push({
      ...check,
      reason: check.pass ? check.reason : `${check.reason}. ${failureExcerpt(output, directory)}`,
      artifact: path.basename(log)
    });
    built ||= script === 'build' && check.pass;
  }
  return { checks, built };
};
