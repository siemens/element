/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiPopoverDirective } from '@siemens/element-ng/popover';

import { SiChatCitation } from './si-annotated-text.model';
import { SiCitationButtonComponent as TestComponent } from './si-citation-button.component';

const CITATION_WITH_URL: SiChatCitation = {
  id: '1',
  title: 'Deep Learning – Ian Goodfellow et al.',
  url: 'https://www.deeplearningbook.org'
};

const CITATION_WITHOUT_URL: SiChatCitation = {
  id: '2',
  title: 'Backpropagation Algorithm – Stanford CS231n'
};

const CITATION_WITH_DESCRIPTION: SiChatCitation = {
  id: '3',
  title: 'Neural Networks – Deep Dive',
  description: 'An excerpt describing neural networks in depth.',
  url: 'https://example.com/neural-networks'
};

describe('SiCitationButtonComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let citations: WritableSignal<SiChatCitation[]>;
  let label: WritableSignal<string>;
  let clickedValues: SiChatCitation[];

  beforeEach(() => {
    citations = signal<SiChatCitation[]>([CITATION_WITH_URL, CITATION_WITHOUT_URL]);
    label = signal('View sources');
    clickedValues = [];

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('citations', citations), inputBinding('label', label)]
    });
    debugElement = fixture.debugElement;
    fixture.componentInstance.citationClicked.subscribe(c => clickedValues.push(c));
  });

  it('should render a button with a globe icon', async () => {
    await fixture.whenStable();

    const button = debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.querySelector('si-icon')).toBeTruthy();
  });

  it('should have the default "View sources" aria-label', async () => {
    await fixture.whenStable();

    const button: HTMLButtonElement = debugElement.query(By.css('button')).nativeElement;
    expect(button.getAttribute('aria-label')).toBe('View sources');
  });

  it('should have the default "View sources" title attribute', async () => {
    await fixture.whenStable();

    const button: HTMLButtonElement = debugElement.query(By.css('button')).nativeElement;
    expect(button.title).toBe('View sources');
  });

  it('should use a custom label when provided', async () => {
    label.set('All sources');
    await fixture.whenStable();

    const button: HTMLButtonElement = debugElement.query(By.css('button')).nativeElement;
    expect(button.getAttribute('aria-label')).toBe('All sources');
  });

  it('should have correct button classes for a circular action button', async () => {
    await fixture.whenStable();

    const button: HTMLButtonElement = debugElement.query(By.css('button')).nativeElement;
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-tertiary-ghost');
    expect(button).toHaveClass('btn-icon');
  });

  it('should attach a SiPopoverDirective to the inner span', async () => {
    await fixture.whenStable();

    const popover = debugElement.query(By.directive(SiPopoverDirective));
    expect(popover).toBeTruthy();
  });

  describe('popover content', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show the popover on mouseenter', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).toBeInTheDocument();
    });

    it('should hide the popover on mouseleave after a short delay', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      vi.advanceTimersByTime(200);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).not.toBeInTheDocument();
    });

    it('should show the popover on button click', async () => {
      await fixture.whenStable();

      const button: HTMLButtonElement = debugElement.query(By.css('button')).nativeElement;
      button.click();
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).toBeInTheDocument();
    });

    it('should display citation titles in the popover', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      const popover = document.querySelector('.popover');
      expect(popover).toHaveTextContent(CITATION_WITH_URL.title);
      expect(popover).toHaveTextContent(CITATION_WITHOUT_URL.title);
    });

    it('should render citation with URL as an anchor link', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      const anchor = document.querySelector('.popover a[href]') as HTMLAnchorElement;
      expect(anchor).toBeTruthy();
      expect(anchor.href).toBe(CITATION_WITH_URL.url);
      expect(anchor.target).toBe('_blank');
    });

    it('should render citation without URL as a button', async () => {
      citations.set([CITATION_WITHOUT_URL]);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      const buttons = document.querySelectorAll('.popover button');
      expect(buttons).toHaveLength(1);
    });

    it('should display the description when present', async () => {
      citations.set([CITATION_WITH_DESCRIPTION]);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).toHaveTextContent(
        CITATION_WITH_DESCRIPTION.description!
      );
    });

    it('should not display a description paragraph when description is absent', async () => {
      citations.set([CITATION_WITH_URL]);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      const descriptionParagraph = document.querySelector('.popover p.text-secondary');
      expect(descriptionParagraph).not.toBeInTheDocument();
    });

    it('should emit citationClicked when a citation button in the popover is clicked', async () => {
      citations.set([CITATION_WITHOUT_URL]);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      const citationButton = document.querySelector('.popover button') as HTMLButtonElement;
      citationButton.click();
      await fixture.whenStable();

      expect(clickedValues).toHaveLength(1);
      expect(clickedValues[0]).toBe(CITATION_WITHOUT_URL);
    });
  });
});
