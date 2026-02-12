/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import ts from 'typescript';

import { DiscoveredSourceFile } from '../../utils/index.js';

/**
 * Generic context passed to all migration rules
 */
export interface MigrationContext {
  tree: Tree;
  discoveredSourceFile: DiscoveredSourceFile;
  recorder: UpdateRecorder;
}

export interface RenameElementTagParams {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  fromName: string;
  toName: string;
  defaultAttributes?: { name: string; value: string }[];
}

export interface Replacement {
  start: number;
  end: number;
  text: string;
}

export interface ChangeInstruction {
  start: number;
  width: number;
  newNode: ts.Node;
}
