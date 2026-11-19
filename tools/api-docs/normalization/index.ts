/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { ResolvedApiDocsConfig } from '../configuration.js';
import type { ApiDocumentation } from '../extraction/model.js';
import type { ApiPresentation, PresentationView } from './model.js';
import { memberId, referenceMembers } from './context.js';
import { createPresentationContext } from './resolver.js';
import { sourceUrl } from './routing.js';
import { prepareExplicitPublicApi, prepareView } from './views.js';

/** Normalize compiler/source semantics into portable data; never serialize HTML. */
export function prepareApiPresentation(
  documentation: ApiDocumentation,
  referencePaths: Record<string, string>,
  config: ResolvedApiDocsConfig
): ApiPresentation {
  const context = createPresentationContext(documentation, config);
  const { result, entries, byId } = context;
  result.symbols = entries.map(entry => ({
    id: entry.id,
    name: entry.name,
    packageName: entry.packageName,
    importPath: entry.importPath,
    importStatement:
      entry.related || entry.documentationOnly
        ? null
        : `import${entry.typeOnlyExport || ['interface', 'type_alias'].includes(entry.kind) ? ' type' : ''} { ${entry.name} } from '${entry.importPath.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}';`,
    kind: entry.kind,
    referencePath: referencePaths[entry.id] ?? null,
    sourceUrl: sourceUrl(config.links.sourceBase, entry.source),
    metadata: [
      ...(entry.selector ? [{ label: 'Selector', value: entry.selector }] : []),
      ...(entry.exportAs?.length
        ? [{ label: 'Exported as', value: entry.exportAs.join(', ') }]
        : []),
      ...(entry.providedInRoot ? [{ label: 'Provided in', value: 'root' }] : []),
      ...(entry.aliasOf ? [{ label: 'Alias of', value: entry.aliasOf }] : [])
    ],
    api: prepareView(context, entry, 'api'),
    explicitPublicApi: prepareExplicitPublicApi(context, entry),
    type: prepareView(context, entry, 'type')
  }));
  // Snapshot direct edges before replacing views with their ordered TYPE closure.
  const typeEdges = new Map(result.symbols.map(symbol => [symbol.id, symbol.type.relatedTypeIds]));
  // Referenced classes have their own API pages. Do not expand their complete
  // implementation (or its dependencies) into consumer-facing type documentation.
  // Keep unpublished classes inline so their public signatures remain readable.
  const linkedClasses = new Set(
    result.symbols
      .filter(
        symbol =>
          symbol.referencePath !== null &&
          [
            'component',
            'directive',
            'injectable',
            'pipe',
            'ng_module',
            'undecorated_class'
          ].includes(symbol.kind)
      )
      .map(symbol => symbol.id)
  );
  const close = (ownerId: string, view: PresentationView): void => {
    const seen = new Set([ownerId]);
    const pending = [...view.relatedTypeIds];
    const related: string[] = [];
    for (const id of pending) {
      if (seen.has(id)) continue;
      seen.add(id);
      if (linkedClasses.has(id)) continue;
      related.push(id);
      pending.push(...(typeEdges.get(id) ?? []));
    }
    view.relatedTypeIds = related;
  };
  for (const symbol of result.symbols) {
    close(symbol.id, symbol.api);
    if (symbol.explicitPublicApi) close(symbol.id, symbol.explicitPublicApi);
    close(symbol.id, symbol.type);
    const entry = byId.get(symbol.id)!;
    const memberNames = new Map(
      referenceMembers(context, entry).map(member => [memberId(entry, member), member.name])
    );
    const rows = (mode: 'api' | 'type') =>
      symbol[mode].groups.flatMap((group, groupIndex) =>
        group.rows.map((row, rowIndex) => ({ group, row, mode, groupIndex, rowIndex }))
      );
    const apiRows = rows('api');
    const typeRows = rows('type');
    // prepareView orders bindings as inputs, then outputs; TYPE rows are the final fallback.
    const bindingRows = apiRows.filter(({ group }) => ['inputs', 'outputs'].includes(group.kind));
    const rowsById = Map.groupBy([...bindingRows, ...typeRows], ({ row }) => row.id);
    const aliases = (name: string): string[] => [
      ...new Set([
        `${symbol.name}.${name}`,
        `${symbol.importPath}#${symbol.name}.${name}`,
        `${symbol.packageName}#${symbol.name}.${name}`
      ])
    ];
    const candidatesByKey = new Map<string, Set<string>>();
    for (const { row } of [...apiRows, ...typeRows]) {
      const memberName = memberNames.get(row.id);
      if (memberName === undefined) continue;
      for (const name of new Set([memberName, row.name])) {
        for (const key of aliases(name)) {
          const candidates = candidatesByKey.get(key) ?? new Set<string>();
          candidates.add(row.id);
          candidatesByKey.set(key, candidates);
        }
      }
    }
    for (const [key, rowIds] of candidatesByKey) {
      for (const rowId of rowIds) {
        const selections = rowsById.get(rowId) ?? [];
        const selected =
          selections.find(item => item.mode === 'api' && aliases(item.row.name).includes(key)) ??
          selections[0];
        if (!selected) throw new Error(`API member ${key} has no prepared source row.`);
        const { mode, groupIndex, rowIndex, group, row } = selected;
        const selectionId = `${symbol.id}/selection/${mode}/${groupIndex}/${rowIndex}`;
        result.members[selectionId] ??= {
          symbolId: symbol.id,
          view: {
            documentation: [],
            declaration: [],
            signatures: [],
            groups: [{ ...group, rows: [row] }],
            relatedTypeIds: symbol[mode].relatedTypeIds
          }
        };
        const candidates = (result.memberIndex[key] ??= []);
        if (!candidates.includes(selectionId)) candidates.push(selectionId);
      }
    }
  }
  return result;
}
