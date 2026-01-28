/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalRef } from '@siemens/element-ng/modal';
import { firstValueFrom } from 'rxjs';

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

  it('should create', async () => {
    expect(component).toBeTruthy();
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', {
      ...createWidgetConfig(TEST_WIDGET),
      id: 'testId'
    });
    fixture.detectChanges();
    // to avoid injector destroyed error
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(component.widgetConfig()).toBeDefined();
    expect(component.widget()).toBeDefined();
  });

  it('should setup custom editor', async () => {
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', {
      ...createWidgetConfig(TEST_WIDGET),
      id: 'testId'
    });
    fixture.detectChanges();
    await firstValueFrom(outputToObservable(component.editorSetupCompleted));
    expect(
      fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
        .tagName
    ).toBe('SI-TEST-WIDGET-EDITOR');
  });

  it('#onCancel() should emit undefined on closed', async () => {
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', {
      ...createWidgetConfig(TEST_WIDGET),
      id: 'testId'
    });
    fixture.detectChanges();

    const closedPromise = firstValueFrom(outputToObservable(component.closed));
    buttonsByName('Cancel')[0].nativeElement.click();
    const wd = await closedPromise;
    expect(wd).toBeUndefined();
  });

  it('#onSave() should emit widget config on closed', async () => {
    const widgetConfig = { ...createWidgetConfig(TEST_WIDGET), id: 'testId' };
    fixture.componentRef.setInput('widget', TEST_WIDGET);
    fixture.componentRef.setInput('widgetConfig', widgetConfig);
    fixture.detectChanges();

    const closedPromise = firstValueFrom(outputToObservable(component.closed));
    buttonsByName('Save')[0].nativeElement.click();
    const wd = await closedPromise;
    expect(wd).toEqual(widgetConfig);
  });
});
