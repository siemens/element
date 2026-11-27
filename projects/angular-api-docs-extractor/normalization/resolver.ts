/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import ts from 'typescript';

import { compareText } from '../collation.ts';
import type { ResolvedApiDocsConfig } from '../configuration.ts';
import type { ApiDocumentation, ApiEntry, ApiMember, ApiOrigin } from '../extraction/model.ts';
import { SCHEMA_VERSION } from '../schema.ts';
import type { ApiPresentation } from './model.ts';
import {
  angularApi,
  memberId,
  referenceMembers,
  signaturesOf,
  visible,
  type PresentationContext,
  type Scope
} from './context.ts';

const canonicalMemberName = (name: string): string => {
  const trimmed = name.trim();
  if (!/^["']/.test(trimmed)) return name;
  const file = ts.createSourceFile(
    'presentation-member.ts',
    `type X = { ${trimmed}: unknown };`,
    ts.ScriptTarget.Latest,
    true
  );
  const declaration = file.statements[0];
  const member =
    declaration && ts.isTypeAliasDeclaration(declaration) && ts.isTypeLiteralNode(declaration.type)
      ? declaration.type.members[0]
      : undefined;
  return member &&
    ts.isPropertySignature(member) &&
    ts.isStringLiteral(member.name) &&
    member.name.getText(file) === trimmed
    ? member.name.text
    : name;
};

const normalizedMembers = (entry: ApiEntry): ApiMember[] => {
  const members = new Map<string, ApiMember>();
  for (const member of entry.members) {
    const name = canonicalMemberName(member.name);
    const normalized = name === member.name ? member : { ...member, name };
    members.set(memberId(entry, normalized), normalized);
  }
  return [...members.values()].filter(visible);
};

// Match Composer's default Angular API filtering in both layouts.
const angularInterfaceMethods: Record<string, readonly string[]> = {
  '@angular/core': [
    'AfterContentChecked.ngAfterContentChecked',
    'AfterContentInit.ngAfterContentInit',
    'AfterViewInit.ngAfterViewInit',
    'AfterViewChecked.ngAfterViewChecked',
    'DoCheck.ngDoCheck',
    'OnChanges.ngOnChanges',
    'OnDestroy.ngOnDestroy',
    'OnInit.ngOnInit'
  ],
  '@angular/forms': [
    'ControlValueAccessor.writeValue',
    'ControlValueAccessor.registerOnChange',
    'ControlValueAccessor.registerOnTouched',
    'ControlValueAccessor.setDisabledState',
    'Validator.validate',
    'Validator.registerOnValidatorChange'
  ]
};
const angularMemberVisible = (entry: ApiEntry, member: ApiMember): boolean => {
  if (
    member.kind === 'constructor' &&
    ['component', 'directive', 'injectable', 'pipe', 'ng_module'].includes(
      entry.angularKind ?? entry.kind
    )
  )
    return false;
  if (member.name.startsWith('ngAcceptInputType_')) return false;
  if (
    member.static &&
    member.kind === 'method' &&
    (member.name === 'ngTemplateContextGuard' || member.name.startsWith('ngTemplateGuard_'))
  )
    return false;
  const origin = member.implementedFrom;
  // Inherited form adapters remain public members of the derived directive.
  // Only direct framework implementations and lifecycle hooks are omitted.
  if (
    member.inheritedFrom &&
    (origin?.source.packageName ?? origin?.packageName) === '@angular/forms'
  )
    return true;
  return (
    !origin ||
    !angularInterfaceMethods[origin.source.packageName ?? origin.packageName]?.includes(
      `${origin.name}.${member.name}`
    )
  );
};

export function createPresentationContext(
  documentation: ApiDocumentation,
  config: ResolvedApiDocsConfig
): PresentationContext {
  const entries = documentation.entries.filter(visible);
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const result: ApiPresentation = {
    schemaVersion: SCHEMA_VERSION,
    symbols: [],
    index: Object.create(null) as ApiPresentation['index'],
    members: Object.create(null) as ApiPresentation['members'],
    memberIndex: Object.create(null) as ApiPresentation['memberIndex'],
    targets: Object.create(null) as ApiPresentation['targets']
  };
  const apiMembers = new Map(
    entries.map(entry => [
      entry.id,
      normalizedMembers(entry).filter(
        member =>
          angularMemberVisible(entry, member) &&
          (member.visibility !== 'protected' ||
            (angularApi(entry) &&
              (member.inputAlias !== undefined ||
                member.outputAlias !== undefined ||
                ['input', 'output'].includes(member.kind))))
      )
    ])
  );
  const context: PresentationContext = {
    documentation,
    config,
    entries,
    byId,
    result,
    apiMembers,
    homepages: new Map()
  };
  const anchors = new Map<string, Set<string>>();
  const addTarget = (id: string, symbolId: string, base: string): string => {
    if (result.targets[id]) return result.targets[id].anchor;
    const used = anchors.get(symbolId) ?? new Set<string>();
    anchors.set(symbolId, used);
    let anchor = base;
    for (let suffix = 2; used.has(anchor); suffix++) anchor = `${base}--${suffix}`;
    used.add(anchor);
    result.targets[id] = { symbolId, anchor };
    return anchor;
  };
  const registerSignatures = (id: string, owner: ApiEntry, item: ApiEntry | ApiMember): void => {
    signaturesOf(item).forEach((signature, index) => {
      const signatureId = `${id}/signature/${index}`;
      const anchor = addTarget(
        signatureId,
        owner.id,
        `${result.targets[id].anchor}.signature-${index + 1}`
      );
      signature.parameters.forEach((parameter, parameterIndex) =>
        addTarget(
          `${signatureId}/parameter/${parameterIndex}/${encodeURIComponent(parameter.name)}`,
          owner.id,
          `${anchor}.${encodeURIComponent(parameter.name)}`
        )
      );
    });
  };
  for (const entry of entries) {
    for (const key of new Set([
      entry.name,
      `${entry.importPath}#${entry.name}`,
      `${entry.packageName}#${entry.name}`
    ])) {
      const candidates = (result.index[key] ??= []);
      if (!candidates.includes(entry.id)) candidates.push(entry.id);
    }
    addTarget(entry.id, entry.id, entry.name);
    registerSignatures(entry.id, entry, entry);
    entry.declarationVariants?.forEach((variant, index) => {
      if (visible(variant))
        addTarget(
          `${entry.id}/declaration/${index}`,
          entry.id,
          `${entry.name}.declaration-${index + 1}`
        );
    });
    // Register only the members that can appear in the prepared views.
    for (const member of referenceMembers(context, entry)) {
      const id = memberId(entry, member);
      addTarget(
        id,
        entry.id,
        `${entry.name}.${encodeURIComponent((member.inputAlias ?? member.outputAlias ?? member.name).replaceAll('$', '~'))}`
      );
      registerSignatures(id, entry, member);
    }
  }
  return context;
}

const selectSymbol = (
  context: PresentationContext,
  candidates: ApiEntry[],
  name: string,
  scope: Scope
): ApiEntry | undefined => {
  const requestedName = name.split(/[.#]/).at(-1);
  const exactNames = candidates.filter(entry => entry.name === requestedName);
  let matching = exactNames.length ? exactNames : candidates;
  const contextual = matching.filter(entry => entry.importPath === scope.entry.importPath);
  if (contextual.length) matching = contextual;
  else {
    const sourceLocal = matching.filter(
      entry => entry.source.filePath === (scope.member?.source ?? scope.entry.source).filePath
    );
    if (sourceLocal.length) matching = sourceLocal;
  }
  const identities = new Set(
    matching.map(
      entry => `${entry.source.filePath}\0${entry.source.startLine}\0${entry.aliasOf ?? entry.name}`
    )
  );
  if (identities.size !== 1) return undefined;
  // Reexports of one declaration are equivalent, not ambiguous. Prefer a public
  // original export, then the shortest canonical import, independently of order.
  return [...matching].sort(
    (left, right) =>
      Number(!!left.exportAlias) - Number(!!right.exportAlias) ||
      Number(!!left.documentationOnly || !!left.related) -
        Number(!!right.documentationOnly || !!right.related) ||
      left.importPath.length - right.importPath.length ||
      compareText(left.id, right.id)
  )[0];
};
export const originsFor = (
  context: PresentationContext,
  name: string,
  scope: Scope
): ApiOrigin[] => {
  const matching = (origins: ApiOrigin[] = []): ApiOrigin[] => {
    const contextual = origins.filter(origin => origin.referenceName === name);
    if (contextual.length) return contextual;
    const exact = origins.filter(origin => origin.name === name);
    return exact.length ? exact : origins.filter(origin => origin.name === name.split('.').at(-1));
  };
  const memberOrigins = matching(scope.member?.typeReferences);
  return memberOrigins.length ? memberOrigins : matching(scope.entry.typeReferences);
};
export const resolveSymbol = (
  context: PresentationContext,
  name: string,
  scope: Scope
): ApiEntry | undefined => {
  if (context.byId.has(name)) return context.byId.get(name);
  const origins = originsFor(context, name, scope);
  if (origins.length) {
    const candidates = context.entries.filter(entry =>
      origins.some(
        origin =>
          origin.id === entry.id ||
          (entry.source.filePath === origin.source.filePath &&
            (entry.name === origin.name || entry.aliasOf === origin.name))
      )
    );
    // An external or hidden origin must not fall through to an unrelated local name.
    return selectSymbol(context, candidates, name, scope);
  }
  const references = scope.member?.references ?? scope.entry.references ?? [];
  const referenced = references
    .map(id => context.byId.get(id))
    .filter(
      (entry): entry is ApiEntry => !!entry && (entry.name === name || entry.aliasOf === name)
    );
  if (referenced.length) return selectSymbol(context, referenced, name, scope);
  const candidates = (context.result.index[name] ?? []).map(id => context.byId.get(id)!);
  return selectSymbol(context, candidates, name, scope);
};
export const resolveDocumentationTarget = (
  context: PresentationContext,
  name: string,
  scope: Scope
): string | undefined => {
  if (context.result.targets[name]) return name;
  const parameterName = name.startsWith('#') ? name.slice(1) : name;
  if (!/[.#/]/.test(parameterName)) {
    const ownerId = scope.member ? memberId(scope.entry, scope.member) : scope.entry.id;
    const signatures = scope.signature
      ? [scope.signature]
      : signaturesOf(scope.member ?? scope.entry).map((signature, index) => ({
          id: `${ownerId}/signature/${index}`,
          parameters: signature.parameters
        }));
    for (const signature of signatures) {
      const index = signature.parameters.findIndex(parameter => parameter.name === parameterName);
      if (index < 0) continue;
      const id = `${signature.id}/parameter/${index}/${encodeURIComponent(parameterName)}`;
      if (context.result.targets[id]) return id;
    }
  }
  if (name.startsWith('#')) {
    const member = referenceMembers(context, scope.entry).find(
      member => member.name === name.slice(1) && visible(member)
    );
    return member ? memberId(scope.entry, member) : undefined;
  }
  const symbol = resolveSymbol(context, name, scope);
  if (symbol) return symbol.id;
  for (let position = name.length - 1; position >= 0; position--) {
    if (!['.', '#'].includes(name[position])) continue;
    const owner = resolveSymbol(context, name.slice(0, position), scope);
    if (!owner) continue;
    const member = referenceMembers(context, owner).find(
      item => item.name === name.slice(position + 1) && visible(item)
    );
    return member ? memberId(owner, member) : undefined;
  }
  const local = referenceMembers(context, scope.entry).find(
    member => member.name === name && visible(member)
  );
  return local ? memberId(scope.entry, local) : undefined;
};
