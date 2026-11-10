/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/** A named tag and its text extracted from a source documentation comment. */
export interface ApiJsDocTag {
  name: string;
  comment: string;
}

/** The source file and line range of an extracted declaration, used to locate or link to it. */
export interface ApiSource {
  filePath: string;
  startLine: number;
  endLine: number;
  /** External declaration origin, independent of the package-manager store layout. */
  packageName?: string;
}

/** A callable signature's parameter, including its type, documentation, and source default. */
export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  source?: ApiSource;
  optional?: boolean;
  rest?: boolean;
  /** Source initializer only; null records no source default. */
  sourceDefaultValue?: string | null;
  jsdocTags?: ApiJsDocTag[];
  rawComment?: string;
}

/** Identifies the declaration behind a type reference or an inherited or implemented member. */
export interface ApiOrigin {
  name: string;
  /** Contextual reference spelling resolved by the checker, including local import aliases. */
  referenceName?: string;
  packageName: string;
  importPath?: string;
  id?: string;
  source: ApiSource;
  /** Instantiated owning class/interface type, including type arguments. */
  type?: string;
}

/** One callable declaration, preserving its parameters, return type, and overload-specific docs. */
export interface ApiSignature {
  parameters: ApiParameter[];
  returnType: string;
  generics: string[];
  description: string;
  jsdocTags: ApiJsDocTag[];
  source: ApiSource;
  rawComment?: string;
  implementation?: boolean;
}

/** A member of an API entry, with TypeScript metadata and Angular bindings where applicable. */
export interface ApiMember {
  name: string;
  kind: string;
  type: string;
  description: string;
  jsdocTags: ApiJsDocTag[];
  source?: ApiSource;
  inputAlias?: string;
  outputAlias?: string;
  required?: boolean;
  optional?: boolean;
  readonly?: boolean;
  static?: boolean;
  visibility?: 'public' | 'protected' | 'private';
  /** The declaration uses the public keyword rather than default visibility. */
  explicitPublic?: boolean;
  references?: string[];
  typeReferences?: ApiOrigin[];
  inherited?: boolean;
  inheritedFrom?: ApiOrigin;
  implementedFrom?: ApiOrigin;
  signatures?: ApiSignature[];
  signalReadType?: string;
  signalTransformType?: string;
  /** Source initializer only; null records no source default. */
  sourceDefaultValue?: string | null;
  rawComment?: string;
}

/** A top-level extracted symbol: a package export or a declaration included only for documentation. */
export interface ApiEntry {
  id: string;
  name: string;
  packageName: string;
  importPath: string;
  kind: string;
  description: string;
  jsdocTags: ApiJsDocTag[];
  source: ApiSource;
  members: ApiMember[];
  /** Source-complete class/interface view for explicitly requested type tables. */
  typeMembers?: ApiMember[];
  type?: string;
  selector?: string;
  exportAs?: string[];
  providedInRoot?: boolean;
  generics?: string[];
  /** Direct declared base types, including source type arguments. */
  extends?: string[];
  /** Direct declared implemented types, including source type arguments. */
  implements?: string[];
  references?: string[];
  typeReferences?: ApiOrigin[];
  signatures?: ApiSignature[];
  angularKind?: 'component' | 'directive' | 'injectable' | 'pipe' | 'ng_module';
  /** Source initializer only; null records no source default. */
  sourceDefaultValue?: string | null;
  /** Configured external API or related signature type, not a canonical package export. */
  documentationOnly?: boolean;
  /** Admitted public API or explicitly selected related documentation. */
  docsVisible?: boolean;
  /** Source type reached through a public signature, not an importable barrel export. */
  related?: boolean;
  internal?: boolean;
  exportAlias?: boolean;
  /** Original declaration name when this export uses a different spelling. */
  aliasOf?: string;
  typeOnlyExport?: boolean;
  /** Whether a variable declaration has an explicit source type annotation. */
  explicitType?: boolean;
  /** Bounded constant/type-alias facets; main entries remain unique. */
  declarationVariants?: ApiDeclarationVariant[];
}

/** The constant or type-alias facet of a single entry that has both declarations. */
type ApiDeclarationVariant = Omit<ApiEntry, 'declarationVariants'>;

/** Maps a primary or secondary package import path to its source entry point for extraction. */
export interface ApiEntryPoint {
  /** Full npm import path, including a secondary entrypoint's suffix. */
  packageName: string;
  /** Source entrypoint, relative to the extraction root. */
  sourcePath: string;
}

/** The versioned extraction result consumed by the documentation normalization stage. */
export interface ApiDocumentation {
  schemaVersion: 1;
  entries: ApiEntry[];
  entryPoints: ApiEntryPoint[];
}
