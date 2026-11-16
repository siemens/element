/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal } from '@angular/core';

/**
 * Parent contract used by {@link SiChatInputComponent} when it is projected into a chat container.
 */
export interface SiChatInputParent {
  readonly inputSending: Signal<boolean>;
  readonly inputInterruptible: Signal<boolean>;
  onInputSend(): void;
}

/**
 * Optional parent contract for {@link SiChatInputComponent}.
 */
export const SI_CHAT_INPUT_PARENT = new InjectionToken<SiChatInputParent>('si.chat-input.parent');
