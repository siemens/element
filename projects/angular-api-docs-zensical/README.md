# Siemens Angular API Docs for Zensical

Install the locally built `siemens-angular-api-docs-zensical` wheel into the same Python environment as Zensical. The wheel includes the rendering templates and stylesheet. The commands below assume you have already configured `extra.element_docs` and run `angular-api-docs extract` from `@siemens/angular-api-docs-extractor` to generate the JSON artifacts.

## Markdown export hook

With Zensical 0.1.2, `llmstxt.preprocess` takes a script path relative to `mkdocs.yml`, not an import name. Create `tools/docs/llms_preprocess.py` next to (not inside) the documentation tree:

```python
from siemens_angular_api_docs_zensical.llms_preprocess import preprocess  # noqa: F401
```

Point your existing `llmstxt` plugin configuration at the shim:

```yaml
plugins:
  - llmstxt:
      preprocess: tools/docs/llms_preprocess.py
```

## Stylesheet and CLI

Install the config hook in `mkdocs.yml` alongside your existing `extra.element_docs` settings:

```yaml
extra:
  element_docs_install: !!python/name:siemens_angular_api_docs_zensical.zensical_navigation.install
```

The hook tells Zensical to publish and load the bundled `_src/docs-builder.css` directly from the installed package in both default and API mode. It leaves the site's theme in place, and you don't need to copy the stylesheet into `docs_dir`.

```sh
angular-api-docs-zensical generate-pages
zensical build --clean --strict
```

`angular-api-docs-zensical generate-pages` accepts `--config <path>` (default: `mkdocs.yml`). Relative paths within the config resolve from the config's directory, just as in Zensical.

## Find the template for a piece of API documentation

Start with what you see on the page. A Markdown tag such as `<si-docs-api>` selects what to show; the TypeScript doc comment supplies the text; the Jinja template controls where and how it appears.

- **Card heading, selector, import, or main description:** [`symbol.html.jinja`](md_extension_element_api/templates/symbol.html.jinja). The call to `api.blocks(view.documentation, local)` renders the main description.
- **Inputs, Outputs, or Methods table:** [`macros.html.jinja`](md_extension_element_api/templates/macros.html.jinja). Start with `group()` for the heading and `rows()` for each member's type, default, and description. The Description cell renders `row.documentation`.
- **Related type card or function signature:** [`symbol.html.jinja`](md_extension_element_api/templates/symbol.html.jinja) renders the card header. In [`macros.html.jinja`](md_extension_element_api/templates/macros.html.jinja), `type_rows()` renders compact member lists and `signatures()` handles standalone functions and callable items in those lists.
- **An embed for just one member:** [`member.html.jinja`](md_extension_element_api/templates/member.html.jinja) uses the same `group()` macro as a full card.
- **Bold text, inline code, links, or fenced examples:** In [`macros.html.jinja`](md_extension_element_api/templates/macros.html.jinja), `blocks()` handles paragraphs and fences; `fragments()` formats text within a paragraph. Both browser cards and Markdown exports use these macros.
- **The API section of a downloaded Markdown page:** [`structured.html.jinja`](md_extension_element_api/templates/structured.html.jinja) supplies the HTML that Zensical converts to Markdown.
- **Generated reference pages under `api/`:** In the [reference page templates](siemens_angular_api_docs_zensical/templates/), `root`, `package`, and `category` build the index pages; `symbol.md.jinja` writes the Markdown shell and its API embed tags for a single symbol.

For example, the [Typeahead page](../../docs/components/sorting-filtering/typeahead.md) embeds `SiTypeaheadDirective`, and the [Cards page](../../docs/components/layout-navigation/cards.md) embeds `SiActionCardComponent`. Both main descriptions go through the same `view.documentation` call in `symbol.html.jinja`; there is no separate template per Angular declaration kind.
