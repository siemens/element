/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiMapTooltipComponent } from './si-map-tooltip.component';

describe('SiMapTooltipComponent', () => {
  let component: SiMapTooltipComponent;
  let fixture: ComponentFixture<SiMapTooltipComponent>;

  const labels = ['Label A', 'Label B', 'Label C'];
  const label = 'Label X';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiMapTooltipComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMapTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the tooltip from simple string value', () => {
    component.setTooltip(label);

    const tooltip = fixture.debugElement.query(By.css('.si-map-tooltip'));
    expect(tooltip.nativeElement.innerHTML).toContain('<div>Label X</div>');
  });

  it('should display the tooltip from array of strings', () => {
    component.setTooltip(labels);

    const tooltip = fixture.debugElement.query(By.css('.si-map-tooltip'));
    expect(tooltip.nativeElement.innerHTML).toContain(
      '<div>Label A</div><div>Label B</div><div>Label C</div>'
    );
  });

  it('should render cropped tooltip if there are too many labels', () => {
    component.setTooltip([...labels, ...labels]);
    fixture.detectChanges();
    const tooltip = fixture.debugElement.query(By.css('.si-map-tooltip'));
    expect(tooltip.nativeElement.innerHTML).toContain('and 2 more...');
  });

  it('should trim the label if too long', () => {
    const longLabel = 'This is too long label, which will be trimmed 50 ch';
    component.setTooltip(longLabel);
    const tooltip = fixture.debugElement.query(By.css('.si-map-tooltip'));
    expect(tooltip.nativeElement.innerHTML).toContain('...');
  });
});
