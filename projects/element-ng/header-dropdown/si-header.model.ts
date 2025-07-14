/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ConnectedPosition } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { SiHeaderDropdownTriggerDirective } from './si-header-dropdown-trigger.directive';

/** @internal */
export interface HeaderWithDropdowns {
  /** Called whenever an item is triggered that is not opening another dropdown. */
  onDropdownItemTriggered?(): void;
  /** Whether the dropdown should be opened inline. */
  inlineDropdown?: Observable<boolean>;
  /** The position of the dropdown if opened in an overlay. */
  overlayPosition?: ConnectedPosition[];
  /** Called whenever a dropdown is opened **/
  dropdownOpened?(trigger: SiHeaderDropdownTriggerDirective): void;
  /** Called whenever a dropdown is close **/
  dropdownClosed?(trigger: SiHeaderDropdownTriggerDirective): void;
}

/** @internal */
export const SI_HEADER_WITH_DROPDOWNS = new InjectionToken<HeaderWithDropdowns>(
  'si-header.with-dropdowns'
);

/**
 * Can be used to pass context-specific options to a header-dropdown
 * that should / or cannot be provided by a consuming application.
 * @internal
 */
export interface HeaderDropdownOptions {
  /**
   * If the inline navbar is already wrapped in a focus trap,
   * set this property to prevent the header-dropdown from creating a focus trap.
   */
  disableRootFocusTrapForInlineMode: boolean;
}

/** @internal */
export const SI_HEADER_DROPDOWN_OPTIONS = new InjectionToken<HeaderDropdownOptions>(
  'si-header-dropdown.options'
);
