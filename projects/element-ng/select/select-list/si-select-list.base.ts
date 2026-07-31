/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  TemplateRef
} from '@angular/core';

import {
  SI_SELECT_OPTIONS_STRATEGY,
  SiSelectOptionsStrategy
} from '../options/si-select-options-strategy';
import { SiSelectSelectionStrategy } from '../selection/si-select-selection-strategy';
import { SelectGroup, SelectOption } from '../si-select.types';

@Directive({
  host: {
    class: 'dropdown-menu position-static w-100 py-4 d-flex flex-column',
    '[class.si-multi-select]': 'multiSelect',
    '(keydown.tab)': 'keydownTab()'
  }
})
export abstract class SiSelectListBase<T> implements OnInit, OnDestroy {
  /**
   * Base ID used to associate the listbox with its label.
   */
  readonly baseId = input.required<string>();
  /**
   * Custom template for rendering options.
   */
  readonly optionTemplate = input<
    TemplateRef<{
      $implicit: SelectOption<T>;
    }>
  >();
  /**
   * Custom template for rendering option groups.
   */
  readonly groupTemplate = input<
    TemplateRef<{
      $implicit: SelectGroup<T>;
    }>
  >();
  /** @defaultValue null */
  readonly labelledby = input<string | null>(null);
  /**
   * Custom template for actions displayed below the options.
   */
  readonly actionsTemplate = input<TemplateRef<any>>();

  /**
   * Emits when the listbox should close.
   */
  readonly closeOverlay = output<void>();

  protected readonly selectionStrategy =
    inject<SiSelectSelectionStrategy<T>>(SiSelectSelectionStrategy);
  protected readonly selectOptions = inject<SiSelectOptionsStrategy<T>>(SI_SELECT_OPTIONS_STRATEGY);
  protected readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  protected readonly elementRef = inject(ElementRef);
  protected rows = this.selectOptions.rows;
  protected focusTrap!: ConfigurableFocusTrap;

  protected multiSelect = this.selectionStrategy.allowMultiple;

  ngOnInit(): void {
    this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.focusTrap.destroy();
  }

  protected keydownTab(): void {
    // Ignore tab key if actions are displayed.
    if (!this.actionsTemplate()) {
      this.closeOverlayAlways();
    }
  }

  protected closeOverlayAlways(): void {
    this.closeOverlay.emit();
  }

  protected closeOverlayIfSingle(): void {
    if (!this.selectionStrategy.allowMultiple) {
      this.closeOverlayAlways();
    }
  }
}
