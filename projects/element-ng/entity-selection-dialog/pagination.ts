/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface PageRequest {
  // The requested page number
  pageNumber: number;
  // The requested page size
  pageSize: number;
  // The search to be performed on the server
  search: string;
  // The filter to be applied on the page request
  filter?: string;
}

export interface Page {
  // The number of elements in the page
  size: number;
  // The total number of elements
  totalElements: number;
  // The total number of pages
  totalPages: number;
  // The current page number
  pageNumber: number;
}

export interface PagedData<T> {
  data: T[];
  page: Page;
}
