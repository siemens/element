/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement, inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { elementGlobal } from '@siemens/element-icons';

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
});
