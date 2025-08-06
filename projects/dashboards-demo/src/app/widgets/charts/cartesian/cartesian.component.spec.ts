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
import { CartesianComponent } from './cartesian.component';

describe('CartesianComponent', () => {
  let component: CartesianComponent;
  let fixture: ComponentFixture<CartesianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SimplChartsNgModule,
        SiResizeObserverModule,
        SiTranslatePipe,
        CartesianComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartesianComponent);
    component = fixture.componentInstance;
    component.config = WIDGETS[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
