/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
type CollapseTo = 'start' | 'end';
type SplitOrientation = 'horizontal' | 'vertical';

type Scale = 'none' | 'auto';

interface Action {
  iconClass: string;
  tooltip: string;
  click: (evt: Event) => void;
}

interface PartState {
  expanded?: boolean;
  size?: number;
}

export type { Action, CollapseTo, PartState, Scale, SplitOrientation };
