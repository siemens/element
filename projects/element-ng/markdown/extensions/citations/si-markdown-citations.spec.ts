/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Parent } from 'mdast';

import { SiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownMetadata } from '../../si-markdown.types';
import { siMarkdownCitationsTransformer } from './si-markdown-citations';

describe('siMarkdownCitationsTransformer', () => {
  const makeOptions = (): SiMarkdownOptions =>
    new SiMarkdownOptions().installUnifiedPlugin(
      siMarkdownCitationsTransformer,
      (meta: SiMarkdownMetadata) => meta.citations
    );

  it('replaces identifier citations with nodes that reference their source metadata', () => {
    const processor = makeOptions().makeProcessor({
      citations: [
        {
          identifier: 'doc1',
          name: 'Annual Report',
          url: 'https://example.com/report'
        }
      ]
    });
    const tree = processor.runSync(processor.parse('Revenue increased by 12% [doc1].'));

    expect((tree.children[0] as Parent).children).toEqual([
      { type: 'text', value: 'Revenue increased by 12% ' },
      { type: 'citations', children: [{ type: 'citation', citationIndex: 0 }] },
      { type: 'text', value: '.' }
    ]);
  });

  it('replaces inline cite directives with identifier citations', () => {
    const processor = makeOptions().makeProcessor({
      citations: [
        {
          identifier: 'doc1',
          name: 'Annual Report',
          url: 'https://example.com/report'
        }
      ]
    });
    const tree = processor.runSync(processor.parse('Revenue increased by 12% :cite[doc1].'));

    expect((tree.children[0] as Parent).children).toMatchObject([
      { type: 'text', value: 'Revenue increased by 12% ' },
      { type: 'citations', children: [{ type: 'citation', citationIndex: 0 }] },
      { type: 'text', value: '.' }
    ]);
  });

  it('replaces nodes covered by position citations', () => {
    const markdown = 'Revenue increased in 2025.[[1]](https://example.com/report)';
    const processor = makeOptions().makeProcessor({
      citations: [
        {
          position: { startIndex: 26, endIndex: markdown.length },
          name: 'Annual Report',
          url: 'https://example.com/report'
        }
      ]
    });
    const tree = processor.runSync(processor.parse(markdown));

    expect((tree.children[0] as Parent).children).toContainEqual(
      expect.objectContaining({
        type: 'citations',
        children: [expect.objectContaining({ type: 'citation', citationIndex: 0, text: '[1]' })]
      })
    );
  });

  it('removes a link containing only an identifier citation', () => {
    const processor = makeOptions().makeProcessor({
      citations: [{ identifier: '1', name: 'Annual Report', url: 'https://example.com/report' }]
    });
    const tree = processor.runSync(
      processor.parse('Revenue increased in 2025.[[1]](https://example.com/report)')
    );

    expect((tree.children[0] as Parent).children).toMatchObject([
      { type: 'text', value: 'Revenue increased in 2025.' },
      { type: 'citations', children: [{ type: 'citation', citationIndex: 0 }] }
    ]);
  });

  it('replaces position citations within text nodes', () => {
    const processor = makeOptions().makeProcessor({
      citations: [
        {
          position: { startIndex: 8, endIndex: 11 },
          name: 'Annual Report',
          url: 'https://example.com/report'
        }
      ]
    });
    const tree = processor.runSync(processor.parse('Revenue [1] increased.'));

    expect((tree.children[0] as Parent).children).toEqual([
      { type: 'text', value: 'Revenue ' },
      {
        type: 'citations',
        children: [{ type: 'citation', citationIndex: 0, text: '[1]' }]
      },
      { type: 'text', value: ' increased.' }
    ]);
  });

  it('groups adjacent citations in a single container', () => {
    const processor = makeOptions().makeProcessor({
      citations: [
        { identifier: '1', name: 'First source', url: 'https://example.com/1' },
        { identifier: '2', name: 'Second source', url: 'https://example.com/2' },
        { identifier: '3', name: 'Third source', url: 'https://example.com/3' }
      ]
    });
    const tree = processor.runSync(processor.parse('Revenue [1][3][2].'));

    expect((tree.children[0] as Parent).children).toEqual([
      { type: 'text', value: 'Revenue ' },
      {
        type: 'citations',
        children: [
          { type: 'citation', citationIndex: 0 },
          { type: 'citation', citationIndex: 2 },
          { type: 'citation', citationIndex: 1 }
        ]
      },
      { type: 'text', value: '.' }
    ]);
  });

  it('leaves the AST unchanged when an identifier citation cannot be resolved', () => {
    const processor = makeOptions().makeProcessor({
      citations: [{ identifier: 'doc1', name: 'Annual Report', url: 'https://example.com/report' }]
    });
    const tree = processor.parse('Revenue increased by 12% [unknown].');

    expect(processor.runSync(tree).children).toBe(tree.children);
  });
});
