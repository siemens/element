/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPointMetaData } from '../../models';
import { SiMapPopoverComponent } from './si-map-popover.component';

@Component({
  selector: 'si-mock-popover',
  template: '<p>Mocking custom popover component</p>'
})
class MockCustomPopoverComponent {
  readonly mapPoint = input<MapPointMetaData>();
}

describe('SiMapPopoverComponent', () => {
  let component: SiMapPopoverComponent;
  let fixture: ComponentFixture<SiMapPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiMapPopoverComponent, MockCustomPopoverComponent]
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

    it('default content template for a single map point', () => {
      component.render({ component: undefined, mapPoints });
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Point 1');
      expect(el.innerHTML).toContain('Desc 1');
      expect(el.querySelector('.si-map-popover-list')).toBeNull();
    });

    it('default cluster template for multiple map points', () => {
      const multiplePoints: MapPointMetaData[] = [
        { name: 'Point A', description: 'Desc A' },
        { name: 'Point B', description: 'Desc B' }
      ];
      component.render({ component: undefined, mapPoints: multiplePoints });
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.si-map-popover-list')).not.toBeNull();
      expect(el.textContent).toContain('Point A');
      expect(el.textContent).toContain('Point B');
    });
  });
});
