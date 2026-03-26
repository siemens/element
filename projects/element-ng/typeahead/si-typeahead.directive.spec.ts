/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import {
  SiTypeaheadDirective,
  Typeahead,
  TypeaheadMatch,
  TypeaheadOptionItemContext,
  TypeaheadOptionSource
} from '.';
import { SiTypeaheadInputHarness } from './testing/si-typeahead-input.harness';
import { SiTypeaheadHarness } from './testing/si-typeahead.harness';

const testItems = ['test', 'item'];

@Component({
  imports: [SiTypeaheadDirective, FormsModule],
  template: `
    <ng-template #testTemplate let-matchItem="match">
      <div>Test Template: {{ matchItem.text }}</div>
    </ng-template>
    <input
      ngModel
      type="text"
      [siTypeahead]="items()"
      [typeaheadProcess]="process()"
      [typeaheadScrollable]="scrollable()"
      [typeaheadOptionsInScrollableView]="optionsInScrollableView()"
      [typeaheadScrollableAdditionalHeight]="scrollableAdditionalHeight()"
      [typeaheadAutoSelectIndex]="autoSelectIndex()"
      [typeaheadCloseOnEsc]="closeOnEsc()"
      [typeaheadWaitMs]="waitMs()"
      [typeaheadMinLength]="minLength()"
      [typeaheadOptionField]="optionField()"
      [typeaheadTokenize]="tokenize()"
      [typeaheadMatchAllTokens]="matchAllTokens()"
      [typeaheadItemTemplate]="itemTemplate()"
      [typeaheadSkipSortingMatches]="typeaheadSkipSortingMatches()"
      [typeaheadClearValueOnSelect]="typeaheadClearValueOnSelect()"
      [typeaheadCreateOption]="createOption()"
      (typeaheadOnFullMatch)="onFullMatch($event)"
      (typeaheadOnSelect)="onSelect($event)"
      (ngModelChange)="onModelChange($event)"
      (typeaheadOnCreateOption)="onCreateOption($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly items = signal<Typeahead>(testItems);
  readonly process = signal(true);
  readonly scrollable = signal(false);
  readonly autoSelectIndex = signal(0);
  readonly closeOnEsc = signal(true);
  readonly optionsInScrollableView = signal(5);
  readonly scrollableAdditionalHeight = signal(13);
  readonly waitMs = signal(0);
  readonly minLength = signal(1);
  readonly optionField = signal('name');
  readonly tokenize = signal(true);
  readonly matchAllTokens = signal<'no' | 'once' | 'separately' | 'independently'>('separately');
  readonly itemTemplate = signal<TemplateRef<TypeaheadOptionItemContext>>(undefined!);
  readonly typeaheadSkipSortingMatches = signal(false);
  readonly typeaheadClearValueOnSelect = signal(false);
  readonly createOption = signal<string | undefined>(undefined);

  readonly template = viewChild.required('testTemplate', {
    read: TemplateRef<TypeaheadOptionItemContext>
  });

  onFullMatch = ($event: TypeaheadMatch): void => {};
  onSelect = ($event: TypeaheadMatch): void => {};
  onModelChange = ($event: string): void => {};
  onCreateOption = ($event: string): void => {};
}

describe('SiTypeaheadDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let wrapperElement: HTMLElement;
  let loader: HarnessLoader;
  let rootLoader: HarnessLoader;

  const getElement = (): HTMLElement => document.querySelector('si-typeahead') as HTMLElement;

  const testItemsOrdering = ['aa', 'a', 'ad', 'fd', 'Add', 'And'];

  const testObjects = [
    { test: 'foo', anotherValue: false },
    { test: 'fuu', anotherValue: false },
    { test: 'bar', anotherValue: true }
  ];

  const testList = ['sweet', 'home', 'alabama', 'where', 'the', 'skies', 'are', 'so', 'blue'];

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    wrapperElement = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });
  afterEach(() => vi.useRealTimers());

  const tick = async (ms = 0): Promise<void> => {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('should create typeahead list on focus', async () => {
    wrapperComponent.minLength.set(0);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
  });

  it('should create component on input', async () => {
    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.sendKeys('t');
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
  });

  it('should contain items from array', async () => {
    wrapperComponent.minLength.set(0);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    expect(await input.getItems()).toEqual(['test', 'item']);
  });

  describe('with tokenization disabled', () => {
    it('should contain items from array matching simple search', async () => {
      wrapperComponent.tokenize.set(false);

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      await tick(0);
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching simple search', async () => {
      wrapperComponent.tokenize.set(false);

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tests');
      await tick(0);
      expect(await input.getItems()).toBeNull();
    });
  });

  describe('with tokenization enabled', () => {
    it('should contain items from array matching simple search', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      await tick(0);
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching simple search', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tests');
      await tick(0);
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to separately', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes t');
      await tick(0);
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to separately', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes st');
      await tick(0);
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to independently', async () => {
      wrapperComponent.matchAllTokens.set('independently');

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('te t');
      await tick(0);
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to independently', async () => {
      wrapperComponent.matchAllTokens.set('independently');

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes t');
      await tick(0);
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to once', async () => {
      wrapperComponent.matchAllTokens.set('once');

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('test t');
      await tick(0);
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to once', async () => {
      wrapperComponent.matchAllTokens.set('once');

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('test q');
      await tick(0);
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to no', async () => {
      wrapperComponent.matchAllTokens.set('no');

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('test q');
      await tick(0);
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to no', async () => {
      wrapperComponent.matchAllTokens.set('no');

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('q');
      await tick(0);
      expect(await input.getItems()).toBeNull();
    });
  });

  it('should contain matching items from objects', async () => {
    wrapperComponent.items.set(testObjects);
    wrapperComponent.optionField.set('test');

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('f');
    await tick(0);
    expect(await input.getItems()).toEqual(['foo', 'fuu']);
  });

  it('should contain items from observable with process disabled', async () => {
    wrapperComponent.items.set(of(testObjects));
    wrapperComponent.process.set(false);
    wrapperComponent.optionField.set('test');

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('f');
    await tick(0);
    expect(await input.getItems()).toEqual(['foo', 'fuu', 'bar']);
  });

  it('should contain matching items from observable', async () => {
    wrapperComponent.items.set(of(testItems));

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('tes');
    await tick(0);
    expect(await input.getItems()).toEqual(['test']);
  });

  describe('with option source loading state', () => {
    let optionsSubject: Subject<string[]>;
    let source: TypeaheadOptionSource;

    beforeEach(() => {
      optionsSubject = new Subject<string[]>();
      source = vi.fn().mockReturnValue(optionsSubject);
      wrapperComponent.items.set(source);
    });

    it('should show empty loading state until options arrive', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      vi.advanceTimersByTime(501);
      expect(await input.isEmptyLoading()).toBe(true);

      optionsSubject.next(testItems);
      expect(source).toHaveBeenCalledWith('tes');
      expect(await input.getItems()).toEqual(['test']);
      expect(await input.isEmptyLoading()).toBe(false);
    });

    it('should show loading spinner when options are visible', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      optionsSubject.next(testItems);
      await input.typeText('test');
      vi.advanceTimersByTime(501);
      await fixture.whenStable();
      // Flush the spinner attach scheduled by SiLoadingSpinnerDirective spinner$ timer.
      // See si-loading-spinner.directive.ts:82-93 where the delayed timer emits.
      vi.advanceTimersByTime(0);
      expect(await input.hasLoadingSpinner()).toBe(true);
      expect(await input.isEmptyLoading()).toBe(false);
      optionsSubject.next(testItems);
      expect(await input.hasLoadingSpinner()).toBe(false);
    });

    it('should stop loading when source errors', async () => {
      const errorSource = vi.fn().mockReturnValue(throwError(() => new Error('source error')));
      wrapperComponent.items.set(errorSource);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      await tick(0);

      expect(errorSource).toHaveBeenCalledWith('tes');
      expect(consoleSpy).toHaveBeenCalled();
      expect(await input.getItems()).toBeNull();
      expect(await input.isEmptyLoading()).toBe(false);
    });
  });

  it('s on top', async () => {
    wrapperComponent.items.set(of(testItemsOrdering));

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('a');
    await tick(0);
    expect(await input.getItems()).toEqual(['a', 'aa', 'ad', 'Add', 'And']);
  });

  it('should list options in original order', async () => {
    wrapperComponent.items.set(of(testItemsOrdering));
    wrapperComponent.typeaheadSkipSortingMatches.set(true);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('a');
    await tick(0);
    expect(await input.getItems()).toEqual(['aa', 'a', 'ad', 'Add', 'And']);
  });

  it('should list options where search value is at the beginning of an option on top', async () => {
    wrapperComponent.items.set(of(['DMark', 'Deutsche Mark', 'Mark']));

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('mar');
    await tick(0);
    expect(await input.getItems()).toEqual(['Mark', 'DMark', 'Deutsche Mark']);
  });

  it('should list options with multiple matches and there position is closer to start on top', async () => {
    wrapperComponent.items.set(of(['DMark', 'ZMarkmar', 'Markmar', 'AA Markmar']));

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('mar');
    await tick(0);
    expect(await input.getItems()).toEqual(['Markmar', 'ZMarkmar', 'AA Markmar', 'DMark']);
  });

  it('should list options with more matches on top', async () => {
    wrapperComponent.items.set(of(['DMark', 'Deutsche Mark', 'Mark', 'Markmar', 'Markmar mar']));

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('mar');
    await tick(0);
    expect(await input.getItems()).toEqual([
      'Markmar mar',
      'Markmar',
      'Mark',
      'DMark',
      'Deutsche Mark'
    ]);
  });

  it('should narrow down search on second input', async () => {
    wrapperComponent.items.set(testList);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('a');
    await tick(0);
    expect(await input.getItems()).toEqual(['alabama', 'are']);

    await input.typeText('al');
    await tick(0);
    expect(await input.getItems()).toEqual(['alabama']);
  });

  it('should use item template if set', async () => {
    wrapperComponent.minLength.set(0);
    wrapperComponent.itemTemplate.set(wrapperComponent.template());

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    const labels = await input.getItems();
    labels!.forEach(i => expect(i).toContain('Test Template: '));
  });

  it('should use emit on full match', async () => {
    wrapperComponent.items.set(testList);
    wrapperComponent.onFullMatch = vi.fn();

    await (await loader.getHarness(SiTypeaheadInputHarness)).typeText('so');
    await tick(0);
    expect(wrapperComponent.onFullMatch).toHaveBeenCalled();
  });

  it('should not use emit on partial match', async () => {
    wrapperComponent.items.set(testList);
    wrapperComponent.onFullMatch = vi.fn();

    await (await loader.getHarness(SiTypeaheadInputHarness)).typeText('s');
    await tick(0);
    expect(wrapperComponent.onFullMatch).not.toHaveBeenCalled();
  });

  it('should use emit on select', async () => {
    wrapperComponent.minLength.set(0);
    wrapperComponent.onSelect = vi.fn();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    await input.select({ text: 'test' });
    expect(wrapperComponent.onSelect).toHaveBeenCalled();
  });

  it('should wait specified number of milliseconds', async () => {
    wrapperComponent.minLength.set(0);
    wrapperComponent.waitMs.set(333);

    vi.spyOn(window, 'setTimeout');

    await (await loader.getHarness(SiTypeaheadInputHarness)).focus();

    await tick(wrapperComponent.waitMs());

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 333);
  });

  it('should properly select item on click', async () => {
    wrapperComponent.minLength.set(0);
    wrapperComponent.onModelChange = vi.fn();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    await input.select({ text: 'item' });

    expect(wrapperComponent.onModelChange).toHaveBeenCalledWith('item');
  });

  it('should not clear value on select if `typeaheadClearValueOnSelect` is false', async () => {
    wrapperComponent.typeaheadClearValueOnSelect.set(false);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('item');
    await input.focus();
    await tick(0);
    await input.select({ text: 'item' });

    expect(await input.getValue()).toEqual('item');
  });

  it('should clear value on select if `typeaheadClearValueOnSelect` is true', async () => {
    wrapperComponent.typeaheadClearValueOnSelect.set(true);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('item');
    await input.focus();
    await tick(0);
    await input.select({ text: 'item' });
    await tick(0);

    expect(await input.getValue()).toEqual('');
  });

  it('should properly select item with arrow down and enter', async () => {
    wrapperComponent.items.set(testList);
    wrapperComponent.minLength.set(0);
    wrapperComponent.onModelChange = vi.fn();

    fixture.detectChanges();

    const inputElement = wrapperElement.querySelector('input')! as HTMLInputElement;
    inputElement.dispatchEvent(new Event('focusin'));
    await tick(0);
    inputElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        keyCode: DOWN_ARROW
      })
    );
    await tick(0);
    inputElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: ENTER
      })
    );
    await tick(0);

    expect(wrapperComponent.onModelChange).toHaveBeenCalledWith('home');
  });

  it('should not select any item when selecting the first item is disabled', async () => {
    wrapperComponent.minLength.set(0);
    wrapperComponent.onModelChange = vi.fn();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    await input.sendKeys(TestKey.TAB);
    await tick(0);

    expect(wrapperComponent.onModelChange).not.toHaveBeenCalledWith('item');
  });

  it('should remove on escape if enabled', async () => {
    wrapperComponent.minLength.set(0);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
    await input.sendKeys(TestKey.ESCAPE);
    await tick(0);
    expect(await input.getItems()).toBeFalsy();
  });

  it('should not remove on escape if disabled', async () => {
    wrapperComponent.closeOnEsc.set(false);
    wrapperComponent.minLength.set(0);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
    await input.sendKeys(TestKey.ESCAPE);
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
  });

  it('should reduce typeahead height when less items are displayed and typeaheadScrollable = true', async () => {
    wrapperComponent.items.set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    wrapperComponent.scrollable.set(true);
    wrapperComponent.minLength.set(0);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);

    const height = (await input.getTypeaheadDimensions())?.height;
    expect(height).toBeGreaterThan(0);
    await input.typeText('a');
    await tick(0);

    expect((await input.getTypeaheadDimensions())?.height).toBeLessThan(height!);
  });

  it('should make list scrollable and display specified number of items with additional height', async () => {
    wrapperComponent.items.set(testList);
    wrapperComponent.minLength.set(0);
    wrapperComponent.scrollable.set(true);
    wrapperComponent.optionsInScrollableView.set(3);
    wrapperComponent.scrollableAdditionalHeight.set(11);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);

    const computedStyle = window.getComputedStyle(
      getElement().querySelector('.typeahead') as HTMLElement
    );
    const matchComputedStyle = window.getComputedStyle(
      getElement()!.querySelector('.typeahead')!.firstElementChild as HTMLElement
    );
    const matchHeight = parseFloat(matchComputedStyle.height ? matchComputedStyle.height : '0');
    const paddingTop = parseFloat(computedStyle.paddingTop ? computedStyle.paddingTop : '0');
    const paddingBottom = parseFloat(
      computedStyle.paddingBottom ? computedStyle.paddingBottom : '0'
    );
    const marginTop = parseFloat(computedStyle.marginTop ? computedStyle.marginTop : '0');
    const marginBottom = parseFloat(computedStyle.marginBottom ? computedStyle.marginBottom : '0');
    const height = wrapperComponent.optionsInScrollableView() * matchHeight;
    const expectedHeight =
      height +
      paddingTop +
      paddingBottom +
      marginTop +
      marginBottom +
      wrapperComponent.scrollableAdditionalHeight();
    expect((await input.getTypeaheadDimensions())?.height).toBeCloseTo(expectedHeight, 1);
  });

  it('should scroll down to selected item when scrollable', async () => {
    wrapperComponent.items.set(testList);
    wrapperComponent.minLength.set(0);
    wrapperComponent.scrollable.set(true);
    wrapperComponent.optionsInScrollableView.set(3);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    for (let i = 0; i < 12; i++) {
      await input.sendKeys(TestKey.DOWN_ARROW);
      await tick(0);
    }

    const typeaheadElement = getElement().querySelector('.typeahead') as HTMLElement;
    const matches = typeaheadElement!.children;
    const matchElement = Array.from(matches).map(item => item)[3] as HTMLElement;
    const typeaheadRect = typeaheadElement.getBoundingClientRect();
    const matchRect = matchElement.getBoundingClientRect();
    const distanceFromTop = matchRect.top - typeaheadRect.top;
    const distanceFromBottom = typeaheadRect.bottom - matchRect.bottom;

    expect(distanceFromTop).toBeGreaterThanOrEqual(0);
    expect(distanceFromBottom).toBeGreaterThanOrEqual(0);
  });

  it('should scroll up to selected item when scrollable', async () => {
    wrapperComponent.items.set(testList);
    wrapperComponent.minLength.set(0);
    wrapperComponent.scrollable.set(true);
    wrapperComponent.optionsInScrollableView.set(3);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    for (let i = 0; i < 4; i++) {
      await input.sendKeys(TestKey.UP_ARROW);
      await tick(0);
    }

    const overlay = await rootLoader.getHarness(SiTypeaheadHarness);
    const dimensions = await overlay.getDimensions();
    const selectedItem = await overlay.getItems({ isActive: true });
    const itemDimension = await selectedItem.at(0)!.getDimensions();
    const distanceFromTop = itemDimension?.top - dimensions.top;
    const distanceFromBottom =
      dimensions.top + dimensions.height - (itemDimension.top + itemDimension.height);
    expect(distanceFromTop).toBeGreaterThanOrEqual(0);
    expect(distanceFromBottom).toBeGreaterThanOrEqual(0);
  });

  it('should remove when input field is empty again', async () => {
    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('t');
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
    await input.typeText('');
    await tick(0);
    expect(await input.getItems()).toBeFalsy();
  });

  it('should remove when focus is lost', async () => {
    wrapperComponent.minLength.set(0);
    const items = new BehaviorSubject(testList);
    wrapperComponent.items.set(items);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    expect(await input.getItems()).toBeTruthy();
    await input.blur();
    await tick(0);
    expect(await input.getItems()).toBeFalsy();
    // Updating the items should not bring back typeahead overlay.
    items.next(['value']);
    expect(await input.getItems()).toBeFalsy();
  });

  it('should trigger the create option', async () => {
    wrapperComponent.createOption.set('Create {{query}}');
    const createSpy = vi.spyOn(wrapperComponent, 'onCreateOption');
    const selectSpy = vi.spyOn(wrapperComponent, 'onSelect');

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await tick(0);
    await input.typeText('Success');
    await tick(0);
    const items = await input.getItems();
    expect(items).toContain('Create Success');
    await input.select({ text: 'Create Success' });
    await tick(0);
    expect(createSpy).toHaveBeenCalledWith('Success');
    expect(selectSpy).not.toHaveBeenCalled();
    expect(await input.getItems()).toBeNull();
  });
});
