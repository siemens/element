/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  SiAccountDetailsComponent,
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SI_DATATABLE_CONFIG,
  SiDatatableInteractionDirective
} from '@siemens/element-ng/datatable';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { NavbarVerticalItem } from '@siemens/element-ng/navbar-vertical';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { DataService, Page, PageRequest } from '../datatable/data.service';

@Component({
  selector: 'app-sample',
  imports: [
    NgxDatatableModule,
    SiDatatableInteractionDirective,
    SiPaginationComponent,
    SiSearchBarComponent,
    RouterLink,
    SiAccountDetailsComponent,
    SiApplicationHeaderComponent,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderActionsDirective,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './content-full-layout-full-scroll.html',
  providers: [DataService]
})
export class SampleComponent {
  private dataService = inject(DataService);
  protected readonly tableConfig = SI_DATATABLE_CONFIG;
  protected readonly menuItems: NavbarVerticalItem[] = [
    {
      type: 'group',
      label: 'Home',
      children: [
        { type: 'router-link', label: 'Sub Item', routerLink: 'subItem' },
        { type: 'router-link', label: 'Sub Item 2', routerLink: 'subItem2' },
        { type: 'router-link', label: 'Sub Item 3', routerLink: 'subItem3' }
      ]
    },
    {
      type: 'group',
      label: 'Documentation',
      children: [
        { type: 'router-link', label: 'Sub Item 4', routerLink: 'subItem4' },
        { type: 'router-link', label: 'Sub Item 5', routerLink: 'subItem5' },
        { type: 'router-link', label: 'Sub Item 6', routerLink: 'subItem6' }
      ]
    },
    { type: 'header', label: 'All the rest' },
    { type: 'router-link', label: 'Energy & Operations', routerLink: 'energy' },
    { type: 'router-link', label: 'Test Coverage', routerLink: 'coverage' }
  ];

  protected readonly maxPageNumber = 10;
  private readonly pageRequest = signal<PageRequest>({ offset: 0, pageSize: 10 });

  private readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => this.dataService.getResults(params)
  });

  protected readonly page = computed(() => {
    const request = this.pageRequest();
    const resolvedPage = this.dataResource.value()?.page ?? new Page();

    return {
      ...resolvedPage,
      pageNumber: request.offset,
      size: request.pageSize
    };
  });
  protected readonly rows = computed(() =>
    this.dataResource.isLoading() ? [] : (this.dataResource.value()?.data ?? [])
  );
  protected readonly isLoading = computed(() => (this.dataResource.isLoading() ? 1 : 0));

  protected setPaginationPage(pageNumber: number): void {
    this.setPage({
      offset: pageNumber - 1,
      pageSize: this.pageRequest().pageSize
    });
  }

  setPage(pageRequest: PageRequest): void {
    const requestedPage = Math.min(pageRequest.offset, this.maxPageNumber - 1);
    const current = this.pageRequest();
    if (current.offset !== requestedPage || current.pageSize !== pageRequest.pageSize) {
      this.pageRequest.set({ ...pageRequest, offset: requestedPage });
    }
  }
}
