# Siemens Angular API Docs for Zensical

Install the locally built `siemens-angular-api-docs-zensical` wheel into the same Python environment as Zensical. The wheel includes the rendering templates and stylesheet. The commands below assume you have already configured `extra.element_docs` and run `pnpm exec tsx tools/api-docs/index.ts` to generate the JSON artifacts.

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
