/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { ResolvedApiDocsConfig } from '../configuration.ts';
import type {
  ApiDocumentation,
  ApiEntry,
  ApiMember,
  ApiParameter,
  ApiSignature
} from '../extraction/model.ts';
import type { ApiPresentation, PresentationFragment } from './model.ts';

/** Shared lookup state; dependency collection belongs to each view scope. */
export interface PresentationContext {
  readonly documentation: ApiDocumentation;
  readonly config: ResolvedApiDocsConfig;
  readonly entries: ApiEntry[];
  readonly byId: ReadonlyMap<string, ApiEntry>;
  readonly result: ApiPresentation;
  readonly apiMembers: ReadonlyMap<string, ApiMember[]>;
  readonly homepages: Map<string, string>;
}
export type Comment = Pick<ApiEntry, 'description' | 'jsdocTags'> & { rawComment?: string };
export type Scope = {
  readonly relatedTypeIds: Set<string>;
  readonly entry: ApiEntry;
  readonly member?: ApiMember;
  readonly generics?: string[];
  readonly signature?: { id: string; parameters: ApiParameter[] };
};
export const fragment = (
  kind: PresentationFragment['kind'],
  text: string,
  targetId: string | null = null,
  href: string | null = null
): PresentationFragment => ({ kind, text, targetId, href });
export const tagName = (name: string): string => name.replace(/^@/, '').toLowerCase();
export const hiddenTags = new Set([
  'default',
  'defaultvalue',
  'defaultref',
  'internal',
  'public',
  'private',
  'protected',
  'readonly',
  'override',
  'inheritdoc',
  'experimental',
  'alpha',
  'beta',
  'abstract',
  'typeparam',
  'template',
  'param'
]);
export const visible = (item: {
  jsdocTags: { name: string }[];
  internal?: boolean;
  docsVisible?: boolean;
  visibility?: string;
}): boolean =>
  item.visibility !== 'private' &&
  (item.docsVisible === true ||
    (!item.internal &&
      !item.jsdocTags.some(tag => ['internal', 'private'].includes(tagName(tag.name)))));
export const memberId = (entry: ApiEntry, member: ApiMember): string =>
  `${entry.id}/member/${member.static ? 'static/' : ''}${encodeURIComponent(member.name)}`;

export const angularApi = (entry: ApiEntry): boolean =>
  ['component', 'directive'].includes(entry.angularKind ?? entry.kind);
export const referenceMembers = (context: PresentationContext, entry: ApiEntry): ApiMember[] =>
  context.apiMembers.get(entry.id) ?? [];
export const signaturesOf = (item: ApiEntry | ApiMember): ApiSignature[] => {
  const signatures = item.signatures ?? [];
  const overloads = signatures.filter(signature => !signature.implementation);
  if (overloads.length) return overloads;
  return signatures;
};
