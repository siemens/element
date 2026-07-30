/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiMarkdownOptions } from '../../si-markdown-options';
import { SiMarkdownComponent } from '../../si-markdown.component';
import { SiMarkdownCitation, siMarkdownSourceCitations } from './si-markdown-source-citation.extension';

describe('SiMarkdownSourceCitationComponent', () => {
  let fixture: ComponentFixture<SiMarkdownComponent>;
  let element: HTMLElement;
  let citations: SiMarkdownCitation[];
  let onSourceOpen: ReturnType<typeof vi.fn<(citation: SiMarkdownCitation) => void>>;

  beforeEach(() => {
    citations = [
      {
        reference: '1',
        name: 'Data Analysis Guide',
        url: 'https://example.com/data-analysis',
        quote: 'Validate the data structure before analysis.'
      },
      {
        reference: '2',
        name: 'Large Dataset Performance Guide',
        url: 'https://example.com/large-datasets',
        description: 'Use incremental processing for production datasets.'
      }
    ];
    onSourceOpen = vi.fn<(citation: SiMarkdownCitation) => void>();
    fixture = TestBed.createComponent(SiMarkdownComponent);
    element = fixture.nativeElement;
    fixture.componentRef.setInput(
      'options',
      new SiMarkdownOptions().installExtension(
        siMarkdownSourceCitations({ citations, onSourceOpen })
      )
    );
  });

  it('groups resolved citations into one trailing source chip and opens its sources', async () => {
    fixture.componentRef.setInput(
      'markdown',
      'Validate the data structure before analysis.[1] Then process it incrementally.[2][1]'
    );
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    const sourceCitation = element.querySelector('si-markdown-source-citation');
    const trigger = sourceCitation?.querySelector('button');

    expect(element.querySelectorAll('si-markdown-source-citation')).toHaveLength(1);
    expect(element.querySelector('p')).not.toHaveTextContent('[1]');
    expect(element.querySelector('p')).not.toHaveTextContent('[2]');
    expect(trigger).toHaveAccessibleName('View sources: Data Analysis Guide and 1 additional source');
    expect(trigger).toHaveTextContent('Data Analysis Guide +1');
    expect(trigger?.querySelector('.chip')).not.toHaveAttribute('role');

    vi.useFakeTimers({ shouldAdvanceTime: true });
    trigger?.click();
    await fixture.whenStable();
    vi.advanceTimersByTime(10);
    await fixture.whenStable();

    const sourceItems = document.querySelectorAll('.popover .list-item');
    expect(sourceItems).toHaveLength(2);
    expect(sourceItems[0]).toHaveTextContent('Data Analysis Guide');
    expect(sourceItems[0]).toHaveTextContent('Validate the data structure before analysis.');
    expect(sourceItems[1]).toHaveTextContent('Large Dataset Performance Guide');
    expect(sourceItems[1]).toHaveTextContent('Use incremental processing for production datasets.');

    (sourceItems[1] as HTMLButtonElement).click();
    expect(onSourceOpen).toHaveBeenCalledWith(citations[1]);
    vi.useRealTimers();
  });

  it('leaves unresolved markers and citation-shaped markdown links unchanged', async () => {
    fixture.componentRef.setInput('markdown', 'Unknown source [3]. [1](https://example.com)');
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    await fixture.whenStable();

    expect(element.querySelectorAll('si-markdown-source-citation')).toHaveLength(0);
    expect(element.querySelector('p')).toHaveTextContent('Unknown source [3]. 1');
    expect(element.querySelector('a')).toHaveAttribute('href', 'https://example.com');
  });
});