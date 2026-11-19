/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import ts from 'typescript';

import { compareText } from '../collation.js';
import type { ApiEntry, ApiMember, ApiParameter } from '../extraction/model.js';
import type {
  PresentationFragment,
  PresentationGroup,
  PresentationRow,
  PresentationSignature,
  PresentationView
} from './model.js';
import {
  angularApi,
  fragment,
  memberId,
  signaturesOf,
  tagName,
  visible,
  type PresentationContext,
  type Scope
} from './context.js';
import { commentBlocks, genericFragments, referenceFragment, typeFragments } from './fragments.js';
import { sourceUrl } from './routing.js';

const defaultValue = (
  item: ApiEntry | ApiMember | ApiParameter,
  context?: PresentationContext,
  type: PresentationFragment[] = []
): string | null => {
  const explicit = item.jsdocTags?.find(tag =>
    ['default', 'defaultvalue'].includes(tagName(tag.name))
  )?.comment;
  const value =
    explicit !== undefined
      ? (/^```[^\n]*\n([\s\S]*?)\n```$/.exec(explicit.trim())?.[1] ?? explicit)
      : item.sourceDefaultValue;
  if (value == null) return null;
  const typeText = type.map(part => part.text).join('');
  const signalReadType = 'signalReadType' in item ? item.signalReadType : undefined;
  const display = [typeText, signalReadType].some(
    name => name && context?.config.defaultValues.unwrapWrapperFunctionTypes.includes(name)
  )
    ? unwrapWrapperFunction(value)
    : value;
  return explicit === undefined && (display.length > 120 || /[\r\n]/.test(display))
    ? '...'
    : display;
};
/** Show `wrapper(() => value)` as `value`. */
const unwrapWrapperFunction = (value: string): string => {
  const file = ts.createSourceFile('default.ts', `(${value})`, ts.ScriptTarget.Latest);
  const [statement] = file.statements;
  const expression =
    statement &&
    ts.isExpressionStatement(statement) &&
    ts.isParenthesizedExpression(statement.expression)
      ? statement.expression.expression
      : undefined;
  if (!expression || !ts.isCallExpression(expression) || expression.arguments.length !== 1)
    return value;
  const [argument] = expression.arguments;
  if (!ts.isArrowFunction(argument) || argument.parameters.length || ts.isBlock(argument.body))
    return value;
  return argument.body.getText(file);
};
const badges = (item: ApiMember | ApiParameter): string[] => {
  const values: string[] = [];
  for (const name of ['required', 'optional', 'readonly', 'static', 'inherited', 'rest'] as const)
    if (name in item && item[name as keyof typeof item]) values.push(name);
  if ('visibility' in item && item.visibility === 'protected') values.push('protected');
  if (item.jsdocTags?.some(tag => tagName(tag.name) === 'deprecated')) values.push('deprecated');
  return values;
};
const prepareSignatures = (
  context: PresentationContext,
  id: string,
  name: string,
  item: ApiEntry | ApiMember,
  scope: Scope
): PresentationSignature[] =>
  signaturesOf(item).map((signature, index) => {
    const signatureId = `${id}/signature/${index}`;
    const signatureScope = {
      ...scope,
      signature: { id: signatureId, parameters: signature.parameters },
      generics: [...(scope.generics ?? []), ...signature.generics]
    };
    const parameters = signature.parameters.map((parameter, parameterIndex): PresentationRow => {
      const type = typeFragments(context, parameter.type, signatureScope);
      return {
        id: `${signatureId}/parameter/${parameterIndex}/${encodeURIComponent(parameter.name)}`,
        name: parameter.name,
        badges: badges(parameter),
        type,
        default: defaultValue(parameter, context, type),
        documentation: commentBlocks(
          context,
          { ...parameter, jsdocTags: parameter.jsdocTags ?? [] },
          signatureScope
        ),
        signatures: [],
        sourceUrl: sourceUrl(context.config.links.sourceBase, parameter.source)
      };
    });
    const label = [
      fragment('code', name),
      ...genericFragments(context, signature.generics, signatureScope),
      fragment('code', '(')
    ];
    parameters.forEach((parameter, parameterIndex) => {
      if (parameterIndex) label.push(fragment('code', ', '));
      label.push(
        fragment(
          'code',
          (parameter.badges.includes('rest') ? '...' : '') +
            parameter.name +
            (parameter.badges.includes('optional') ? '?' : '') +
            ': '
        ),
        ...parameter.type
      );
      if (parameter.default !== null) label.push(fragment('code', ' = ' + parameter.default));
    });
    const returns = typeFragments(context, signature.returnType, signatureScope);
    label.push(fragment('code', '): '), ...returns);
    return {
      id: signatureId,
      label,
      documentation: commentBlocks(context, signature, signatureScope),
      parameters,
      returns
    };
  });
const bindingType = (member: ApiMember, output: boolean): string => {
  if (!output && member.signalTransformType) return member.signalTransformType;
  if (!output && member.signalReadType) return member.signalReadType;
  const file = ts.createSourceFile(
    'binding.ts',
    `type X = ${member.type};`,
    ts.ScriptTarget.Latest,
    true
  );
  const statement = file.statements[0];
  if (
    statement &&
    ts.isTypeAliasDeclaration(statement) &&
    ts.isTypeReferenceNode(statement.type) &&
    [
      'InputSignal',
      'InputSignalWithTransform',
      'ModelSignal',
      'OutputEmitterRef',
      'OutputRef',
      'EventEmitter'
    ].includes(statement.type.typeName.getText(file))
  )
    return statement.type.typeArguments?.[0]?.getText(file) ?? member.type;
  return member.type;
};

const isInput = (member: ApiMember): boolean =>
  member.inputAlias !== undefined || member.kind === 'input';
const isOutput = (member: ApiMember): boolean =>
  member.outputAlias !== undefined || member.kind === 'output';

export const prepareExplicitPublicApi = (
  context: PresentationContext,
  entry: ApiEntry
): PresentationView | undefined => {
  if (
    !['component', 'directive', 'injectable', 'pipe', 'ng_module'].includes(
      entry.angularKind ?? entry.kind
    )
  )
    return undefined;
  const members = context.apiMembers.get(entry.id) ?? [];
  const bindings = angularApi(entry);
  const filtered = members.filter(
    member =>
      (bindings && (isInput(member) || isOutput(member))) ||
      (!member.name.startsWith('_') &&
        (member.explicitPublic || member.jsdocTags.some(tag => tagName(tag.name) === 'public')))
  );
  return filtered.length === members.length
    ? undefined
    : prepareView(context, entry, 'api', filtered);
};

export const prepareView = (
  context: PresentationContext,
  entry: ApiEntry,
  viewKind: 'api' | 'type',
  members = (viewKind === 'type' ? context.typeMembers : context.apiMembers).get(entry.id) ?? []
): PresentationView => {
  const scope: Scope = { entry, generics: entry.generics, relatedTypeIds: new Set() };
  const angular = angularApi(entry) && viewKind === 'api';
  const service = (entry.angularKind ?? entry.kind) === 'injectable' && viewKind === 'api';
  const memberKind = (member: ApiMember): string =>
    ['getter', 'setter'].includes(member.kind) ? 'accessor' : member.kind;
  const groupMembers: { kind: string; title: string; members: ApiMember[] }[] =
    angular || service
      ? [
          {
            kind: 'inputs',
            title: 'Input Properties',
            members: members.filter(isInput)
          },
          {
            kind: 'outputs',
            title: 'Output Properties',
            members: members.filter(isOutput)
          },
          {
            kind: 'members',
            title: 'Attributes and Methods',
            members: members.filter(member => !isInput(member) && !isOutput(member))
          }
        ]
      : ['constructor', 'property', 'accessor', 'method', 'index_signature', 'other'].map(kind => ({
          kind: kind === 'other' ? 'members' : kind + 's',
          title: (
            {
              constructor: 'Constructor',
              property: 'Properties',
              accessor: 'Accessors',
              method: 'Methods',
              index_signature: 'Index Signatures',
              other: 'Members'
            } as Record<string, string>
          )[kind],
          members: members.filter(member =>
            kind === 'other'
              ? !['constructor', 'property', 'accessor', 'method', 'index_signature'].includes(
                  memberKind(member)
                )
              : memberKind(member) === kind
          )
        }));
  const groups: PresentationGroup[] = groupMembers
    .filter(group => group.members.length)
    .map(group => ({
      kind: group.kind,
      title: group.title,
      showDefaults:
        group.kind !== 'outputs' && group.members.some(member => defaultValue(member) !== null),
      rows: group.members
        .map(member => {
          const memberScope = { ...scope, member };
          const output = group.kind === 'outputs';
          const name =
            group.kind === 'inputs'
              ? (member.inputAlias ?? member.name)
              : output
                ? (member.outputAlias ?? member.name)
                : member.name;
          const documentation = commentBlocks(context, member, memberScope);
          for (const [label, origin] of [
            ['Inherited from', member.inheritedFrom],
            ['Implements', member.implementedFrom]
          ] as const)
            if (origin)
              documentation.push({
                kind: 'paragraph',
                parts: [
                  fragment('text', label + ' '),
                  referenceFragment(
                    context,
                    origin.type ?? origin.name,
                    origin.id ?? origin.name,
                    memberScope,
                    'origin'
                  )
                ]
              });
          const type = typeFragments(
            context,
            angular && ['inputs', 'outputs'].includes(group.kind)
              ? bindingType(member, output)
              : member.type,
            memberScope
          );
          return {
            id: memberId(entry, member),
            name,
            badges: badges(member).filter(
              badge => badge !== 'readonly' || !['inputs', 'outputs'].includes(group.kind)
            ),
            type,
            default: output ? null : defaultValue(member, context, type),
            documentation,
            signatures: ['inputs', 'outputs'].includes(group.kind)
              ? []
              : prepareSignatures(context, memberId(entry, member), name, member, memberScope),
            sourceUrl: sourceUrl(context.config.links.sourceBase, member.source)
          };
        })
        .sort((left, right) => compareText(left.name, right.name))
    }));
  const variants =
    entry.declarationVariants?.flatMap((variant, index): PresentationRow[] => {
      if (!visible(variant)) return [];
      const type = typeFragments(context, variant.type ?? '', { ...scope, entry: variant });
      return [
        {
          id: `${entry.id}/declaration/${index}`,
          name: variant.name,
          badges: [variant.kind],
          type,
          default: defaultValue(variant, context, type),
          documentation: commentBlocks(context, variant, { ...scope, entry: variant }),
          signatures: [],
          sourceUrl: sourceUrl(context.config.links.sourceBase, variant.source)
        }
      ];
    }) ?? [];
  if (variants.length)
    groups.push({
      kind: 'declarations',
      title: 'Declarations',
      showDefaults: variants.some(variant => variant.default !== null),
      rows: variants
    });
  const documentationBlocks = commentBlocks(context, entry, scope);
  const constantDefault = entry.kind === 'constant' ? defaultValue(entry) : null;
  const declaration = entry.type
    ? [
        ...(entry.kind === 'type_alias'
          ? [
              fragment('code', 'type ' + entry.name),
              ...genericFragments(context, entry.generics ?? [], scope),
              fragment('code', ' = ')
            ]
          : []),
        ...typeFragments(context, entry.type, scope),
        ...(constantDefault !== null ? [fragment('code', ' = ' + constantDefault)] : [])
      ]
    : [
        fragment('code', entry.kind + ' ' + entry.name),
        ...genericFragments(context, entry.generics ?? [], scope)
      ];
  for (const kind of ['extends', 'implements'] as const) {
    const types = entry[kind] ?? [];
    if (!types.length) continue;
    declaration.push(fragment('code', ' ' + kind + ' '));
    types.forEach((type, index) => {
      if (index) declaration.push(fragment('code', ', '));
      declaration.push(...typeFragments(context, type, scope));
    });
  }
  const signatures = prepareSignatures(context, entry.id, entry.name, entry, scope);
  return {
    documentation: documentationBlocks,
    declaration,
    groups,
    signatures,
    relatedTypeIds: [...scope.relatedTypeIds]
  };
};
