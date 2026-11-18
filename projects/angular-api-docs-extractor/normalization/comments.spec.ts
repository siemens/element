/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest';

import { inlineTagsToMarkdown, parseRawComment } from './comments.ts';

const summary = (raw: string): string => {
  const { description, jsdocTags } = parseRawComment(raw);
  return JSON.stringify([
    description,
    ...jsdocTags.map(({ name, comment }) => `${name}: ${comment}`)
  ]);
};
const comment = (...lines: string[]): string =>
  ['/**', ...lines.map(line => ' * ' + line), ' */'].join('\n');

describe('raw JSDoc parsing', () => {
  it.each([
    [
      'fences, labels, CRLF paragraphs, and ordered tags',
      '/**\r\n * Before. {@label OVERLOAD}\r\n * Use `{@label CODE}` and {@link Thing | Label}.\r\n *    continuation.\r\n *\r\n * ```ts\r\n * {@label FENCED}\r\n * ```\r\n *\r\n * Next paragraph.\r\n * @example\r\n * ```ts\r\n * @Component({\r\n *   template: `<si-icon />`\r\n * })\r\n * ```\r\n * ~~~ts\r\n * @Component({\r\n *   template: `<si-icon />`\r\n * })\r\n * ~~~\r\n * @docs-private\r\n * @deprecated\r\n * @param value - First.\r\n *   Continued.\r\n * @typeParam T - Type.\r\n * @see One\r\n * @see Two\r\n */'
    ]
  ])('%s', (_name, rawComment) => {
    expect(summary(rawComment)).toMatchInlineSnapshot(
      `"["Before. \\nUse \`{@label CODE}\` and [Label](<tsdoc-link:Thing>).\\n   continuation.\\n\\n\`\`\`ts\\n{@label FENCED}\\n\`\`\`\\n\\nNext paragraph.","example: \`\`\`ts\\n@Component({\\n  template: \`<si-icon />\`\\n})\\n\`\`\`\\n~~~ts\\n@Component({\\n  template: \`<si-icon />\`\\n})\\n~~~","docs-private: ","deprecated: ","param: First.\\n  Continued.","typeParam: Type.","see: One","see: Two"]"`
    );
  });

  it('splits tags unknown to TSDoc and keeps hyphenated tag names', () => {
    const raw = comment(
      'Summary.',
      '@since v6',
      '@docs-private',
      '@param event The event without a hyphen.',
      '```ts',
      '@docs-private',
      '```'
    );
    expect(summary(raw)).toBe(
      JSON.stringify([
        'Summary.',
        'since: v6',
        'docs-private: ',
        'param: The event without a hyphen.\n```ts\n@docs-private\n```'
      ])
    );
  });

  it.each([
    ['last line', '/**\n     * Text.\n     * @docs-private\n     */'],
    ['single line', '/** @docs-private*/'],
    ['opener line', '/** @docs-private\n * Text. */']
  ])('rewrites hyphenated tags on the %s', (_name, raw) => {
    const { jsdocTags } = parseRawComment(raw);
    expect(jsdocTags.map(tag => tag.name)).toEqual(['docs-private']);
  });

  it('keeps tags that TSDoc cannot represent as text', () => {
    expect(parseRawComment(comment('Text.', '@ü-x', '@a--b')).description).toBe(
      'Text.\n@ü-x\n@a--b'
    );
  });

  it('only splits unknown tags at the start of a line', () => {
    expect(summary(comment('Use the @Input decorator.'))).toBe(
      JSON.stringify(['Use the @Input decorator.'])
    );
  });

  it('merges consecutive doc comments and detects inherited docs', () => {
    const parsed = parseRawComment(comment('First.') + '\n' + comment('{@inheritDoc}', '@see Two'));
    expect(parsed).toEqual({
      description: 'First.',
      jsdocTags: [{ name: 'see', comment: 'Two' }],
      inheritsDoc: true
    });
  });

  it.each([
    ['{@link Other}', '[Other](<tsdoc-link:Other>)'],
    ['{@link Owner.value | label}', '[label](<tsdoc-link:Owner\\.value>)'],
    ['{@link Owner.value label}', '[label](<tsdoc-link:Owner\\.value>)'],
    [
      '{@link @angular/forms#FormsModule}',
      '[\\@angular\\/forms\\#FormsModule](<tsdoc-link:\\@angular\\/forms\\#FormsModule>)'
    ],
    ['{@linkcode ./guide.md | *g*}', '[\\*g\\*](<tsdoc-link:\\.\\/guide\\.md>)'],
    ['{@link   }', '{@link   }'],
    ['`{@link Code}` {@label L}', '`{@link Code}`']
  ])('converts %s', (text, markdown) => {
    expect(inlineTagsToMarkdown(text)).toBe(markdown);
  });

  it.each([
    ['fences', '```'.repeat(60_000)],
    ['backticks', '`'.repeat(60_000)],
    ['unclosed links', '{@link' + ' '.repeat(60_000)],
    ['unclosed labels', '{@label' + ' '.repeat(60_000)],
    ['unmatched inline tags', '{@x'.repeat(60_000) + '}'],
    ['tag spacing', '@a' + ' '.repeat(60_000) + 'x']
  ])('parses adversarial comments in linear time: %s', (_name, text) => {
    const started = performance.now();
    parseRawComment(comment(text));
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});
