/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { SiTranslateModule, t } from '@siemens/element-translate-ng/translate';

import { TOOLTIP_FEATURES_TO_DISPLAY } from '../../models/constants';

@Component({
  selector: 'si-map-tooltip',
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  imports: [SiTranslateModule],
  templateUrl: './si-map-tooltip.component.html',
  styleUrl: './si-map-tooltip.component.scss'
})
export class SiMapTooltipComponent {
  protected readonly content = viewChild.required<ElementRef>('content');

  /**
   * Cutoff text for tooltips, when cluster combines more than 4 features
   *
   * @defaultValue
   * ```
   * t(() =>$localize`:@@SI_MAPS.TOOLTIP_MORE_TEXT:and {{length}} more...`)
   * ```
   */
  readonly moreText = input(
    t(() => $localize`:@@SI_MAPS.TOOLTIP_MORE_TEXT:and {{length}} more...`)
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
  private readonly elementRef = inject(ElementRef);

  /**
   * Method sets tooltip content. If parameter is of type
   * string, it will directly set it as tooltip content.
   * If it is array of string, it will render it as list of those strings.
   *
   * @param labels - array of strings or string itself
   */
  setTooltip(labels: string[] | string): void {
    if (typeof labels === 'string') {
      this.setContent(this.getLabelSnippet(labels));
      this.hiddenEntries.set(0);
      return;
    }

    const list: string[] = [];

    if (labels.length > 1) {
      const toDisplay = [...labels];
      const rest = toDisplay.splice(
        TOOLTIP_FEATURES_TO_DISPLAY,
        toDisplay.length - TOOLTIP_FEATURES_TO_DISPLAY
      );

      toDisplay.forEach(feat => list.push(this.getLabelSnippet(feat)));
      this.hiddenEntries.set(rest.length ?? 0);
    }

    this.setContent(list.join(''));
  }

  private getLabelSnippet(label: string): string {
    if (this.maxLabelLength() != -1 && label.length > this.maxLabelLength()) {
      return `<div>${label.substring(0, this.maxLabelLength())}...</div>`;
    } else {
      return `<div>${label}</div>`;
    }
  }

  private setContent(tooltip: string): void {
    this.content().nativeElement.innerHTML = tooltip;
  }
}
