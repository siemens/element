/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { SiValueWidgetBodyComponent } from '@siemens/element-ng/dashboard';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { Observable } from 'rxjs';

import { DataService } from '../../widgets/charts/data.service';

@Component({
  selector: 'app-value-widget',
  imports: [SiValueWidgetBodyComponent, SiLinkDirective],
  template: `
    <si-value-widget-body
      icon="element-checked"
      description="Number of contributing issues"
      [value]="valueWidgetValue?.value"
      [unit]="valueWidgetValue?.unit"
    />
    <ng-template #footer><a [siLink]="link">Go to issues</a></ng-template>
  `
})
export class ValueWidgetComponent implements OnInit, WidgetInstance {
  readonly config = input.required<WidgetConfig>();
  protected valueWidgetValue?: { value: string; unit: string };
  @ViewChild('footer', { static: true }) footer?: TemplateRef<unknown>;
  protected link?: Link = { href: 'https://github.com/siemens/element/issues' };

  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    (
      (this.dataService as any)[this.config().payload.datasourceId]() as Observable<{
        value: string;
        unit: string;
      }>
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => (this.valueWidgetValue = value));
  }
}
