/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalRef } from '@spike-rabbit/element-ng/modal';

import { TEST_WIDGET } from '../../../test/test-widget/test-widget';
import { TestingModule } from '../../../test/testing.module';
import { createWidgetConfig } from '../../model/widgets.model';
import { SiWidgetInstanceEditorDialogComponent } from './si-widget-instance-editor-dialog.component';

describe('SiWidgetInstanceEditorDialogComponent', () => {
  let component: SiWidgetInstanceEditorDialogComponent;
  let fixture: ComponentFixture<SiWidgetInstanceEditorDialogComponent>;

  const buttonsByName = (label: string): DebugElement[] => {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .filter((debugElement: DebugElement) => debugElement.nativeElement.innerHTML === label);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingModule, SiWidgetInstanceEditorDialogComponent],
      providers: [{ provide: ModalRef, useValue: new ModalRef() }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiWidgetInstanceEditorDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', {
      ...createWidgetConfig(TEST_WIDGET),
      id: 'testId'
    });
    fixture.detectChanges();
    expect(component.widgetConfig()).toBeDefined();
    expect(component.widget()).toBeDefined();
  });

  it('should setup custom editor', (done: DoneFn) => {
    component.editorSetupCompleted.subscribe(_ => {
      expect(
        fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
          .tagName
      ).toBe('SI-TEST-WIDGET-EDITOR');
      done();
    });

    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', {
      ...createWidgetConfig(TEST_WIDGET),
      id: 'testId'
    });
    fixture.detectChanges();
  });

  it('#onCancel() should emit undefined on closed', (done: DoneFn) => {
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', {
      ...createWidgetConfig(TEST_WIDGET),
      id: 'testId'
    });
    fixture.detectChanges();

    component.closed.subscribe(wd => {
      expect(wd).toBeUndefined();
      done();
    });
    buttonsByName('Cancel')[0].nativeElement.click();
  });

  it('#onSave() should emit widget config on closed', (done: DoneFn) => {
    const widgetConfig = { ...createWidgetConfig(TEST_WIDGET), id: 'testId' };
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', widgetConfig);
    fixture.detectChanges();

    component.closed.subscribe(wd => {
      expect(wd).toEqual(widgetConfig);
      done();
    });
    buttonsByName('Save')[0].nativeElement.click();
  });
});
