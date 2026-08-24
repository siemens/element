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
    color: 'status-success',
    stacked: 'element-state-tick smooth-auto',
    stackedColor: 'status-success-contrast',
    background: 'background-success-subtle',
    severity: 5
  },
  info: {
    icon: 'element-square-filled',
    color: 'status-info',
    stacked: 'element-state-info smooth-auto',
    stackedColor: 'status-info-contrast',
    background: 'background-information-subtle',
    severity: 4
  },
  caution: {
    icon: 'element-square-45-filled',
    color: 'status-caution',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-caution-contrast',
    background: 'background-caution-subtle',
    severity: 3
  },
  warning: {
    icon: 'element-triangle-filled',
    color: 'status-warning',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-warning-contrast',
    background: 'background-warning-subtle',
    severity: 2
  },
  danger: {
    icon: 'element-circle-filled',
    color: 'status-danger',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-danger-contrast',
    background: 'background-danger-subtle',
    severity: 1
  },
  critical: {
    icon: 'element-octagon-filled',
    color: 'status-critical',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-critical-contrast',
    background: 'background-critical-subtle',
    severity: 0
  },
  progress: {
    icon: 'element-circle-filled',
    color: 'status-info',
    stacked: 'element-state-progress smooth-auto',
    stackedColor: 'status-info-contrast',
    background: 'background-information-subtle',
    severity: 7
  },
  pending: {
    icon: 'element-circle-filled',
    color: 'status-caution',
    stacked: 'element-state-pause smooth-auto',
    stackedColor: 'status-caution-contrast',
    background: 'background-caution-subtle',
    severity: 6
  },
  unknown: {
    icon: 'element-circle-filled',
    color: 'status-neutral',
    stacked: 'element-state-question-mark',
    stackedColor: 'text-primary',
    background: 'background-0',
    severity: 8
  }
};
