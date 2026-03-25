/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, outputBinding, signal, twoWayBinding, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  PromptCategory,
  PromptSuggestion,
  SiAiWelcomeScreenComponent
} from './si-ai-welcome-screen.component';

describe('SiAiWelcomeScreenComponent', () => {
  let fixture: ComponentFixture<SiAiWelcomeScreenComponent>;
  let categories: WritableSignal<PromptCategory[]>;
  let promptSuggestions: WritableSignal<PromptSuggestion[]>;
  let selectedCategory: WritableSignal<string | undefined>;
  let promptSelectedSpy = vi.fn();

  beforeEach(() => {
    categories = signal<PromptCategory[]>([]);
    promptSuggestions = signal<PromptSuggestion[]>([]);
    selectedCategory = signal<string | undefined>(undefined);
    promptSelectedSpy = vi.fn();

    fixture = TestBed.createComponent(SiAiWelcomeScreenComponent, {
      bindings: [
        inputBinding('categories', categories),
        inputBinding('promptSuggestions', promptSuggestions),
        twoWayBinding('selectedCategory', selectedCategory),
        outputBinding<PromptSuggestion>('promptSelected', promptSelectedSpy)
      ]
    });
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display categories when provided', async () => {
    categories.set([{ label: 'Category 1' }, { label: 'Category 2' }]);
    await fixture.whenStable();

    const compiled = fixture.nativeElement;
    expect(compiled).toHaveTextContent('Category 1');
    expect(compiled).toHaveTextContent('Category 2');
  });

  it('should display prompt suggestions when provided', async () => {
    promptSuggestions.set([{ text: 'Suggestion 1' }, { text: 'Suggestion 2' }]);
    await fixture.whenStable();

    const compiled = fixture.nativeElement;
    expect(compiled).toHaveTextContent('Suggestion 1');
    expect(compiled).toHaveTextContent('Suggestion 2');
  });

  it('should emit categorySelected when category is clicked', async () => {
    categories.set([{ label: 'Category 1' }]);
    await fixture.whenStable();

    const categoryChip = fixture.nativeElement.querySelector('si-summary-chip .chip');
    categoryChip?.click();
    await fixture.whenStable();

    expect(selectedCategory()).toBe('Category 1');
  });

  it('should emit promptSelected when suggestion is clicked', async () => {
    const suggestion = { text: 'Suggestion 1' };
    promptSuggestions.set([suggestion]);
    await fixture.whenStable();

    const suggestionButton = fixture.nativeElement.querySelector('button');
    suggestionButton?.click();

    expect(promptSelectedSpy).toHaveBeenCalledWith(suggestion);
  });

  it('should hide categories when no categories provided', async () => {
    categories.set([]);
    await fixture.whenStable();

    const compiled = fixture.nativeElement;
    const categoryChips = compiled.querySelectorAll('si-summary-chip');
    expect(categoryChips.length).toBe(0);
  });

  it('should hide suggestions when no suggestions provided', async () => {
    promptSuggestions.set([]);
    await fixture.whenStable();

    const compiled = fixture.nativeElement;
    const actionCards = compiled.querySelectorAll('[si-action-card]');
    expect(actionCards.length).toBe(0);
  });
});
