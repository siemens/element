/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActionDialog, SiActionDialogService } from '@siemens/element-ng/action-modal';
import {
  ColumnSelectionDialogResult,
  SiColumnSelectionDialogService
} from '@siemens/element-ng/column-selection-dialog';
import { LOG_EVENT } from '@siemens/live-preview';
import { delay, Observable, of, Subscription } from 'rxjs';

import { cloneColumnData, headerData } from './column-dialog.data';

@Component({
  selector: 'app-sample',
  templateUrl: './si-modal-dialogs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  private logEvent = inject(LOG_EVENT);
  private siModal = inject(SiActionDialogService);
  private siColumnModal = inject(SiColumnSelectionDialogService);
  private translate = inject(TranslateService);
  protected columns = cloneColumnData(headerData);

  ngOnInit(): void {
    // note: this is normally in translation file, this is for demo proposes only
    this.translate.set('DEMO.SAVE_CONFIRM_HEAD', 'Unsaved data');
    this.translate.set('DEMO.SAVE_CONFIRM_MSG', 'Save {{what}}?');
    this.translate.set('DEMO.DISCARD_CONFIRM_HEAD', 'Unsaved data');
    this.translate.set('DEMO.DISCARD_CONFIRM_MSG', 'Discard changes of {{what}}?');
    this.translate.set('DEMO.DELETE_CONFIRM_HEAD', 'Delete scheduler');
    this.translate.set(
      'DEMO.DELETE_CONFIRM_MSG',
      'Delete "{{what}}"?\n\nThis action cannot be undone'
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private unsubscribe(): void {
    this.subscription?.unsubscribe();
  }

  showColumnSelection(): void {
    this.showColumnSelectionDialog(true);
  }

  showColumnSelectionNoVisibilityDialog(): void {
    this.showColumnSelectionDialog(false);
  }

  showActionDialog(dialog: ActionDialog): void {
    this.unsubscribe();
    this.subscription = this.siModal
      .showActionDialog(dialog)
      .subscribe(result => this.logEvent('Result:', result));
  }

  fakeLoading = <T>(type: T): Observable<T> => {
    this.logEvent('delayed:', type);
    return of(type).pipe(delay(3000));
  };

  private showColumnSelectionDialog(columnVisibility: boolean): void {
    this.unsubscribe();
    this.subscription = this.siColumnModal
      .showColumnSelectionDialog({
        heading: 'Customize columns',
        bodyTitle: 'Customize view by selecting or ordering',
        columns: this.columns,
        restoreEnabled: true,
        columnVisibilityConfigurable: columnVisibility
      })
      .subscribe((result: ColumnSelectionDialogResult) => {
        switch (result.type) {
          case 'ok':
            this.logEvent('Column selection submitted');
            break;
          case 'cancel':
            this.logEvent('Column selection canceled!');
            break;
          case 'instant':
            this.logEvent('Instantaneous selection done!');
            break;
          case 'restoreDefault':
            {
              this.logEvent('Column selection restored to default!');
              const restoredColumns = cloneColumnData(headerData);
              // redo IDs to show they're independent of previous state
              restoredColumns.forEach((x, i) => (x.id = 'No' + (i + 3)));
              result.updateColumns?.(restoredColumns);
            }
            break;
        }
      });
  }
}
