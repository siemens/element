/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type {
  ApiDocumentation,
  ApiEntry,
  ApiMember,
  ApiParameter,
  ApiSignature
} from '../extraction/model.ts';

/** Minimal hand-built extraction models for normalization scenarios. */
export const testPackage = '@test/library';
export const source = { filePath: 'source.ts', startLine: 1, endLine: 3 };

export const entry = (name: string, overrides: Partial<ApiEntry> = {}): ApiEntry => ({
  id: `${overrides.importPath ?? overrides.packageName ?? testPackage}#${name}`,
  name,
  packageName: testPackage,
  importPath: overrides.packageName ?? testPackage,
  kind: 'interface',
  description: '',
  jsdocTags: [],
  source,
  members: [],
  ...overrides
});

export const member = (name: string, overrides: Partial<ApiMember> = {}): ApiMember => ({
  name,
  kind: 'property',
  type: 'string',
  description: '',
  jsdocTags: [],
  ...overrides
});

export const parameter = (name: string, overrides: Partial<ApiParameter> = {}): ApiParameter => ({
  name,
  type: 'string',
  description: '',
  ...overrides
});

export const signature = (overrides: Partial<ApiSignature> = {}): ApiSignature => ({
  parameters: [],
  returnType: 'void',
  generics: [],
  description: '',
  jsdocTags: [],
  source,
  ...overrides
});

export const method = (
  name: string,
  signatures: Partial<ApiSignature>[] = [{}],
  overrides: Partial<ApiMember> = {}
): ApiMember =>
  member(name, { kind: 'method', type: '', signatures: signatures.map(signature), ...overrides });

export const documentation = (...entries: ApiEntry[]): ApiDocumentation => ({
  schemaVersion: 1,
  entries,
  entryPoints: []
});
