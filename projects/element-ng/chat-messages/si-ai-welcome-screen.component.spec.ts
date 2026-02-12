/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiAiWelcomeScreenComponent } from './si-ai-welcome-screen.component';

describe('SiAiWelcomeScreenComponent', () => {
  let component: SiAiWelcomeScreenComponent;
  let fixture: ComponentFixture<SiAiWelcomeScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiAiWelcomeScreenComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SiAiWelcomeScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display categories when provided', () => {
    const categories = [{ label: 'Category 1' }, { label: 'Category 2' }];
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Category 1');
    expect(compiled.textContent).toContain('Category 2');
  });

  it('should display prompt suggestions when provided', () => {
    const suggestions = [{ text: 'Suggestion 1' }, { text: 'Suggestion 2' }];
    fixture.componentRef.setInput('promptSuggestions', suggestions);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Suggestion 1');
    expect(compiled.textContent).toContain('Suggestion 2');
  });

  it('should emit categorySelected when category is clicked', () => {
    const categories = [{ label: 'Category 1' }];
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const categoryChip = fixture.nativeElement.querySelector('si-summary-chip .chip');
    categoryChip?.click();
    fixture.detectChanges();

    expect(component.selectedCategory()).toBe('Category 1');
  });

  it('should emit promptSelected when suggestion is clicked', () => {
    const suggestion = { text: 'Suggestion 1' };
    fixture.componentRef.setInput('promptSuggestions', [suggestion]);
    fixture.detectChanges();

    const emitSpy = spyOn(component.promptSelected, 'emit');
    const suggestionButton = fixture.nativeElement.querySelector('button');
    suggestionButton?.click();

    expect(emitSpy).toHaveBeenCalledWith(suggestion);
  });

  it('should hide categories when no categories provided', () => {
    fixture.componentRef.setInput('categories', []);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const categoryChips = compiled.querySelectorAll('si-summary-chip');
    expect(categoryChips.length).toBe(0);
  });

  it('should hide suggestions when no suggestions provided', () => {
    fixture.componentRef.setInput('promptSuggestions', []);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const actionCards = compiled.querySelectorAll('[si-action-card]');
    expect(actionCards.length).toBe(0);
  });
});
