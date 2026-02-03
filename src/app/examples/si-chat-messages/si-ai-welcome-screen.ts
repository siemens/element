/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal } from '@angular/core';
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

  readonly selectedCategory = signal<string | undefined>('All prompts');

  readonly promptSuggestions: Record<string, PromptSuggestion[]> = {
    'All prompts': [
      { text: 'How do I optimize performance for large datasets?' },
      { text: 'What are the best practices for data validation?' },
      { text: 'Help me troubleshoot this error message' },
      { text: 'Explain the difference between async and sync operations' }
    ],
    'Maintenance': [
      { text: 'How do I update system dependencies?' },
      { text: 'What are best practices for database maintenance?' }
    ],
    'Analytics': [
      { text: 'How do I visualize this data?' },
      { text: 'What metrics should I track?' }
    ],
    'Troubleshooting': [
      { text: 'Help me troubleshoot this error message' },
      { text: 'Why is my query running slowly?' }
    ]
  };

  readonly currentPromptSuggestions = computed(() => {
    const category = this.selectedCategory() ?? 'All prompts';
    return this.promptSuggestions[category] || [];
  });

  onPromptSelected(suggestion: PromptSuggestion): void {
    this.logEvent(`Prompt selected: ${suggestion.text}`);
  }
}
