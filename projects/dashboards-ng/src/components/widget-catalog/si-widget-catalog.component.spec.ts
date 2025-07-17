/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalRef } from '@siemens/element-ng/modal';

import { TEST_WIDGET } from '../../../test/test-widget/test-widget';
import { createTestingWidget, TestingModule } from '../../../test/testing.module';
import { SiWidgetCatalogComponent } from './si-widget-catalog.component';

describe('SiWidgetCatalogComponent', () => {
  let component: SiWidgetCatalogComponent;
  let fixture: ComponentFixture<SiWidgetCatalogComponent>;

  const buttonsByName = (label: string): DebugElement[] => {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .filter((debugElement: DebugElement) => debugElement.nativeElement.innerHTML === label);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingModule, SiWidgetCatalogComponent],
      providers: [{ provide: ModalRef, useValue: new ModalRef() }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiWidgetCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(0);
    const addButtons = buttonsByName('Add');
    expect(addButtons.length).toBe(1);
    expect(addButtons[0].attributes.disabled).toBeDefined();
  });

  describe('Add button', () => {
    it('should be present and active if the selected widget has no widget editor component', () => {
      component.widgetCatalog = [createTestingWidget('hello', 'helloId', 'HelloComponent')];
      fixture.detectChanges();

      const addButtons = buttonsByName('Add');
      expect(addButtons.length).toBe(1);
      expect(addButtons[0].attributes.disabled).toBeUndefined();
    });

    it('should be invisible if the catalog component has an editor', () => {
      component.widgetCatalog = [
        createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')
      ];
      fixture.detectChanges();

      const addButtons = buttonsByName('Add');
      expect(addButtons.length).toBe(0);
    });

    it('should be visible on the editor view', () => {
      component.widgetCatalog = [
        createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')
      ];
      component.view.set('editor');
      fixture.detectChanges();
      const addButtons = buttonsByName('Add');
      expect(addButtons.length).toBe(1);
    });

    it('should create and emit widget config from selected', (done: DoneFn) => {
      component.widgetCatalog = [createTestingWidget('Hello', 'id-1234')];
      fixture.detectChanges();

      component.closed.subscribe(widgetConfig => {
        expect(widgetConfig?.widgetId).toBe('id-1234');
        done();
      });
      buttonsByName('Add')[0].nativeElement.click();
      fixture.detectChanges();
    });
  });

  describe('Next button', () => {
    it('should be visible if the selected widget has an editor component in list view', () => {
      component.widgetCatalog = [
        createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')
      ];
      fixture.detectChanges();

      expect(component.view()).toBe('list');
      const addButtons = buttonsByName('Next');
      expect(addButtons.length).toBe(1);
    });

    it('should be invisible false if the selected widget has no editor component', () => {
      component.widgetCatalog = [createTestingWidget('hello', 'helloId', 'HelloComponent')];
      fixture.detectChanges();

      const addButtons = buttonsByName('Next');
      expect(addButtons.length).toBe(0);
    });

    it('should be invisible in editor view', () => {
      component.widgetCatalog = [
        createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')
      ];
      component.view.set('editor');
      fixture.detectChanges();

      expect(buttonsByName('Next').length).toBe(0);

      component.view.set('editor-only');
      fixture.detectChanges();
      expect(buttonsByName('Next').length).toBe(0);

      component.view.set('list');
      fixture.detectChanges();
      expect(buttonsByName('Next').length).toBe(1);
    });

    it('should switch to editor view and display the widget editor component', async () => {
      component.widgetCatalog = [TEST_WIDGET];
      fixture.detectChanges();

      buttonsByName('Next')[0].nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.view()).toBe('editor');
      expect(
        fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
          .tagName
      ).toBe('SI-TEST-WIDGET-EDITOR');
    });

    it('with wrong widget editor configuration should switch to editor view should not display an editor', async () => {
      component.widgetCatalog = [
        createTestingWidget('hello', 'helloId', 'HelloComponent', 'Hello123Component')
      ];
      fixture.detectChanges();

      buttonsByName('Next')[0].nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.view()).toBe('editor');
      expect(fixture.debugElement.query(By.css('.si-layout-fixed-height')).children.length).toBe(0);
    });
  });

  describe('Search ', () => {
    beforeEach(() => {
      component.widgetCatalog = [
        createTestingWidget('eins', '1'),
        createTestingWidget('zwei', '2', 'HelloComponent', 'HelloEditorComponent'),
        createTestingWidget('drei', '3')
      ];
      fixture.detectChanges();
    });

    it('with undefined should not filter visible widgets', () => {
      fixture.debugElement
        .query(By.css('si-search-bar'))
        .triggerEventHandler('searchChange', 'some');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(0);

      fixture.debugElement
        .query(By.css('si-search-bar'))
        .triggerEventHandler('searchChange', undefined);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(3);
    });

    it('with case-insensitive matching string should filter visible widgets', () => {
      fixture.debugElement
        .query(By.css('si-search-bar'))
        .triggerEventHandler('searchChange', 'WEI');
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(1);
    });

    it('with empty string should not filter visible widgets', () => {
      fixture.debugElement
        .query(By.css('si-search-bar'))
        .triggerEventHandler('searchChange', 'some');
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(0);

      fixture.debugElement
        .query(By.css('si-search-bar'))
        .triggerEventHandler('searchChange', '   ');
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(3);
    });

    it('shall keep the search term and result after clicking `Next` to widget editor and `Previous` to catalog', fakeAsync(async () => {
      expect(buttonsByName('Next').length).toBe(0);

      let searchInput = fixture.nativeElement.querySelector('si-search-bar input')!;
      searchInput.value = 'zwei';
      searchInput.dispatchEvent(new Event('input'));
      tick(400); // debounce time in search bar

      fixture.detectChanges();

      expect(buttonsByName('Next').length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(1);

      const nextButton = fixture.nativeElement.querySelectorAll('button')[3] as HTMLButtonElement;
      expect(nextButton.innerHTML).toBe('Next');

      // Navigate to next page that shows the editor of the widget and not the widget catalog.
      // Test by verifying the search input is gone.
      nextButton.click();
      fixture.detectChanges();
      searchInput = fixture.nativeElement.querySelector('si-search-bar input')!;
      expect(searchInput).toBeNull();

      // Navigate back to the widget catalog.
      const previousButton = fixture.nativeElement.querySelectorAll(
        'button'
      )[1] as HTMLButtonElement;
      expect(previousButton.innerHTML).toBe('Previous');
      previousButton.click();
      fixture.detectChanges();

      // Verify that the search input is back and includes the value `zwei`
      searchInput = fixture.nativeElement.querySelector('si-search-bar input')!;
      expect(searchInput).not.toBeNull();
      expect(searchInput.value).toBe('zwei');
      expect(buttonsByName('Next').length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('.list-group-item')).length).toBe(1);
    }));
  });

  it('Cancel button shall emit undefined on closed', (done: DoneFn) => {
    fixture.detectChanges();

    component.closed.subscribe(wd => {
      expect(wd).toBeUndefined();
      done();
    });
    buttonsByName('Cancel')[0].nativeElement.click();
  });

  it('Previous button shall switch to list view', async () => {
    component.widgetCatalog = [TEST_WIDGET];
    fixture.detectChanges();

    buttonsByName('Next')[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.view()).toBe('editor');
    expect(
      fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
        .tagName
    ).toBe('SI-TEST-WIDGET-EDITOR');

    buttonsByName('Previous')[0].nativeElement.click();
    fixture.detectChanges();
    expect(component.view()).toBe('list');
    expect(
      fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
        .tagName
    ).not.toBe('SI-TEST-WIDGET-EDITOR');
  });
});
