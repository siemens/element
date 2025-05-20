/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';
import { EntityStatusType, StatusIcon } from '@siemens/element-ng/common';

import {
  elementCircleFilled,
  elementOctagonFilled,
  elementSquare45Filled,
  elementSquareFilled,
  elementStateExclamationMark,
  elementStateInfo,
  elementStatePause,
  elementStateProgress,
  elementStateQuestionMark,
  elementStateTick,
  elementTriangleFilled
} from './element-icons';
import { addIcons } from './si-icons';

/**
 * The status icon configuration.
 *
 * @experimental
 */
export const STATUS_ICON_CONFIG = new InjectionToken<{ [key in EntityStatusType]: StatusIcon }>(
  'STATUS_ICON_CONFIG',
  {
    providedIn: 'root',
    factory: () => {
      addIcons({
        elementCircleFilled,
        elementOctagonFilled,
        elementSquare45Filled,
        elementSquareFilled,
        elementStateExclamationMark,
        elementStateInfo,
        elementStatePause,
        elementStateProgress,
        elementStateQuestionMark,
        elementStateTick,
        elementTriangleFilled
      });
      return {
        success: {
          icon: 'elementCircleFilled',
          color: 'status-success',
          stacked: 'elementStateTick',
          stackedColor: 'status-success-contrast',
          background: 'bg-base-success',
          severity: 5
        },
        info: {
          icon: 'elementSquareFilled',
          color: 'status-info',
          stacked: 'elementStateInfo',
          stackedColor: 'status-info-contrast',
          background: 'bg-base-info',
          severity: 4
        },
        caution: {
          icon: 'elementSquare45Filled',
          color: 'status-caution',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'status-caution-contrast',
          background: 'bg-base-caution',
          severity: 3
        },
        warning: {
          icon: 'elementTriangleFilled',
          color: 'status-warning',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'status-warning-contrast',
          background: 'bg-base-warning',
          severity: 2
        },
        danger: {
          icon: 'elementCircleFilled',
          color: 'status-danger',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'status-danger-contrast',
          background: 'bg-base-danger',
          severity: 1
        },
        critical: {
          icon: 'elementOctagonFilled',
          color: 'status-critical',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'status-critical-contrast',
          background: 'bg-base-danger',
          severity: 0
        },
        progress: {
          icon: 'elementCircleFilled',
          color: 'status-info',
          stacked: 'elementStateProgress',
          stackedColor: 'status-info-contrast',
          background: 'bg-base-info',
          severity: 7
        },
        pending: {
          icon: 'elementCircleFilled',
          color: 'status-caution',
          stacked: 'elementStatePause',
          stackedColor: 'status-caution-contrast',
          background: 'bg-base-caution',
          severity: 6
        },
        unknown: {
          icon: 'elementCircleFilled',
          color: 'status-neutral',
          stacked: 'elementStateQuestionMark',
          stackedColor: 'text-body',
          background: 'bg-base-0',
          severity: 8
        }
      };
    }
  }
);
