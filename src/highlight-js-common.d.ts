/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
declare module 'highlight.js/lib/common' {
  interface HighlightResult {
    value: string;
  }

  interface HighlightJsCommon {
    getLanguage(language: string): unknown;
    highlight(code: string, options: { language: string }): HighlightResult;
  }

  const hljs: HighlightJsCommon;
  export default hljs;
}
