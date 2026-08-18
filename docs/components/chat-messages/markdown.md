# Markdown

> **Note:** The markdown component is currently experimental and may undergo changes in future releases.

The **markdown** component renders Markdown content as Angular components. Use its options to
configure extensions, code highlighting, and custom rendering behavior. Options can, and where
possible should, be shared between multiple component instances.

## Usage --

### Basic usage

Create the options once and pass the same instance to each `si-markdown` component that needs the
configuration. The component supports GitHub Flavored Markdown by default, including tables, task
lists, strikethrough, and autolinked URLs.

```ts
import { Component, signal } from '@angular/core';
import { makeSiMarkdownOptions, SiMarkdownComponent } from '@siemens/element-ng/markdown';
import { siMarkdownMathKaTeX } from '@siemens/element-ng/markdown/extensions/katex';
import { siMarkdownMermaid } from '@siemens/element-ng/markdown/extensions/mermaid';
import { siMarkdownHighlightJs } from '@siemens/element-ng/markdown/hightlighter/highlightjs';
import remarkGemoji from 'remark-gemoji';

@Component({
  imports: [SiMarkdownComponent],
  template: ` <si-markdown [markdown]="markdown()" [options]="markdownOptions" /> `
})
export class MarkdownExampleComponent {
  protected readonly markdown = signal('# Release notes');
  protected readonly markdownOptions = makeSiMarkdownOptions()
    .setCodeHighlighter(siMarkdownHighlightJs({ autoDetectLanguage: true }))
    .installExtension(siMarkdownMathKaTeX())
    .installExtension(siMarkdownMermaid())
    .installUnifiedPlugin(remarkGemoji);
}
```

### Code highlighting

Configure syntax highlighting for fenced code blocks with `siMarkdownHighlightJs()` and
`.setCodeHighlighter()`. The highlighter includes JavaScript, TypeScript, JSON, CSS, SCSS, Bash,
Python, and XML languages (also HTML) by default.

Use `languageLoader` to load other languages only when a code block requests them. The loader
receives the language name from the fence and returns the corresponding Highlight.js language
module. Return `undefined` for languages your application does not support.

```ts
import {
  siMarkdownHighlightJs,
  type HighlightJSLanguageImport
} from '@siemens/element-ng/markdown/hightlighter/highlightjs';

const highlightJsLanguageLoader = async (language: string): HighlightJSLanguageImport => {
  switch (language) {
    case 'c':
      return import('highlight.js/lib/languages/c');
    case 'cpp':
      return import('highlight.js/lib/languages/cpp');
    case 'yaml':
      return import('highlight.js/lib/languages/yaml');
    default:
      return undefined;
  }
};

protected readonly markdownOptions = makeSiMarkdownOptions().setCodeHighlighter(
  siMarkdownHighlightJs({ languageLoader: highlightJsLanguageLoader })
);
```

When `autoDetectLanguage` is enabled, Highlight.js can only detect languages that have already
been registered; it does not invoke `languageLoader`. Eagerly register every language you want to
auto-detect, following the built-in language registration used by the Highlight.js component:

```ts
import hljs from 'highlight.js/lib/core';
import langYaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('yaml', langYaml);

protected readonly markdownOptions = makeSiMarkdownOptions().setCodeHighlighter(
  siMarkdownHighlightJs({ autoDetectLanguage: true })
);
```

### Extensions

The following rendering support is included in every Markdown component:

| Rendering support        | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| GitHub Flavored Markdown | Parses tables, task lists, strikethrough, and autolinked URLs. |
| Inline HTML              | Renders sanitized inline HTML.                                 |
| Code blocks              | Renders fenced code blocks without syntax highlighting.        |

Optional integrations are configured through `SiMarkdownOptions`:

| Integration                                 | Configuration                                  | Purpose                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [KaTeX](https://katex.org/)                 | `.installExtension(siMarkdownMathKaTeX())`     | Parses and renders inline and block LaTeX math expressions. It accepts optional `remark-math` parser and KaTeX rendering options. |
| [Mermaid](https://mermaid.js.org/)          | `.installExtension(siMarkdownMermaid())`       | Renders fenced code blocks declared as `mermaid` as diagrams. It accepts optional Mermaid configuration.                          |
| [Highlight.js](https://highlightjs.org/)    | `.setCodeHighlighter(siMarkdownHighlightJs())` | Adds syntax highlighting to fenced code blocks. It accepts Highlight.js options, including automatic language detection.          |
| [Gemojis](https://github.com/github/gemoji) | `.installUnifiedPlugin(remarkGemoji)`          | Converts emoji shortcodes such as `:rocket:` to emoji.                                                                            |

You can also add a compatible [unified](https://unifiedjs.com/) or [remark](https://remark.js.org/)
plugin with `.installUnifiedPlugin(plugin, options)`. This is useful for syntax that is not covered
by the Element integrations, such as emoji shortcodes.

> **Bundle size:** KaTeX, Mermaid, Highlight.js, and additional `unified` plugins increase the
> application bundle size. Import and configure only the integrations your Markdown content requires.

### Custom extension

An extension can install `unified` plugin(s) and associate the AST node types produced by that
plugin with Angular renderer components. As an example, the following provides an alternative
to render LaTeX math expressions. Instead of using KaTeX it uses `@webc.site/math`. This package
is smaller and faster than KaTeX, but can only produce MathML (supported by all major browsers).
It is distributed under the `MulanPSL-2.0`, an OSI approved liberal license.

```ts
import remarkMath, { type Options } from 'remark-math';

import { SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownMathComponent } from './si-markdown-math.component';

export const siMarkdownWebcSiteMath = (parseOptions?: Options): SiMarkdownExtension => {
  return {
    plugins: [{ plugin: remarkMath, options: parseOptions }],
    types: [
      { type: 'math', component: SiMarkdownMathComponent },
      { type: 'inlineMath', component: SiMarkdownMathComponent }
    ]
  };
};
```

The renderer implements `SiMarkdownExtensionComponent`. Element supplies the parsed node, its
parent, and the options provided in the extension definition as signal inputs.

```ts
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import mathml from '@webc.site/math';
import { Literal, type Node, type Parent } from 'mdast';

import { SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-math',
  template: '',
  host: {
    '[attr.data-line]': 'node().position?.start?.line',
    '[class.d-block]': 'displayMode()',
    '[innerHTML]': 'html()'
  }
})
export class SiMarkdownMathComponent implements SiMarkdownExtensionComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<any>();

  protected readonly displayMode = computed(() => this.node().type === 'math');
  protected readonly html = computed(() => {
    const expr = (this.node() as Literal).value;
    const html = mathml(expr, this.displayMode());
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
}
```

Register the extension with the component options:

```ts
protected readonly markdownOptions = makeSiMarkdownOptions().installExtension(siMarkdownWebcSiteMath());
```

## Code ---

<si-docs-component example="si-markdown/si-markdown" height="700"></si-docs-component>

<si-docs-api component="SiMarkdownComponent"></si-docs-api>

<si-docs-types></si-docs-types>
