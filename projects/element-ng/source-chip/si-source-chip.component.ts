/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { elementGlobal } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  SiPopoverTitleDirective,
  SiPopoverBodyDirective,
  SiPopoverDirective
} from '@siemens/element-ng/popover';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { SourceReference } from './si-source-chip.model';

@Component({
  selector: 'si-source-chip',
  imports: [
    SiIconComponent,
    SiTranslatePipe,
    SiPopoverTitleDirective,
    SiPopoverBodyDirective,
    SiPopoverDirective
  ],
  templateUrl: './si-source-chip.component.html',
  styleUrl: './si-source-chip.component.scss',
  host: {
    class: 'px-2',
    '[class.lh-1]': 'compact()'
  }
})
export class SiSourceChipComponent {
  /**
   * Wether to show the glob icon.
   * @defaultValue false
   */
  readonly showIcon = input(false, { transform: booleanAttribute });
  /**
   * Wether to show a 'sources' label
   * @defaultValue false
   */
  readonly showLabel = input(false, { transform: booleanAttribute });
  /** The sources. */
  readonly sources = input.required<SourceReference[]>();
  /**
   * Compact mode for inline use.
   * @defaultValue false
   */
  readonly compact = input(false, { transform: booleanAttribute });
  /**
   * Disabled state.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted when a source has been clicked. */
  readonly sourceClicked = output<SourceReference>();

  protected readonly labelSources = t(() => $localize`:@@SI_SOURCE_CHIP.SOURCES:Sources`);

  protected readonly label = computed(() => {
    const name = this.sources()[0].name;
    return name.length > 24 ? name.slice(0, 24) + '…' : name;
  });

  constructor() {
    addIcons({ elementGlobal });
  }
}
