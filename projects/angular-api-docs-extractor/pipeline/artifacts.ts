/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ResolvedApiDocsConfig } from '../configuration.ts';
import type {
  ApiPresentation,
  PresentationBlock,
  PresentationFragment,
  PresentationRow,
  PresentationSignature,
  PresentationView
} from '../normalization/model.ts';
import type { ReferencePlan } from '../normalization/reference-plan.ts';
import { SCHEMA_VERSION } from '../schema.ts';

interface ReferenceCatalog {
  schemaVersion: typeof SCHEMA_VERSION;
  referencePages: Pick<ReferencePlan, 'pages' | 'navigation'>;
}

function safeUrl(value: string): void {
  if (
    !value ||
    /[\u0000-\u0020\u007f\\]/.test(value) ||
    value.startsWith('//') ||
    (/^[a-z][\w+.-]*:/i.test(value) && !/^(https?:|mailto:)/i.test(value))
  )
    throw new Error(`Unsafe API documentation URL: ${value}`);
  if (/^https?:/i.test(value)) {
    if (!/^https?:\/\/[^/]+/i.test(value))
      throw new Error(`API documentation URL has no host: ${value}`);
    new URL(value);
  }
}

export function safePagePath(pagePath: string, referenceDir: string): string {
  const normalized = pagePath.replaceAll('\\', '/');
  if (
    path.posix.isAbsolute(normalized) ||
    /^[a-z]:/i.test(normalized) ||
    normalized.split('/').some(segment => segment === '..' || segment === '.' || !segment) ||
    !normalized.endsWith('.md')
  )
    throw new Error(`Invalid generated documentation path: ${pagePath}`);
  if (!normalized.startsWith(`${referenceDir}/`))
    throw new Error(`Generated reference must be beneath ${referenceDir}/: ${pagePath}`);
  return normalized;
}

/** Check producer invariants that TypeScript cannot express before publishing JSON. */
function validatePreparedArtifacts(
  presentation: ApiPresentation,
  references: ReferencePlan,
  referenceDir: string
): void {
  if (presentation.schemaVersion !== SCHEMA_VERSION)
    throw new Error(`Expected API presentation schemaVersion ${SCHEMA_VERSION}.`);
  type Page = ReferencePlan['pages'][number];
  type Overview = Exclude<Page, { kind: 'symbol' }>;
  const entriesOf = (page: Overview) =>
    page.kind === 'category' ? page.groups.flatMap(group => group.entries) : page.entries;
  const pages = new Map<string, Page>();
  const validatePath = (pagePath: string) => safePagePath(pagePath, referenceDir);
  const { referencePaths } = references;
  for (const page of references.pages) {
    const pagePath = validatePath(page.path);
    if (pages.has(pagePath)) throw new Error(`Duplicate generated reference path: ${pagePath}`);
    pages.set(pagePath, page);
  }
  const rootPath = `${referenceDir}/index.md`;
  const root = pages.get(rootPath);
  if (root?.kind !== 'root')
    throw new Error(`Reference catalog requires the ${rootPath} root overview.`);
  for (const page of pages.values()) {
    if (page.kind === 'symbol') continue;
    const labels = new Set<string>();
    const entries = entriesOf(page);
    if (entries.some(entry => !entry.name || !entry.label.trim()))
      throw new Error('Invalid reference overview descriptor.');
    if (page.kind === 'category') {
      const { groups } = page;
      const initials = [...new Set(entries.map(entry => entry.name[0].toUpperCase()))].sort();
      if (
        groups.length !== initials.length ||
        groups.some(
          (group, index) =>
            !group.entries.length ||
            group.letter !== (initials.length > 1 ? initials[index] : '') ||
            group.entries.some(entry => entry.name[0].toUpperCase() !== initials[index])
        )
      )
        throw new Error('Invalid prepared reference category groups.');
    }
    for (const entry of entries) {
      if (page.kind === 'category' && labels.has(entry.label))
        throw new Error(`Duplicate reference category label: ${entry.label}`);
      labels.add(entry.label);
      const target = pages.get(validatePath(entry.path));
      if (entry.href !== './' + path.posix.relative(path.posix.dirname(page.path), entry.path))
        throw new Error(`Invalid reference entry href: ${entry.href}`);
      const expectedKind =
        page.kind === 'category' ? 'symbol' : page.kind === 'package' ? 'category' : 'package';
      if (!target || target.kind !== expectedKind)
        throw new Error(
          `Reference overview points to a missing or incompatible page: ${entry.path}`
        );
      if (target.kind === 'symbol' && target.name !== entry.name)
        throw new Error(`Inconsistent reference overview entry: ${entry.path}`);
    }
  }
  for (const canonical of Object.values(referencePaths)) {
    if (pages.get(validatePath(canonical))?.kind !== 'symbol')
      throw new Error('Reference canonical path points to a missing symbol page.');
  }
  const symbolIds = new Set<string>();
  const symbolPages = new Set<string>();
  for (const symbol of presentation.symbols) {
    if (symbolIds.has(symbol.id))
      throw new Error(`Duplicate API presentation symbol: ${symbol.id}`);
    symbolIds.add(symbol.id);
    symbolPages.add(JSON.stringify([symbol.name, symbol.importPath]));
    if (symbol.referencePath !== (referencePaths[symbol.id] ?? null))
      throw new Error(`Inconsistent canonical reference path for ${symbol.id}.`);
    if (symbol.referencePath !== null) {
      const page = pages.get(validatePath(symbol.referencePath));
      if (
        page?.kind !== 'symbol' ||
        page.name !== symbol.name ||
        page.importPath !== symbol.importPath
      )
        throw new Error(`Inconsistent canonical symbol descriptor for ${symbol.id}.`);
    }
  }
  for (const id of Object.keys(referencePaths))
    if (!symbolIds.has(id)) throw new Error(`Reference catalog contains an unknown symbol: ${id}`);
  for (const page of pages.values())
    if (page.kind === 'symbol' && !symbolPages.has(JSON.stringify([page.name, page.importPath])))
      throw new Error(`Reference page contains an unknown symbol: ${page.name}`);
  const validateIndex = (
    index: Record<string, string[]>,
    exists: (id: string) => boolean,
    label: string
  ): void => {
    for (const ids of Object.values(index))
      if (new Set(ids).size !== ids.length || ids.some(id => !exists(id)))
        throw new Error(`Invalid API presentation ${label} index.`);
  };
  validateIndex(presentation.index, id => symbolIds.has(id), 'symbol');
  const anchors = new Map<string, Set<string>>();
  const targets = presentation.targets;
  const members = presentation.members;
  for (const target of Object.values(presentation.targets)) {
    const used = anchors.get(target.symbolId) ?? new Set<string>();
    if (
      !symbolIds.has(target.symbolId) ||
      !target.anchor ||
      /\s/.test(target.anchor) ||
      used.has(target.anchor)
    )
      throw new Error('Invalid API presentation target.');
    used.add(target.anchor);
    anchors.set(target.symbolId, used);
  }
  const targetFor = (id: string, owner: string): void => {
    if (targets[id]?.symbolId !== owner) throw new Error(`Missing canonical API target: ${id}`);
  };
  const fragments = (parts: PresentationFragment[]): void => {
    for (const part of parts) {
      if (part.kind === 'link') {
        if ((part.targetId === null) === (part.href === null))
          throw new Error('Link needs exactly one targetId or href.');
        if (part.href !== null) safeUrl(part.href);
        if (part.targetId !== null && !targets[part.targetId])
          throw new Error('Unknown logical API target.');
      } else if (part.targetId !== null || part.href !== null)
        throw new Error('Plain fragment must have null targets.');
    }
  };
  const blocks = (items: PresentationBlock[]): void => {
    for (const block of items) fragments(block.parts);
  };
  const signatures = (items: PresentationSignature[], owner: string): void => {
    for (const signature of items) {
      targetFor(signature.id, owner);
      fragments(signature.label);
      blocks(signature.documentation);
      for (const parameter of signature.parameters) row(parameter, owner);
      fragments(signature.returns);
    }
  };
  const row = (item: PresentationRow, owner: string): void => {
    targetFor(item.id, owner);
    if (item.sourceUrl !== null) safeUrl(item.sourceUrl);
    fragments(item.type);
    blocks(item.documentation);
    signatures(item.signatures, owner);
  };
  const validateView = (prepared: PresentationView, owner: string): void => {
    blocks(prepared.documentation);
    fragments(prepared.declaration);
    signatures(prepared.signatures, owner);
    for (const group of prepared.groups)
      for (const preparedRow of group.rows) row(preparedRow, owner);
    const seen = new Set([owner]);
    for (const id of prepared.relatedTypeIds) {
      if (!symbolIds.has(id) || seen.has(id)) throw new Error('Invalid prepared related type ID.');
      seen.add(id);
    }
  };
  for (const symbol of presentation.symbols) {
    const owner = symbol.id;
    targetFor(owner, owner);
    if (symbol.sourceUrl !== null) safeUrl(symbol.sourceUrl);
    validateView(symbol.api, owner);
    if (symbol.explicitPublicApi) validateView(symbol.explicitPublicApi, owner);
    validateView(symbol.type, owner);
  }
  for (const [id, member] of Object.entries(members)) {
    if (!symbolIds.has(member.symbolId) || targets[id])
      throw new Error('Invalid prepared member owner or selection ID.');
    validateView(member.view, member.symbolId);
    const prepared = member.view;
    if (
      prepared.groups.length !== 1 ||
      prepared.groups[0].rows.length !== 1 ||
      prepared.documentation.length ||
      prepared.declaration.length ||
      prepared.signatures.length
    )
      throw new Error('Invalid prepared member selection view.');
  }
  validateIndex(presentation.memberIndex, id => Object.hasOwn(members, id), 'member');
  const validateNavigation = (nodes: ReferencePlan['navigation'], page: Overview): void => {
    const entries = entriesOf(page);
    if (
      nodes.length !== entries.length + 1 ||
      JSON.stringify(nodes[0]) !== JSON.stringify({ Overview: page.path })
    )
      throw new Error('Invalid reference navigation overview or entry count.');
    const remaining = new Map(entries.map(entry => [entry.label, entry.path]));
    for (const [index, item] of nodes.slice(1).entries()) {
      if (Object.keys(item).length !== 1) throw new Error('Invalid reference navigation entry.');
      for (const [label, target] of Object.entries(item)) {
        const expectedPath = remaining.get(label);
        if (!expectedPath || (page.kind !== 'category' && label !== entries[index].label))
          throw new Error('Invalid reference navigation label or order.');
        remaining.delete(label);
        if (page.kind === 'category') {
          if (target !== expectedPath) throw new Error('Unknown reference navigation page.');
        } else {
          const child = pages.get(expectedPath)!;
          if (typeof target === 'string' || child.kind === 'symbol')
            throw new Error('Invalid reference navigation subtree.');
          validateNavigation(target, child);
        }
      }
    }
  };
  validateNavigation(references.navigation, root);
}

export async function writePreparedArtifacts(
  presentation: ApiPresentation,
  references: ReferencePlan,
  config: ResolvedApiDocsConfig
) {
  validatePreparedArtifacts(presentation, references, config.reference.dir);
  const catalog: ReferenceCatalog = {
    schemaVersion: SCHEMA_VERSION,
    referencePages: { pages: references.pages, navigation: references.navigation }
  };
  const outputDir = config.output.dir;
  const artifactPath = path.join(outputDir, 'api-documentation.json');
  const catalogPath = path.join(outputDir, 'api-reference-pages.json');
  const files = [
    { target: artifactPath, content: JSON.stringify(presentation, null, 2) + '\n' },
    { target: catalogPath, content: JSON.stringify(catalog, null, 2) + '\n' }
  ].map(file => ({ ...file, temporary: `${file.target}.${randomUUID()}.tmp` }));
  await mkdir(outputDir, { recursive: true });
  try {
    for (const file of files) await writeFile(file.temporary, file.content, { flag: 'wx' });
    for (const file of files) await rename(file.temporary, file.target);
    return { artifactPath, catalogPath };
  } finally {
    await Promise.all(files.map(file => rm(file.temporary, { force: true })));
  }
}
