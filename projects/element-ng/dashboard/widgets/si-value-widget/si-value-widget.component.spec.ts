/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';

import { SiValueWidgetComponent } from './si-value-widget.component';

describe('SiValueWidgetComponent', () => {
  let fixture: ComponentFixture<SiValueWidgetComponent>;
  let element: HTMLElement;
  let heading: WritableSignal<string>;
  let value: WritableSignal<string>;
  let unit: WritableSignal<string>;
  let icon: WritableSignal<string>;
  let description: WritableSignal<string>;
  let primaryActions: WritableSignal<ContentActionBarMainItem[]>;
  let secondaryActions: WritableSignal<MenuItem[]>;
  let link: WritableSignal<any>;

  beforeEach(() => {
    heading = signal('');
    value = signal('72');
    unit = signal('kWh');
    icon = signal('element-checked');
    description = signal('Description');
    primaryActions = signal([]);
    secondaryActions = signal([]);
    link = signal(undefined);
    fixture = TestBed.createComponent(SiValueWidgetComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('value', value),
        inputBinding('unit', unit),
        inputBinding('icon', icon),
        inputBinding('description', description),
        inputBinding('primaryActions', primaryActions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('link', link)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should have a heading', () => {
    heading.set('TITLE_KEY');
    fixture.detectChanges();
    expect(element.querySelector('.card-header')!.innerHTML).toContain('TITLE_KEY');
  });
});
