/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// The following is based on the demo code of ngx-datatable (https://github.com/swimlane/ngx-datatable)
// which is distributed under MIT license.

/**
 * The page request describes the data request. The
 * attribute names are taken from the ngx-datatable
 * output events to streamline eventing from ngx-datatable
 * to controller to data service.
 */
export interface PageRequest {
  // The requested page number
  offset: number;
  // The requested page size
  pageSize: number;
  // An optional filter parameter
  filter?: string;
  // An optional sort parameter
  sort?: {
    prop: string;
    dir: 'asc' | 'desc';
  };
}

export class Page {
  // The number of elements in the page
  size = 0;
  // The total number of elements
  totalElements = 0;
  // The total number of pages
  totalPages = 0;
  // The current page number
  pageNumber = 0;
}

/**
 * The data service returns paged data objects, which
 * contains the data and a page object that describes
 * the page the the total number of elements.
 */
export class PagedData<T> {
  data = new Array<T>();
  page = new Page();
}

export class CorporateEmployee {
  id: number;
  name: string;
  role: string;
  company: string;
  age?: number;

  constructor(id: number, name: string, role: string, company: string, age?: number) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.company = company;
    this.age = age;
  }
}

/**
 * A service used to mock a paged data result from a server
 */
@Injectable()
export class DataService {
  totalElements = 10000;
  private elements: CorporateEmployee[] = [];

  constructor() {
    for (let index = 0; index < this.totalElements; index++) {
      this.elements.push(this.getData(index));
    }
  }

  public getResults(page: PageRequest): Observable<PagedData<CorporateEmployee>> {
    return of(this.getPagedData(page)).pipe(delay(this.optionalDelay(3000 * Math.random())));
  }

  public getEmptyResults(page: PageRequest): Observable<PagedData<CorporateEmployee>> {
    const pagedData = new PagedData<CorporateEmployee>();
    return of(pagedData).pipe(delay(this.optionalDelay(3000 * Math.random())));
  }

  private optionalDelay(ms: number): number {
    return navigator.webdriver ? 0 : ms;
  }

  private getPagedData(pageRequest: PageRequest): PagedData<CorporateEmployee> {
    let filteredElements;
    if (pageRequest.filter) {
      filteredElements = this.elements.filter(
        e => e.name.toLowerCase().includes(pageRequest.filter!) || !pageRequest.filter
      );
    } else {
      filteredElements = this.elements;
    }

    if (pageRequest.sort) {
      const sort = pageRequest.sort;
      this.elements.sort(
        (a: any, b: any) =>
          a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1)
      );
    }

    const pagedData = new PagedData<CorporateEmployee>();
    const page = new Page();

    page.pageNumber = pageRequest.offset;
    page.size = pageRequest.pageSize;
    page.totalElements = filteredElements.length;
    page.totalPages = page.totalElements / page.size;
    const start = page.pageNumber * page.size;
    const end = Math.min(start + page.size, page.totalElements);
    pagedData.data = filteredElements.slice(start, end);
    pagedData.page = page;
    return pagedData;
  }

  private getData(index: number): CorporateEmployee {
    return new CorporateEmployee(
      index,
      'Max Meier ' + index,
      this.getRole(index),
      this.getCompany(index),
      this.getAge(index)
    );
  }

  private getRole(index: number): string {
    if (index % 2 === 0) {
      return 'Engineer';
    } else {
      return 'Installer';
    }
  }

  private getCompany(index: number): string {
    return 'Great Company ' + (index % 5);
  }

  private getAge(index: number): number {
    return index % 11;
  }
}
