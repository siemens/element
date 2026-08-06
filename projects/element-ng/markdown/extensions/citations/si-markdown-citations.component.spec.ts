/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiSourceChipComponent } from '@siemens/element-ng/source-chip';

import { SI_MARKDOWN_CONTROL, type SiMarkdownControl } from '../../si-markdown-token';
import { type SiMarkdownCitation } from '../../si-markdown.types';
import { SiMarkdownCitationsComponent } from './si-markdown-citations.component';

describe('SiMarkdownCitationsComponent', () => {
  let fixture: ComponentFixture<SiMarkdownCitationsComponent>;
  const citation: SiMarkdownCitation = {
    identifier: 'doc1',
    name: 'Annual Report',
    url: 'https://example.com/report'
  };
  const extensionEvent = { emit: vi.fn() };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SI_MARKDOWN_CONTROL,
          useValue: {
            templates: signal(new Map()),
            meta: signal({ citations: [citation] }),
            debug: signal(false),
            extensionEvent: extensionEvent as unknown as SiMarkdownControl['extensionEvent']
          } satisfies SiMarkdownControl
        }
      ]
    });
    fixture = TestBed.createComponent(SiMarkdownCitationsComponent);
    fixture.componentRef.setInput('node', {
      type: 'citations',
      children: [
        { type: 'citation', citationIndex: 0 },
        { type: 'citation', citationIndex: 1 }
      ]
    });
    fixture.componentRef.setInput('parent', { type: 'paragraph', children: [] });
    await fixture.whenStable();
  });

  it('renders resolved sources and forwards source clicks', () => {
    const sourceChip = fixture.debugElement.query(By.directive(SiSourceChipComponent))
      .componentInstance as SiSourceChipComponent;

    expect(sourceChip.sources()).toEqual([citation]);

    sourceChip.sourceClicked.emit(citation);

    expect(extensionEvent.emit).toHaveBeenCalledWith({ name: 'citationClicked', data: citation });
  });
});
