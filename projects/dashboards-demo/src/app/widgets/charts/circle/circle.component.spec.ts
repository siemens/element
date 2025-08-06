/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimplChartsNgModule } from '@spike-rabbit/charts-ng';
import { SiResizeObserverModule } from '@spike-rabbit/element-ng/resize-observer';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

import { WIDGETS } from '../../widget-configs.mocks';
import { CircleComponent } from './circle.component';

describe('CircleComponent', () => {
  let component: CircleComponent;
  let fixture: ComponentFixture<CircleComponent>;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SimplChartsNgModule,

        SiTranslatePipe,
        SiResizeObserverModule,
        CircleComponent
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleComponent);
    component = fixture.componentInstance;
    component.config = WIDGETS[1];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
