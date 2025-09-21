/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, Signal, booleanAttribute } from '@angular/core';
import { SiCollapsiblePanelComponent } from '@siemens/element-ng/accordion';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { SiChatMessageComponent } from './si-chat-message.component';

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

  protected formatData(data: string | object | Signal<string | object> | undefined): string {
    if (data === undefined || data === null) return '';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
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
