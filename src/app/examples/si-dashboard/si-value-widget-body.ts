/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { SiValueWidgetBodyComponent } from '@spike-rabbit/element-ng/dashboard';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiValueWidgetBodyComponent, SiLinkDirective],
  templateUrl: './si-value-widget-body.html',
  styles: `
    .card-size {
      height: 400px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  private cdRef = inject(ChangeDetectorRef);

  simplActionLink: Link = {
    title: 'Do something',
    action: () => alert('Hello Element!')
  };

  value1?: string;
  value2?: string;

  ngOnInit(): void {
    setTimeout(() => {
      this.value1 = '72';
      this.value2 = '144';
      this.cdRef.markForCheck();
    }, 2000);
  }
}
