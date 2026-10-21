/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, signal } from '@angular/core';
import {
  elementChat,
  elementCopy,
  elementCut,
  elementDelete,
  elementExport,
  elementOptionsVertical,
  elementRestore
} from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiMenuModule, CdkContextMenuTrigger, CdkMenuTrigger, SiIconComponent],
  templateUrl: './si-menu.html'
})
export class SampleComponent {
  readonly view = signal('table');
  readonly showArchived = signal(true);

  readonly icons = addIcons({
    elementChat,
    elementCopy,
    elementCut,
    elementDelete,
    elementExport,
    elementOptionsVertical,
    elementRestore
  });

  toggleArchived(): void {
    this.showArchived.update(value => !value);
  }
}
