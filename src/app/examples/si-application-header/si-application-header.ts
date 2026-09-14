/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  SiAccountDetailsComponent,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderCollapsibleActionsComponent,
  SiHeaderLogoDirective,
  SiHeaderNavigationComponent,
  SiHeaderNavigationItemComponent,
  SiHeaderSelectionItemComponent
} from '@siemens/element-ng/application-header';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownCheckItemComponent,
  SiHeaderDropdownItemComponent,
  SiHeaderDropdownRadioItemComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { SiThemeService, ThemeType } from '@siemens/element-ng/theme';

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    SiHeaderActionItemComponent,
    SiHeaderCollapsibleActionsComponent,
    RouterLink,
    RouterLinkActive,
    SiAccountDetailsComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderDropdownItemComponent,
    SiHeaderDropdownCheckItemComponent,
    SiHeaderDropdownRadioItemComponent,
    SiHeaderNavigationItemComponent,
    SiHeaderAccountItemComponent,
    SiHeaderNavigationComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderSelectionItemComponent,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-application-header.html'
})
export class SampleComponent {
  private readonly themeService = inject(SiThemeService);

  readonly allTenants = ['Tenant 1', 'Tenant 2', 'Tenant 3'];
  readonly activeTenant = signal('Tenant 1');

  readonly activeTheme = signal<ThemeType>('auto');

  selectTheme(theme: ThemeType): void {
    this.activeTheme.set(theme);
    this.themeService.applyThemeType(theme);
  }
}
