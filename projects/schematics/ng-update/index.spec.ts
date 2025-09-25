/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { addTestFiles, createTestApp } from '../utils/testing';

const migrationPath = path.join(
  process.cwd(),
  'dist/@siemens/element-ng/schematics/migration.json'
);

describe('ng-update migration version 48.0.0', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  const name = 'migrations';

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, migrationPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  test.only('should migrate to v48', async () => {
    addTestFiles(appTree, {
      '/projects/app/src/components/test/test.component.ts': `import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogResult, SiActionDialogService } from '@simpl/element-ng/action-modal';

import { BaseElementComponent } from '../base-element';

@Component({
  selector: 'app-modal-message',
  template:'',
  host: {
    class: 'd-none'
  }
})
export class ModalMessageComponent extends BaseElementComponent implements OnInit {
  readonly message = input.required<string>();
  readonly buttons = input.required<Record<string, string>>();
  readonly type = input<string | null>(null);
  readonly heading = input<string | undefined>(undefined);
  readonly icon = input<string | null>(null);
  readonly windowClosingButton = input<string | null>(null);

  readonly modalClosed = output<string>();

  private readonly modalService = inject(SiActionDialogService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.openModal();
  }

  openModal(): void {
    switch (this.type()) {
       case 'warning':
        this.modalService
          .showAlertDialog(
            this.message(),
            this.heading(),
            this.buttons()[this.windowClosingButton()!],
            undefined,
            this.icon() ?? 'element-validation-warning'
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.modalClosed.emit(this.actionDialogResultToString());
          });
        break;
      case 'question':
        this.modalService
          .showConfirmationDialog(
            this.message(),
            this.heading(),
            this.buttons().yes ?? undefined,
            this.buttons()[this.windowClosingButton()!],
            undefined,
            this.icon() ?? 'element-validation-question-mark'
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(closingValue => {
            this.modalClosed.emit(this.confirmDialogResultToString(closingValue));
          });
        break;
      default:
        this.modalService
          .showAlertDialog(
            this.message(),
            this.heading(),
            this.buttons()[this.windowClosingButton()!],
            undefined,
            this.icon() ?? 'element-validation-warning'
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.modalClosed.emit(this.actionDialogResultToString());
          });
    }
  }

  actionDialogResultToString(): string {
    return this.windowClosingButton() ?? 'close';
  }

  confirmDialogResultToString(value: ConfirmationDialogResult): string {
    if (value === ConfirmationDialogResult.Confirm) {
      return 'yes';
    }
    return this.windowClosingButton() ?? 'no';
  }
}
`
    });
    const tree = await runner.runSchematic('migration-v48', { path: 'projects/app/src' }, appTree);
    console.log(tree.readContent('/projects/app/src/components/test/test.component.ts'));
    expect(tree).toBeDefined();
  });
});
