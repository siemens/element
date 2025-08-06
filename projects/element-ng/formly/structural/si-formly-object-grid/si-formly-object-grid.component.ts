/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { SiFormContainerComponent } from '@spike-rabbit/element-ng/form';

import { GridColumnConfig, GridRow, ToGridRowConfig } from './si-formly-object-grid.model';

@Component({
  selector: 'si-formly-object-grid',
  imports: [FormlyModule, SiFormContainerComponent],
  templateUrl: './si-formly-object-grid.component.html'
})
export class SiFormlyObjectGridComponent extends FieldType implements OnInit {
  protected rows: GridRow[] = [];

  /**
   * Template option to suppress displaying error messages that relate
   * to the formControl of this grid (see formControl.errors).
   */
  private suppressFormErrorDisplay = false;

  protected get containerClass(): string | string[] {
    if (Array.isArray(this.props.containerClass) && this.props.containerClass.length > 0) {
      return this.props.containerClass;
    }
    return typeof this.props.containerClass === 'string' ? this.props.containerClass : 'container';
  }

  ngOnInit(): void {
    this.setRows();
    this.suppressFormErrorDisplay = this.props.suppressFormErrorDisplay === true;
  }

  protected get displayErrorMessages(): boolean {
    return this.showError && !!this.formControl.errors && !this.suppressFormErrorDisplay;
  }

  private setRows(): void {
    this.rows.length = 0;

    if (!Array.isArray(this.props.gridConfig) || this.props.gridConfig.length === 0) {
      this.rows = [
        {
          classes: ['row'],
          columns: [{ classes: ['col-sm'], fields: this.field.fieldGroup }]
        }
      ];
    }

    const gridConfig = this.props.gridConfig as ToGridRowConfig[];
    const fieldGroup = [...(this.field.fieldGroup ?? [])];
    gridConfig.forEach(rowConfig => {
      const columns: GridColumnConfig[] = [];

      rowConfig.columns.forEach(config => {
        const fields = fieldGroup.splice(
          0,
          config.fieldCount < 0 ? fieldGroup.length : config.fieldCount
        );
        const colClasses = config.classes ?? [];
        if (colClasses.length === 0) {
          colClasses.push('col');
        }
        columns.push({ fields, classes: colClasses });
      });
      const rowClasses = rowConfig.classes ?? [];
      if (rowClasses.length === 0) {
        rowClasses.push('row');
      }

      this.rows.push({ classes: rowClasses, columns });
    });
  }
}
