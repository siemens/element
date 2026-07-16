/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Parent, type Root } from 'mdast';

import { SiMarkdownOptions } from './si-markdown-options';
import { type SiMarkdownRoot } from './si-markdown.types';

describe('siMarkdownFootnotes', () => {
  it('collects definitions used by link and image references', () => {
    const processor = new SiMarkdownOptions().makeProcessor();
    const tree = processor.runSync(
      processor.parse(`[foo]: /url "title"

[foo]

![Building image as reference][imageref]

[imageref]: ./assets/images/building-1.webp`)
    ) as Root;

    expect(tree.children).toHaveLength(2);
    expect((tree.children[0] as Parent).children).toContainEqual(
      expect.objectContaining({ type: 'linkReference', identifier: 'foo' })
    );
    expect((tree.children[1] as Parent).children).toContainEqual(
      expect.objectContaining({ type: 'imageReference', identifier: 'imageref' })
    );
    expect((tree as SiMarkdownRoot).references?.definitions).toEqual(
      new Map([
        ['foo', expect.objectContaining({ url: '/url', title: 'title' })],
        ['imageref', expect.objectContaining({ url: './assets/images/building-1.webp' })]
      ])
    );
  });

  it('moves definitions to the end and numbers definitions and references by definition order', () => {
    const processor = new SiMarkdownOptions().makeProcessor();
    const tree = processor.runSync(
      processor.parse(`A reference.[^second]

[^first]: First definition.

Another reference.[^first]

[^second]: Second definition.`)
    ) as Root;

    expect(tree.children).toHaveLength(3);
    expect((tree.children[0] as Parent).children).toContainEqual(
      expect.objectContaining({ type: 'footnoteReference', identifier: 'second', label: '2' })
    );
    expect((tree.children[1] as Parent).children).toContainEqual(
      expect.objectContaining({ type: 'footnoteReference', identifier: 'first', label: '1' })
    );
    expect(tree.children[2]).toMatchObject({
      type: 'footnotes',
      children: [
        { type: 'footnoteDefinition', identifier: 'first', label: '1' },
        { type: 'footnoteDefinition', identifier: 'second', label: '2' }
      ]
    });
    expect(tree.children.some(child => child.type === 'footnoteDefinition')).toBe(false);
  });
});
