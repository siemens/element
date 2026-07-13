/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalRef } from '@siemens/element-ng/modal';
import { SiSearchBarComponent } from '@siemens/element-ng/search-bar';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-translate-ng/translate';
import { firstValueFrom, NEVER } from 'rxjs';

import { TEST_WIDGET } from '../../../test/test-widget/test-widget';
import { createTestingWidget, TestingModule } from '../../../test/testing.module';
import { Widget } from '../../model/widgets.model';
import { SiWidgetCatalogComponent } from './si-widget-catalog.component';

type WidgetSetterMode = 'deprecated' | 'signal';

describe('SiWidgetCatalogComponent', () => {
  let component: SiWidgetCatalogComponent;
  let fixture: ComponentFixture<SiWidgetCatalogComponent>;

  const buttonsByName = (label: string): DebugElement[] => {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .filter((debugElement: DebugElement) => debugElement.nativeElement.innerHTML === label);
  };

  const setWidgets = (widgets: Widget[], mode: WidgetSetterMode): void => {
    if (mode === 'deprecated') {
      component.widgetCatalog = widgets;
    } else {
      component.widgetList.set(widgets);
    }
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
    expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(0);
    const addButtons = buttonsByName('Add');
    expect(addButtons).toHaveLength(1);
    expect(addButtons[0].attributes.disabled).toBeDefined();
  });

  (['deprecated', 'signal'] as const).forEach(mode => {
    describe(`Add button (${mode})`, () => {
      it('should be present and active if the selected widget has no widget editor component', () => {
        setWidgets([createTestingWidget('hello', 'helloId', 'HelloComponent')], mode);
        fixture.detectChanges();

        const addButtons = buttonsByName('Add');
        expect(addButtons).toHaveLength(1);
        expect(addButtons[0].attributes.disabled).toBeUndefined();
      });

      it('should be invisible if the catalog component has an editor', () => {
        setWidgets(
          [createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')],
          mode
        );
        fixture.detectChanges();

        const addButtons = buttonsByName('Add');
        expect(addButtons).toHaveLength(0);
      });

      it('should be visible on the editor view', () => {
        setWidgets(
          [createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')],
          mode
        );
        component.view.set('editor');
        fixture.detectChanges();
        const addButtons = buttonsByName('Add');
        expect(addButtons).toHaveLength(1);
      });

      it('should create and emit widget config from selected', async () => {
        setWidgets([createTestingWidget('Hello', 'id-1234')], mode);
        fixture.detectChanges();

        const widgetConfigPromise = firstValueFrom(outputToObservable(component.closed));
        buttonsByName('Add')[0].nativeElement.click();
        fixture.detectChanges();
        const widgetConfig = await widgetConfigPromise;
        expect(widgetConfig?.widgetId).toBe('id-1234');
      });
    });

    describe(`Next button (${mode})`, () => {
      it('should be visible if the selected widget has an editor component in list view', () => {
        setWidgets(
          [createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')],
          mode
        );
        fixture.detectChanges();

        expect(component.view()).toBe('list');
        const addButtons = buttonsByName('Next');
        expect(addButtons).toHaveLength(1);
      });

      it('should be invisible false if the selected widget has no editor component', () => {
        setWidgets([createTestingWidget('hello', 'helloId', 'HelloComponent')], mode);
        fixture.detectChanges();

        const addButtons = buttonsByName('Next');
        expect(addButtons).toHaveLength(0);
      });

      it('should be invisible in editor view', () => {
        setWidgets(
          [createTestingWidget('hello', 'helloId', 'HelloComponent', 'HelloEditorComponent')],
          mode
        );
        component.view.set('editor');
        fixture.detectChanges();

        expect(buttonsByName('Next')).toHaveLength(0);

        component.view.set('editor-only');
        fixture.detectChanges();
        expect(buttonsByName('Next')).toHaveLength(0);

        component.view.set('list');
        fixture.detectChanges();
        expect(buttonsByName('Next')).toHaveLength(1);
      });

      it('should switch to editor view and display the widget editor component', async () => {
        setWidgets([TEST_WIDGET], mode);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        buttonsByName('Next')[0].nativeElement.click();
        fixture.detectChanges();

        // cannot use jasmine.clock here.
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(component.view()).toBe('editor');
        expect(
          fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
            .tagName
        ).toBe('SI-TEST-WIDGET-EDITOR');
      });

      it('with wrong widget editor configuration should switch to editor view should not display an editor', async () => {
        setWidgets(
          [createTestingWidget('hello', 'helloId', 'HelloComponent', 'Hello123Component')],
          mode
        );
        fixture.detectChanges();

        buttonsByName('Next')[0].nativeElement.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.view()).toBe('editor');
        expect(fixture.debugElement.query(By.css('.si-layout-fixed-height')).children).toHaveLength(
          0
        );
      });
    });

    describe(`Search (${mode})`, () => {
      beforeEach(() => {
        setWidgets(
          [
            createTestingWidget('eins', '1'),
            createTestingWidget('zwei', '2', 'HelloComponent', 'HelloEditorComponent'),
            createTestingWidget('drei', '3')
          ],
          mode
        );
        fixture.detectChanges();
      });

      it('with undefined should not filter visible widgets', () => {
        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'some');
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(0);

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', undefined);
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(3);
      });

      it('with case-insensitive matching string should filter visible widgets', () => {
        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'WEI');
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(1);
      });

      it('with empty string should not filter visible widgets', () => {
        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'some');
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(0);

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', '   ');
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(3);
      });

      it('shall keep the search term and result after clicking `Next` to widget editor and `Previous` to catalog', async () => {
        expect(buttonsByName('Next')).toHaveLength(0);

        let searchInput = fixture.nativeElement.querySelector('si-search-bar input')!;
        searchInput.value = 'zwei';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const searchBarEl = fixture.debugElement.query(By.css('si-search-bar'));
        const searchBarComponent = searchBarEl.componentInstance as SiSearchBarComponent;
        const debounceTime = searchBarComponent.debounceTime();
        // cannot use jasmine.clock here.
        await new Promise(resolve => setTimeout(resolve, debounceTime + 1)); // wait for debounce time + extra 1 ms to avoid flaky test
        await fixture.whenStable();

        expect(buttonsByName('Next')).toHaveLength(1);
        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(1);

        const nextButton = buttonsByName('Next')[0].nativeElement;
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
        expect(buttonsByName('Next')).toHaveLength(1);
        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(1);
      });
    });

    it('Cancel button shall emit undefined on closed', async () => {
      fixture.detectChanges();

      const closedPromise = firstValueFrom(outputToObservable(component.closed));
      buttonsByName('Cancel')[0].nativeElement.click();
      const wd = await closedPromise;
      expect(wd).toBeUndefined();
    });

    it(`Previous button shall switch to list view (${mode})`, async () => {
      setWidgets([TEST_WIDGET], mode);
      fixture.detectChanges();

      buttonsByName('Next')[0].nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.view()).toBe('editor');
      // cannot use jasmine.clock here.
      await new Promise(resolve => setTimeout(resolve, 100));
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

  describe('Widget name and description translation', () => {
    const translations: Record<string, string> = {
      'WIDGET.NAME_KEY': 'Translated Widget Name',
      'WIDGET.DESCRIPTION_KEY': 'Translated Widget Description'
    };

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TestingModule, SiWidgetCatalogComponent],
        providers: [
          { provide: ModalRef, useValue: new ModalRef() },
          provideMockTranslateServiceBuilder(
            () =>
              ({
                translate: (key: string) => translations[key] ?? key,
                translateSync: (key: string) => translations[key] ?? key,
                translationChange: NEVER
              }) as unknown as SiTranslateService
          )
        ]
      });
    });

    (['deprecated', 'signal'] as const).forEach(mode => {
      beforeEach(() => {
        fixture = TestBed.createComponent(SiWidgetCatalogComponent);
        component = fixture.componentInstance;
      });

      it(`should display translated widget name and description (${mode})`, () => {
        setWidgets(
          [
            {
              ...createTestingWidget('WIDGET.NAME_KEY', 'translatable-1'),
              description: 'WIDGET.DESCRIPTION_KEY'
            }
          ],
          mode
        );
        fixture.detectChanges();

        const listItems = fixture.debugElement.queryAll(By.css('.list-group-item'));
        expect(listItems).toHaveLength(1);
        expect(listItems[0].query(By.css('.si-h5')).nativeElement).toHaveTextContent(
          'Translated Widget Name'
        );
        expect(listItems[0].query(By.css('.si-body')).nativeElement).toHaveTextContent(
          'Translated Widget Description'
        );
      });

      it(`should filter widgets by translated name (${mode})`, () => {
        setWidgets(
          [
            {
              ...createTestingWidget('WIDGET.NAME_KEY', 'translatable-1'),
              description: 'WIDGET.DESCRIPTION_KEY'
            },
            createTestingWidget('Other Widget', 'other-1')
          ],
          mode
        );
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(2);

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'Translated');
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-group-item'))).toHaveLength(1);
        expect(
          fixture.debugElement.query(By.css('.list-group-item .si-h5')).nativeElement
        ).toHaveTextContent('Translated Widget Name');
      });
    });
  });
});
