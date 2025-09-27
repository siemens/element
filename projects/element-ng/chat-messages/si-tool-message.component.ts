/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, input } from '@angular/core';
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

  protected formatData(data: string | object | undefined): string {
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
    return this.output() !== undefined && this.output() !== null;
  }
}
