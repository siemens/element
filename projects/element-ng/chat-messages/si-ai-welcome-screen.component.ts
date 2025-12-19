/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, model, output } from '@angular/core';
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
   * The list of prompt suggestions
   * @defaultValue []
   */
  readonly promptSuggestions = input<PromptSuggestion[]>([]);

  /**
   * Emitted when a prompt suggestion is clicked
   */
  readonly promptSelected = output<PromptSuggestion>();

  protected onCategoryClick(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  protected onPromptClick(suggestion: PromptSuggestion): void {
    this.promptSelected.emit(suggestion);
  }
}
