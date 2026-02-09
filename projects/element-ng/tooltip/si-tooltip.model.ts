/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

export type SiTooltipContent = TranslatableString | TemplateRef<any> | Type<any> | null | undefined;

export interface SiTooltipConfig {
  id: string;
  tooltip: () => SiTooltipContent;
  tooltipContext: () => unknown;
}

export const SI_TOOLTIP_CONFIG = new InjectionToken<SiTooltipConfig>('SiTooltipConfig');
