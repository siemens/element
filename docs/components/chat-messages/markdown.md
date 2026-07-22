# Markdown

> **Note:** The markdown component is currently experimental and may undergo changes in future releases.

The **markdown** component renders Markdown content as Angular components. Use its options to configure extensions, code highlighting, and custom rendering behavior. Options can be shared between multiple component instances.

## Usage ---

Create the options once and pass the same instance to each `si-markdown` component that needs the configuration. The component supports GitHub Flavored Markdown by default, including tables, task lists, strikethrough, and autolinked URLs.

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

## Extensions ---

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

You can also add a compatible [unified](https://unifiedjs.com/) or [remark](https://remark.js.org/) plugin with `.installUnifiedPlugin(plugin, options)`. This is useful for syntax that is not covered by the Element integrations, such as emoji shortcodes.

> **Bundle size:** KaTeX, Mermaid, Highlight.js, and additional `unified` plugins increase the application bundle size. Import and configure only the integrations your Markdown content requires.

## Custom extension ---

An extension can install `unified` plugin(s) and associate the AST node types produced by that plugin with Angular renderer components. The KaTeX integration is an example: `remark-math` parses Markdown math into `math` and `inlineMath` nodes, which are then rendered by the same component.

```ts
import { type KatexOptions } from 'katex';
import remarkMath, { type Options as RemarkMathOptions } from 'remark-math';
import { type SiMarkdownExtension } from '@siemens/element-ng/markdown';

import { MarkdownKatexComponent } from './markdown-katex.component';

export const markdownKaTeX = (
  parseOptions?: RemarkMathOptions,
  katexOptions?: KatexOptions
): SiMarkdownExtension => ({
  plugins: [{ plugin: remarkMath, options: parseOptions }],
  types: [
    { type: 'math', component: MarkdownKatexComponent, options: katexOptions },
    { type: 'inlineMath', component: MarkdownKatexComponent, options: katexOptions }
  ]
});
```

The renderer implements `SiMarkdownExtensionComponent`. Element supplies the parsed node, its parent, and the options provided in the extension definition as signal inputs.

```ts
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { type KatexOptions, renderToString } from 'katex';
import { type Literal, type Node, type Parent } from 'mdast';
import { type SiMarkdownExtensionComponent } from '@siemens/element-ng/markdown';

@Component({
  selector: 'app-markdown-katex',
  template: '',
  host: {
    '[innerHTML]': 'html()'
  }
})
export class MarkdownKatexComponent implements SiMarkdownExtensionComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<KatexOptions>();

  protected readonly html = computed(() => {
    const expression = (this.node() as Literal).value;
    return this.sanitizer.bypassSecurityTrustHtml(
      renderToString(expression, {
        ...this.options(),
        displayMode: this.node().type === 'math'
      })
    );
  });
}
```

Register the extension with the component options:

```ts
protected readonly markdownOptions = makeSiMarkdownOptions().installExtension(markdownKaTeX());
```

## Code ---

<si-docs-component example="si-markdown/si-markdown" height="700"></si-docs-component>

<si-docs-api component="SiMarkdownComponent"></si-docs-api>

<si-docs-types></si-docs-types>
