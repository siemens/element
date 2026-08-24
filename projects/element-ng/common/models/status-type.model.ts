/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

export type StatusType = 'success' | 'info' | 'warning' | 'danger' | 'caution' | 'critical';
export type ExtendedStatusType = StatusType | 'unknown';
export type EntityStatusType = ExtendedStatusType | 'pending' | 'progress';
export type AccentLineType = StatusType | 'caution' | 'primary' | 'inactive';

export interface StatusIcon {
  icon: string;
  color: string;
  stacked: string;
  stackedColor: string;
  background: string;
  severity: number; // for sorting
  ariaLabel?: TranslatableString;
}

export const STATUS_ICON: { [key in EntityStatusType]: StatusIcon } = {
  success: {
    icon: 'element-circle-filled',
    color: 'text-success',
    stacked: 'element-state-tick smooth-auto',
    stackedColor: 'text-on-success',
    background: 'background-success-subtle',
    severity: 5
  },
  info: {
    icon: 'element-square-filled',
    color: 'text-information',
    stacked: 'element-state-info smooth-auto',
    stackedColor: 'text-on-information',
    background: 'background-information-subtle',
    severity: 4
  },
  caution: {
    icon: 'element-square-45-filled',
    color: 'text-caution',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'text-on-caution',
    background: 'background-caution-subtle',
    severity: 3
  },
  warning: {
    icon: 'element-triangle-filled',
    color: 'text-warning',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'text-on-warning',
    background: 'background-warning-subtle',
    severity: 2
  },
  danger: {
    icon: 'element-circle-filled',
    color: 'text-danger',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'text-on-danger',
    background: 'background-danger-subtle',
    severity: 1
  },
  critical: {
    icon: 'element-octagon-filled',
    color: 'text-critical',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'text-on-critical',
    background: 'background-critical-subtle',
    severity: 0
  },
  progress: {
    icon: 'element-circle-filled',
    color: 'text-information',
    stacked: 'element-state-progress smooth-auto',
    stackedColor: 'text-on-information',
    background: 'background-information-subtle',
    severity: 7
  },
  pending: {
    icon: 'element-circle-filled',
    color: 'text-caution',
    stacked: 'element-state-pause smooth-auto',
    stackedColor: 'text-on-caution',
    background: 'background-caution-subtle',
    severity: 6
  },
  unknown: {
    icon: 'element-circle-filled',
    color: 'text-disabled',
    stacked: 'element-state-question-mark',
    stackedColor: 'text-primary',
    background: 'background-0',
    severity: 8
  }
};
