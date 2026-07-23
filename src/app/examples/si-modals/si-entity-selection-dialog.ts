/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  PagedData,
  PageRequest,
  Selectable,
  SiEntitySelectionDialogService
} from '@simpl/element-ng';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-sample',
  templateUrl: './si-entity-selection-dialog.html'
})
export class SampleComponent {
  // the real function is injected by the previewer
  logEvent!: (p: any) => void;

  constructor(private siModal: SiEntitySelectionDialogService) {}

  showOnePageSelection() {
    const data: Selectable[] = [];
    for (let i = 0; i < 101; i++) {
      data.push({ id: '' + i, title: 'Entity ' + i });
    }
    const pagedData: PagedData<Selectable> = {
      data,
      page: { pageNumber: 1, size: data.length, totalElements: data.length, totalPages: 1 }
    };
    const pagedData$: Observable<PagedData<Selectable>> = of(pagedData);

    this.siModal
      .showSelectEntityDialog('Select Entity Title', pagedData$)
      .subscribe(result => this.logEvent('Selected entity: ' + result?.title));
  }

  showMultiPageSelection(numberOfSelections = 1, preselected = true) {
    const totalElements = 1000;
    let pageSize = 10;
    let search = '';
    const serverData: Selectable[] = [];
    for (let i = 0; i < totalElements; i++) {
      serverData.push({ id: '' + i, title: 'Entity ' + i });
    }

    const loadData = (searchTearm: string) => {
      if (searchTearm) {
        return serverData.filter(selectable =>
          selectable.title.toLowerCase().includes(searchTearm.toLowerCase())
        );
      } else {
        return serverData;
      }
    };

    let filteredServerData = [...serverData];

    let clientData: Selectable[] = new Array<Selectable>(totalElements);
    clientData.splice(0, pageSize, ...serverData.slice(0, pageSize));
    const startPage: PagedData<Selectable> = {
      data: clientData,
      page: {
        pageNumber: 0,
        size: pageSize,
        totalElements: serverData.length,
        totalPages: totalElements / pageSize
      }
    };

    const pagedData$ = new BehaviorSubject<PagedData<Selectable>>(startPage);
    const pageRequests$ = new BehaviorSubject<PageRequest | undefined>(undefined);

    const subscription = pageRequests$.subscribe(pageRequest => {
      if (pageRequest) {
        // reset cache if criteria change
        if (search !== pageRequest.search) {
          search = pageRequest.search;
          pageSize = pageRequest!.pageSize;
          filteredServerData = loadData(search);
          clientData = new Array<Selectable>(totalElements);
        }

        const startIndex = pageRequest!.pageNumber * pageRequest!.pageSize;
        clientData.splice(
          startIndex,
          pageSize,
          ...filteredServerData.slice(startIndex, startIndex + pageSize)
        );

        const page: PagedData<Selectable> = {
          data: [...clientData],
          page: {
            pageNumber: pageRequest!.pageNumber,
            size: pageSize,
            totalElements: filteredServerData.length,
            totalPages: totalElements / pageSize
          }
        };
        pagedData$.next(page);
      }
    });

    const selected = preselected
      ? [serverData[1], serverData[3], serverData[11], serverData[21]]
      : undefined;
    this.siModal
      .showSelectEntitiesDialog(
        'Paged Multi Selection',
        pagedData$,
        pageRequests$,
        selected,
        'Save',
        'Cancel',
        numberOfSelections
      )
      .subscribe(result => {
        if (result) {
          this.logEvent(
            result?.length + ' selected entities with ids: ' + result.map(item => item.id)
          );
        } else {
          this.logEvent('Selection canceled');
        }
        subscription.unsubscribe();
      });
  }
}
