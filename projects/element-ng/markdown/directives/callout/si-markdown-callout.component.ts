/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input } from '@angular/core';
import { elementLightOn } from '@siemens/element-icons';
import { StatusType } from '@siemens/element-ng/common';
import {
  addIcons,
  SiIconComponent,
  SiStatusIconComponent,
  STATUS_ICON_CONFIG
} from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { TranslatableString } from '@siemens/element-translate-ng/translate-types';
import { type Node, type Parent } from 'mdast';

import { SiMarkdownFragmentComponent } from '../../si-markdown-fragment.component';
import { type DirectiveNode, type SiMarkdownExtensionComponent } from '../../si-markdown.types';

type CalloutType =
  'success' | 'info' | 'warning' | 'danger' | 'caution' | 'critical' | 'note' | 'tip';

interface Callout {
  label?: TranslatableString;
  severity: StatusType;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'si-markdown-callout',
  imports: [SiIconComponent, SiStatusIconComponent, SiMarkdownFragmentComponent, SiTranslatePipe],
  templateUrl: './si-markdown-callout.component.html',
  host: {
    class: 'd-block mb-4'
  }
})
export class SiMarkdownCalloutComponent implements SiMarkdownExtensionComponent {
  private readonly statusIcons = inject(STATUS_ICON_CONFIG);

  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<unknown>();

  readonly icons = addIcons({ elementLightOn });

  readonly callouts: Record<CalloutType, Callout> = {
    info: { label: this.statusIcons.info.ariaLabel, severity: 'info' },
    success: { label: this.statusIcons.success.ariaLabel, severity: 'success' },
    warning: { label: this.statusIcons.warning.ariaLabel, severity: 'warning' },
    danger: { label: this.statusIcons.danger.ariaLabel, severity: 'danger' },
    caution: { label: this.statusIcons.caution.ariaLabel, severity: 'caution' },
    critical: { label: this.statusIcons.critical.ariaLabel, severity: 'critical' },
    note: {
      label: t(() => $localize`:@@SI_MARKDOWN_CALLOUT.NOTE:Note`),
      severity: 'info'
    },
    tip: {
      label: t(() => $localize`:@@SI_MARKDOWN_CALLOUT.TIP:Tip`),
      severity: 'success',
      icon: this.icons.elementLightOn,
      color: this.statusIcons.success.color
    }
  };

  protected readonly config = computed(() => {
    const directive = this.node() as DirectiveNode;
    const type = directive.attributes.type?.toLocaleLowerCase() as CalloutType;
    return {
      callout: this.callouts[type] ?? this.callouts.note,
      heading: directive.attributes.heading
    };
  });
}
