/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { SiCardComponent } from '@siemens/element-ng/card';

/*
Sample component to test custom type registration in SiFormlyModule
*/
@Component({
  imports: [SiCardComponent],
  selector: 'app-custom-type',
  template: `
    <div class="col mb-6">
      <si-card [heading]="props.heading">
        <p class="card-body card-text" body>
          <ng-template #fieldComponent />
        </p>
      </si-card>
    </div>
  `
})
export class CustomWrapperComponent extends FieldWrapper {}
