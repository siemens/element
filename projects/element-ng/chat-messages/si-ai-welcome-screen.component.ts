/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, input, model, output } from '@angular/core';
import { SiActionCardComponent } from '@siemens/element-ng/card';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';

export interface PromptCategory {
  label: string;
}

export interface PromptSuggestion {
  text: string;
}

/**
 * AI welcome screen component for displaying initial state in AI chat interfaces.
 *
 * The AI welcome screen component provides an engaging initial state for AI chat interfaces,
 * featuring a welcome message, optional prompt categories for filtering, and suggested prompts
 * that users can click to start conversations.
 *
 * The component includes:
 * - Welcome header with AI branding and customizable greeting
 * - Optional category pills for filtering prompt suggestions
 * - Clickable prompt suggestion cards
 * - Optional refresh button to regenerate suggestions
 *
 * @see {@link SiAiChatContainerComponent} for the AI chat container which uses this component
 * @see {@link SiChatContainerComponent} for the base chat container
 *
 * @experimental
 */
@Component({
  selector: 'si-ai-welcome-screen',
  imports: [SiActionCardComponent, SiSummaryChipComponent, SiIconComponent],
  templateUrl: './si-ai-welcome-screen.component.html',
  styleUrl: './si-ai-welcome-screen.component.scss',
  host: {
    class: 'd-block'
  },
  hostDirectives: [SiResponsiveContainerDirective]
})
export class SiAiWelcomeScreenComponent {
  /**
   * The list of prompt categories
   * @defaultValue []
   */
  readonly categories = input<PromptCategory[]>([]);

  /**
   * The currently selected category ID
   * @defaultValue undefined
   */
  readonly selectedCategory = model<string | undefined>(undefined);

  /**
   * The list of prompt suggestions, either as an array or a record mapping category labels to suggestion arrays
   * @defaultValue []
   */
  readonly promptSuggestions = input<PromptSuggestion[] | Record<string, PromptSuggestion[]>>([]);

  /**
   * Computed list of filtered prompt suggestions based on selected category
   */
  protected readonly filteredPromptSuggestions = computed(() => {
    const suggestions = this.promptSuggestions();
    const selected = this.selectedCategory();

    // If suggestions is an array, return as-is (no filtering)
    if (Array.isArray(suggestions)) {
      return suggestions;
    }

    // If suggestions is a record and a category is selected, return that category's suggestions
    if (selected && suggestions[selected]) {
      return suggestions[selected];
    }

    // If no category selected, return all suggestions flattened
    return Object.values(suggestions).flat();
  });

  /**
   * Emitted when a prompt suggestion is clicked
   */
  readonly promptSelected = output<PromptSuggestion>();

  protected onCategoryClick(categoryLabel: string): void {
    this.selectedCategory.set(
      this.selectedCategory() === categoryLabel ? undefined : categoryLabel
    );
  }

  protected onPromptClick(suggestion: PromptSuggestion): void {
    this.promptSelected.emit(suggestion);
  }
}
