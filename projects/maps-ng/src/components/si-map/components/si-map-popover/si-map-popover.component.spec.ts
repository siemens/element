/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPointMetaData } from '../../models';
import { SiMapPopoverComponent } from './si-map-popover.component';

@Component({
  selector: 'si-mock-popover',
  standalone: true,
  template: '<p>Mocking custom popover component</p>'
})
class MockCustomPopoverComponent {
  readonly mapPoint = input<any>();
  readonly mapPoints = input<any>();
}

describe('SiMapPopoverComponent', () => {
  let component: SiMapPopoverComponent;
  let fixture: ComponentFixture<SiMapPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiMapPopoverComponent, MockCustomPopoverComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMapPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should render', () => {
    const mapPoints: MapPointMetaData = {
      name: 'Point 1',
      description: 'Desc 1'
    };

    it('custom popover component if defined', () => {
      vi.spyOn(component as any, 'renderCustomComponent');
      component.render({ component: MockCustomPopoverComponent, mapPoints });
      // eslint-disable-next-line
      expect(component['renderCustomComponent']).toHaveBeenCalled();
    });

    it('default popover component otherwise', () => {
      vi.spyOn(component as any, 'renderDefault');
      component.render({ component: undefined, mapPoints });
      // eslint-disable-next-line
      expect(component['renderDefault']).toHaveBeenCalled();
    });
  });
});
