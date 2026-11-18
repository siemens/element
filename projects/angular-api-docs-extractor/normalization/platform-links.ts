/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import bcd from '@mdn/browser-compat-data' with { type: 'json' };
import type { Identifier } from '@mdn/browser-compat-data/types';
import ts from 'typescript';

type UrlIndex = Map<string, string | null>;

function buildIndex(): { paths: UrlIndex; names: UrlIndex } {
  const paths: UrlIndex = new Map();
  const names: UrlIndex = new Map();
  const add = (index: UrlIndex, key: string, url: string): void => {
    const previous = index.get(key);
    if (previous !== url) index.set(key, previous === undefined ? url : null);
  };
  const visit = (features: Identifier, parent = ''): void => {
    for (const name of Object.keys(features)) {
      if (name === '__compat') continue;
      const feature = features[name];
      const path = parent ? `${parent}.${name}` : name;
      const url = feature.__compat?.mdn_url;
      if (url) {
        add(paths, path, url);
        add(names, name, url);
      }
      visit(feature, path);
    }
  };
  visit(bcd.api);
  visit(bcd.javascript.builtins);
  return { paths, names };
}

let index: ReturnType<typeof buildIndex> | undefined;

const { builtins, operators } = bcd.javascript;
const handbook = 'https://www.typescriptlang.org/docs/handbook/2/';
const keywordUrls: ReadonlyMap<ts.SyntaxKind, string | undefined> = new Map([
  [ts.SyntaxKind.StringKeyword, builtins.String.__compat?.mdn_url],
  [ts.SyntaxKind.NumberKeyword, builtins.Number.__compat?.mdn_url],
  [ts.SyntaxKind.BooleanKeyword, builtins.Boolean.__compat?.mdn_url],
  [ts.SyntaxKind.BigIntKeyword, builtins.BigInt.__compat?.mdn_url],
  [ts.SyntaxKind.SymbolKeyword, builtins.Symbol.__compat?.mdn_url],
  [ts.SyntaxKind.UndefinedKeyword, builtins.undefined.__compat?.mdn_url],
  [ts.SyntaxKind.NullKeyword, operators.null.__compat?.mdn_url],
  [ts.SyntaxKind.AnyKeyword, handbook + 'everyday-types.html#any'],
  [ts.SyntaxKind.UnknownKeyword, handbook + 'functions.html#unknown'],
  [ts.SyntaxKind.NeverKeyword, handbook + 'functions.html#never'],
  [ts.SyntaxKind.VoidKeyword, handbook + 'functions.html#void'],
  [ts.SyntaxKind.ObjectKeyword, handbook + 'functions.html#object']
]);

/** JavaScript primitives link to MDN, TypeScript-only keywords to the TypeScript handbook. */
export function resolveKeywordTypeUrl(node: ts.Node): string | undefined {
  return ts.isLiteralTypeNode(node)
    ? keywordUrls.get(node.literal.kind)
    : keywordUrls.get(node.kind);
}

/** An exact path takes precedence over member names. Null means ambiguous, undefined unknown. */
export function resolvePlatformUrl(name: string): string | null | undefined {
  const { paths, names } = (index ??= buildIndex());
  const exact = paths.get(name);
  return exact === undefined ? names.get(name) : exact;
}
