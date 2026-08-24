/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken } from '@angular/core';
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
} from '@siemens/element-icons';
import { EntityStatusType, StatusIcon } from '@siemens/element-ng/common';
import { t } from '@siemens/element-translate-ng/translate';

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
          color: 'text-success',
          stacked: 'elementStateTick',
          stackedColor: 'text-on-success',
          background: 'background-success-subtle',
          severity: 5,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.SUCCESS:Success`)
        },
        info: {
          icon: 'elementSquareFilled',
          color: 'text-information',
          stacked: 'elementStateInfo',
          stackedColor: 'text-on-information',
          background: 'background-information-subtle',
          severity: 4,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.INFO:Info`)
        },
        caution: {
          icon: 'elementSquare45Filled',
          color: 'text-caution',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'text-on-caution',
          background: 'background-caution-subtle',
          severity: 3,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.CAUTION:Caution`)
        },
        warning: {
          icon: 'elementTriangleFilled',
          color: 'text-warning',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'text-on-warning',
          background: 'background-warning-subtle',
          severity: 2,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.WARNING:Warning`)
        },
        danger: {
          icon: 'elementCircleFilled',
          color: 'text-danger',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'text-on-danger',
          background: 'background-danger-subtle',
          severity: 1,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.DANGER:Danger`)
        },
        critical: {
          icon: 'elementOctagonFilled',
          color: 'text-critical',
          stacked: 'elementStateExclamationMark',
          stackedColor: 'text-on-critical',
          background: 'background-critical-subtle',
          severity: 0,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.CRITICAL:Critical`)
        },
        progress: {
          icon: 'elementCircleFilled',
          color: 'text-information',
          stacked: 'elementStateProgress',
          stackedColor: 'text-on-information',
          background: 'background-information-subtle',
          severity: 7,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.PROGRESS:Progress`)
        },
        pending: {
          icon: 'elementCircleFilled',
          color: 'text-caution',
          stacked: 'elementStatePause',
          stackedColor: 'text-on-caution',
          background: 'background-caution-subtle',
          severity: 6,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.PENDING:Pending`)
        },
        unknown: {
          icon: 'elementCircleFilled',
          color: 'text-disabled',
          stacked: 'elementStateQuestionMark',
          stackedColor: 'text-primary',
          background: 'background-0',
          severity: 8,
          ariaLabel: t(() => $localize`:@@SI_ICON_STATUS.UNKNOWN:Unknown`)
        }
      };
    }
  }
);
