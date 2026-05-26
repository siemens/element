/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { elementGlobal } from '@siemens/element-icons';
import { SiPopoverDirective } from '@siemens/element-ng/popover';

import { SiChatCitation } from './si-annotated-text.model';
import { SiCitationPillComponent as TestComponent } from './si-citation-pill.component';

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

describe('SiCitationPillComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let citation: WritableSignal<SiChatCitation>;
  let icon: WritableSignal<string | undefined>;

  let clickedValues: SiChatCitation[];

  beforeEach(() => {
    citation = signal<SiChatCitation>(CITATION_WITH_URL);
    icon = signal<string | undefined>(undefined);
    clickedValues = [];

    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('citation', citation), inputBinding('icon', icon)]
    });
    debugElement = fixture.debugElement;
    fixture.componentInstance.clicked.subscribe(c => clickedValues.push(c));
  });

  describe('when citation has a URL', () => {
    beforeEach(() => {
      citation.set(CITATION_WITH_URL);
    });

    it('should render an anchor element', async () => {
      await fixture.whenStable();

      const anchor = debugElement.query(By.css('a.citation-pill'));
      expect(anchor).toBeTruthy();
    });

    it('should not render a button element', async () => {
      await fixture.whenStable();

      const button = debugElement.query(By.css('button.citation-pill'));
      expect(button).toBeFalsy();
    });

    it('should set href, target and rel on the anchor', async () => {
      await fixture.whenStable();

      const anchor: HTMLAnchorElement = debugElement.query(By.css('a.citation-pill')).nativeElement;
      expect(anchor.getAttribute('href')).toBe(CITATION_WITH_URL.url);
      expect(anchor.target).toBe('_blank');
      expect(anchor.rel).toContain('noopener');
      expect(anchor.rel).toContain('noreferrer');
    });

    it('should set title and aria-label from citation title', async () => {
      await fixture.whenStable();

      const anchor: HTMLAnchorElement = debugElement.query(By.css('a.citation-pill')).nativeElement;
      expect(anchor.title).toBe(CITATION_WITH_URL.title);
      expect(anchor.getAttribute('aria-label')).toBe(CITATION_WITH_URL.title);
    });

    it('should emit clicked with the citation and prevent default navigation on click', async () => {
      await fixture.whenStable();

      const anchor: HTMLAnchorElement = debugElement.query(By.css('a.citation-pill')).nativeElement;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      anchor.dispatchEvent(event);
      await fixture.whenStable();

      expect(event.defaultPrevented).toBe(true);
      expect(clickedValues).toHaveLength(1);
      expect(clickedValues[0]).toBe(CITATION_WITH_URL);
    });
  });

  describe('when citation has no URL', () => {
    beforeEach(() => {
      citation.set(CITATION_WITHOUT_URL);
    });

    it('should render a button element', async () => {
      await fixture.whenStable();

      const button = debugElement.query(By.css('button.citation-pill'));
      expect(button).toBeTruthy();
    });

    it('should not render an anchor element', async () => {
      await fixture.whenStable();

      const anchor = debugElement.query(By.css('a.citation-pill'));
      expect(anchor).toBeFalsy();
    });

    it('should set title and aria-label from citation title', async () => {
      await fixture.whenStable();

      const button: HTMLButtonElement = debugElement.query(
        By.css('button.citation-pill')
      ).nativeElement;
      expect(button.title).toBe(CITATION_WITHOUT_URL.title);
      expect(button.getAttribute('aria-label')).toBe(CITATION_WITHOUT_URL.title);
    });

    it('should emit clicked with the citation when button is clicked', async () => {
      await fixture.whenStable();

      const button: HTMLButtonElement = debugElement.query(
        By.css('button.citation-pill')
      ).nativeElement;
      button.click();
      await fixture.whenStable();

      expect(clickedValues).toHaveLength(1);
      expect(clickedValues[0]).toBe(CITATION_WITHOUT_URL);
    });
  });

  describe('icon', () => {
    it('should show the default icon when no icon input is set', async () => {
      fixture = TestBed.createComponent(TestComponent, {
        bindings: [inputBinding('citation', citation)]
      });
      debugElement = fixture.debugElement;
      await fixture.whenStable();

      const iconEl = debugElement.query(By.css('si-icon'));
      expect(iconEl).toBeTruthy();
      expect(iconEl.componentInstance.icon()).toBe(elementGlobal);
    });

    it('should hide the icon when icon is set to undefined', async () => {
      icon.set('element-bookmark');
      await fixture.whenStable();
      expect(debugElement.query(By.css('si-icon'))).toBeTruthy();

      icon.set(undefined);
      await fixture.whenStable();

      const iconEl = debugElement.query(By.css('si-icon'));
      expect(iconEl).toBeFalsy();
    });

    it('should render a custom icon when icon input is provided', async () => {
      const customIcon = 'element-bookmark';
      icon.set(customIcon);
      await fixture.whenStable();

      const iconEl = debugElement.query(By.css('si-icon'));
      expect(iconEl).toBeTruthy();
      expect(iconEl.componentInstance.icon()).toBe(customIcon);
    });
  });

  describe('popover', () => {
    const getPopoverDir = (): SiPopoverDirective =>
      debugElement.query(By.directive(SiPopoverDirective)).injector.get(SiPopoverDirective);

    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(async () => {
      // Flush the applyFocus setTimeout while the overlay is still attached so
      // the resulting afterNextRender runs against a valid injector.
      vi.advanceTimersByTime(10);
      await fixture.whenStable();
      getPopoverDir().hide();
      vi.useRealTimers();
    });

    it('should open the popover on mouseenter', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).toBeInTheDocument();
    });

    it('should show the citation title in the popover', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).toHaveTextContent(CITATION_WITH_URL.title);
    });

    it('should show the description in the popover when present', async () => {
      citation.set(CITATION_WITH_DESCRIPTION);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover')).toHaveTextContent(
        CITATION_WITH_DESCRIPTION.description!
      );
    });

    it('should show a "View source" link in the popover when citation has a URL', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      const link = document.querySelector('.popover a[target="_blank"]') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe(CITATION_WITH_URL.url);
    });

    it('should not show a "View source" link in the popover when citation has no URL', async () => {
      citation.set(CITATION_WITHOUT_URL);
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10);
      await fixture.whenStable();

      expect(document.querySelector('.popover a[target="_blank"]')).toBeFalsy();
    });

    it('should close the popover on mouseleave after a short delay', async () => {
      await fixture.whenStable();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      vi.advanceTimersByTime(10); // flush applyFocus timer while overlay is alive
      await fixture.whenStable();
      expect(document.querySelector('.popover')).toBeInTheDocument();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      vi.advanceTimersByTime(200); // exceeds the 150 ms scheduleHide delay
      await fixture.whenStable();

      expect(document.querySelector('.popover')).not.toBeInTheDocument();
    });
  });
});
