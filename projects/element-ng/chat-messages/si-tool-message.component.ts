/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  input,
  Signal,
  booleanAttribute,
  viewChild,
  ElementRef,
  effect
} from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * Tool message component for displaying AI tool calls in conversational interfaces.
 *
 * The tool message component renders AI tool call information in chat interfaces,
 * supporting input/output display with an icon, loading states, and collapsible sections.
 * It appears as text (no bubble) aligned to the left side with and icon always shown.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component automatically handles:
 * - Styling for tool messages distinct from user, AI and generic chat messages
 * - Displaying tool name, icon, input arguments, and output result
 * - Showing loading states with skeleton UI during generation
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiAiMessageComponent} for the AI message component
 * @see {@link SiUserMessageComponent} for the user message component
 * @see {@link SiChatContainerComponent} for the base chat container to use this within
 * @see {@link SiAiChatContainerComponent} for the AI chat container which uses this component
 *
 * @experimental
 */
@Component({
  selector: 'si-tool-message',
  imports: [SiChatMessageComponent, SiIconComponent, SiCollapsiblePanelComponent],
  templateUrl: './si-tool-message.component.html',
  styleUrl: './si-tool-message.component.scss',
  host: {
    class: 'si-tool-message'
  }
})
export class SiToolMessageComponent {
  /**
   * The tool name/title
   * @defaultValue ''
   */
  readonly name = input<string>('');

  /**
   * Input arguments for the tool call (optional, JSON string or object)
   * @defaultValue undefined
   */
  readonly inputArguments = input<string | object>();

  /**
   * Output result from the tool call (optional, JSON string or object)
   * @defaultValue undefined
   */
  readonly output = input<string | object>();

  /**
   * Whether to expand the input arguments section by default
   * @defaultValue false
   */
  readonly expandInputArguments = input(false, { transform: booleanAttribute });

  /**
   * Whether to expand the output section by default
   * @defaultValue false
   */
  readonly expandOutput = input(false, { transform: booleanAttribute });

  /**
   * Whether the tool call is currently executing (shows skeleton)
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Custom tool icon name
   * @defaultValue 'element-maintenance'
   */
  readonly toolIcon = input('element-maintenance');

  /**
   * Label for the input arguments section
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TOOL_MESSAGE.INPUT_ARGUMENTS:Input Arguments`)
   * ```
   */
  readonly inputArgumentsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_TOOL_MESSAGE.INPUT_ARGUMENTS:Input Arguments`)
  );

  /**
   * Label for the output section
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TOOL_MESSAGE.OUTPUT:Output`)
   * ```
   */
  readonly outputLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_TOOL_MESSAGE.OUTPUT:Output`)
  );

  /**
   * Optional formatter function to transform output content before display.
   * - Returns string: Content will be displayed as text
   * - Returns Node: DOM node will be inserted directly
   *
   * When a formatter is provided and the rendered output contains only a single
   * code block, the surrounding markdown-content styling is stripped for a cleaner look.
   *
   * @defaultValue undefined
   */
  readonly contentFormatter = input<((text: string) => string | Node) | undefined>(undefined);

  protected readonly formattedInputContent =
    viewChild<ElementRef<HTMLDivElement>>('formattedInputContent');
  protected readonly formattedOutputContent =
    viewChild<ElementRef<HTMLDivElement>>('formattedOutputContent');

  constructor() {
    effect(() => {
      const formatter = this.contentFormatter();

      const inputContainer = this.formattedInputContent()?.nativeElement;
      if (inputContainer && formatter) {
        this.renderFormatted(formatter, inputContainer, this.formatData(this.inputArguments()));
      }

      const outputContainer = this.formattedOutputContent()?.nativeElement;
      if (outputContainer && formatter) {
        this.renderFormatted(formatter, outputContainer, this.formatData(this.getOutputValue()));
      }
    });
  }

  private renderFormatted(
    formatter: (text: string) => string | Node,
    container: HTMLElement,
    content: string
  ): void {
    container.innerHTML = '';
    if (!content) {
      return;
    }
    const formatted = formatter(content);
    if (typeof formatted === 'string') {
      container.textContent = formatted;
    } else if (formatted instanceof Node) {
      this.stripSingleCodeBlockWrapper(formatted);
      container.appendChild(formatted);
    }
  }

  /**
   * If the rendered node contains only a single code block (`.code-wrapper`),
   * strips the surrounding `markdown-content` class so the code block renders
   * without extra markdown container styling.
   */
  private stripSingleCodeBlockWrapper(node: Node): void {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    const significantChildren = Array.from(node.childNodes).filter(
      child => child.nodeType === 1 || (child.nodeType === 3 && child.textContent?.trim())
    );
    if (
      significantChildren.length === 1 &&
      significantChildren[0] instanceof HTMLElement &&
      significantChildren[0].classList.contains('code-wrapper')
    ) {
      node.className = '';
    }
  }

  protected formatData(data: string | object | Signal<string | object> | undefined): string {
    if (data === undefined || data === null) return '';
    // Unwrap signal if provided
    const unwrappedData =
      typeof data === 'function' && 'call' in data ? (data as Signal<string | object>)() : data;
    if (unwrappedData === undefined || unwrappedData === null) return '';
    if (typeof unwrappedData === 'string') return unwrappedData;
    try {
      return '```\n' + JSON.stringify(unwrappedData, null, 2).replace(/^\n+|\n+$/g, '') + '\n```';
    } catch {
      return '```\n' + String(unwrappedData).replace(/^\n+|\n+$/g, '') + '\n```';
    }
  }

  protected hasInputArguments(): boolean {
    return this.inputArguments() !== undefined && this.inputArguments() !== null;
  }

  protected hasOutput(): boolean {
    const outputValue = this.output();
    return outputValue !== undefined && outputValue !== null;
  }

  protected getLoadingState(): boolean {
    const loadingValue = this.loading();

    // If explicitly loading
    if (loadingValue) {
      return true;
    }

    // If output is empty string (not undefined), show loading
    return false;
  }

  protected getOutputValue(): string | object | undefined {
    const outputValue = this.output();
    return outputValue as string | object | undefined;
  }
}
