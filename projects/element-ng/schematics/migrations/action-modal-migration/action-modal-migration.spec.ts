/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp, readLines } from '../../utils/index.js';

const collectionPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../collection.json'
);

describe('action modal migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  const name = 'migrate-v47-to-v48';

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const checkTemplateMigration = async (
    original: string[],
    expected: string[],
    sourceFile = `/projects/app/src/components/test/test.component.ts`
  ): Promise<void> => {
    addTestFiles(appTree, {
      [sourceFile]: original.join('\n'),
      '/package.json': `{
         "dependencies": {
          "@simpl/element-ng": "47.0.3",
          "@simpl/maps-ng": "47.0.3",
          "@simpl/dashboards-ng": "47.0.3",
          "@simpl/element-translate-ng": "47.0.3",
          "some-other-dep": "1.2.3"
        }
        }`
    });

    const tree = await runner.runSchematic('ng-add', { path: 'projects/app/src' }, appTree);
    const actual = readLines(tree, sourceFile);
    expect(actual).toEqual(expected);
  };

  it('should migrate `showAlertDialog` method and its type usage', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { AlertDialogResult, SiActionDialogService } from '@simpl/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showAlertDialog('Message', 'Heading', 'Confirmation button text').subscribe(`,
      `(value: AlertDialogResult) => { if (value === AlertDialogResult.Confirm) { return 'yes'; } return 'no'; });`,
      `} }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { AlertDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showActionDialog({ type: 'alert', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text' }).subscribe(`,
      `(value: AlertDialogResult) => { if (value === 'confirm') { return 'yes'; } return 'no'; });`,
      `} }`
    ];

    await checkTemplateMigration(original, expected);
  });

  it('should migrate `showConfirmationDialog` method and its type usage', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { ConfirmationDialogResult, SiActionDialogService } from '@simpl/element-ng';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showConfirmationDialog('Message', 'Heading', 'Confirmation button text','Decline button text').subscribe(`,
      `(value: ConfirmationDialogResult) => { if (value === ConfirmationDialogResult.Confirm) { return 'Confirm'; }`,
      `else if (value === ConfirmationDialogResult.Decline) { return 'Decline'; } });`,
      `} }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { ConfirmationDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showActionDialog({ type: 'confirmation', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text', declineBtnName: 'Decline button text' }).subscribe(`,
      `(value: ConfirmationDialogResult) => { if (value === 'confirm') { return 'Confirm'; }`,
      `else if (value === 'decline') { return 'Decline'; } });`,
      `} }`
    ];

    await checkTemplateMigration(original, expected);
  });

  it('should migrate `showEditDiscardDialog` method and its type usage', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { EditDiscardDialogResult, SiActionDialogService } from '@simpl/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showEditDiscardDialog(true, 'Message', 'Heading', 'Save button text','Discard button text').subscribe(`,
      `(value: EditDiscardDialogResult) => { if (value === EditDiscardDialogResult.Save) { return 'Save'; }`,
      `else if (value === EditDiscardDialogResult.Discard) { return 'Discard'; } `,
      `else if (value === EditDiscardDialogResult.Cancel) { return 'Cancel'; } });`,
      `} }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { EditDiscardDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showActionDialog({ type: 'edit-discard', disableSave: true, message: 'Message', heading: 'Heading', saveBtnName: 'Save button text', discardBtnName: 'Discard button text' }).subscribe(`,
      `(value: EditDiscardDialogResult) => { if (value === 'save') { return 'Save'; }`,
      `else if (value === 'discard') { return 'Discard'; } `,
      `else if (value === 'cancel') { return 'Cancel'; } });`,
      `} }`
    ];

    await checkTemplateMigration(original, expected);
  });

  it('should migrate `showDeleteConfirmationDialog` method and its type usage', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { DeleteConfirmationDialogResult, SiActionDialogService } from '@simpl/element-ng';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showDeleteConfirmationDialog('Message', 'Heading', 'Delete button text','Cancel button text').subscribe(`,
      `(value: DeleteConfirmationDialogResult) => { if (value === DeleteConfirmationDialogResult.Delete) { return 'Delete'; }`,
      `else if (value === DeleteConfirmationDialogResult.Cancel) { return 'Cancel'; } });`,
      `} }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { DeleteConfirmationDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showActionDialog({ type: 'delete-confirm', message: 'Message', heading: 'Heading', deleteBtnName: 'Delete button text', cancelBtnName: 'Cancel button text' }).subscribe(`,
      `(value: DeleteConfirmationDialogResult) => { if (value === 'delete') { return 'Delete'; }`,
      `else if (value === 'cancel') { return 'Cancel'; } });`,
      `} }`
    ];

    await checkTemplateMigration(original, expected);
  });

  it('should migrate multiple instances of action modal methods', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { SiActionDialogService } from '@simpl/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `ms = inject(SiActionDialogService);`,
      `readonly type = input<string | null>(null);`,
      `showDialog() {`,
      `  switch (this.type()) {`,
      `    case 'alert':`,
      `      this.ms.showAlertDialog('Message', 'Heading', 'Confirmation button text').subscribe();`,
      `      break;`,
      `    case 'confirm':`,
      `      this.ms.showConfirmationDialog('Message', 'Heading', 'Confirmation button text','Decline button text').subscribe();`,
      `      break;`,
      `    case 'edit':`,
      `      this.ms.showEditDiscardDialog(true, 'Message', 'Heading', 'Save button text','Discard button text').subscribe();`,
      `      break;`,
      `    case 'delete':`,
      `      this.ms.showDeleteConfirmationDialog('Message', 'Heading', 'Delete button text','Cancel button text').subscribe();`,
      `      break;`,
      `    default:`,
      `      this.ms.showAlertDialog('Message', 'Heading', 'Confirmation button text').subscribe();`,
      `  } } }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `ms = inject(SiActionDialogService);`,
      `readonly type = input<string | null>(null);`,
      `showDialog() {`,
      `  switch (this.type()) {`,
      `    case 'alert':`,
      `      this.ms.showActionDialog({ type: 'alert', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text' }).subscribe();`,
      `      break;`,
      `    case 'confirm':`,
      `      this.ms.showActionDialog({ type: 'confirmation', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text', declineBtnName: 'Decline button text' }).subscribe();`,
      `      break;`,
      `    case 'edit':`,
      `      this.ms.showActionDialog({ type: 'edit-discard', disableSave: true, message: 'Message', heading: 'Heading', saveBtnName: 'Save button text', discardBtnName: 'Discard button text' }).subscribe();`,
      `      break;`,
      `    case 'delete':`,
      `      this.ms.showActionDialog({ type: 'delete-confirm', message: 'Message', heading: 'Heading', deleteBtnName: 'Delete button text', cancelBtnName: 'Cancel button text' }).subscribe();`,
      `      break;`,
      `    default:`,
      `      this.ms.showActionDialog({ type: 'alert', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text' }).subscribe();`,
      `  } } }`
    ];

    await checkTemplateMigration(original, expected);
  });

  it('should migrate action modal methods if its imported from @siemens/element-ng/action-modal', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { AlertDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showAlertDialog('Message', 'Heading', 'Confirmation button text').subscribe(`,
      `(value: AlertDialogResult) => { if (value === AlertDialogResult.Confirm) { return 'yes'; } return 'no'; });`,
      `} }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { AlertDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showActionDialog({ type: 'alert', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text' }).subscribe(`,
      `(value: AlertDialogResult) => { if (value === 'confirm') { return 'yes'; } return 'no'; });`,
      `} }`
    ];

    await checkTemplateMigration(original, expected);
  });

  it('should migrate action modal methods even if we do not have dialog method subscribed', async () => {
    const original = [
      `import { Component, inject } from '@angular/core';`,
      `import { AlertDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showAlertDialog('Message', 'Heading', 'Confirmation button text') } }`
    ];

    const expected = [
      `import { Component, inject } from '@angular/core';`,
      `import { AlertDialogResult, SiActionDialogService } from '@siemens/element-ng/action-modal';`,
      `@Component({ selector: 'app-test-action-modal' })`,
      `export class TestActionModalComponent {`,
      `showDialog() { inject(SiActionDialogService).showActionDialog({ type: 'alert', message: 'Message', heading: 'Heading', confirmBtnName: 'Confirmation button text' }) } }`
    ];

    await checkTemplateMigration(original, expected);
  });
});
