/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { SiSourceChipComponent } from './si-source-chip.component';
import { type SourceReference } from './si-source-chip.model';

const source: SourceReference = {
  name: 'A source name that exceeds the compact chip label limit',
  url: 'https://example.com/source',
  description: 'Source description'
};

describe('SiSourceChipComponent', () => {
  let fixture: ComponentFixture<SiSourceChipComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(SiSourceChipComponent);
    fixture.componentRef.setInput('sources', [source]);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders a truncated source name', () => {
    expect(element.querySelector('.chip')).toHaveTextContent(`${source.name.slice(0, 24)}…`);
  });

  it('renders the optional icon and sources label', async () => {
    fixture.componentRef.setInput('showIcon', true);
    fixture.componentRef.setInput('showLabel', true);
    await fixture.whenStable();

    expect(element.querySelector('.chip')).toHaveTextContent('Sources');
    expect(element.querySelector('si-icon')).toBeInTheDocument();
  });

  it('opens its popover when clicked', async () => {
    const chip = element.querySelector<HTMLButtonElement>('.chip')!;

    await fixture.whenStable();
    await userEvent.click(chip);

    expect(document.querySelector('.popover')).toHaveTextContent(source.name);
    expect(document.querySelector('.popover')).toHaveTextContent(source.description!);

    await userEvent.click(chip);
    await fixture.whenStable();
  });
});
