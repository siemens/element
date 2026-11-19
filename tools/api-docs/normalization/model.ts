/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { SCHEMA_VERSION } from '../schema.js';

/** Portable template input. No compiler records or HTML cross this boundary. */
export interface PresentationFragment {
  kind: 'text' | 'code' | 'link';
  text: string;
  targetId: string | null;
  href: string | null;
}

export interface PresentationBlock {
  kind: 'paragraph' | 'code';
  /** Authored fence language, absent for unlabelled code. */
  language?: string;
  parts: PresentationFragment[];
}

export interface PresentationRow {
  id: string;
  name: string;
  badges: string[];
  type: PresentationFragment[];
  default: string | null;
  documentation: PresentationBlock[];
  signatures: PresentationSignature[];
  sourceUrl: string | null;
}

export interface PresentationSignature {
  id: string;
  label: PresentationFragment[];
  documentation: PresentationBlock[];
  parameters: PresentationRow[];
  returns: PresentationFragment[];
}

export interface PresentationGroup {
  kind: string;
  title: string;
  showDefaults: boolean;
  rows: PresentationRow[];
}

export interface PresentationView {
  documentation: PresentationBlock[];
  declaration: PresentationFragment[];
  groups: PresentationGroup[];
  signatures: PresentationSignature[];
  relatedTypeIds: string[];
}

interface PresentationSymbol {
  id: string;
  name: string;
  packageName: string;
  importPath: string;
  /** Null for source-local and documentation-only declarations with no public export. */
  importStatement: string | null;
  kind: string;
  referencePath: string | null;
  sourceUrl: string | null;
  metadata: { label: string; value: string }[];
  api: PresentationView;
  /** Optional API view for embeds that hide implicitly public members. */
  explicitPublicApi?: PresentationView;
  type: PresentationView;
}

interface PresentationTarget {
  symbolId: string;
  /** Stable within the owning symbol; page-local collisions are disambiguated when rendering. */
  anchor: string;
}

export interface ApiPresentation {
  schemaVersion: typeof SCHEMA_VERSION;
  symbols: PresentationSymbol[];
  /** Name, importPath#name and packageName#name map to candidate symbol IDs. */
  index: Record<string, string[]>;
  /** Rendering selections, not canonical link targets. */
  members: Record<string, { symbolId: string; view: PresentationView }>;
  /** Qualified member names resolve to prepared selection IDs. */
  memberIndex: Record<string, string[]>;
  targets: Record<string, PresentationTarget>;
}
