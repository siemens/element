/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

/** load to dynamically load Highlight.js languages, still only a subset */
export const hljsLanguageLoader = async (
  lang: string
): Promise<typeof import('highlight.js/lib/languages/*') | undefined> => {
  switch (lang) {
    case 'applescript':
      return import('highlight.js/lib/languages/applescript');
    case 'basic':
      return import('highlight.js/lib/languages/basic');
    case 'c':
      return import('highlight.js/lib/languages/c');
    case 'cmake':
      return import('highlight.js/lib/languages/cmake');
    case 'cpp':
      return import('highlight.js/lib/languages/cpp');
    case 'csharp':
      return import('highlight.js/lib/languages/csharp');
    case 'diff':
      return import('highlight.js/lib/languages/diff');
    case 'dockerfile':
      return import('highlight.js/lib/languages/dockerfile');
    case 'erb':
      return import('highlight.js/lib/languages/erb');
    case 'go':
      return import('highlight.js/lib/languages/go');
    case 'gradle':
      return import('highlight.js/lib/languages/gradle');
    case 'graphql':
      return import('highlight.js/lib/languages/graphql');
    case 'groovy':
      return import('highlight.js/lib/languages/groovy');
    case 'ini':
      return import('highlight.js/lib/languages/ini');
    case 'java':
      return import('highlight.js/lib/languages/java');
    case 'julia':
      return import('highlight.js/lib/languages/julia');
    case 'latex':
      return import('highlight.js/lib/languages/latex');
    case 'llvm':
      return import('highlight.js/lib/languages/llvm');
    case 'lua':
      return import('highlight.js/lib/languages/lua');
    case 'makefile':
      return import('highlight.js/lib/languages/makefile');
    case 'markdown':
      return import('highlight.js/lib/languages/markdown');
    case 'mathematica':
      return import('highlight.js/lib/languages/mathematica');
    case 'matlab':
      return import('highlight.js/lib/languages/matlab');
    case 'objectivec':
      return import('highlight.js/lib/languages/objectivec');
    case 'perl':
      return import('highlight.js/lib/languages/perl');
    case 'pgsql':
      return import('highlight.js/lib/languages/pgsql');
    case 'php':
      return import('highlight.js/lib/languages/php');
    case 'powershell':
      return import('highlight.js/lib/languages/powershell');
    case 'protobuf':
      return import('highlight.js/lib/languages/protobuf');
    case 'ruby':
      return import('highlight.js/lib/languages/ruby');
    case 'rust':
      return import('highlight.js/lib/languages/rust');
    case 'scala':
      return import('highlight.js/lib/languages/scala');
    case 'scheme':
      return import('highlight.js/lib/languages/scheme');
    case 'scilab':
      return import('highlight.js/lib/languages/scilab');
    case 'sql':
      return import('highlight.js/lib/languages/sql');
    case 'swift':
      return import('highlight.js/lib/languages/swift');
    case 'tcl':
      return import('highlight.js/lib/languages/tcl');
    case 'vbnet':
      return import('highlight.js/lib/languages/vbnet');
    case 'vbscript':
      return import('highlight.js/lib/languages/vbscript');
    case 'vim':
      return import('highlight.js/lib/languages/vim');
    case 'wasm':
      return import('highlight.js/lib/languages/wasm');
    case 'yaml':
      return import('highlight.js/lib/languages/yaml');
  }
  return undefined;
};
