/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  viewChild
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SI_DATATABLE_CONFIG, SiDatatableModule } from '@siemens/element-ng/datatable';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { Link } from '@siemens/element-ng/link';
import { SiPaginationComponent } from '@siemens/element-ng/pagination';
import { LOG_EVENT } from '@siemens/live-preview';
import { DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';

import { CorporateEmployee, DataService, PagedData, PageRequest } from './data.service';

interface LoadErrorAction extends Link {
  title: string;
  action: () => void;
}

interface LoadError {
  icon: string;
  heading: string;
  message: string;
  /** Only offered if it can resolve the problem. */
  action?: LoadErrorAction;
}

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    NgxDatatableModule,
    SiDatatableModule,
    SiEmptyStateComponent,
    SiFormItemComponent,
    SiInlineNotificationComponent,
    SiPaginationComponent
  ],
  templateUrl: './datatable-error-handling.html',
  providers: [DataService]
})
export class SampleComponent {
  protected readonly tableConfig = SI_DATATABLE_CONFIG;
  protected readonly pageSize = 5;

  private readonly logEvent = inject(LOG_EVENT);
  private readonly dataService = inject(DataService);
  private readonly table = viewChild.required<DatatableComponent, ElementRef<HTMLElement>>(
    DatatableComponent,
    { read: ElementRef }
  );

  protected readonly pageRequest = signal<PageRequest>({ offset: 0, pageSize: this.pageSize });
  protected readonly dataResource = rxResource({
    params: () => this.pageRequest(),
    stream: ({ params }) => this.dataService.getResults(params)
  });

  // `value()` throws while the resource is in error state, so it must be guarded by `hasValue()`.
  // Keeping the last loaded page preserves the pagination when a request fails.
  private readonly loadedData = linkedSignal<
    PagedData<CorporateEmployee> | undefined,
    PagedData<CorporateEmployee> | undefined
  >({
    source: () => (this.dataResource.hasValue() ? this.dataResource.value() : undefined),
    computation: (data, previous) => data ?? previous?.value
  });
  // Only show rows of the requested page. They stay visible if reloading the page fails.
  protected readonly rows = computed(() => {
    const data = this.loadedData();
    return data?.page.pageNumber === this.pageRequest().offset ? data.data : [];
  });
  protected readonly totalElements = computed(() => this.loadedData()?.page.totalElements ?? 0);

  protected readonly loadError = computed(() =>
    this.dataResource.status() === 'error' ? this.toLoadError(this.dataResource.error()) : undefined
  );

  // Demo only: the HTTP status the simulated server responds with.
  protected readonly responseStatus = this.dataService.responseStatus;
  protected readonly responseStatuses = [
    { status: HttpStatusCode.Ok, label: '200 OK' },
    { status: 0, label: 'Network error' },
    { status: HttpStatusCode.Unauthorized, label: '401 Unauthorized' },
    { status: HttpStatusCode.Forbidden, label: '403 Forbidden' },
    { status: HttpStatusCode.InternalServerError, label: '500 Internal Server Error' },
    { status: HttpStatusCode.GatewayTimeout, label: '504 Gateway Timeout' }
  ];

  constructor() {
    this.responseStatus.set(HttpStatusCode.InternalServerError);
  }

  protected setPage(pageRequest: PageRequest): void {
    this.pageRequest.set({ offset: pageRequest.offset, pageSize: pageRequest.pageSize });
  }

  protected retry(): void {
    // The action is removed while loading, so move the focus to the table to not lose it.
    this.table().nativeElement.focus();
    this.dataResource.reload();
  }

  protected simulateResponse(status: number): void {
    this.responseStatus.set(status);
    this.dataResource.reload();
  }

  private toLoadError(error: unknown): LoadError {
    const retry: LoadErrorAction = { title: 'Retry', action: () => this.retry() };
    const status = error instanceof HttpErrorResponse ? error.status : undefined;
    switch (status) {
      case 0:
        return {
          icon: 'element-connection-lost',
          heading: 'No connection to server',
          message: 'Check connection and try again.',
          action: retry
        };
      case HttpStatusCode.Unauthorized:
        return {
          icon: 'element-lock',
          heading: 'Session expired',
          message: 'Log in again to view users.',
          action: { title: 'Log in', action: () => this.logEvent('Log in clicked') }
        };
      case HttpStatusCode.Forbidden:
        return {
          icon: 'element-lock',
          heading: 'Insufficient access rights',
          message: 'No access rights to view users. Contact administrator.'
        };
      case HttpStatusCode.GatewayTimeout:
        return {
          icon: 'element-timer',
          heading: 'Server not responding',
          message: 'The server did not respond in time. Try again later.',
          action: retry
        };
      default:
        return {
          icon: 'element-warning',
          heading: 'Failed to load users',
          message: 'The server encountered an unexpected problem. Try again later.',
          action: retry
        };
    }
  }
}
