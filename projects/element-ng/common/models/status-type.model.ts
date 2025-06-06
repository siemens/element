/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
export type StatusType = 'success' | 'info' | 'warning' | 'danger';
export type ExtendedStatusType = StatusType | 'caution' | 'critical' | 'unknown';
export type EntityStatusType = ExtendedStatusType | 'pending' | 'progress';
export type AccentLineType = StatusType | 'caution' | 'primary' | 'inactive';

export interface StatusIcon {
  icon: string;
  color: string;
  stacked: string;
  stackedColor: string;
  background: string;
  severity: number; // for sorting
}

export const STATUS_ICON: { [key in EntityStatusType]: StatusIcon } = {
  success: {
    icon: 'element-circle-filled',
    color: 'status-success',
    stacked: 'element-state-tick smooth-auto',
    stackedColor: 'status-success-contrast',
    background: 'bg-base-success',
    severity: 5
  },
  info: {
    icon: 'element-square-filled',
    color: 'status-info',
    stacked: 'element-state-info smooth-auto',
    stackedColor: 'status-info-contrast',
    background: 'bg-base-info',
    severity: 4
  },
  caution: {
    icon: 'element-square-45-filled',
    color: 'status-caution',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-caution-contrast',
    background: 'bg-base-caution',
    severity: 3
  },
  warning: {
    icon: 'element-triangle-filled',
    color: 'status-warning',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-warning-contrast',
    background: 'bg-base-warning',
    severity: 2
  },
  danger: {
    icon: 'element-circle-filled',
    color: 'status-danger',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-danger-contrast',
    background: 'bg-base-danger',
    severity: 1
  },
  critical: {
    icon: 'element-octagon-filled',
    color: 'status-critical',
    stacked: 'element-state-exclamation-mark smooth-auto',
    stackedColor: 'status-critical-contrast',
    background: 'bg-base-critical',
    severity: 0
  },
  progress: {
    icon: 'element-circle-filled',
    color: 'status-info',
    stacked: 'element-state-progress smooth-auto',
    stackedColor: 'status-info-contrast',
    background: 'bg-base-info',
    severity: 7
  },
  pending: {
    icon: 'element-circle-filled',
    color: 'status-caution',
    stacked: 'element-state-pause smooth-auto',
    stackedColor: 'status-caution-contrast',
    background: 'bg-base-caution',
    severity: 6
  },
  unknown: {
    icon: 'element-circle-filled',
    color: 'status-neutral',
    stacked: 'element-state-question-mark',
    stackedColor: 'text-body',
    background: 'bg-base-0',
    severity: 8
  }
};
