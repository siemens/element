/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  Component,
  DestroyRef,
  HostListener,
  inject,
  Input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  WidgetConfig,
  WidgetConfigStatus,
  WidgetInstanceEditorWizard,
  WidgetInstanceEditorWizardState
} from '@siemens/dashboards-ng';
import { SiCalendarButtonComponent, SiDatepickerDirective } from '@siemens/element-ng/datepicker';
import { SiFormModule } from '@siemens/element-ng/form';

@Component({
  selector: 'app-contact-widget-editor',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SiFormModule,
    SiDatepickerDirective,
    SiCalendarButtonComponent
  ],
  templateUrl: './contact-widget-editor.component.html'
})
export class ContactWidgetEditorComponent implements WidgetInstanceEditorWizard, AfterViewInit {
  @Input({
    required: true
  })
  config!: WidgetConfig;
  readonly statusChanges = output<Partial<WidgetConfigStatus>>();

  get state(): WidgetInstanceEditorWizardState {
    return this.stateInternal();
  }

  readonly stateChange = output<WidgetInstanceEditorWizardState>();

  readonly stateInternal = signal<WidgetInstanceEditorWizardState>({
    hasNext: true,
    hasPrevious: false,
    disableNext: true
  });

  protected readonly currentPage = signal<number>(0);
  protected pageCount = 2;

  personal = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    birthday: new FormControl<Date | string>('')
  });
  company = new FormGroup({
    jobTitle: new FormControl<string>('', Validators.required),
    company: new FormControl<string>(''),
    email: new FormControl<string>(''),
    phone: new FormControl<string>('')
  });
  form = new FormGroup({ personal: this.personal, company: this.company });

  private readonly destroyRef = inject(DestroyRef);
  private modified = false;

  ngAfterViewInit(): void {
    // must emit initial state
    this.stateChange.emit(this.state);

    const date: Date = new Date(this.config?.payload?.birthday);
    this.personal.patchValue({
      firstName: this.config?.payload?.firstName ?? '',
      lastName: this.config?.payload?.lastName ?? '',
      birthday: !isNaN(date.getTime()) ? date : ''
    });
    this.company.patchValue({
      jobTitle: this.config?.payload?.jobTitle ?? '',
      company: this.config?.payload?.company ?? '',
      email: this.config?.payload?.email ?? '',
      phone: this.config?.payload?.phone ?? ''
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const config = this.config;

      Object.assign(config.payload, value.personal);
      Object.assign(config.payload, value.company);
      this.config = { ...config };
      if (!this.modified) {
        this.modified = true;
        this.statusChanges.emit({ modified: this.modified });
      }
    });

    this.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.statusChanges.emit({ invalid: value === 'INVALID' });
    });

    this.personal.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      const disableNext = value === 'INVALID';
      if (this.stateInternal().disableNext !== disableNext) {
        this.stateInternal.update(x => ({ ...x, disableNext }));
        this.stateChange.emit(this.stateInternal());
      }
    });

    this.statusChanges.emit({ invalid: !this.form.valid });

    const disableNext = this.personal.invalid;
    if (this.stateInternal().disableNext !== disableNext) {
      this.stateInternal.update(x => ({ ...x, disableNext }));
      this.stateChange.emit(this.stateInternal());
    }
  }

  @HostListener('next')
  next(): void {
    const currentPage = this.currentPage();
    if (currentPage < this.pageCount) {
      const nextPage = currentPage + 1;
      this.currentPage.set(nextPage);
      this.stateInternal.set({
        hasNext: nextPage < this.pageCount - 1,
        hasPrevious: nextPage > 0
      });
      this.stateChange.emit(this.stateInternal());
    }
  }

  @HostListener('previous')
  previous(): void {
    const currentPage = this.currentPage();
    if (currentPage > 0) {
      const nextPage = currentPage - 1;
      this.currentPage.set(nextPage);
      this.stateInternal.set({
        hasNext: nextPage < this.pageCount - 1,
        hasPrevious: nextPage > 0
      });
    }
    this.stateChange.emit(this.stateInternal());
  }
}
