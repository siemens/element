import siemensConfig from '@siemens/prettier-config';
import * as jinjaTemplatePlugin from 'prettier-plugin-jinja-template';

// prettier-plugin-jinja-template unconditionally sets PRETTIER_DEBUG="true" on import,
// which causes Prettier to fail on partial code snippets embedded in Markdown files.
delete process.env.PRETTIER_DEBUG;

/** @type {import('prettier').Config} */
export default {
  ...siemensConfig,
  plugins: [jinjaTemplatePlugin],
  overrides: [
    ...(siemensConfig.overrides ?? []),
    {
      files: ['**/*.html.jinja', 'docs/_custom_theme/**/*.html'],
      options: {
        parser: 'jinja-template',
        htmlWhitespaceSensitivity: 'css'
      }
    }
  ]
};
