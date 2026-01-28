/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import {
  SiAiWelcomeScreenComponent,
  PromptCategory,
  PromptSuggestion
} from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAiWelcomeScreenComponent],
  templateUrl: './si-ai-welcome-screen.html'
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);

  readonly promptCategories: PromptCategory[] = [
    { label: 'All prompts' },
    { label: 'Maintenance' },
    { label: 'Analytics' },
    { label: 'Troubleshooting' }
  ];

  readonly selectedCategory = signal<string>('All prompts');

  readonly allSuggestions: PromptSuggestion[] = [
    { text: 'How do I optimize performance for large datasets?' },
    { text: 'What are the best practices for data validation?' },
    { text: 'Help me troubleshoot this error message' },
    { text: 'Explain the difference between async and sync operations' }
  ];

  readonly promptSuggestions = signal<PromptSuggestion[]>(this.allSuggestions);

  onPromptSelected(suggestion: PromptSuggestion): void {
    this.logEvent(`Prompt selected: ${suggestion.text}`);
  }
}
