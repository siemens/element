/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { compareText } from '../collation.js';
import type { ReferenceCategory as Category, ResolvedApiDocsConfig } from '../configuration.js';
import type { ApiDocumentation, ApiEntry } from '../extraction/model.js';

export interface ReferenceEntry {
  name: string;
  path: string;
  /** Semantic navigation label; name remains the unqualified overview text. */
  label: string;
  href: string;
}

type ReferencePage =
  | {
      kind: 'symbol';
      path: string;
      title: string;
      /** Raw attribute values; the renderer must HTML-escape them. */
      name: string;
      importPath: string;
      category: Category;
    }
  | {
      kind: 'category';
      path: string;
      title: string;
      groups: { letter: string; entries: ReferenceEntry[] }[];
    }
  | {
      kind: 'package' | 'root';
      path: string;
      title: string;
      entries: ReferenceEntry[];
      readme: string;
    };

export interface ReferencePlan {
  referencePaths: Record<string, string>;
  pages: ReferencePage[];
  navigation: ReferenceNavigation[];
}
interface ReferenceNavigation {
  [label: string]: string | ReferenceNavigation[];
}
type DraftPage =
  | Exclude<ReferencePage, { kind: 'category' }>
  | { kind: 'category'; path: string; title: string; entries: ReferenceEntry[] };
const relativeHref = (page: string, target: string): string =>
  './' + path.posix.relative(path.posix.dirname(page), target);
const packageNameOf = (name: string): string =>
  name
    .split('/')
    .slice(0, name.startsWith('@') ? 2 : 1)
    .join('/');
const title = (category: Category): string => category[0].toUpperCase() + category.slice(1);
const isExportAlias = (entry: ApiEntry): boolean => entry.exportAlias === true;
const isTypeOnlyClass = (entry: ApiEntry): boolean =>
  entry.typeOnlyExport === true &&
  ['class', 'undecorated_class', 'component', 'directive', 'injectable', 'ng_module'].includes(
    entry.kind
  );

function categoryOf(entry: ApiEntry): Category | undefined {
  if (isExportAlias(entry) || isTypeOnlyClass(entry)) return 'types';
  const kind = entry.angularKind ?? entry.kind;
  if (kind === 'component' || kind === 'directive' || kind === 'injectable' || kind === 'pipe')
    return `${kind}s`;
  if (kind === 'ng_module' || kind === 'module') return 'types';
  return [
    'enum',
    'class',
    'undecorated_class',
    'interface',
    'type_alias',
    'constant',
    'function'
  ].includes(kind)
    ? 'types'
    : undefined;
}

function typeOrder(entry: ApiEntry): number {
  if (isExportAlias(entry)) return 6;
  if (isTypeOnlyClass(entry)) return 2;
  if (entry.explicitType && entry.signatures?.length) return 4;
  if (entry.kind === 'constant' && entry.signatures?.length) return 5;
  return (
    (
      {
        enum: 0,
        class: 1,
        undecorated_class: 1,
        interface: 2,
        type_alias: 3,
        constant: 4,
        function: 5
      } as Record<string, number>
    )[entry.kind] ?? 6
  );
}

/** Preserve code/HTML boundaries while preparing README source links. */
function prepareReadme(
  source: string,
  directory: string,
  root: string,
  sourceBase: string | null
): string {
  const repositoryLink = (url: string): string => {
    if (!sourceBase || /^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(url)) return url;
    const [file, fragment = ''] = url.split(/(?=#)/, 2);
    return (
      sourceBase +
      path.relative(root, path.resolve(directory, file)).split(path.sep).join('/') +
      (file.endsWith('/') ? '/' : '') +
      fragment
    );
  };
  const prose = (part: string): string =>
    part
      .replace(/^# /gm, '## ')
      .replace(/^ {4}/gm, '  ')
      .replace(/(?<!https?)(?<!mailto):/g, '&#58;')
      .replace(
        /(!?\[[^\]\n]*\]\()([^\s)]+)(\))/g,
        (_match, before: string, url: string, after: string) => before + repositoryLink(url) + after
      );
  const tokens = /```[^\n]*\n[\s\S]*?```|(`+)(?:(?!\1)[\s\S])*?\1|<[^>]*>/g;
  let result = '';
  let position = 0;
  for (const match of source.matchAll(tokens)) {
    const token = match[0];
    result +=
      prose(source.slice(position, match.index)) +
      (token.startsWith('`') && !token.startsWith('```')
        ? token.replace(/<(?!\u200b)/g, '<\u200b').replace(/(?<!\u200b)>/g, '\u200b>')
        : token);
    position = match.index + match[0].length;
  }
  return result + prose(source.slice(position));
}

/** Prepare routing, grouped overview inputs and nested navigation without rendering Markdown. */
export function prepareReferencePlan(
  documentation: ApiDocumentation,
  config: ResolvedApiDocsConfig
): ReferencePlan {
  const {
    root,
    packages,
    reference: { dir: relativeDir, categories },
    links: { sourceBase }
  } = config;
  if (!packages.length) throw new Error('No documentation packages configured.');
  const packageDirectories = new Map(
    packages.map(directory => {
      const manifest: unknown = JSON.parse(
        readFileSync(path.join(directory, 'package.json'), 'utf8')
      );
      if (
        !manifest ||
        typeof manifest !== 'object' ||
        !('name' in manifest) ||
        typeof manifest.name !== 'string' ||
        !manifest.name.trim()
      )
        throw new Error(`Missing package name in ${directory}/package.json`);
      return [manifest.name, directory] as const;
    })
  );
  const pages: DraftPage[] = [];
  const referencePaths: Record<string, string> = {};
  const pageIndexes = new Map<string, number>();
  const addPage = (page: DraftPage): void => {
    const index = pageIndexes.get(page.path);
    if (index !== undefined) pages[index] = page;
    else {
      pageIndexes.set(page.path, pages.length);
      pages.push(page);
    }
  };
  const packageNames = [
    ...new Set([
      ...documentation.entryPoints.map(entry => packageNameOf(entry.packageName)),
      ...documentation.entries.filter(entry => !entry.related).map(entry => entry.packageName)
    ])
  ];
  const packageLinks: ReferenceEntry[] = [];
  for (const packageName of packageNames) {
    const packageDir = packageName.replace(/^@/, '') + '/';
    const base = `${relativeDir}/${packageDir}`;
    const unique = new Map<string, ApiEntry[]>();
    for (const entry of documentation.entries) {
      if (entry.packageName !== packageName) continue;
      const variants = (entry.declarationVariants ?? [entry]).filter(variant => {
        if (variant.related) return false;
        return !variant.internal && !variant.documentationOnly;
      });
      if (variants.length) unique.set(entry.id, variants);
    }
    // Deduplicate barrel reexports first, then replace merged type/value parents
    // with their declaration facets. Every facet contributes a descriptor, but
    // overview entries retain only the first kind-sorted occurrence.
    const packageEntries = [...unique.values()].flat();
    const parentIds = new Map(
      [...unique].flatMap(([id, variants]) => variants.map(variant => [variant, id] as const))
    );
    const categoryLinks: ReferenceEntry[] = [];
    for (const category of categories) {
      const entries = packageEntries
        .filter(entry => categoryOf(entry) === category)
        .sort(
          (a, b) =>
            (category === 'types' ? typeOrder(a) - typeOrder(b) : 0) || compareText(a.name, b.name)
        );
      if (!entries.length) continue;
      const labels = new Set<string>();
      const names = new Map(
        [...Map.groupBy(entries, entry => entry.name)].map(([name, variants]) => [
          name,
          {
            duplicate: new Set(variants.map(entry => parentIds.get(entry))).size > 1,
            // The primary barrel keeps the stable public URL. Without one,
            // choose an entry point independently of extraction order.
            canonicalImportPath: variants
              .map(entry => entry.importPath)
              .sort(
                (a, b) => Number(b === packageName) - Number(a === packageName) || compareText(a, b)
              )[0]
          }
        ])
      );
      const listedEntries: ReferenceEntry[] = [];
      for (const entry of entries) {
        const { duplicate, canonicalImportPath } = names.get(entry.name)!;
        const suffix = duplicate
          ? entry.importPath.slice(packageName.length).replace(/^\//, '') || 'primary'
          : '';
        const qualifier =
          duplicate && entry.importPath !== canonicalImportPath ? `_entrypoints/${suffix}/` : '';
        const filePath = `${base}${category}/${qualifier}${entry.name}.md`;
        // Preserve the legacy deterministic last-category choice for merged symbols.
        referencePaths[parentIds.get(entry)!] = filePath;
        const typeName =
          category === 'types'
            ? 'Type'
            : category === 'injectables'
              ? 'Service'
              : title(category).slice(0, -1);
        addPage({
          kind: 'symbol',
          path: filePath,
          title: `${entry.name}${entry.name.includes(typeName) ? '' : ' ' + typeName} documentation`,
          name: entry.name,
          importPath: entry.importPath,
          category
        });
        const label = duplicate ? `${entry.name} (${suffix})` : entry.name;
        if (!labels.has(label)) {
          labels.add(label);
          listedEntries.push({
            name: entry.name,
            path: filePath,
            label,
            href: relativeHref(`${base}${category}/index.md`, filePath)
          });
        }
      }
      const overviewPath = `${base}${category}/index.md`;
      addPage({
        kind: 'category',
        path: overviewPath,
        title: `${title(category)} in ${packageName}`,
        entries: listedEntries
      });
      categoryLinks.push({
        name: title(category),
        path: overviewPath,
        label: title(category),
        href: relativeHref(`${base}index.md`, overviewPath)
      });
    }
    const overviewPath = `${base}index.md`;
    const directory = packageDirectories.get(packageName);
    if (!directory) throw new Error(`Documentation package is not configured: ${packageName}`);
    const readme = prepareReadme(
      readFileSync(path.join(directory, 'README.md'), 'utf8').trim(),
      directory,
      root,
      sourceBase
    );
    addPage({
      kind: 'package',
      path: overviewPath,
      title: packageName,
      entries: categoryLinks,
      readme
    });
    packageLinks.push({
      name: packageName,
      path: overviewPath,
      label: packageName,
      href: relativeHref(`${relativeDir}/index.md`, overviewPath)
    });
  }
  {
    const readme = prepareReadme(
      readFileSync(path.join(root, 'README.md'), 'utf8'),
      root,
      root,
      sourceBase
    );
    addPage({
      kind: 'root',
      path: `${relativeDir}/index.md`,
      title: 'Documented packages',
      entries: packageLinks,
      readme
    });
  }
  const byPath = new Map(pages.map(page => [page.path, page]));
  const navigationOf = (page: DraftPage): ReferenceNavigation[] => {
    if (page.kind === 'symbol') throw new Error('Symbol cannot own reference navigation.');
    return [
      { Overview: page.path },
      ...page.entries.map(entry => ({
        [entry.label]: page.kind === 'category' ? entry.path : navigationOf(byPath.get(entry.path)!)
      }))
    ];
  };
  const navigation = navigationOf(byPath.get(`${relativeDir}/index.md`)!);
  return {
    pages: pages.map(page => {
      if (page.kind !== 'category') return page;
      const letters = [...new Set(page.entries.map(entry => entry.name[0].toUpperCase()))].sort();
      return {
        kind: page.kind,
        path: page.path,
        title: page.title,
        groups: letters.map(letter => ({
          letter: letters.length > 1 ? letter : '',
          entries: page.entries.filter(entry => entry.name[0].toUpperCase() === letter)
        }))
      };
    }),
    referencePaths,
    navigation
  };
}
