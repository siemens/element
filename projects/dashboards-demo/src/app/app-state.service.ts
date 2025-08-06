/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { SiActionDialogService } from '@spike-rabbit/element-ng/action-modal';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  editable$ = new BehaviorSubject<boolean>(false);
  dialogService = inject(SiActionDialogService);

  canDeactivate = (): true | Observable<boolean> => {
    if (!this.editable$.value) {
      return true;
    } else {
      return this.dialogService.showActionDialog({ type: 'edit-discard', disableSave: true }).pipe(
        switchMap(result => {
          if (result === 'discard') {
            this.editable$.next(false);
            return of(true);
          } else {
            return of(false);
          }
        })
      );
    }
  };
}
