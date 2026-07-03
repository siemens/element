/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  min,
  minLength,
  pattern,
  required
} from '@angular/forms/signals';
import { provideSiFormFieldConfig, SiFormFieldComponent } from '@siemens/element-ng/form';

export interface TravelRequest {
  name: string;
  description: string;
  birthday: string;
  arrival: string;
  departure: string;
  serviceClass: string;
  fellowPassengers: number;
  termsAccepted: boolean;
  privacyDeclined: boolean;
}

const emptyRequest: TravelRequest = {
  name: '',
  description: '',
  birthday: '',
  arrival: '',
  departure: '',
  serviceClass: 'first',
  fellowPassengers: 0,
  termsAccepted: false,
  privacyDeclined: false
};

@Component({
  selector: 'app-sample',
  imports: [JsonPipe, FormField, FormRoot, SiFormFieldComponent],
  templateUrl: './si-signal-form.html',
  providers: [provideSiFormFieldConfig()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly model = signal<TravelRequest>({ ...emptyRequest });

  protected readonly submitted = signal<TravelRequest | undefined>(undefined);

  protected readonly form = form(
    this.model,
    path => {
      required(path.name, { message: 'Name required' });
      minLength(path.name, 3, { message: 'Minimum 3 characters' });
      pattern(path.name, /^[A-Z].*/, {
        message: 'Name must start with an uppercase letter'
      });
      required(path.birthday, { message: 'Day of birth required' });
      min(path.fellowPassengers, 2, { message: 'Minimum 2' });
      required(path.termsAccepted, {
        message: 'Accept terms before joining'
      });
    },
    {
      submission: {
        action: async () => {
          this.submitted.set(this.model());
          return undefined;
        }
      }
    }
  );

  protected cancel(): void {
    this.model.set({ ...emptyRequest });
    this.submitted.set(undefined);
  }
}
