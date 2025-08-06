/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  SiApplicationHeaderComponent,
  SiHeaderActionItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@spike-rabbit/element-ng/application-header';
import {
  NavbarVerticalItem,
  SiNavbarVerticalComponent
} from '@spike-rabbit/element-ng/navbar-vertical';
import { SiThemeService, ThemeType } from '@spike-rabbit/element-ng/theme';

@Component({
  selector: 'app-root',
  imports: [
    SiNavbarVerticalComponent,
    RouterOutlet,
    SiApplicationHeaderComponent,
    RouterLink,
    SiHeaderActionItemComponent,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  menuItems: NavbarVerticalItem[] = [
    { type: 'router-link', label: 'Dashboard', routerLink: 'dashboard' },
    { type: 'router-link', label: 'Custom Catalog', routerLink: 'custom-catalog' },
    { type: 'router-link', label: 'Fixed Widgets', routerLink: 'fixed-widgets' },
    { type: 'router-link', label: 'Routed Dashboard 1', routerLink: 'routed-dashboard/1' },
    { type: 'router-link', label: 'Routed Dashboard 2', routerLink: 'routed-dashboard/2' }
  ];

  collapsed = false;
  theme: ThemeType = 'light';

  private translate = inject(TranslateService);
  private themeService = inject(SiThemeService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.theme = params.theme;
      this.themeService.applyThemeType(params.theme);
    });
    if (navigator.webdriver) {
      this.collapsed = true;
    }
    this.themeService.resolvedColorScheme$.pipe(takeUntilDestroyed()).subscribe(theme => {
      this.theme = theme;
    });
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('en');
    this.translate.use(this.translate.getBrowserLang() ?? 'en');
  }

  toggleDark(): void {
    if (this.theme === 'light') {
      this.theme = 'dark';
      this.themeService.applyThemeType(this.theme);
    } else {
      this.theme = 'light';
      this.themeService.applyThemeType(this.theme);
    }
  }
}
