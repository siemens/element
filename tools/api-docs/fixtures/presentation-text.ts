/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type {
  ApiPresentation,
  PresentationBlock,
  PresentationFragment,
  PresentationRow,
  PresentationSignature,
  PresentationView
} from '../normalization/model.js';

type PresentationSymbol = ApiPresentation['symbols'][number];

/**
 * Compact, review-friendly text form of prepared presentation data for snapshots.
 * Links render as `[text → #targetId]` or `[text → href]`. Inline code in prose renders as
 * `` `text` ``; declarations, types and signatures are code throughout and render bare.
 * Row and signature source URLs are omitted; the symbol header keeps its own.
 * Within a symbol, target ids owned by that symbol are abbreviated to `#~`.
 */
export function fragmentsText(parts: PresentationFragment[], prose = false): string {
  return parts
    .map(part =>
      part.targetId || part.href
        ? `[${part.text} → ${part.targetId ? '#' + part.targetId : part.href}]`
        : prose && part.kind === 'code'
          ? `\`${part.text}\``
          : part.text
    )
    .join('')
    .replaceAll('\u200b', '<ZWSP>');
}

const indent = (lines: string[], depth: number): string[] =>
  lines.map(line => '  '.repeat(depth) + line);

function blocksText(blocks: PresentationBlock[]): string[] {
  return blocks.flatMap(block =>
    block.kind === 'code'
      ? [
          '```' + (block.language ?? ''),
          ...block.parts
            .map(part => part.text)
            .join('')
            .split('\n'),
          '```'
        ]
      : fragmentsText(block.parts, true).split('\n')
  );
}

function rowText(row: PresentationRow): string[] {
  const badges = row.badges.length ? ` [${row.badges.join(', ')}]` : '';
  const type = row.type.length ? `: ${fragmentsText(row.type)}` : '';
  const value = row.default === null ? '' : ` = ${row.default}`;
  return [
    `${row.name}${type}${value}${badges}  #${row.id}`,
    ...indent(blocksText(row.documentation), 1),
    ...row.signatures.flatMap(signature => indent(signatureText(signature), 1))
  ];
}

function signatureText(signature: PresentationSignature): string[] {
  return [
    `${fragmentsText(signature.label)} → ${fragmentsText(signature.returns)}  #${signature.id}`,
    ...indent(blocksText(signature.documentation), 1),
    ...signature.parameters.flatMap(parameter => {
      const [head, ...details] = rowText(parameter);
      return indent([`param ${head}`, ...details], 1);
    })
  ];
}

export function viewText(view: PresentationView): string {
  return [
    ...(view.declaration.length ? [`declaration: ${fragmentsText(view.declaration)}`] : []),
    ...blocksText(view.documentation),
    ...view.groups.flatMap(group => [
      `## ${group.kind} "${group.title}"${group.showDefaults ? ' (defaults)' : ''}`,
      ...group.rows.flatMap(row => indent(rowText(row), 1))
    ]),
    ...view.signatures.flatMap(signature => [
      '## signature',
      ...indent(signatureText(signature), 1)
    ]),
    ...(view.relatedTypeIds.length ? [`related: ${view.relatedTypeIds.join(', ')}`] : [])
  ].join('\n');
}

export function symbolText(symbol: PresentationSymbol): string {
  const api = viewText(symbol.api);
  const views: [string, string | undefined][] = [
    ['api', api],
    [
      'explicitPublicApi',
      symbol.explicitPublicApi &&
        (viewText(symbol.explicitPublicApi) === api
          ? '(same as api)'
          : viewText(symbol.explicitPublicApi))
    ],
    ['type', viewText(symbol.type)]
  ];
  return [
    `# ${symbol.kind} ${symbol.id}`,
    `import: ${symbol.importStatement ?? '-'}`,
    `page: ${symbol.referencePath ?? '-'}`,
    `source: ${symbol.sourceUrl ?? '-'}`,
    ...symbol.metadata.map(item => `${item.label}: ${item.value}`),
    ...views.flatMap(([name, view]) => (view === undefined ? [] : ['', `=== ${name}`, view]))
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(
      new RegExp(`(?<=#)${symbol.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[/\\]\\s]|$)`, 'gm'),
      '~'
    );
}
