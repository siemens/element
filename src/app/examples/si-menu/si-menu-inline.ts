/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, signal } from '@angular/core';
import {
  elementChat,
  elementCopy,
  elementCut,
  elementDelete,
  elementExport,
  elementRestore
} from '@siemens/element-icons';
import { addIcons } from '@siemens/element-ng/icon';
import { SiMenuModule } from '@siemens/element-ng/menu';

@Component({
  selector: 'app-sample',
  imports: [SiMenuModule, CdkMenuTrigger],
  templateUrl: './si-menu-inline.html',
  host: {
    class: 'p-5'
  }
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
    elementRestore
  });

  toggleArchived(): void {
    this.showArchived.update(value => !value);
  }
}
