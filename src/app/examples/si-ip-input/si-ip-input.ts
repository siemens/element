/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiIp4InputDirective, SiIp6InputDirective } from '@siemens/element-ng/ip-input';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SiIp4InputDirective,
    SiIp6InputDirective,
    SiFormItemComponent
  ],
  templateUrl: './si-ip-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  protected readonly logEvent = inject(LOG_EVENT);
  protected readonly configForm = new FormGroup({
    cidr: new FormControl(false, { nonNullable: true })
  });
  protected readonly ipV4Placeholder = signal('192.168.0.1');
  protected ipV4address = '';
  protected ipV6address = '';

  constructor() {
    this.configForm.valueChanges.subscribe(value => {
      this.ipV4Placeholder.set(value.cidr ? '192.168.0.1/24' : '192.168.0.1');
    });
  }
  onIpChange(field: string, value: string): void {
    this.logEvent(field, value);
  }
}
