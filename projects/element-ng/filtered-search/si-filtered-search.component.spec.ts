/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader, parallel, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  provideZonelessChangeDetection,
  signal,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule, provideNoopAnimations } from '@angular/platform-browser/animations';
import { CriterionDefinition } from '@siemens/element-ng/filtered-search';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, of } from 'rxjs';
import type { Mock } from 'vitest';

import {
  DisplayedCriteriaEventArgs,
  OptionCriterion,
  OptionType,
  SearchCriteria,
  SiFilteredSearchComponent
} from './index';
import { SiFilteredSearchCriterionHarness } from './testing/si-filtered-search-criterion.harness';
import { SiFilteredSearchHarness } from './testing/si-filtered-search.harness';

@Component({
  imports: [SiFilteredSearchComponent],
  template: ` <si-filtered-search
    searchLabel="search"
    [disabled]="disabled"
    [disableFreeTextSearch]="disableFreeTextSearch"
    [freeTextCriterion]="freeTextCriterion"
    [readonly]="readonly"
    [placeholder]="placeholder"
    [lazyLoadingDebounceTime]="lazyLoadingDebounceTime"
    [lazyCriterionProvider]="lazyCriterionProvider"
    [lazyValueProvider]="lazyValueProvider"
    [exclusiveCriteria]="exclusiveCriteria"
    [strictCriterion]="strictCriterion"
    [strictValue]="strictValue"
    [maxCriteria]="maxCriteria"
    [typeaheadOptionsLimit]="typeaheadOptionsLimit"
    [doSearchOnInputChange]="doSearchOnInputChange"
    [onlySelectValue]="onlySelectValue"
    [disableSelectionByColonAndSemicolon]="disableSelectionByColonAndSemicolon"
    [criteria]="criteria()"
    [itemCountText]="itemCountText"
    [(searchCriteria)]="searchCriteria"
    (doSearch)="doSearch($event)"
    (searchCriteriaChange)="searchCriteriaChange($event)"
    (interceptDisplayedCriteria)="showCriteria($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly filteredSearch = viewChild.required(SiFilteredSearchComponent);
  disabled!: boolean;
  disableFreeTextSearch = false;
  freeTextCriterion?: CriterionDefinition;
  readonly!: boolean;
  placeholder = '';

  // eslint-disable-next-line @angular-eslint/prefer-signals
  searchCriteria = signal<SearchCriteria>({
    criteria: [],
    value: ''
  });
  readonly criteria = signal<CriterionDefinition[]>([]);
  lazyLoadingDebounceTime = 0;
  lazyCriterionProvider: any;
  lazyValueProvider: any;
  exclusiveCriteria!: boolean;
  strictCriterion = false;
  strictValue!: boolean;
  maxCriteria!: number;
  typeaheadOptionsLimit!: number;
  doSearchOnInputChange = false;
  onlySelectValue = false;
  disableSelectionByColonAndSemicolon = false;
  itemCountText = '{{itemCount}} items';
  cdRef = inject(ChangeDetectorRef);

  doSearch(event: SearchCriteria): void {}

  logEvent(event: any): void {}

  showCriteria(event: DisplayedCriteriaEventArgs): void {}

  searchCriteriaChange(event: SearchCriteria): void {}
}

describe('SiFilteredSearchComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const tick = async (ms = 100): Promise<void> => {
    vi.advanceTimersByTime(ms);
    await fixture.whenStable();
  };

  describe('idempotence criteria order', () => {
    it('should idempotence criteria order for date', async () => {
      component.criteria.set([
        {
          name: 'date',
          label: 'Date',
          validationType: 'date',
          datepickerConfig: {}
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'date', value: '2020-08-28' }],
        value: ''
      });

      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      const criterion = criteria[0];
      expect(await criterion.label()).toEqual('Date');
      expect(await (await criterion.value())?.text()).toEqual('8/28/2020');
    });
  });

  describe('with placeholder', () => {
    it('should not show by default', async () => {
      const freeTextSearch = await (
        await loader.getHarness(SiFilteredSearchHarness)
      ).freeTextSearch();
      expect(await freeTextSearch.getPlaceholder()).toEqual('');
    });

    it('should display custom text if set', async () => {
      component.placeholder = 'Search';
      const freeTextSearch = await (
        await loader.getHarness(SiFilteredSearchHarness)
      ).freeTextSearch();
      expect(await freeTextSearch.getPlaceholder()).toBe('Search');
    });
  });

  describe('with clear all', () => {
    it('should not show button when empty', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      expect(await filteredSearch.clearButtonVisible()).toBeFalsy();
    });

    it('should not show button when in read-only mode', async () => {
      component.readonly = true;
      component.searchCriteria.set({ criteria: [], value: 'TEXT_KEY' });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      expect(await filteredSearch.clearButtonVisible()).toBeFalsy();
    });

    it('should delete current criterion and edit last one', async () => {
      const spy = vi.spyOn(component, 'doSearch');
      component.searchCriteria.set({
        criteria: [
          { name: 'foo', value: 'bar' },
          { name: 'foo1', value: 'bar1' }
        ],
        value: ''
      });

      let criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);

      expect(await criteria[0].label()).toEqual('foo');
      expect(await (await criteria[0].value())?.text()).toEqual('bar');
      expect(await criteria[1].label()).toEqual('foo1');
      expect(await (await criteria[1].value())?.text()).toEqual('bar1');

      await criteria[1].clickClearButton();

      criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      expect(criteria).toHaveLength(1);
      expect(await criteria[0].label()).toEqual('foo');
      expect(await (await criteria[0].value())?.text()).toEqual('bar');
      expect(spy).toHaveBeenCalledWith({
        criteria: [{ name: 'foo', value: 'bar' }],
        value: ''
      });
    });

    it('should reset searchCriteria and publish related events', async () => {
      component.searchCriteria.set({ criteria: [{ name: 'foo', value: 'bar' }], value: 'value' });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      expect(await filteredSearch.getCriteria()).toHaveLength(1);
      await filteredSearch.clickClearButton();
      expect(await filteredSearch.getCriteria()).toHaveLength(0);
      expect(await filteredSearch.freeTextSearch().then(freeText => freeText.getValue())).toEqual(
        ''
      );
      expect(component.filteredSearch().searchCriteria()).toEqual({ criteria: [], value: '' });
      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [],
        value: ''
      });
    });
  });

  describe('with delete criterion', () => {
    beforeEach(() => {
      component.searchCriteria.set({ criteria: [{ name: 'foo', value: 'bar' }], value: '' });
    });

    it('should not show button when in read-only mode', async () => {
      component.readonly = true;

      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      expect(await criteria[0].clearButtonVisible()).toBeFalsy();
    });

    it('should clear criterion when clicked', async () => {
      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      expect(criteria).toHaveLength(1);
      await criteria[0].clickClearButton();
      expect(await loader.getAllHarnesses(SiFilteredSearchCriterionHarness)).toHaveLength(0);
    });

    it('should clear input value if clear is pressed while criterion is active', async () => {
      // Having an option used to be responsible for preventing the criterion text to be cleared.
      component.criteria.set([{ name: 'foo', options: [{ value: 'bar', label: 'Bar' }] }]);
      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      expect(criteria).toHaveLength(1);
      await criteria[0].clickLabel();
      expect(await criteria[0].value().then(value => value?.getValue())).toBe('Bar');
      await criteria[0].clickClearButton();
      expect(criteria).toHaveLength(1);
      expect(await criteria[0].value().then(value => value?.getValue())).toBe('');
      const harness = await loader.getHarness(SiFilteredSearchHarness);
      await harness.freeTextSearch().then(search => search.focus());
      expect(await criteria[0].value().then(value => value?.text())).toBe('');
    });
  });

  describe('with lazy loaded category values', () => {
    beforeEach(() => {
      component.lazyLoadingDebounceTime = 0;
      component.lazyCriterionProvider = vi.fn().mockReturnValue(
        of([
          { name: 'foo', label: 'Foo', options: ['foo1', 'bar1'] },
          { name: 'bar', label: 'Bar' },
          {
            name: 'withOptions',
            label: 'WithOptions',
            options: [
              { value: '0', label: 'first' },
              { value: '1', label: 'second' }
            ]
          }
        ])
      );
    });

    it('should invoke lazy loading provider on free text search focus', async () => {
      const spy = vi.fn().mockReturnValue(of([{ name: 'foo' }]));
      component.lazyCriterionProvider = spy;
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      spy.mockClear();

      for (const times of [1, 2, 3]) {
        await freeTextSearch.focus();
        expect(component.lazyCriterionProvider).toHaveBeenCalledTimes(times);
        await freeTextSearch.blur();
      }
    });

    it('should invoke lazy loading provider with free text value on focus', async () => {
      const spy = vi.fn().mockReturnValue(of([{ name: 'foo' }]));
      component.lazyCriterionProvider = spy;
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.typeText('Fo');
      expect(component.lazyCriterionProvider).toHaveBeenCalledWith(
        'Fo',
        component.filteredSearch().searchCriteria()
      );
      spy.mockClear();
      await freeTextSearch.blur();
      await freeTextSearch.focus();
      expect(component.lazyCriterionProvider).toHaveBeenCalledWith(
        'Fo',
        component.filteredSearch().searchCriteria()
      );
    });

    it('should show typeahead with criteria when search text is entered', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.typeText('Fo');
      await tick();
      const items = await freeTextSearch.getItems();
      expect(items).toHaveLength(1);
    });

    it('should invoke lazy loading provider with parameter', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.typeText('Fo');
      expect(component.lazyCriterionProvider).toHaveBeenCalledWith(
        'Fo',
        component.filteredSearch().searchCriteria()
      );
    });

    it('should display criterion options for lazyCriterionProvider', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.typeText('Fo');
      await tick();
      await freeTextSearch.select({ text: 'Foo' });
      await tick();

      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.focus();
      const items = await criteriaValue?.getItemLabels();
      expect(items).toHaveLength(2);
    });

    it('should display criterion label in input', async () => {
      component.logEvent = vi.fn().mockImplementation(searchCriteria => {
        component.searchCriteria = searchCriteria;
      });

      // Select criterion
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await tick();
      await freeTextSearch.select({ text: 'WithOptions' });

      await tick();

      const criterion = (await filteredSearch.getCriteria({ labelText: 'WithOptions' })).at(0);
      const criterionValue = await criterion?.value();
      await criterionValue?.focus();
      await criterionValue?.select({ text: 'first' });
      await tick();
      expect(await freeTextSearch.isFocused()).toBe(true);

      await criterionValue?.click();
      expect(await criterionValue?.getValue()).toEqual('first');
    });

    it('should show all criteria options using pressing Backspace to delete the input value', async () => {
      component.searchCriteria.set({ criteria: [{ name: 'foo', value: 'foo1' }], value: '' });
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criterion = (await filteredSearch.getCriteria()).at(0);
      const criteriaValue = await criterion?.value();
      await criteriaValue?.click();
      /* Simulate pressing backspace to remove the entire input field value */
      await criteriaValue?.sendKeys(TestKey.BACKSPACE);
      await criteriaValue?.clearText();
      await tick();
      expect(await criteriaValue?.getItemLabels()).toEqual(['foo1', 'bar1']);
    });

    it('should update values after criterion change', async () => {
      const criterionProvider = new BehaviorSubject<CriterionDefinition[]>([]);
      component.lazyCriterionProvider = () => criterionProvider;
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();

      criterionProvider.next([{ name: 'foo', label: 'Foo', options: ['foo1', 'foo2'] }]);
      await freeTextSearch.typeText('oo');
      await tick();
      await freeTextSearch.select({ text: 'Foo' });
      await tick();
      const [criterion] = await filteredSearch.getCriteria({ labelText: 'Foo' });
      await criterion.clickLabel();
      expect(await criterion.value().then(value => value?.getItemLabels())).toEqual([
        'foo1',
        'foo2'
      ]);
      await criterion.value().then(value => value?.select({ text: 'foo2' }));
      await tick();
      criterionProvider.next([{ name: 'foo', label: 'Foo', options: ['foo3'] }]);
      // TODO: it should immediately update the values.
      await freeTextSearch.focus();
      await tick();
      await criterion.clickLabel();
      await criterion.value().then(value => value?.clearText());
      await tick();
      expect(await criterion.value().then(value => value?.getItemLabels())).toEqual(['foo3']);
    });
  });

  describe('with lazy loaded values', () => {
    beforeEach(() => {
      component.criteria.set([
        { name: 'foo', label: 'Foo' },
        { name: 'bar', label: 'Bar' }
      ]);
      component.lazyValueProvider = vi.fn().mockReturnValue(of(['Foo', 'Bar']));
      component.searchCriteria.set({
        criteria: [{ name: 'foo', value: 'Foo' }],
        value: ''
      });
    });

    it('should invoke lazy loading provider', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const value = await criteria[0].value();
      await value?.click();
      await tick();
      expect(component.lazyValueProvider).toHaveBeenCalledWith('foo', 'Foo');
    });

    it('should invoke lazy loading provider with parameter', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const value = await criteria[0].value();
      await value?.click();
      await value?.clearText();
      await value?.sendKeys('Fo');
      await tick();
      expect(component.lazyValueProvider).toHaveBeenCalledWith('foo', 'Fo');
    });

    it('should check lazy loaded values', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.clearText();
      await criteriaValue?.sendKeys('Fo');
      await tick();
      expect(component.lazyValueProvider).toHaveBeenCalledWith('foo', 'Fo');

      const items = await criteriaValue?.getItemLabels();
      expect(items).toEqual(['Foo']);

      component.criteria.set([
        { name: 'foo', label: 'Foo' },
        { name: 'bar', label: 'Bar' },
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      component.searchCriteria.set({ criteria: [{ name: 'location', value: '' }], value: '' });

      const newCriteriaValue = await filteredSearch.getCriteria().then(c => c[0].value());
      await newCriteriaValue!.click();
      await newCriteriaValue!.focus();
      await tick();
      expect(component.lazyValueProvider).toHaveBeenCalledWith('location', '');
    });

    it('should show selected criterion on label click', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true
        }
      ]);
      component.searchCriteria.set({ criteria: [{ name: 'location', value: ['Bar'] }], value: '' });
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      await criteria[0].clickLabel();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await tick();
      expect(await criteriaValue?.getItemLabels({ isSelected: true })).toEqual(['Bar']);
    });
  });

  describe('with lazy loaded values and optiontype as return type', () => {
    beforeEach(() => {
      component.criteria.set([
        { name: 'foo', label: 'Foo' },
        { name: 'bar', label: 'Bar' }
      ]);
      component.lazyValueProvider = vi.fn().mockReturnValue(
        of([
          { value: 'fO', label: 'Foo' },
          { value: 'BR', label: 'Bar' }
        ])
      );
      component.searchCriteria.set({
        criteria: [{ name: 'foo', value: '' }],
        value: ''
      });
      component.doSearchOnInputChange = true;
      fixture.detectChanges();
    });

    it('should emit selected optionType value ', async () => {
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.focus();
      await tick();

      expect(component.lazyValueProvider).toHaveBeenCalledWith('foo', '');

      const spy = vi.spyOn(component, 'doSearch');
      await criteriaValue?.select({ text: 'Foo' });
      await tick();

      expect(spy).toHaveBeenCalledWith({
        criteria: [{ name: 'foo', value: 'fO' }],
        value: ''
      });
    });
  });

  describe('with date and datetime criteria', () => {
    it('should modify date value when datepicker consider time has changed', async () => {
      component.criteria.set([
        {
          name: 'Alarm',
          label: 'Alarm',
          validationType: 'date-time',
          operators: ['=', '≤', '≥'],
          datepickerConfig: {
            showTime: true,
            showMinutes: true,
            showSeconds: true,
            showMilliseconds: false,
            mandatoryTime: false,
            disabledTime: false
          }
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'Alarm', operator: '≥', value: '2020-08-28 08:30:00' }],
        value: ''
      });

      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      const criterion = criteria[0];
      const criterionValue = await criterion.value();
      await criterionValue?.click();

      expect(await criterionValue?.getValue()).toContain('8/28/2020, 8:30:00 AM');
      (await (await criterionValue?.datepicker())?.considerTimeSwitch())?.toggle();
      expect(await criterionValue?.getValue()).toContain('8/28/2020');
    });

    it('should change active editor on keyboard tab', async () => {
      component.criteria.set([
        {
          name: 'Alarm',
          label: 'Alarm',
          validationType: 'date-time',
          operators: ['=', '≤', '≥'],
          datepickerConfig: {
            showTime: true,
            showMinutes: true,
            showSeconds: true,
            showMilliseconds: false,
            mandatoryTime: false,
            disabledTime: false
          }
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'Alarm', operator: '≥', value: '2020-08-28 08:30:00' }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criterion = criteria[0];
      const criterionValue = await criterion.value();
      await criterionValue?.click();
      await tick();

      // Date Time keyboard interactions
      await criterionValue?.sendKeys(TestKey.BACKSPACE);

      vi.useRealTimers();
      // needed to avoid flaky test
      await new Promise(resolve => setTimeout(resolve, 0));
      vi.useFakeTimers();

      await filteredSearch.freeTextSearch().then(async freeTextSearch => {
        await freeTextSearch.focus();
      });
      await tick();

      expect(await criterionValue?.isEditable()).toBeFalsy();
    });

    it('should focus next input on enter', async () => {
      component.criteria.set([
        {
          name: 'Alarm',
          label: 'Alarm',
          validationType: 'date',
          operators: ['=', '≤', '≥']
        }
      ]);
      component.searchCriteria.set({
        criteria: [
          { name: 'Alarm', operator: '≥', value: '2020-08-28' },
          { name: 'Alarm', operator: '≥', value: '2020-08-29' }
        ],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criterionValue = await criteria[0].value();
      await criterionValue?.click();
      await tick();
      await criterionValue?.sendKeys(TestKey.ENTER);
      await tick();
      const operator2 = await criteria[1].operator();
      expect(await operator2!.hasFocs()).toBe(true);
      await operator2!.sendKeys(TestKey.ENTER);
      const value2 = await criteria[1].value();
      expect(await value2!.hasFocs()).toBe(true);
      await value2!.sendKeys(TestKey.ENTER);
      expect(
        await filteredSearch.freeTextSearch().then(freeTextSearch => freeTextSearch.isFocused())
      ).toBe(true);
    });

    it('should be able to enter date with keyboard', async () => {
      component.criteria.set([
        {
          name: 'Alarm',
          label: 'Alarm',
          validationType: 'date',
          operators: ['=', '≤', '≥']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'Alarm', operator: '≥', value: '1999-08-28' }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criterionValue = (await criteria[0].value())!;
      await criterionValue.click();

      await criterionValue.setValue('8/28/1'); // does not trigger input event
      await criterionValue.sendKeys('9');

      await criterionValue.sendKeys(TestKey.ENTER);
      expect(await criterionValue.text()).toBe('8/28/2019');
    });

    it('should be possible to enter date with mouse', async () => {
      component.criteria.set([
        {
          name: 'Alarm',
          label: 'Alarm',
          validationType: 'date'
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'Alarm', operator: '≥', value: '1999-08-28' }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criterionValue = (await criteria[0].value())!;
      await criterionValue.click();
      await tick();
      const datepicker = await criterionValue.datepicker();
      await datepicker!.next();
      await datepicker!.selectCell({ text: '13' });
      await criterionValue.sendKeys(TestKey.ESCAPE);
      expect(await criterionValue.isEditable()).toBe(true);
      expect(await criterionValue.getValue()).toBe('9/13/1999');
      await criterionValue.blur();
      await tick();
      expect(await criterionValue.isEditable()).toBe(false);
      expect(await criterionValue.text()).toBe('9/13/1999');
    });
  });

  describe('with strict criterion mode', () => {
    it('should throw error if no criteria defined', () => {
      component.strictCriterion = true;
      component.cdRef.markForCheck();
      expect(() => fixture.detectChanges()).toThrowError(
        'strict criterion mode activated without predefined criteria!'
      );
    });
  });

  it('should trigger search when button is pressed', async () => {
    const spy = vi.spyOn(component, 'doSearch');
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await freeTextSearch.typeText('test-search');
    await filteredSearch.clickSearchButton();
    expect(spy).toHaveBeenCalledWith({ criteria: [], value: 'test-search' });
  });

  it('should trigger search if enter is pressed with no open typeahead', async () => {
    const spy = vi.spyOn(component, 'doSearch');
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await freeTextSearch.typeText('');
    await freeTextSearch.sendKeys(TestKey.ENTER);
    expect(spy).toHaveBeenCalledWith({ criteria: [], value: '' });
  });

  it('should trigger search if no value is selected', async () => {
    component.criteria.set([{ name: 'company', label: 'Company', options: ['Foo', 'Bar'] }]);
    const spy = vi.spyOn(component, 'doSearch');
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    expect(await freeTextSearch.getItems()).toHaveLength(1);
    await freeTextSearch.sendKeys(TestKey.ENTER);
    expect(spy).toHaveBeenCalledWith({ criteria: [], value: '' });
  });

  it('should not trigger search if enter is pressed on input with value', async () => {
    component.criteria.set([{ name: 'company', label: 'Company', options: ['Foo', 'Bar'] }]);
    const spy = vi.spyOn(component, 'doSearch');
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    await freeTextSearch.sendKeys(TestKey.DOWN_ARROW, TestKey.ENTER);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not crash when searchCriteria is set to undefined', async () => {
    expect(() => {
      // The type does not allow any, but we can handle it.
      component.searchCriteria.set(undefined as any);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should contain correct typeahead content', async () => {
    component.criteria.set([
      { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
      { name: 'Name' }
    ]);
    component.searchCriteria.set({
      criteria: [],
      value: ''
    });

    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    const labels = await freeTextSearch.getItems();
    expect(labels).toEqual(['Company', 'Name']);
  });

  it('should update typeahead with newly assigned criteria', async () => {
    component.criteria.set([]);
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    // Should not show a typeahead
    expect(await freeTextSearch.getItems()).toBe(null);
    // Update the criteria while the user focused the free text input
    component.criteria.set([{ name: 'company', label: 'Company' }, { name: 'Name' }]);

    const labels = await freeTextSearch.getItems();
    expect(labels).toEqual(['Company', 'Name']);
  });

  it('with disableFreeTextSearch should contain no matching notice in typeahead dropdown', async () => {
    component.disableFreeTextSearch = true;
    component.criteria.set([
      { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
      { name: 'Name' }
    ]);

    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.typeText('bla');
    expect(await freeTextSearch.getItems()).toBeNull();
  });

  it('should only show non-selected criteria in typeahead if exclusive criteria is enabled', async () => {
    component.exclusiveCriteria = true;
    component.criteria.set([
      { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
      { name: 'Name' },
      { name: 'Age' }
    ]);
    component.searchCriteria.set({ value: '', criteria: [{ name: 'Name', value: 'Bob' }] });
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    await freeTextSearch.select({ text: 'Company' });
    await tick();
    const [criteria] = await filteredSearch.getCriteria({ labelText: 'Company' });
    await criteria.value().then(value => value!.select({ text: 'Foo' }));
    await freeTextSearch.focus();
    await tick();
    expect(await freeTextSearch.getItems()).toEqual(['Age']);
    await criteria.clickClearButton();
    expect(await freeTextSearch.getItems()).toEqual(['Company', 'Age']);
    await filteredSearch.clickClearButton();
    expect(await freeTextSearch.getItems()).toEqual(['Company', 'Name', 'Age']);
  });

  it('should show all criteria in typeahead if exclusive criteria is enabled and criteria changes externally', async () => {
    component.exclusiveCriteria = true;
    component.criteria.set([
      { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
      { name: 'Name' },
      { name: 'Age' }
    ]);
    component.searchCriteria.set({ value: '', criteria: [] });
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    expect(await freeTextSearch.getItems()).toEqual(['Company', 'Name', 'Age']);
    await freeTextSearch.select({ text: 'Company' });
    await tick();
    const [criteria] = await filteredSearch.getCriteria({ labelText: 'Company' });
    await criteria.value().then(value => value!.select({ text: 'Foo' }));
    // reset input
    component.searchCriteria.set({ value: '', criteria: [] });
    // see if all criteria are available again
    await freeTextSearch.focus();
    await tick();
    expect(await freeTextSearch.getItems()).toEqual(['Company', 'Name', 'Age']);
  });

  it('should display typeahead options with icon', async () => {
    component.criteria.set([
      {
        name: 'test-result',
        label: 'Test-Result',
        options: [
          { value: 'passed', label: 'Passed', iconClass: 'element-ok-filled' },
          { value: 'failed', label: 'Failed', iconClass: 'element-cancel-filled' },
          { value: 'not-tested', label: 'Not tested', iconClass: 'element-issue-filled' }
        ]
      }
    ]);
    component.searchCriteria.set({ criteria: [{ name: 'test-result' }], value: '' });
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const criteria = await filteredSearch.getCriteria();
    const criterionValue = await criteria[0].value();
    await criterionValue?.click();
    await criterionValue?.focus();
    await tick();
    const items = (await criterionValue?.getItems()) ?? [];
    expect(items).toHaveLength(3);
    const icons = await parallel(() => items?.map(async i => await i.icon()));
    expect(await icons[0]?.hasClass('element-ok-filled')).toBeTruthy();
    expect(await icons[1]?.hasClass('element-cancel-filled')).toBeTruthy();
    expect(await icons[2]?.hasClass('element-issue-filled')).toBeTruthy();
  });

  it('should have same height within criteria', async () => {
    component.criteria.set([
      {
        name: 'test-operator',
        operators: [' ', 'ignored']
      },
      {
        name: 'test-multi',
        multiSelect: true
      }
    ]);
    component.searchCriteria.set({
      criteria: [
        { name: 'test-unknown' },
        { name: 'test-operator', operator: 'ignored', value: '' },
        { name: 'test-operator', operator: ' ', value: 't' },
        { name: 'test-multi', operator: '', value: [] }
      ],
      value: ''
    });
    runOnPushChangeDetection(fixture);

    const criteria = Array.from(element.querySelectorAll('.criteria'));
    const heights = criteria.map(c => c.getBoundingClientRect().height);
    expect(new Set(heights)).toHaveLength(1);
  });

  describe('multi select scenarios', () => {
    it('should present preloaded values correctly', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      component.searchCriteria.set({
        criteria: [
          { name: 'location', value: ['Munich', 'Zug'] },
          { name: 'location', value: 'Hamburg' }
        ],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const value = await (await criteria[0].value())?.text();

      expect(value).toBe('2 items');
    });

    it('should show a checkbox if that is expected', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      component.searchCriteria.set({
        criteria: [
          { name: 'location', value: ['Munich', 'Zug'] },
          { name: 'location', value: 'Hamburg' }
        ],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      await criteria[0].clickLabel();
      await tick();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.focus();

      expect(await criteriaValue?.getItemLabels({ isSelected: true })).toEqual(['Munich', 'Zug']);
      expect(await criteriaValue?.getItemLabels({ isSelected: false })).toEqual([
        'Lünen',
        'Karlsruhe'
      ]);

      await criteriaValue?.select({ text: 'Karlsruhe' });
      expect(await criteriaValue?.getItemLabels({ isSelected: true })).toEqual([
        'Karlsruhe',
        'Munich',
        'Zug'
      ]);
    });

    it('should initialize searchCriteria with empty array', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        {
          name: 'country',
          label: 'C',
          multiSelect: true,
          options: [
            { value: 'DE', label: 'Germany' },
            { value: 'CH', label: 'Switzerland' }
          ]
        }
      ]);
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await tick();
      await freeTextSearch.select(-1);
      await freeTextSearch.sendKeys(TestKey.ENTER);
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [{ name: 'country', value: [] }],
        value: ''
      });
    });

    it('should select value', async () => {
      component.criteria.set([
        {
          name: 'country',
          label: 'C',
          multiSelect: true,
          options: [
            { value: 'DE', label: 'Germany' },
            { value: 'CH', label: 'Switzerland' }
          ]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'country' }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criterion = (await filteredSearch.getCriteria()).at(0);
      const criteriaValue = await criterion?.value();
      await criteriaValue?.click();
      await criteriaValue?.focus();
      await tick();
      await criteriaValue?.select({ text: 'Switzerland' });
      await filteredSearch.freeTextSearch().then(freeTextSearch => freeTextSearch.focus());
      await tick();
      expect(await criteriaValue?.text()).toBe('Switzerland');
    });

    it('should deselect all values when the user click the cancel button', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: ['Munich', 'Zug'] }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criterion = (await filteredSearch.getCriteria()).at(0)!;
      await criterion.clickLabel();
      await tick();
      const criterionValue = (await criterion.value())!;
      expect(await criterionValue.getItems({ isSelected: false })).toHaveLength(2);
      await criterion.clickClearButton();
      expect(await criterionValue.hasFocs()).toBe(true);
      expect(await criterionValue.getItems({ isSelected: false })).toHaveLength(4);

      expect(component.filteredSearch().searchCriteria()).toEqual({
        criteria: [expect.objectContaining({ name: 'location', value: [] })],
        value: ''
      });
    });

    it('should deselect matching value via keyboard', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: ['Munich', 'Zug'] }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criterion = (await filteredSearch.getCriteria()).at(0);
      const criteriaValue = await criterion?.value();
      await criteriaValue?.click();
      await criteriaValue?.focus();
      await criteriaValue?.sendKeys('Z');
      await tick();
      await criteriaValue?.sendKeys(TestKey.ENTER);

      expect(component.filteredSearch().searchCriteria()).toEqual({
        criteria: [expect.objectContaining({ name: 'location', value: ['Munich'] })],
        value: ''
      });
    });

    it('should select matching value via keyboard', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: ['Munich', 'Zug'] }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criterion = (await filteredSearch.getCriteria()).at(0);
      const criteriaValue = await criterion?.value();
      await criteriaValue?.click();
      await criteriaValue?.focus();
      await criteriaValue?.clearText();
      await criteriaValue?.sendKeys('K');
      await tick();
      await criteriaValue?.sendKeys(TestKey.ENTER);
      expect(component.searchCriteria()).toEqual({
        criteria: [
          expect.objectContaining({ name: 'location', value: ['Munich', 'Zug', 'Karlsruhe'] })
        ],
        value: ''
      });
    });

    it('should restore user selection when the user focus the criterion value', async () => {
      component.criteria.set([
        {
          name: 'location',
          label: 'Location',
          multiSelect: true,
          options: ['Lünen', 'Karlsruhe', 'Munich', 'Zug']
        }
      ]);
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await tick();
      await freeTextSearch.select({ text: 'Location' });
      await tick();
      const criterion = (await filteredSearch.getCriteria({ labelText: 'Location' })).at(0);
      const criteriaValue = await criterion?.value();
      await criteriaValue?.focus();
      await criteriaValue?.select({ text: 'Karlsruhe' });
      await criteriaValue?.select({ text: 'Zug' });
      await criteriaValue?.blur();
      await tick();
      await criteriaValue?.click();
      await tick();
      const items = (await criteriaValue?.getItems({ isSelected: true })) ?? [];
      const selected = await parallel(() => items?.map(async i => await i.getText()));
      expect(selected).toEqual(['Karlsruhe', 'Zug']);
    });
  });

  describe('searchCriteria', () => {
    it('should handle predefined text values correctly', async () => {
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      expect(criteria).toHaveLength(1);
      const criterion = criteria[0];
      expect(await criterion.label()).toBe('location');
      expect(await (await criterion.value())?.text()).toBe('Munich');
      const freeTextSearch = await filteredSearch.freeTextSearch();
      expect(await freeTextSearch.getValue()).toBe('Max');
    });

    it('should handle predefined date values correctly', async () => {
      component.criteria.set([
        { name: 'Birthday', label: 'Birthday', validationType: 'date', operators: ['=', '≤', '≥'] }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'Birthday', operator: '=', value: '1994-12-20' }],
        value: ''
      });

      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      const criteriaValue = await criteria[0].value();
      expect(await criteria[0].label()).toContain('Birthday');
      expect(await criteriaValue?.text()).toContain('12/20/1994');
    });

    it('should validate values and labels if strictValue is set', async () => {
      component.strictValue = true;
      component.criteria.set([
        { name: 'country', label: 'Country' },
        { name: 'location', label: 'Location', options: ['Munich'] }
      ]);
      component.searchCriteria.set({
        criteria: [
          { name: 'location', value: 'Munich' },
          { name: 'location', value: 'Zug' },
          { name: 'company', value: 'Munich' },
          { name: 'country', value: 'Ger' },
          { name: 'country', value: '' }
        ],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const invalidCriteria = await filteredSearch.getCriteria({ isValid: false });
      expect(invalidCriteria).toHaveLength(1);
      const invalidCriteriaLabels = await parallel(() =>
        invalidCriteria.map(async v => await v.label())
      );
      expect(invalidCriteriaLabels).toEqual(['company']);

      const invalidValueCriteria = await filteredSearch.getCriteria({ isValidValue: false });
      const invalidValues = await parallel(() =>
        invalidValueCriteria.map(async v => await (await v.value())?.text())
      );
      expect(invalidValues).toEqual(['Zug', '']);

      const validCriteria = await filteredSearch.getCriteria({ isValidValue: true });
      const validValues = await parallel(() =>
        validCriteria.map(async v => await (await v.value())?.text())
      );
      expect(validValues).toEqual(['Munich', 'Munich', 'Ger']);
    });

    it('should validate label names if strictCriterion is set', async () => {
      component.strictCriterion = true;
      component.criteria.set([{ name: 'location', label: 'Location', options: ['Munich'] }]);
      component.searchCriteria.set({
        criteria: [
          { name: 'location', value: 'Munich' },
          { name: 'location', value: 'Zug' },
          { name: 'company', value: 'Munich' }
        ],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const invalidCriteria = await filteredSearch.getCriteria({ isValid: false });
      const invalidCriteriaLabels = await parallel(() =>
        invalidCriteria.map(async v => await v.label())
      );
      expect(invalidCriteriaLabels).toEqual(['company']);
    });

    it('should validate selection from typeahad if strictCriterion is set', async () => {
      component.strictCriterion = true;
      component.criteria.set([{ name: 'location', label: 'Location', options: ['Munich', 'Zug'] }]);
      component.searchCriteria.set({ criteria: [], value: '' });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await tick();
      await freeTextSearch.select({ text: 'Location' });
      await tick();
      const [criteria] = await filteredSearch.getCriteria({ labelText: 'Location' });
      await criteria.value().then(value => value!.select({ text: 'zug' }));

      const invalidCriteria = await filteredSearch.getCriteria({ isValid: false });
      const invalidCriteriaLabels = await parallel(() =>
        invalidCriteria.map(async v => await v.label())
      );
      expect(invalidCriteriaLabels).toEqual([]);
    });

    it('should show all the options when onlySelectValue is true', async () => {
      component.onlySelectValue = true;
      component.criteria.set([
        {
          name: 'test-result',
          label: 'Test-Result',
          options: ['Passed', 'failed', 'not-tested']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'test-result', value: 'Passed' }],
        value: ''
      });
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criterionValue = await criteria[0].value();
      await criterionValue?.click();
      await criterionValue?.focus();
      await tick();
      const items = (await criterionValue?.getItems()) ?? [];

      const icons = await parallel(() => items?.map(async i => await i.getText()));
      expect(icons).toEqual(['Passed', 'failed', 'not-tested']);
    });

    it('should emit model change with free text search value', async () => {
      component.searchCriteria.set({
        criteria: [],
        value: 'Max'
      });
      vi.spyOn(component, 'searchCriteriaChange');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.typeText('te');
      await freeTextSearch.select({ text: 'Apply search criteria' });
      expect(component.searchCriteriaChange).toHaveBeenCalledWith({
        criteria: [],
        value: 'te'
      });
    });

    it('should update value label on criteria option change', async () => {
      // Changing the label of an option should effect the value label of a select criterion
      component.criteria.set([
        {
          name: 'option',
          label: 'Option',
          options: [
            { value: 'o1', label: 'option-1' },
            { value: 'o2', label: 'option-2' }
          ]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'option', value: 'o1' }],
        value: ''
      });
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      component.criteria()?.forEach((c: CriterionDefinition) => {
        c.options!.forEach((o: OptionType) => {
          (o as OptionCriterion).label = (o as OptionCriterion).label + 'changed';
        });
      });
      component.criteria.set([...component.criteria()!]);
      component.cdRef.markForCheck();
      const criteria = await filteredSearch.getCriteria();
      const criterionValue = await criteria[0].value();
      const value = await criterionValue?.text();

      expect(value).toEqual('option-1changed');
    });
  });

  describe('search criteria fallback label, criteria first in input sequence', () => {
    it('should check that searchCriteria label, when unspecified, fallbacks to existing criteria label', async () => {
      component.criteria.set([{ name: 'location', label: 'Location', options: ['Munich'] }]);
      component.searchCriteria.set({
        criteria: [
          { name: 'location', value: 'Munich' },
          { name: 'company', value: 'Munich' }
        ],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      expect(criteria).toHaveLength(2);
      expect(await criteria[0].label()).toBe('Location');
      expect(await (await criteria[0].value())?.text()).toBe('Munich');
      expect(await criteria[1].label()).toBe('company');
      expect(await (await criteria[1].value())?.text()).toBe('Munich');
    });
  });

  describe('search criteria fallback label, search criteria first in input sequence', () => {
    it('should check that searchCriteria label, when unspecified, fallbacks to existing criteria label', async () => {
      component.searchCriteria.set({
        criteria: [
          { name: 'location', value: 'Munich' },
          { name: 'company', value: 'Munich' }
        ],
        value: 'Max'
      });
      component.criteria.set([{ name: 'location', label: 'Location', options: ['Munich'] }]);

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      expect(criteria).toHaveLength(2);
      expect(await criteria[0].label()).toBe('Location');
      expect(await (await criteria[0].value())?.text()).toBe('Munich');
      expect(await criteria[1].label()).toBe('company');
      expect(await (await criteria[1].value())?.text()).toBe('Munich');
    });
  });

  describe('with `doSearchOnInputChange` set to true', () => {
    beforeEach(() => {
      component.doSearchOnInputChange = true;
    });

    it('should not display submit text', async () => {
      component.criteria.set([{ name: 'test' }]);

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.typeText('te');
      await tick();
      const items = await freeTextSearch.getItems();
      expect(items).toEqual(['test']);
    });

    it('should emit values while typing in the free text area', async () => {
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.typeText('bla');
      await tick();
      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [],
        value: 'bla'
      });
    });

    it('should emit values while typing in the typeahead part (criterion name and value)', async () => {
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      // Make second input field appear
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.clearText();
      await criteriaValue?.sendKeys('Zug');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [{ name: 'location', value: 'Zug' }],
        value: 'Max'
      });
    });

    it('and disableFreeTextSearch should emit criteria but no free text values while typing', async () => {
      component.disableFreeTextSearch = true;
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      // Make second input field appear
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.clearText();
      await criteriaValue?.sendKeys('Zug');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [{ name: 'location', value: 'Zug' }],
        value: ''
      });
    });

    it('should emit values when operator is selected in typeahead', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        {
          name: 'highLimit',
          label: 'High Limit [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'highLimit', operator: '>' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const criteria = await loader.getAllHarnesses(SiFilteredSearchCriterionHarness);
      await criteria[0].clickLabel();
      const operator = await criteria[0].operator();
      await operator?.clearText();
      await tick();
      await operator?.select({ text: '<' });
      await tick();
      expect(await criteria[0].value().then(value => value?.hasFocs())).toBe(true);

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [
          {
            name: 'highLimit',
            operator: '<',
            value: ''
          }
        ],
        value: 'Max'
      });
    });

    it('should not emit on submit', async () => {
      vi.spyOn(component, 'doSearch');
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      await filteredSearch.clickSearchButton();
      expect(component.doSearch).not.toHaveBeenCalled();
    });
  });

  it('should not emit values while typing in the free text area', async () => {
    vi.spyOn(component, 'doSearch');

    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.typeText('bla');
    expect(component.doSearch).not.toHaveBeenCalled();
  });

  it('should make criteria as empty if the maxCriteria value has already been met.', async () => {
    component.maxCriteria = 2;
    component.criteria.set([
      { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
      { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] }
    ]);
    component.searchCriteria.set({
      criteria: [
        { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
        { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] }
      ],
      value: ''
    });

    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    // check if typeahead does not have any criteria, since maxCriteria value is already met
    expect(await freeTextSearch.getItems()).toBeNull();
  });

  it('should not restrict typeahead on criteria.', async () => {
    component.maxCriteria = 2;
    component.typeaheadOptionsLimit = 0;
    component.criteria.set([
      { name: 'company', label: 'Company' },
      { name: 'location', label: 'Location' },
      { name: 'floor', label: 'Floor' },
      { name: 'section', label: 'Section' },
      ...Array.from({ length: 20 }).map((_val, index) => ({
        name: 'name ' + index,
        label: 'Name -' + index
      }))
    ]);

    // focus input.value-input to get typeahead content
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    const items = await freeTextSearch.getItems();
    expect(items).toHaveLength(24);
  });

  it('should restrict typeahead on criteria based on input.', async () => {
    component.maxCriteria = 20;
    component.typeaheadOptionsLimit = 10;
    component.criteria.set([
      { name: 'company', label: 'Company' },
      { name: 'location', label: 'Location' },
      { name: 'floor', label: 'Floor' },
      { name: 'section', label: 'Section' },
      ...Array.from({ length: 20 }).map((_val, index) => ({
        name: 'criteria ' + index,
        label: 'Crit -' + index
      }))
    ]);

    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    const items = await freeTextSearch.getItems();
    expect(items).toHaveLength(10);
  });

  it('should allow setting a custom value after an value option was selected', async () => {
    component.criteria.set([{ name: 'country', options: ['Germany'] }]);
    const spy = vi.spyOn(component, 'doSearch');
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeText = await filteredSearch.freeTextSearch();
    await freeText.focus();
    await tick();
    await freeText.select({ text: 'country' });
    await tick();
    const [criterion] = await filteredSearch.getCriteria();
    await criterion.clickLabel();
    await criterion.value().then(async value => {
      await value?.focus();
      await value?.select({ text: 'Germany' });
    });
    await filteredSearch.clickSearchButton();
    expect(spy).toHaveBeenCalledWith({
      value: '',
      criteria: [{ name: 'country', value: 'Germany' }]
    });
    await criterion.clickLabel();
    await criterion.value().then(async value => {
      await value!.focus();
      await value!.sendKeys('-North');
    });
    await filteredSearch.clickSearchButton();
    expect(spy).toHaveBeenCalledWith({
      value: '',
      criteria: [{ name: 'country', value: 'Germany-North' }]
    });
  });

  describe('with operator specified', () => {
    it('should contain correct typeahead content', async () => {
      component.criteria.set([
        {
          name: 'highLimit',
          label: 'High Limit [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'highLimit' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      await criteria[0].clickLabel();
      await tick();
      const operator = await criteria[0].operator();
      await operator?.focus();
      const items = await operator?.getItemLabels();
      expect(items).toEqual(['≠', '≤', '≥', '<', '>']);
    });

    it('should allow one to edit operators and focus preselected operator', async () => {
      component.criteria.set([
        {
          name: 'temperature',
          label: 'Temperature [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'temperature', operator: '≤', value: '20' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      await criteria[0].clickLabel();
      await tick();
      const operator = await criteria[0].operator();
      await operator?.focus();
      const activeItem = await operator?.getItemLabels({ isActive: true });
      expect(activeItem).toHaveLength(1);
      // Make sure the operator that is given as input is pre-selected
      expect(await activeItem![0]).toBe('≤');
    });
  });

  describe('with Keyboard interaction workflows', () => {
    it('should focus out of criterion after keyboard Enter (criterion value)', async () => {
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.sendKeys(TestKey.ENTER);

      // Skip test when browser is not focussed to prevent failures.
      if (document.hasFocus()) {
        const input = fixture.nativeElement.querySelector('input.value-input:focus');
        expect(input).toBeTruthy();
      }
    });

    it('should focus out of criterion after keyboard semicolon (criterion value)', async () => {
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const criteriaValue = await criteria[0].value();
      await criteriaValue?.click();
      await criteriaValue?.sendKeys(';');
      expect(
        await filteredSearch.freeTextSearch().then(freeTextSearch => freeTextSearch.isFocused())
      ).toBe(true);
    });

    it('should focus value field after keyboard Enter (operator field)', async () => {
      component.criteria.set([
        {
          name: 'highLimit',
          label: 'High Limit [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'highLimit', operator: '<' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      const operator = await criteria[0].operator();
      expect(operator).toBeTruthy();
      await operator?.click();
      await operator?.focus();
      // Skip test when browser is not focussed to prevent failures.
      await operator?.sendKeys(TestKey.ENTER);
      expect(await criteria[0].value().then(value => value?.hasFocs())).toBe(true);
    });

    it('should focus operator if backspace pressed in empty criterion value', async () => {
      component.criteria.set([
        {
          name: 'highLimit',
          label: 'High Limit [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'highLimit', label: 'High Limit [°C]', value: '123', operator: '>' }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria({ labelText: 'High Limit [°C]' });
      const value = await criteria[0].value();
      await value!.click();
      await value!.setValue('');
      await value!.sendKeys(TestKey.BACKSPACE);
      expect(await criteria[0].operator().then(operator => operator?.hasFocs())).toBe(true);
    });

    it('should delete criterion if backspace pressed in empty criterion value without operator', async () => {
      component.searchCriteria.set({
        criteria: [
          { name: 'first', value: '' },
          { name: 'second', value: '' }
        ],
        value: ''
      });
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const value = await filteredSearch
        .getCriteria({ labelText: 'first' })
        .then(criteria => criteria[0].value());
      await value!.click();
      await value!.sendKeys(TestKey.BACKSPACE);
      expect(await filteredSearch.getCriteria()).toHaveLength(1);
      const value2 = await filteredSearch
        .getCriteria({ labelText: 'second' })
        .then(criteria => criteria[0].value());
      await tick();
      expect(await value2!.hasFocs()).toBe(true);
      await value2!.sendKeys(TestKey.BACKSPACE);
      expect(
        await filteredSearch.freeTextSearch().then(freeTextSearch => freeTextSearch.isFocused())
      ).toBe(true);
      expect(await filteredSearch.getCriteria()).toHaveLength(0);
    });

    it('should delete criterion if backspace pressed in empty criterion operator', async () => {
      component.criteria.set([
        {
          name: 'highLimit',
          label: 'High Limit [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'highLimit', label: 'High Limit [°C]', value: '123', operator: '>' }],
        value: ''
      });
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const operator = await filteredSearch
        .getCriteria({ labelText: 'High Limit [°C]' })
        .then(criteria => criteria[0].operator());
      await operator!.click();
      await operator!.setValue('');
      await operator!.sendKeys(TestKey.BACKSPACE);
      expect(await filteredSearch.getCriteria()).toHaveLength(0);
    });

    it('should focus criteria value if backspace pressed in empty free search', async () => {
      component.doSearchOnInputChange = true;
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: ''
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.sendKeys(TestKey.BACKSPACE);
      const criteria = await filteredSearch.getCriteria({ labelText: 'location' });
      await tick();
      expect(await criteria[0].value().then(value => value?.hasFocs())).toBe(true);
    });

    it('should match criterion label after keyboard colon was pressed', async () => {
      component.exclusiveCriteria = true;
      component.doSearchOnInputChange = true;
      component.criteria.set([{ name: 'test', label: 'Location', options: [] }]);
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys('location:');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        value: '',
        criteria: [{ value: '', name: 'test' }]
      });
    });

    it('should match criterion option after keyboard semicolon was pressed', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([{ name: 'test', label: 'Location', options: [] }]);
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await tick();
      await freeTextSearch.select({ text: 'Location' });
      await tick();

      await filteredSearch
        .getCriteria()
        .then(criteria => criteria[0].value())
        .then(value => value!.sendKeys('Hannover;FreeText'));

      await tick();
      expect(component.doSearch).toHaveBeenCalledWith({
        value: 'FreeText',
        criteria: [{ value: 'Hannover', name: 'test' }]
      });
    });

    it('should ignore colon if disabled', async () => {
      component.criteria.set([{ name: 'test', label: 'Location', options: ['Hannover'] }]);
      component.disableSelectionByColonAndSemicolon = true;
      const spy = vi.spyOn(component, 'doSearch');
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys('location:');
      expect(spy).not.toHaveBeenCalled();
      expect(await filteredSearch.getCriteria()).toHaveLength(0);
    });

    it('should ignore semicolon if disabled', async () => {
      component.criteria.set([{ name: 'test', label: 'Location', options: ['Hannover'] }]);
      component.disableSelectionByColonAndSemicolon = true;
      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await tick();
      await freeTextSearch.select({ text: 'Location' });
      await tick();
      const spy = vi.spyOn(component, 'doSearch');
      await filteredSearch
        .getCriteria()
        .then(criteria => criteria[0].value())
        .then(value => value!.sendKeys('H;H'));
      expect(spy).not.toHaveBeenCalled();
      await freeTextSearch.focus();
      await tick();
      expect(
        await filteredSearch
          .getCriteria()
          .then(criteria => criteria[0].value())
          .then(value => value!.getValue())
      ).toBeFalsy();
    });

    it('should emit free text value as new criteria after keyboard colon was pressed', async () => {
      component.doSearchOnInputChange = true;
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      expect(await freeTextSearch.getValue()).toBe('Max');
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [
          { name: 'location', value: 'Munich' },
          { name: 'Max', value: '' }
        ],
        value: ''
      });
    });

    it('should not support colon criteria creation if selectOnlyValue is enabled', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        {
          name: 'location',
          label: 'location',
          options: ['Munich']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max'
      });
      component.onlySelectValue = true;
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [{ name: 'location', value: 'Munich' }],
        value: 'Max:'
      });
    });

    it('should delete criterion on keyboard backspace (empty operator input)', async () => {
      component.criteria.set([
        {
          name: 'highLimit',
          label: 'High Limit [°C]',
          validationType: 'integer',
          operators: ['≠', '≤', '≥', '<', '>']
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'highLimit' }],
        value: 'Max'
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const criteria = await filteredSearch.getCriteria();
      await criteria[0].clickLabel();
      const operatorInput = await criteria[0].operator();
      expect(component.filteredSearch().searchCriteria()?.criteria.length).toBe(1);
      await operatorInput?.focus();
      await operatorInput?.sendKeys(TestKey.BACKSPACE);

      expect(component.filteredSearch().searchCriteria()?.criteria.length).toBe(0);
    });
  });

  describe('with value/label feature', () => {
    it('should emit criterion with value and label from config', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
        { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] },
        {
          name: 'country',
          label: 'Country',
          options: [
            { value: 'DE', label: 'Germany' },
            { value: 'CH', label: 'Switzerland' }
          ]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'country', value: 'Switzerland' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: expect.arrayContaining([{ name: 'country', value: 'CH' }]),
        value: ''
      });
    });

    // TODO: this is non-sense. Our interface does not allow empty value for options.
    // TODO: remove with v47
    it('should emit criterion with value = label from config', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
        { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] },
        {
          name: 'country',
          label: 'Country',
          options: [{ value: 'DE', label: 'Germany' }, { label: 'Switzerland' } as any]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'country', value: 'Switzerland' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: expect.arrayContaining([{ name: 'country', value: 'Switzerland' }]),
        value: ''
      });
    });

    it('should work when only value is defined', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
        { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] },
        {
          name: 'country',
          label: 'Country',
          options: [{ value: 'DE', label: 'Germany' }, { value: 'CH' }]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'country', value: 'Switzerland' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: expect.arrayContaining([{ name: 'country', value: 'Switzerland' }]),
        value: ''
      });
    });

    it('should prefer searchCriteria value over the criteria', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
        { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] },
        {
          name: 'country',
          label: 'Country',
          options: [
            { value: 'DE', label: 'Germany' },
            { value: 'CH', label: 'Switzerland' }
          ]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'country', value: 'Switzerland_Overrride' }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();

      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: expect.arrayContaining([{ name: 'country', value: 'Switzerland_Overrride' }]),
        value: ''
      });
    });

    it('should work with multiselect scenario', async () => {
      component.doSearchOnInputChange = true;
      component.criteria.set([
        { name: 'company', label: 'Company', options: ['Foo', 'Bar'] },
        { name: 'Location', label: 'Location', options: ['Munich', 'Zug'] },
        {
          name: 'country',
          label: 'Country',
          multiSelect: true,
          options: [
            { value: 'DE', label: 'Germany' },
            { value: 'CH', label: 'Switzerland' }
          ]
        }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'country', value: ['Switzerland', 'Germany'] }],
        value: 'Max'
      });
      vi.spyOn(component, 'doSearch');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      await freeTextSearch.sendKeys(':');
      await tick();
      expect(component.doSearch).toHaveBeenCalledWith({
        criteria: [
          { name: 'country', value: ['DE', 'CH'] },
          expect.objectContaining({ name: 'Max', value: '' })
        ],
        value: ''
      });
    });
  });

  describe('with interceptDisplayedCriteria', () => {
    beforeEach(() => {
      component.criteria.set([
        { name: 'foo', label: 'Foo' },
        { name: 'bar', label: 'Bar' }
      ]);
      component.searchCriteria.set({
        criteria: [{ name: 'foo', value: 'Foo' }],
        value: ''
      });
    });

    it('should contain actual search and criteria list ', async () => {
      const spy = vi.spyOn(component, 'showCriteria');

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          criteria: ['foo', 'bar'],
          searchCriteria: {
            criteria: [{ name: 'foo', value: 'Foo' }],
            value: ''
          }
        })
      );
    });

    it('should not emit interceptDisplayedCriteria when maxCriteria exceeded', async () => {
      const spy = vi.spyOn(component, 'showCriteria');
      component.maxCriteria = 1;

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not display criteria when interceptDisplayedCriteria pass an empty array', async () => {
      vi.spyOn(component, 'showCriteria').mockImplementation(e => {
        e.allow([]);
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();
      await freeTextSearch.focus();
      const items = await freeTextSearch.getItems();
      expect(items).toBeNull();
    });

    describe('with only one foo criterion', () => {
      let spy: Mock;
      beforeEach(() => {
        spy = vi.spyOn(component, 'showCriteria').mockImplementation(e => {
          if (e.searchCriteria.criteria.find(c => c.name === 'foo')) {
            e.allow(['bar']);
          } else {
            e.allow(['foo', 'bar']);
          }
        });
      });

      it('should update after criterion was added', async () => {
        component.searchCriteria.set({ criteria: [], value: '' });
        const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
        const freeTextSearch = await filteredSearch.freeTextSearch();
        await freeTextSearch.focus();
        await tick();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(await freeTextSearch.getItems()).toEqual(['Foo', 'Bar']);
        await freeTextSearch.select({ text: 'Foo' });
        await tick();
        await freeTextSearch.focus();
        await tick();
        expect(spy).toHaveBeenCalledTimes(2);
        expect(await freeTextSearch.getItems()).toEqual(['Bar']);
      });

      it('should update after criterion was removed', async () => {
        const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
        const freeTextSearch = await filteredSearch.freeTextSearch();
        await freeTextSearch.focus();
        await tick();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(await freeTextSearch.getItems()).toEqual(['Bar']);
        await filteredSearch.getCriteria({ labelText: 'Foo' }).then(c => c[0].clickClearButton());
        expect(spy).toHaveBeenCalledTimes(2);
        expect(await freeTextSearch.getItems()).toEqual(['Foo', 'Bar']);
      });
    });

    it('should allow only one free-text pill at a time using interceptor', async () => {
      component.freeTextCriterion = { name: 'free-text', label: 'Free Text' };
      component.searchCriteria.set({ criteria: [], value: '' });
      await runOnPushChangeDetection(fixture);
      vi.spyOn(component, 'showCriteria').mockImplementation(e => {
        const hasFreeTextPill = e.searchCriteria.criteria.some(c => c.name === 'free-text');
        // Allow criteria but disable free text if one already exists
        e.allow(e.criteria, !hasFreeTextPill);
      });

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();

      // Step 1: Add the first free-text pill
      await freeTextSearch.focus();
      await freeTextSearch.typeText('first pill');
      await tick();

      // Select the "Create option" to add the free text pill
      await freeTextSearch.select({ text: 'Search for "first pill"' });
      await tick();

      // Verify the pill was created
      let criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);
      let value = await criteria[0].value();
      expect(await value?.text()).toBe('first pill');

      // Step 2: Try to add a second free-text pill (should be prevented)
      await freeTextSearch.focus();
      await freeTextSearch.typeText('second pill');
      await tick();

      // Verify the "Create option" is NOT available because interceptor disabled free text
      expect(await freeTextSearch.getItems()).toBeNull();

      // Verify still only one pill exists
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);

      // Step 3: Remove the existing pill
      await filteredSearch
        .getCriteria({ valueText: 'first pill' })
        .then(c => c[0].clickClearButton());
      await tick();

      // Verify the pill was removed
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(0);

      // Step 4: Add a new free-text pill (should be allowed again)
      await freeTextSearch.focus();
      await freeTextSearch.typeText('new pill');
      await tick();

      // Select the "Create option" to add the free text pill
      await freeTextSearch.select({ text: 'Search for "new pill"' });
      await tick();

      // Verify the pill was created
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);
      value = await criteria[0].value();
      expect(await value?.text()).toBe('new pill');
    });
  });
});

const replacePlaceholders = (str: string, params: Record<string, unknown>): string => {
  return str.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => {
    return params[p1] !== undefined ? String(params[p1]) : match;
  });
};

describe('SiFilteredSearchComponent - With translation', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideMockTranslateServiceBuilder(
          () =>
            ({
              translate: (key: string, params: Record<string, any>) => {
                if (params && Object.keys(params).length > 0) {
                  return `${replacePlaceholders(key, params)} translated`;
                }
                return `translated(${key})`;
              },
              translateAsync: (keys: string | string[], params: Record<string, any>) => {
                const myRecord: {
                  [key: string]: string;
                } = {};
                if (Array.isArray(keys)) {
                  keys.forEach(val => {
                    myRecord[val] = `translated(${val})`;
                  });
                  return of(myRecord);
                }
                return of(`translated(${keys})`);
              },
              translateSync: key => `translated(${key})`
            }) as SiTranslateService
        )
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  beforeEach(async () => {
    component.criteria.set([
      {
        name: 'country',
        label: 'CountryKey',
        options: [
          { value: 'DE', label: 'GermanyKey' },
          { value: 'CH', label: 'SwitzerlandKey' }
        ]
      }
    ]);

    component.searchCriteria.set({
      criteria: [
        { name: 'country', value: 'DE' },
        { name: 'country', value: 'CH' }
      ],
      value: ''
    });
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const tick = async (ms = 100): Promise<void> => {
    vi.advanceTimersByTime(ms);
    await fixture.whenStable();
  };

  it('should update items on translate', async () => {
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    const items = await freeTextSearch.getItems();
    expect(items).toEqual(['translated(CountryKey)']);
    await freeTextSearch.select({ text: 'translated(CountryKey)' });
    const criteria = await filteredSearch.getCriteria();
    expect(await criteria[0].label()).toBe('translated(CountryKey)');
  });

  it('should update criterion option on translate', async () => {
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const validCriteria = await filteredSearch.getCriteria({ isValid: true });
    expect(validCriteria).toHaveLength(2);
    const values = await parallel(() =>
      validCriteria.map(async v => await (await v.value())?.text())
    );
    expect(values).toEqual(['translated(GermanyKey)', 'translated(SwitzerlandKey)']);
    const spy = vi.spyOn(component, 'doSearch');
    component.doSearchOnInputChange = true;
    const deOption = validCriteria[0];
    await deOption.clickLabel();
    const deOptionValue = await deOption.value();
    expect(await deOptionValue!.getValue()).toBe('translated(GermanyKey)');
    await deOptionValue!.clearText();
    await deOptionValue!.sendKeys('other-country');
    await tick();
    expect(spy).toHaveBeenCalledWith({
      criteria: [
        { name: 'country', value: 'other-country' },
        { name: 'country', value: 'CH' }
      ],
      value: ''
    });
    await deOptionValue!.clearText();
    await deOptionValue!.sendKeys('translated(GermanyKey)');
    await tick();
    expect(spy).toHaveBeenCalledWith({
      criteria: [
        { name: 'country', value: 'DE' },
        { name: 'country', value: 'CH' }
      ],
      value: ''
    });
  });

  it('should update inputs on translate', async () => {
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    const items = await freeTextSearch.getItems();
    expect(items).toEqual(['translated(CountryKey)']);
  });

  it('should work with multi-select', async () => {
    component.criteria.set([
      {
        name: 'country',
        multiSelect: true,
        label: 'CountryKey',
        options: [
          { value: 'DE', label: 'GermanyKey' },
          { value: 'CH', label: 'SwitzerlandKey' }
        ]
      }
    ]);

    component.searchCriteria.set({
      criteria: [
        { name: 'country', value: ['DE'] },
        { name: 'country', value: ['CH'] }
      ],
      value: ''
    });
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const criteria = await filteredSearch.getCriteria();
    const values = await parallel(() => criteria.map(async v => await (await v.value())?.text()));
    expect(values).toEqual(['translated(GermanyKey)', 'translated(SwitzerlandKey)']);
  });

  it('should work with multi-select when more than one option selected', async () => {
    component.criteria.set([
      {
        name: 'country',
        multiSelect: true,
        label: 'CountryKey',
        options: [
          { value: 'DE', label: 'GermanyKey' },
          { value: 'CH', label: 'SwitzerlandKey' }
        ]
      }
    ]);

    component.searchCriteria.set({
      criteria: [{ name: 'country', value: ['CH', 'DE'] }],
      value: ''
    });
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const criteria = await filteredSearch.getCriteria();
    const values = await parallel(() => criteria.map(async v => await (await v.value())?.text()));
    expect(values).toEqual(['2 items translated']);
  });

  it('should not fail on invalid dates', async () => {
    component.criteria.set([
      {
        name: 'date',
        label: 'Date',
        validationType: 'date'
      }
    ]);
    component.searchCriteria.set({
      criteria: [{ name: 'date', value: '' }],
      value: ''
    });
    const spy = vi.spyOn(component, 'doSearch');
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const criteria = await filteredSearch.getCriteria();
    const value = await criteria[0].value();
    await value!.click();
    await value!.setValue('');
    await tick();
    await value!.sendKeys('broken-format');
    vi.useRealTimers();
    // needed to avoid flaky test
    await new Promise(resolve => setTimeout(resolve, 0));
    vi.useFakeTimers();
    await value!.blur();
    await filteredSearch.clickSearchButton();
    await tick();
    expect(await value!.text()).toBe('Invalid Date');
    expect(spy).toHaveBeenCalledWith({
      criteria: [
        {
          name: 'date',
          value: '',
          dateValue: expect.anything() // should be invalid date, but there is no matcher for that
        }
      ],
      value: ''
    });
  });

  it('should focus first criteria after first letter is typed', async () => {
    component.criteria.set([{ name: 'Criteria' }]);
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await tick();
    expect(await freeTextSearch.getItems({ isActive: true })).toHaveLength(0);
    await freeTextSearch.typeText('C');
    expect(await freeTextSearch.getItems({ isActive: true })).toHaveLength(1);
  });

  it('should not remove criterion if no value is entered', async () => {
    component.searchCriteria.set({ criteria: [], value: '' });
    component.criteria.set([{ name: 'Date', validationType: 'date' }]);
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const freeTextSearch = await filteredSearch.freeTextSearch();
    await freeTextSearch.focus();
    await freeTextSearch.sendKeys('key:');
    const criteriaText = await filteredSearch.getCriteria();
    expect(criteriaText).toHaveLength(1);
    await criteriaText
      .at(0)!
      .value()
      .then(value => value!.blur());
    expect(await filteredSearch.getCriteria()).toHaveLength(1);
    await freeTextSearch.focus();
    await tick();
    await freeTextSearch.clearText();
    await tick();
    await freeTextSearch.select({ text: 'translated(Date)' });
    await tick();
    // we have to check by the label here. As the text translated: will create another criterion called: translated
    const criteriaDate = await filteredSearch.getCriteria({ labelText: 'translated(Date)' });
    await criteriaDate
      .at(0)!
      .value()
      .then(value => value!.blur());
    // Dates have a default, so they should not get removed
    expect(await filteredSearch.getCriteria({ labelText: 'translated(Date)' })).toHaveLength(1);
  });

  it('should work with strict value', async () => {
    component.strictValue = true;
    component.searchCriteria.set({
      value: '',
      criteria: [
        { name: 'country', value: 'DE' },
        { name: 'country', value: 'FR' }
      ]
    });
    const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
    const criteriaInvalid = await filteredSearch.getCriteria({ isValidValue: false });
    const invalidValues = await parallel(() =>
      criteriaInvalid.map(criterion => criterion.value().then(value => value!.text()))
    );
    expect(invalidValues).toEqual(['FR']);

    const criteriaValid = await filteredSearch.getCriteria({ isValidValue: true });
    const validValues = await parallel(() =>
      criteriaValid.map(criterion => criterion.value().then(value => value!.text()))
    );
    expect(validValues).toEqual(['translated(GermanyKey)']);
  });

  describe('with free text pills enabled', () => {
    it('should create a free text pill when typing text and blurring the input', async () => {
      component.freeTextCriterion = { name: 'free-text', label: 'Free Text' };
      component.searchCriteria.set({
        value: '',
        criteria: []
      });
      await runOnPushChangeDetection(fixture);

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();

      // Verify no pills exist initially
      let criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(0);

      // Type text into the free text search
      await freeTextSearch.focus();
      await freeTextSearch.typeText('test pill text');
      await tick();

      // Blur the input
      await freeTextSearch.blur();
      await tick();

      // Verify a free text pill was created
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);
      const value = await criteria[0].value();
      expect(await value?.text()).toBe('test pill text');

      // Verify the search criteria was updated
      expect(component.searchCriteria().criteria).toEqual([
        { name: 'free-text', value: 'test pill text' }
      ]);
    });

    it('should update an existing free text pill', async () => {
      component.freeTextCriterion = { name: 'free-text', label: 'Free Text' };
      component.searchCriteria.set({
        value: '',
        criteria: [{ name: 'free-text', value: 'original value' }]
      });
      await runOnPushChangeDetection(fixture);

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      let criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);

      // Verify the initial value
      let value = await criteria[0].value();
      expect(await value?.text()).toBe('original value');

      // Click on the value to enter edit mode
      await value?.click();
      await tick();

      // Clear the existing text and type new value
      await value?.clearText();
      await value?.sendKeys('updated value');
      await tick();

      // Press Enter to submit the change
      await value?.sendKeys(TestKey.ENTER);
      await tick();

      // Verify the value has been updated
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);
      value = await criteria[0].value();
      expect(await value?.text()).toBe('updated value');

      // Verify the search criteria was updated
      expect(component.searchCriteria().criteria).toEqual([
        { name: 'free-text', value: 'updated value' }
      ]);
    });

    it('should remove free text pill when editing, deleting all value and pressing enter', async () => {
      component.freeTextCriterion = { name: 'free-text', label: 'Free Text' };
      component.searchCriteria.set({
        value: '',
        criteria: [{ name: 'free-text', value: 'text to delete' }]
      });
      await runOnPushChangeDetection(fixture);

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      let criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);

      // Verify the initial value
      const value = (await criteria[0].value())!;
      expect(await value.text()).toBe('text to delete');

      // Click on the value to enter edit mode
      await value.click();
      await tick();

      // Clear all text
      await value.clearText();
      await tick();

      // Press Enter to submit the change
      await value.sendKeys(TestKey.ENTER);
      await tick();

      // Verify the criterion was removed
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(0);

      // Verify the search criteria no longer contains the criterion
      expect(component.searchCriteria().criteria).toEqual([]);
    });

    it('should not allow adding free text pills when maxCriteria is reached', async () => {
      component.freeTextCriterion = { name: 'free-text', label: 'Free Text' };
      component.maxCriteria = 2;
      component.searchCriteria.set({
        value: '',
        criteria: [{ name: 'free-text', value: 'initial pill' }]
      });
      await runOnPushChangeDetection(fixture);

      const filteredSearch = await loader.getHarness(SiFilteredSearchHarness);
      const freeTextSearch = await filteredSearch.freeTextSearch();

      // Verify initial pill exists
      let criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(1);
      const value = await criteria[0].value();
      expect(await value?.text()).toBe('initial pill');

      // Add the second free text pill (should be allowed)
      await freeTextSearch.focus();
      await freeTextSearch.typeText('second pill');
      await tick();

      // Verify the "Create option" is available
      let items = await freeTextSearch.getItems();
      expect(items).not.toBeNull();
      expect(items!.length).toBeGreaterThan(0);

      // Select the "Create option" item
      await freeTextSearch.select({ text: 'SI_FILTERED_SEARCH.SEARCH_FOR_FREE_TEXT translated' });
      await tick();

      // Verify the second pill was created
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(2);
      const values = await parallel(() =>
        criteria.map(criterion => criterion.value().then(criteriaValue => criteriaValue!.text()))
      );
      expect(values).toEqual(['initial pill', 'second pill']);

      // Try to add a third free text pill (should be blocked)
      await freeTextSearch.focus();
      await freeTextSearch.typeText('third pill');
      await tick();

      // Verify that the "Create option" is no longer available because maxCriteria is reached
      items = await freeTextSearch.getItems();
      expect(items).toBeNull();

      // Verify only two pills exist
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(2);

      // Blur the input to verify no pill is created on blur
      await freeTextSearch.blur();
      await tick();

      // Verify still only two pills exist after blur
      criteria = await filteredSearch.getCriteria();
      expect(criteria.length).toBe(2);

      // Verify the input text was unchanged after blur
      expect(await freeTextSearch.getValue()).toBe('third pill');
    });
  });
});
