/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent, SiEmptyStateModule } from '@siemens/element-ng/empty-state';
import { Filter, SiFilterBarComponent } from '@siemens/element-ng/filter-bar';
import { SiIconComponent } from '@siemens/element-ng/icon';
import {
  SiDetailsPaneBodyComponent,
  SiDetailsPaneComponent,
  SiDetailsPaneFooterComponent,
  SiDetailsPaneHeaderComponent,
  SiListDetailsComponent,
  SiListPaneBodyComponent,
  SiListPaneComponent,
  SiListPaneHeaderComponent
} from '@siemens/element-ng/list-details';
import {
  SiMenuBarDirective,
  SiMenuDirective,
  SiMenuHeaderDirective,
  SiMenuItemComponent
} from '@siemens/element-ng/menu';
import { BOOTSTRAP_BREAKPOINTS } from '@siemens/element-ng/resize-observer';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import { SiTabLinkComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';
import { LOG_EVENT, provideExampleRoutes } from '@siemens/live-preview';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { map, switchMap } from 'rxjs/operators';

import { CorporateEmployee, DataService, PageRequest } from '../datatable/data.service';

@Component({
  imports: [JsonPipe, AsyncPipe],
  template: `
    <div class="si-layout-fixed-height card-body overflow-auto pt-4">
      @let selectedEntity = this.selectedEntity | async;
      @if (selectedEntity) {
        {{ selectedEntity | json }}
      } @else {
        <span class="si-skeleton"></span>
      }
    </div>
  `
})
class OverviewComponent {
  private activatedRoute = inject(ActivatedRoute);
  private dataService = inject(DataService);

  selectedEntity = this.activatedRoute.paramMap.pipe(
    map(params => parseInt(params.get('id')!)),
    switchMap(id => this.dataService.getResultsById(id))
  );
}

@Component({ template: 'History' })
class HistoryComponent {}

@Component({
  imports: [
    RouterOutlet,
    SiDetailsPaneFooterComponent,
    SiDetailsPaneBodyComponent,
    SiDetailsPaneHeaderComponent,
    SiTabsetComponent,
    SiMenuBarDirective,
    SiMenuItemComponent,
    RouterLink,
    SiTabLinkComponent
  ],
  template: `
    <si-details-pane-header title="Title" [hideBackButton]="false">
      <si-tabset style="width: 0" class="flex-grow-1 flex-shrink-1">
        <a si-tab heading="Overview" routerLink="overview"></a>
        <a si-tab heading="History" routerLink="history"></a>
      </si-tabset>
      <si-menu-bar>
        <si-menu-item icon="element-edit" (triggered)="logEvent('editing')">Edit</si-menu-item>
        <si-menu-item
          icon="element-refresh"
          aria-label="Refresh"
          (triggered)="logEvent('refreshing')"
        />
      </si-menu-bar>
    </si-details-pane-header>
    <si-details-pane-body>
      <router-outlet />
    </si-details-pane-body>
    <si-details-pane-footer class="justify-content-end">
      <button type="button" class="btn btn-secondary" (click)="onDiscard()">Discard</button>
      <button type="button" class="btn btn-primary" (click)="onSave()">Save</button>
    </si-details-pane-footer>
  `,
  host: {
    'class': 'd-contents' // This is needed to have the correct layout.
  }
})
class DetailsComponent {
  logEvent = inject(LOG_EVENT);

  onDiscard(): void {
    this.logEvent('Discard');
  }

  onSave(): void {
    this.logEvent('Save');
  }
}

@Component({
  imports: [SiEmptyStateComponent],
  template: ` <si-empty-state heading="No entity selected" icon="element-cancel" /> `
})
class EmptyComponent {}

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    SiListDetailsComponent,
    SiListPaneComponent,
    SiListPaneHeaderComponent,
    SiListPaneBodyComponent,
    SiDetailsPaneComponent,
    SiIconComponent,
    SiMenuItemComponent,
    SiSearchBarComponent,
    SiFilterBarComponent,
    NgxDatatableModule,
    SiDatatableModule,
    SiEmptyStateModule,
    SiMenuDirective,
    SiMenuHeaderDirective,
    CdkMenuTrigger,
    RouterOutlet
  ],
  templateUrl: './si-list-details-router.html',
  providers: [
    DataService,
    provideExampleRoutes([
      { path: '', component: EmptyComponent, data: { SI_EMPTY_DETAILS: true } },
      // Workaround for the live-preview. Do not add this to your application.
      { path: 'EMPTY', component: EmptyComponent, data: { SI_EMPTY_DETAILS: true } },
      {
        path: ':id',
        component: DetailsComponent,
        children: [
          { path: '', component: OverviewComponent, pathMatch: 'full' },
          { path: 'overview', component: OverviewComponent },
          { path: 'history', component: HistoryComponent }
        ]
      }
    ])
  ],
  host: {
    class: 'si-layout-fixed-height'
  }
})
export class SampleComponent implements AfterViewInit {
  logEvent = inject(LOG_EVENT);

  private dataService = inject(DataService);

  /**
   * List details
   */
  expandBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum; // this is the default
  detailsActive = false; // this is the default
  disableResizing = false;

  /**
   * Filters
   */
  filters: Filter[] = [
    {
      filterName: 'date',
      title: 'Date',
      description: '27-12-2022',
      status: 'default'
    },
    {
      filterName: 'location',
      title: 'Location',
      description: 'Zug',
      status: 'default'
    }
  ];

  /**
   * List data (table)
   */
  cache: any = {};
  isLoading = 0;
  pageNumber = 0;
  pageSize = 50;
  rows: CorporateEmployee[] = [];
  selectedEntity: CorporateEmployee | undefined;
  selectedEntities: CorporateEmployee[] = [];
  tableConfig = SI_DATATABLE_CONFIG;
  totalElements = 0;
  searchTerm?: string;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngAfterViewInit(): void {
    this.router
      .navigate(['EMPTY'], { relativeTo: this.activatedRoute })
      .then(() => this.router.navigate(['.'], { relativeTo: this.activatedRoute }));
  }

  datatableOnSelect(items: CorporateEmployee[]): void {
    this.selectedEntities = [...items];
    this.selectedEntity = this.selectedEntities[0];
    this.detailsActive = true;
    this.logEvent(this.selectedEntities);
    this.router.navigate([this.selectedEntity!.id], { relativeTo: this.activatedRoute });
  }

  searchTermChanged(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.cache = {};
    this.totalElements = 0;
    this.rows = [];
    this.setPage({ offset: 0, pageSize: this.pageSize, filter: searchTerm });
  }

  setPage(pageRequest: PageRequest): void {
    pageRequest.filter = this.searchTerm;
    // current page number is determined by last call to setPage
    this.pageNumber = pageRequest.offset;

    // if page size changed, the primitive cache can't handle it, so clear
    if (this.pageSize !== pageRequest.pageSize) {
      this.cache = {};
    }
    this.pageSize = pageRequest.pageSize;

    // don't load same data twice
    if (this.cache[pageRequest.offset]) {
      return;
    }
    this.cache[pageRequest.offset] = true;

    // counter of pages loading
    this.isLoading++;

    this.dataService.getResults(pageRequest).subscribe(pagedData => {
      // create array to store data if missing
      if (!this.rows || this.totalElements !== pagedData.page.totalElements) {
        // length should be total count
        this.rows = new Array<CorporateEmployee>(pagedData.page.totalElements || 0);
      }
      // update total count
      this.totalElements = pagedData.page.totalElements;

      // calc starting index
      const start = pagedData.page.pageNumber * pagedData.page.size;

      // copy existing data
      const rows = [...this.rows];

      // insert new rows into new position
      rows.splice(start, pagedData.page.size, ...pagedData.data);

      // set rows to our new rows
      this.rows = rows;

      this.isLoading--;
    });
  }
}
