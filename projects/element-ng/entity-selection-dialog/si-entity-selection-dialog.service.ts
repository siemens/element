/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { ModalOptions, SiModalService } from '../si-modal/index';
import { PagedData, PageRequest } from './pagination';
import {
  Selectable,
  SelectionType,
  SiEntitySelectionDialogComponent
} from './si-entity-selection-dialog/si-entity-selection-dialog.component';

@Injectable()
export class SiEntitySelectionDialogService {
  constructor(
    private modalService: SiModalService,
    private injector: Injector
  ) {}

  showSelectEntityDialog(
    modalTitle: string,
    pagedData: Observable<PagedData<Selectable>>,
    pageRequests?: Subject<PageRequest | undefined>,
    selected?: Selectable,
    modalSave = 'SISUITE.COMMON.SAVE',
    modalCancel = 'SISUITE.COMMON.CANCEL'
  ): Observable<Selectable | undefined> {
    const selectedElements = selected ? [selected] : [];
    const config = {
      modalTitle,
      pagedData,
      pageRequests,
      selected: selectedElements,
      modalSave,
      modalCancel,
      selectionType: SelectionType.single
    };
    return this.doShowSelectEntitiesDialog(config).pipe(
      map((result: Selectable[] | undefined) => {
        if (result && result.length > 0) {
          return result[0];
        } else {
          return undefined;
        }
      })
    );
  }

  showSelectEntitiesDialog(
    modalTitle: string,
    pagedData: Observable<PagedData<Selectable>>,
    pageRequests?: Subject<PageRequest | undefined>,
    selected?: Selectable[],
    modalSave = 'SISUITE.COMMON.SAVE',
    modalCancel = 'SISUITE.COMMON.CANCEL',
    numberOfSelections = 1
  ): Observable<Selectable[] | undefined> {
    return this.doShowSelectEntitiesDialog({
      modalTitle,
      pagedData,
      pageRequests,
      selected,
      modalSave,
      modalCancel,
      selectionType: SelectionType.multi,
      numberOfSelections
    });
  }

  private doShowSelectEntitiesDialog(initialState: any): Observable<Selectable[] | undefined> {
    const config: ModalOptions = {
      initialState,
      ignoreBackdropClick: true,
      keyboard: false,
      animated: true,
      class: 'modal-dialog-centered',
      injector: this.injector
    };

    console.log('injecto', config);

    const modalRef = this.modalService.show(SiEntitySelectionDialogComponent, config);
    const modalResult = new Subject<Selectable[]>();
    (modalRef.content as SiEntitySelectionDialogComponent).closeModal
      .pipe(first())
      .subscribe((listModalResult: Selectable[] | undefined) => {
        modalRef.hide();
        modalResult.next(listModalResult);
        modalResult.complete();
      });
    return modalResult;
  }
}
