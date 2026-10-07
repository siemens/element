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
import { BehaviorSubject, firstValueFrom, NEVER } from 'rxjs';
import { page } from 'vitest/browser';

import { TEST_WIDGET } from '../../../test/test-widget/test-widget';
import { createTestingWidget, TestingModule } from '../../../test/testing.module';
import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiFlexibleDashboardComponent } from '../flexible-dashboard/si-flexible-dashboard.component';
import { SiWidgetCatalogComponent } from './si-widget-catalog.component';

type WidgetSetterMode = 'deprecated' | 'signal';

describe('SiWidgetCatalogComponent', () => {
  let component: SiWidgetCatalogComponent;
  let fixture: ComponentFixture<SiWidgetCatalogComponent>;
  let widgetInstances$: BehaviorSubject<WidgetConfig[]>;

  const dashboardProvider = {
    provide: SiFlexibleDashboardComponent,
    useValue: {
      grid: () => ({ visibleWidgetInstances$: widgetInstances$ })
    }
  };

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
    widgetInstances$ = new BehaviorSubject<WidgetConfig[]>([]);
    await TestBed.configureTestingModule({
      imports: [TestingModule, SiWidgetCatalogComponent],
      providers: [{ provide: ModalRef, useValue: new ModalRef() }, dashboardProvider]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiWidgetCatalogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => vi.useRealTimers());

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(0);
    const addButtons = buttonsByName('Add');
    expect(addButtons).toHaveLength(1);
    expect(addButtons[0].attributes.disabled).toBeDefined();
  });

  (['deprecated', 'signal'] as const).forEach(mode => {
    describe(`Instance limits (${mode})`, () => {
      const enabledWidget = createTestingWidget('Enabled widget', 'enabled');
      const disabledWidget: Widget = {
        ...createTestingWidget('Disabled widget', 'disabled'),
        maxInstances: 0,
        badge: 'Requires license'
      };
      const limitedWidget: Widget = {
        ...createTestingWidget('Limited widget', 'limited'),
        maxInstances: 1
      };
      const options = (): HTMLElement[] =>
        fixture.debugElement
          .queryAll(By.css('[role="option"]'))
          .map(option => option.nativeElement as HTMLElement);

      it('should render widget options in a scrollable card with divider rows', () => {
        setWidgets([disabledWidget, enabledWidget], mode);
        fixture.detectChanges();

        const listbox = fixture.debugElement.query(By.css('[role="listbox"]'))
          .nativeElement as HTMLElement;
        expect(listbox).toHaveClass('list', 'list-divider');
        expect(listbox.parentElement).toHaveClass('card', 'overflow-auto');
        expect(listbox.querySelectorAll('.list-item')).toHaveLength(2);
      });

      it('should keep a consumer-disabled widget visible without selecting it', async () => {
        setWidgets([disabledWidget, enabledWidget], mode);
        fixture.detectChanges();
        await fixture.whenStable();

        const [disabledOption, enabledOption] = options();
        expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
        expect(disabledOption).toHaveAttribute('aria-selected', 'false');
        expect(disabledOption.querySelector('si-icon')).toHaveClass('text-disabled');
        expect(enabledOption.querySelector('si-icon')).not.toHaveClass('text-disabled');
        expect(disabledOption.querySelector('si-badge')).toHaveTextContent('Requires license');
        expect(disabledOption.querySelector('si-badge')).toHaveClass('bg-info');
        expect(enabledOption).toHaveAttribute('aria-selected', 'true');

        disabledOption.click();
        await fixture.whenStable();

        expect(disabledOption).not.toHaveClass('active');
        expect(enabledOption).toHaveAttribute('aria-selected', 'true');
      });

      it('should leave a zero-limit widget unchecked even if it is already on the dashboard', () => {
        setWidgets([disabledWidget], mode);
        fixture.componentRef.setInput('multiSelect', true);
        widgetInstances$.next([{ id: 'disabled-instance', widgetId: disabledWidget.id }]);
        fixture.detectChanges();

        const [option] = options();
        expect(option.querySelector('input')).toBeDisabled();
        expect(option.querySelector('input')).not.toBeChecked();
        expect(option.querySelector('si-badge')).toHaveTextContent('Requires license');
      });

      it.each([
        { maxInstances: 1, instanceCount: 0, added: false },
        { maxInstances: 1, instanceCount: 1, added: true },
        { maxInstances: 1, instanceCount: 2, added: true },
        { maxInstances: 2, instanceCount: 1, added: false },
        { maxInstances: 2, instanceCount: 2, added: true }
      ])(
        'should show added=$added with $instanceCount instances and a limit of $maxInstances',
        ({ maxInstances, instanceCount, added }) => {
          setWidgets([{ ...limitedWidget, maxInstances }], mode);
          fixture.componentRef.setInput('multiSelect', true);
          widgetInstances$.next(
            Array.from({ length: instanceCount }, (_, index) => ({
              id: `instance-${index}`,
              widgetId: limitedWidget.id
            }))
          );
          fixture.detectChanges();

          const [option] = options();
          expect(option).toHaveAttribute('aria-disabled', String(added));
          expect(option).toHaveAttribute('aria-selected', 'false');
          expect(option).not.toHaveClass('active');
          expect(option.querySelector('input')).toMatchObject({
            checked: false,
            disabled: added
          });
          expect(option.querySelectorAll('si-badge')).toHaveLength(added ? 1 : 0);
          expect(option.querySelectorAll('si-badge.bg-default')).toHaveLength(added ? 1 : 0);
          const stateLabel =
            option.querySelector('si-badge') ?? option.querySelector('.list-item-title');
          expect(stateLabel).toHaveTextContent(added ? 'Added' : 'Limited widget');
        }
      );

      it('should show the added badge instead of a consumer badge at the limit', () => {
        setWidgets([{ ...limitedWidget, badge: 'Consumer badge' }], mode);
        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        fixture.detectChanges();

        const badge = options()[0].querySelector('si-badge');
        expect(badge).toHaveTextContent('Added');
        expect(badge).not.toHaveTextContent('Consumer badge');
        expect(badge).toHaveClass('bg-default');
      });

      it('should allow unlimited widgets with an info badge despite existing instances', () => {
        setWidgets([{ ...enabledWidget, badge: 'Consumer badge' }], mode);
        widgetInstances$.next([
          { id: 'first-instance', widgetId: enabledWidget.id },
          { id: 'second-instance', widgetId: enabledWidget.id }
        ]);
        fixture.detectChanges();

        const [option] = options();
        expect(option).toHaveAttribute('aria-disabled', 'false');
        expect(option).toHaveAttribute('aria-selected', 'true');
        expect(option.querySelector('si-badge')).toHaveTextContent('Consumer badge');
        expect(option.querySelector('si-badge')).toHaveClass('bg-info');
      });

      it('should count instances by widgetId rather than instance id', () => {
        setWidgets([limitedWidget], mode);
        widgetInstances$.next([{ id: limitedWidget.id, widgetId: 'another-widget' }]);
        fixture.detectChanges();

        expect(options()[0]).toHaveAttribute('aria-disabled', 'false');
        expect(options()[0]).toHaveAttribute('aria-selected', 'true');
      });

      it('should initially select the first enabled widget after an added widget', () => {
        setWidgets([limitedWidget, enabledWidget], mode);
        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        fixture.detectChanges();

        const [addedOption, enabledOption] = options();
        expect(addedOption).toHaveAttribute('aria-selected', 'false');
        expect(enabledOption).toHaveAttribute('aria-selected', 'true');
      });

      it('should disable Add when only disabled and added widgets exist', () => {
        setWidgets([disabledWidget, limitedWidget], mode);
        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        fixture.detectChanges();

        expect(options()).toHaveLength(2);
        for (const option of options()) {
          expect(option).toHaveAttribute('aria-selected', 'false');
          expect(option).not.toHaveClass('active');
        }
        expect(buttonsByName('Add')[0].nativeElement).toBeDisabled();
      });

      it('should select the first enabled widget after filtering', async () => {
        setWidgets(
          [
            enabledWidget,
            { ...disabledWidget, name: 'Matching disabled widget' },
            { ...limitedWidget, name: 'Matching enabled widget' }
          ],
          mode
        );
        fixture.detectChanges();

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'Matching');
        await fixture.whenStable();

        const [disabledOption, enabledOption] = options();
        expect(disabledOption).toHaveAttribute('aria-selected', 'false');
        expect(enabledOption).toHaveAttribute('aria-selected', 'true');
      });

      it('should clear selection when filtering leaves only disabled widgets', async () => {
        setWidgets([enabledWidget, disabledWidget], mode);
        fixture.detectChanges();

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'Disabled');
        await fixture.whenStable();

        expect(options()).toHaveLength(1);
        expect(options()[0]).toHaveAttribute('aria-selected', 'false');
        expect(buttonsByName('Add')[0].nativeElement).toBeDisabled();
      });

      it('should ignore disabled options during multi-selection', async () => {
        setWidgets([disabledWidget, limitedWidget, enabledWidget], mode);
        fixture.componentRef.setInput('multiSelect', true);
        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        fixture.detectChanges();
        const closed = vi.fn();
        component.closed.subscribe(closed);

        const [disabledOption, addedOption, enabledOption] = options();
        disabledOption.click();
        addedOption.click();
        enabledOption.click();
        await fixture.whenStable();
        buttonsByName('Add')[0].nativeElement.click();
        await fixture.whenStable();

        expect(disabledOption).toHaveAttribute('aria-selected', 'false');
        expect(addedOption).toHaveAttribute('aria-selected', 'false');
        expect(enabledOption).toHaveAttribute('aria-selected', 'true');
        expect(closed).toHaveBeenCalledExactlyOnceWith([
          expect.objectContaining({ widgetId: enabledWidget.id })
        ]);
      });

      it('should defensively filter disabled widgets from listbox selection events', async () => {
        setWidgets([disabledWidget, limitedWidget, enabledWidget], mode);
        fixture.componentRef.setInput('multiSelect', true);
        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        fixture.detectChanges();
        const closed = vi.fn();
        component.closed.subscribe(closed);

        fixture.debugElement
          .query(By.css('[role="listbox"]'))
          .triggerEventHandler('cdkListboxValueChange', {
            value: [disabledWidget, limitedWidget, enabledWidget]
          });
        await fixture.whenStable();
        buttonsByName('Add')[0].nativeElement.click();

        expect(closed).toHaveBeenCalledExactlyOnceWith([
          expect.objectContaining({ widgetId: enabledWidget.id })
        ]);
      });

      it('should clear multi-selection when a selected widget reaches its limit', async () => {
        setWidgets([limitedWidget], mode);
        fixture.componentRef.setInput('multiSelect', true);
        fixture.detectChanges();
        const [option] = options();
        option.click();
        await fixture.whenStable();
        expect(option.querySelector('input')).toBeChecked();
        expect(buttonsByName('Add')[0].nativeElement).not.toBeDisabled();

        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        await fixture.whenStable();

        expect(option).toHaveAttribute('aria-disabled', 'true');
        expect(option).toHaveAttribute('aria-selected', 'false');
        expect(option).not.toHaveClass('active');
        expect(option.querySelector('input')).not.toBeChecked();
        expect(buttonsByName('Add')[0].nativeElement).toBeDisabled();
      });

      it.each([false, true])(
        'should not add a stale selection after reaching the limit with multiSelect=%s',
        async multiSelect => {
          setWidgets([limitedWidget], mode);
          fixture.componentRef.setInput('multiSelect', multiSelect);
          fixture.detectChanges();
          if (multiSelect) {
            options()[0].click();
            await fixture.whenStable();
          }
          const closed = vi.fn();
          component.closed.subscribe(closed);
          const addButton = buttonsByName('Add')[0].nativeElement as HTMLButtonElement;
          expect(addButton).not.toBeDisabled();

          widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
          addButton.click();
          await fixture.whenStable();

          expect(closed).not.toHaveBeenCalled();
          expect(addButton).toBeDisabled();
        }
      );

      it('should enable a limited widget when an instance is removed', async () => {
        setWidgets([limitedWidget], mode);
        widgetInstances$.next([{ id: 'limited-instance', widgetId: limitedWidget.id }]);
        fixture.detectChanges();
        expect(options()[0]).toHaveAttribute('aria-disabled', 'true');

        widgetInstances$.next([]);
        await fixture.whenStable();

        expect(options()[0]).toHaveAttribute('aria-disabled', 'false');
        expect(options()[0].querySelector('si-badge')).toBeNull();
      });

      it('should disable Add when the widget reaches its limit while its editor is open', async () => {
        setWidgets([{ ...TEST_WIDGET, maxInstances: 1 }], mode);
        fixture.detectChanges();
        buttonsByName('Next')[0].nativeElement.click();
        await fixture.whenStable();
        expect(buttonsByName('Add')[0].nativeElement).not.toBeDisabled();

        widgetInstances$.next([{ id: 'test-instance', widgetId: TEST_WIDGET.id }]);
        await fixture.whenStable();

        expect(buttonsByName('Add')[0].nativeElement).toBeDisabled();
      });
    });

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

      it('with undefined should not filter visible widgets', () => {
        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'some');
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(0);

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', undefined);
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(3);
      });

      it('with case-insensitive matching string should filter visible widgets', () => {
        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'WEI');
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(1);
      });

      it('with empty string should not filter visible widgets', () => {
        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'some');
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(0);

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', '   ');
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(3);
      });

      it('shall keep the search term and result after clicking `Next` to widget editor and `Previous` to catalog', async () => {
        expect(buttonsByName('Next')).toHaveLength(0);

        vi.useFakeTimers();
        let searchInput = fixture.nativeElement.querySelector('si-search-bar input')!;
        searchInput.value = 'zwei';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const searchBarEl = fixture.debugElement.query(By.css('si-search-bar'));
        const searchBarComponent = searchBarEl.componentInstance as SiSearchBarComponent;
        const debounceTime = searchBarComponent.debounceTime();
        await vi.advanceTimersByTimeAsync(debounceTime);
        fixture.detectChanges();
        vi.useRealTimers();

        expect(buttonsByName('Next')).toHaveLength(1);
        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(1);

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
      'WIDGET.DESCRIPTION_KEY': 'Translated Widget Description',
      'WIDGET.BADGE_KEY': 'Translated Widget Badge',
      'DASHBOARD.WIDGET_LIBRARY.ADDED': 'Already added'
    };

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TestingModule, SiWidgetCatalogComponent],
        providers: [
          { provide: ModalRef, useValue: new ModalRef() },
          dashboardProvider,
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

      it(`should display translated widget name, badge and description (${mode})`, () => {
        setWidgets(
          [
            {
              ...createTestingWidget('WIDGET.NAME_KEY', 'translatable-1'),
              description: 'WIDGET.DESCRIPTION_KEY',
              badge: 'WIDGET.BADGE_KEY'
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
        expect(listItems[0].query(By.css('si-badge')).nativeElement).toHaveTextContent(
          'Translated Widget Badge'
        );
      });

      it(`should translate the built-in added badge (${mode})`, () => {
        setWidgets(
          [{ ...createTestingWidget('Limited widget', 'limited'), maxInstances: 1 }],
          mode
        );
        widgetInstances$.next([{ id: 'limited-instance', widgetId: 'limited' }]);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('si-badge')).nativeElement).toHaveTextContent(
          'Already added'
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

        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(2);

        fixture.debugElement
          .query(By.css('si-search-bar'))
          .triggerEventHandler('searchChange', 'Translated');
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.list-item'))).toHaveLength(1);
        expect(
          fixture.debugElement.query(By.css('.list-item .list-item-title')).nativeElement
        ).toHaveTextContent('Translated Widget Name');
      });
    });
  });
});
