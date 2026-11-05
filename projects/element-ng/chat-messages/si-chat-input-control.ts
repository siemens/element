/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Signal, TemplateRef } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Contract for optional, projected controls that temporarily take over composing a message.
 * Implementations are imported by the consumer, not by the chat input.
 * @experimental
 */
export abstract class SiChatInputControl {
  abstract readonly active: Signal<boolean>;
  abstract readonly textSecondary: Signal<boolean>;
  abstract readonly placeholder: Signal<TranslatableString>;
  abstract readonly controls: Signal<TemplateRef<unknown> | undefined>;
  abstract readonly focusTarget: Signal<HTMLButtonElement | undefined>;

  abstract containsFocus(element: Element | null | undefined): boolean;
  abstract activate(): void;
  abstract onKeyDown(event: KeyboardEvent): void;
}
