/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiIconModule } from '@spike-rabbit/element-ng/icon';

import { SiStatusBarItemComponent } from './si-status-bar-item.component';

@Component({
  imports: [SiIconModule, SiStatusBarItemComponent],
  template: `
    <si-status-bar-item
      #item
      [status]="status"
      [value]="value"
      [heading]="heading"
      [blink]="blink"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  status?: string;
  value!: string | number;
  heading!: string;
  color?: string;
  blink = false;
}

describe('SiStatusBarItemComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiIconModule, SiStatusBarItemComponent, TestHostComponent]
    }).compileComponents()
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should contain set properties', () => {
    component.heading = 'heading';
    component.status = 'danger';
    component.value = 'value';
    component.blink = true;

    fixture.detectChanges();

    expect((element.querySelector('.item-title') as HTMLElement).innerText).toContain('heading');
    expect(element.querySelector('.status-item .bg')!.classList).toContain('bg-base-danger');
    expect(element.querySelector('.item-value')!.innerHTML).toContain('value');
  });
});
