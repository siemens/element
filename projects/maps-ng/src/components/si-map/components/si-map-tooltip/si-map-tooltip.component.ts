/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal
} from '@angular/core';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { TOOLTIP_FEATURES_TO_DISPLAY } from '../../models/constants';

@Component({
  selector: 'si-map-tooltip',
  imports: [SiTranslatePipe],
  templateUrl: './si-map-tooltip.component.html',
  styleUrl: './si-map-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiMapTooltipComponent {
  /**
   * Cutoff text for tooltips, when cluster combines more than 4 features
   *
   * @defaultValue
   * ```
   * t(() =>$localize`:@@SI_MAPS.TOOLTIP_MORE_TEXT:+ {{length}} locations`)
   * ```
   */
  readonly moreText = input(
    t(() => $localize`:@@SI_MAPS.TOOLTIP_MORE_TEXT:+ {{length}} locations`)
  );

  /**
   * Adds the maximum length of a string thats allowed in a tooltip and if its longer it cuts off the rest and adds 3 dots at the end.
   * If set to -1, it will not cut off the string.
   * @defaultValue 50
   */
  readonly maxLabelLength = input(50);

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  protected readonly hiddenEntries = signal(0);
  protected readonly tooltipLabels = signal<string[]>([]);
  private readonly elementRef = inject(ElementRef);

  /**
   * Method sets tooltip content. If parameter is of type
   * string, it will directly set it as tooltip content.
   * If it is array of string, it will render it as list of those strings.
   *
   * @param labels - array of strings or string itself
   */
  setTooltip(labels: string[] | string): void {
    const labelList = typeof labels === 'string' ? [labels] : labels.length > 1 ? labels : [];
    this.tooltipLabels.set(
      labelList.slice(0, TOOLTIP_FEATURES_TO_DISPLAY).map(label => this.getLabelText(label))
    );
    this.hiddenEntries.set(Math.max(labelList.length - TOOLTIP_FEATURES_TO_DISPLAY, 0));
  }

  private getLabelText(label: string): string {
    if (this.maxLabelLength() != -1 && label.length > this.maxLabelLength()) {
      return `${label.substring(0, this.maxLabelLength())}…`;
    }

    return label;
  }
}
