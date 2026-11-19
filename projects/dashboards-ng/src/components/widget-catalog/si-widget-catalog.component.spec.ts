/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DebugElement } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalRef } from '@siemens/element-ng/modal';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-translate-ng/translate';
import { firstValueFrom, NEVER } from 'rxjs';
import { page, userEvent } from 'vitest/browser';

import { TEST_WIDGET } from '../../../test/test-widget/test-widget';
import { createTestingWidget, TestingModule } from '../../../test/testing.module';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiWidgetCatalogComponent } from './si-widget-catalog.component';

type WidgetSetterMode = 'deprecated' | 'signal';

describe('SiWidgetCatalogComponent', () => {
  let component: SiWidgetCatalogComponent;
  let fixture: ComponentFixture<SiWidgetCatalogComponent>;

  const buttonsByName = (label: string): DebugElement[] => {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .filter(
        (debugElement: DebugElement) => debugElement.nativeElement.textContent.trim() === label
      );
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
    expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(0);
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
        const widgetConfigs = await widgetConfigPromise;
        expect(widgetConfigs).toHaveLength(1);
        expect(widgetConfigs?.[0].widgetId).toBe('id-1234');
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

        await vi.waitFor(() => expect(component.view()).toBe('editor'));
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

      it('with cleared input should not filter visible widgets', async () => {
        await fixture.whenStable();
        await userEvent.fill(page.getByRole('textbox'), 'some');
        await fixture.whenStable();

        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(0);

        await userEvent.fill(page.getByRole('textbox'), '');
        await fixture.whenStable();
        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(3);
      });

      it('with case-insensitive matching string should filter visible widgets', async () => {
        await fixture.whenStable();
        await userEvent.fill(page.getByRole('textbox'), 'WEI');
        await fixture.whenStable();

        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(1);
        expect(fixture.nativeElement.querySelector('.list-item')).toHaveTextContent('zwei');
      });

      it('with whitespace-only string should not filter visible widgets', async () => {
        await fixture.whenStable();
        await userEvent.fill(page.getByRole('textbox'), 'some');
        await fixture.whenStable();
        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(0);

        await userEvent.fill(page.getByRole('textbox'), '   ');
        await fixture.whenStable();
        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(3);
        await expect.element(page.getByRole('textbox')).toHaveValue('');
      });

      it('shall keep the search term and result after clicking `Next` to widget editor and `Previous` to catalog', async () => {
        await fixture.whenStable();
        expect(buttonsByName('Next')).toHaveLength(0);

        const searchInput = page.getByRole('textbox');
        await userEvent.fill(searchInput, 'zwei');
        await fixture.whenStable();
        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(1);

        expect(buttonsByName('Next')).toHaveLength(1);

        await userEvent.click(page.getByRole('button', { name: 'Next', exact: true }));
        await fixture.whenStable();
        await expect.element(searchInput).not.toBeInTheDocument();

        await userEvent.click(page.getByRole('button', { name: 'Previous', exact: true }));
        await fixture.whenStable();
        await expect.element(searchInput).toHaveValue('zwei');
        expect(buttonsByName('Next')).toHaveLength(1);
        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(1);
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
      await vi.waitFor(() =>
        expect(
          fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
            .tagName
        ).toBe('SI-TEST-WIDGET-EDITOR')
      );

      buttonsByName('Previous')[0].nativeElement.click();
      fixture.detectChanges();
      expect(component.view()).toBe('list');
      expect(
        fixture.debugElement.query(By.css('.si-layout-fixed-height')).children[0].nativeElement
          .tagName
      ).not.toBe('SI-TEST-WIDGET-EDITOR');
    });
  });

  describe('List multi selection', () => {
    const widgetWithoutEditor = createTestingWidget('widgetA', 'a-1');
    const widgetWithoutEditor2 = createTestingWidget('widgetB', 'b-1');
    const widgetWithEditor = createTestingWidget('widgetC', 'c-1', 'CComponent', 'CEditor');

    // The checkboxes are decorative (aria-hidden, inert). The accessible, interactive
    // elements are the cdkListbox options, so query and interact with those.
    const options = (): HTMLElement[] => page.getByRole('option').elements() as HTMLElement[];

    beforeEach(() => {
      component.widgetCatalog = [widgetWithoutEditor, widgetWithoutEditor2, widgetWithEditor];
      fixture.componentRef.setInput('multiSelect', true);
      fixture.detectChanges();
    });

    it('should always show checkboxes in list view', () => {
      expect(options()).toHaveLength(3);
    });

    it('should allow selecting widgets with editor components', async () => {
      const editorOption = options()[2];
      expect(editorOption).not.toHaveAttribute('aria-disabled', 'true');

      editorOption.click();
      await fixture.whenStable();

      expect(editorOption).toHaveAttribute('aria-selected', 'true');
      expect(buttonsByName('Next')).toHaveLength(1);
    });

    it('should show add for multi-selection and hide next', async () => {
      const opts = options();
      opts[1].click();
      await fixture.whenStable();
      opts[2].click();
      await fixture.whenStable();

      expect(buttonsByName('Next')).toHaveLength(0);
      expect(buttonsByName('Add')).toHaveLength(1);
      expect(buttonsByName('Add')[0].nativeElement).not.toHaveAttribute('disabled');
    });

    it('should emit deferred config for editor widgets in multi-selection', async () => {
      const opts = options();
      opts[1].click();
      await fixture.whenStable();
      opts[2].click();
      await fixture.whenStable();

      const closedPromise = firstValueFrom(outputToObservable(component.closed));
      buttonsByName('Add')[0].nativeElement.click();
      await fixture.whenStable();

      const result = (await closedPromise) as Omit<WidgetConfig, 'id'>[];
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result.find(config => config.widgetId === 'b-1')?.setupPending).toBe(undefined);
      expect(result.find(config => config.widgetId === 'c-1')?.setupPending).toBe(true);
    });

    it('should disable add button when no widget is selected', async () => {
      await fixture.whenStable();
      expect(buttonsByName('Add')[0].nativeElement).toHaveAttribute('disabled');
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

        const listItems = fixture.debugElement.queryAll(By.css('.list-item'));
        expect(listItems).toHaveLength(1);
        expect(listItems[0].query(By.css('.list-item-title')).nativeElement).toHaveTextContent(
          'Translated Widget Name'
        );
        expect(
          listItems[0].query(By.css('.list-item-description')).nativeElement
        ).toHaveTextContent('Translated Widget Description');
      });

      it(`should filter widgets by translated name (${mode})`, async () => {
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
        await fixture.whenStable();

        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(2);

        await userEvent.fill(page.getByRole('textbox'), 'Translated');
        await fixture.whenStable();

        await expect
          .poll(() => fixture.nativeElement.querySelectorAll('.list-item'))
          .toHaveLength(1);
        expect(
          fixture.debugElement.query(By.css('.list-item .list-item-title')).nativeElement
        ).toHaveTextContent('Translated Widget Name');
      });
    });
  });
});
