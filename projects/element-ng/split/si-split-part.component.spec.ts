/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { SiSplitPartComponent } from './si-split-part.component';

describe('SiSplitPartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SiSplitPartComponent] }).compileComponents();
  });

  it('should not be collapsible by default', async () => {
    const fixture = TestBed.createComponent(SiSplitPartComponent, {
      bindings: [inputBinding('size', () => 1), inputBinding('unit', () => 'fr')]
    });
    await fixture.whenStable();

    expect(fixture.componentInstance.collapsible()).toBeUndefined();
    await expect.element(page.getByRole('button', { name: 'Collapse' })).not.toBeInTheDocument();
  });
});
