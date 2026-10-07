/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, InjectionToken, Injector, Signal } from '@angular/core';

/**
 * State contract consumed by {@link SiSelectComboboxTriggerDirective} to render
 * the ARIA combobox attributes and drive the open behavior of a select trigger.
 * Each host provides it through {@link SI_SELECT_COMBOBOX_TRIGGER_STATE}.
 */
export interface SiSelectComboboxTriggerState {
  /** Value for the `role` attribute. */
  readonly role: Signal<'combobox' | 'textbox'>;
  /** Value for the `aria-haspopup` attribute. */
  readonly haspopup: Signal<string | undefined>;
  /** Value for the `aria-expanded` attribute. */
  readonly expanded: Signal<boolean | undefined>;
  /** Value for the `aria-controls` attribute. */
  readonly controls: Signal<string | null | undefined>;
  /** Value for the `aria-labelledby` attribute. */
  readonly labelledby: Signal<string | null | undefined>;
  /** Whether the trigger is disabled. */
  readonly disabled: Signal<boolean>;
  /** Called when the user requests to open the dropdown via click or keyboard. */
  requestOpen(): void;
}

/**
 * Injection token providing the {@link SiSelectComboboxTriggerState} to
 * {@link SiSelectComboboxTriggerDirective}.
 */
export const SI_SELECT_COMBOBOX_TRIGGER_STATE =
  new InjectionToken<SiSelectComboboxTriggerState>('si.select.combobox-trigger-state');

/**
 * Shared host directive that renders the ARIA combobox attributes and handles
 * the keyboard/click gestures used to open a select dropdown. The dynamic values
 * are read from the {@link SI_SELECT_COMBOBOX_TRIGGER_STATE} provided by the host.
 *
 * It is meant to be composed via `hostDirectives`, not applied directly.
 */
@Directive({
  host: {
    'aria-autocomplete': 'none',
    '[attr.role]': 'state.role()',
    '[attr.aria-haspopup]': 'state.haspopup()',
    '[attr.aria-expanded]': 'state.expanded()',
    '[attr.aria-controls]': 'state.controls()',
    '[attr.aria-labelledby]': 'state.labelledby()',
    '[attr.aria-disabled]': 'state.disabled()',
    '[attr.tabindex]': 'state.disabled() ? "-1" : "0"',
    '[class.disabled]': 'state.disabled()',
    '(click)': 'open()',
    '(keydown.enter)': 'open()',
    '(keydown.space)': 'open($event)',
    '(keydown.alt.arrowDown)': 'open($event)',
    '(keydown.arrowDown)': 'open($event)',
    '(keydown.arrowUp)': 'open($event)'
  }
})
export class SiSelectComboboxTriggerDirective {
  private readonly injector = inject(Injector);
  private resolvedState?: SiSelectComboboxTriggerState;

  // Resolved lazily to avoid a construction-time cycle with the providing host.
  protected get state(): SiSelectComboboxTriggerState {
    return (this.resolvedState ??= this.injector.get(SI_SELECT_COMBOBOX_TRIGGER_STATE));
  }

  protected open(event?: Event): void {
    // Prevents page scrolling for Space / ArrowUp / ArrowDown.
    event?.preventDefault();
    this.state.requestOpen();
  }
}
