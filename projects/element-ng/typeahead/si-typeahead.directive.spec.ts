/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { HarnessLoader, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, of } from 'rxjs';

import { SiTypeaheadDirective, Typeahead, TypeaheadMatch, TypeaheadOptionItemContext } from '.';
import { SiTypeaheadInputHarness } from './testing/si-typeahead-input.harness';
import { SiTypeaheadHarness } from './testing/si-typeahead.harness';

const testItems = ['test', 'item'];

@Component({
  imports: [SiTypeaheadDirective, FormsModule, SiTranslateModule],
  template: `
    <ng-template #testTemplate let-matchItem="match">
      <div>Test Template: {{ matchItem.text }}</div>
    </ng-template>
    <input
      ngModel
      type="text"
      [siTypeahead]="items"
      [typeaheadProcess]="process"
      [typeaheadScrollable]="scrollable"
      [typeaheadOptionsInScrollableView]="optionsInScrollableView"
      [typeaheadScrollableAdditionalHeight]="scrollableAdditionalHeight"
      [typeaheadAutoSelectIndex]="autoSelectIndex"
      [typeaheadCloseOnEsc]="closeOnEsc"
      [typeaheadWaitMs]="waitMs"
      [typeaheadMinLength]="minLength"
      [typeaheadOptionField]="optionField"
      [typeaheadTokenize]="tokenize"
      [typeaheadMatchAllTokens]="matchAllTokens"
      [typeaheadItemTemplate]="itemTemplate"
      [typeaheadSkipSortingMatches]="typeaheadSkipSortingMatches"
      [typeaheadClearValueOnSelect]="typeaheadClearValueOnSelect"
      (typeaheadOnFullMatch)="onFullMatch($event)"
      (typeaheadOnSelect)="onSelect($event)"
      (ngModelChange)="onModelChange($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  items: Typeahead = testItems;
  process = true;
  scrollable = false;
  autoSelectIndex = 0;
  closeOnEsc = true;
  optionsInScrollableView = 5;
  scrollableAdditionalHeight = 13;
  waitMs = 0;
  minLength = 1;
  optionField = 'name';
  tokenize = true;
  matchAllTokens = 'separately';
  itemTemplate!: TemplateRef<TypeaheadOptionItemContext>;
  typeaheadSkipSortingMatches = false;
  typeaheadClearValueOnSelect = false;

  readonly template = viewChild.required('testTemplate', {
    read: TemplateRef<TypeaheadOptionItemContext>
  });

  onFullMatch = ($event: TypeaheadMatch): void => {};
  onSelect = ($event: TypeaheadMatch): void => {};
  onModelChange = ($event: string): void => {};
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiTypeaheadDirective, FormsModule, SiTranslateModule, WrapperComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    wrapperElement = fixture.nativeElement;
    loader = TestbedHarnessEnvironment.loader(fixture);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000000;
  });

  it('should create typeahead list on focus', async () => {
    wrapperComponent.minLength = 0;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    expect(await input.getItems()).toBeTruthy();
  });

  it('should create component on input', async () => {
    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.sendKeys('t');
    expect(await input.getItems()).toBeTruthy();
  });

  it('should contain items from array', async () => {
    wrapperComponent.minLength = 0;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    expect(await input.getItems()).toEqual(['test', 'item']);
  });

  describe('with tokenization disabled', () => {
    it('should contain items from array matching simple search', async () => {
      wrapperComponent.tokenize = false;

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching simple search', async () => {
      wrapperComponent.tokenize = false;

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tests');
      expect(await input.getItems()).toBeNull();
    });
  });

  describe('with tokenization enabled', () => {
    it('should contain items from array matching simple search', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes');
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching simple search', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tests');
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to separately', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes t');
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to separately', async () => {
      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes st');
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to independently', async () => {
      wrapperComponent.matchAllTokens = 'independently';

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('te t');
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to independently', async () => {
      wrapperComponent.matchAllTokens = 'independently';

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('tes t');
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to once', async () => {
      wrapperComponent.matchAllTokens = 'once';

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('test t');
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to once', async () => {
      wrapperComponent.matchAllTokens = 'once';

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('test q');
      expect(await input.getItems()).toBeNull();
    });

    it('should contain items from array matching tokenized search and match all tokens set to no', async () => {
      wrapperComponent.matchAllTokens = 'no';

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('test q');
      expect(await input.getItems()).toEqual(['test']);
    });

    it('should contain no items from array not matching tokenized search and match all tokens set to no', async () => {
      wrapperComponent.matchAllTokens = 'no';

      const input = await loader.getHarness(SiTypeaheadInputHarness);
      await input.typeText('q');
      expect(await input.getItems()).toBeNull();
    });
  });

  it('should contain matching items from objects', async () => {
    wrapperComponent.items = testObjects;
    wrapperComponent.optionField = 'test';

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('f');
    expect(await input.getItems()).toEqual(['foo', 'fuu']);
  });

  it('should contain items from observable with process disabled', async () => {
    wrapperComponent.items = of(testObjects);
    wrapperComponent.process = false;
    wrapperComponent.optionField = 'test';

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('f');
    expect(await input.getItems()).toEqual(['foo', 'fuu', 'bar']);
  });

  it('should contain matching items from observable', async () => {
    wrapperComponent.items = of(testItems);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('tes');
    expect(await input.getItems()).toEqual(['test']);
  });

  it('s on top', async () => {
    wrapperComponent.items = of(testItemsOrdering);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('a');
    expect(await input.getItems()).toEqual(['a', 'aa', 'ad', 'Add', 'And']);
  });

  it('should list options in original order', async () => {
    wrapperComponent.items = of(testItemsOrdering);
    wrapperComponent.typeaheadSkipSortingMatches = true;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('a');
    expect(await input.getItems()).toEqual(['aa', 'a', 'ad', 'Add', 'And']);
  });

  it('should list options where search value is at the beginning of an option on top', async () => {
    wrapperComponent.items = of(['DMark', 'Deutsche Mark', 'Mark']);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('mar');
    expect(await input.getItems()).toEqual(['Mark', 'DMark', 'Deutsche Mark']);
  });

  it('should list options with multiple matches and there position is closer to start on top', async () => {
    wrapperComponent.items = of(['DMark', 'ZMarkmar', 'Markmar', 'AA Markmar']);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('mar');
    expect(await input.getItems()).toEqual(['Markmar', 'ZMarkmar', 'AA Markmar', 'DMark']);
  });

  it('should list options with more matches on top', async () => {
    wrapperComponent.items = of(['DMark', 'Deutsche Mark', 'Mark', 'Markmar', 'Markmar mar']);

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('mar');
    expect(await input.getItems()).toEqual([
      'Markmar mar',
      'Markmar',
      'Mark',
      'DMark',
      'Deutsche Mark'
    ]);
  });

  it('should narrow down search on second input', async () => {
    wrapperComponent.items = testList;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('a');
    expect(await input.getItems()).toEqual(['alabama', 'are']);

    await input.typeText('al');
    expect(await input.getItems()).toEqual(['alabama']);
  });

  it('should use item template if set', async () => {
    wrapperComponent.minLength = 0;
    wrapperComponent.itemTemplate = wrapperComponent.template();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    const labels = await input.getItems();
    labels!.forEach(i => expect(i).toContain('Test Template: '));
  });

  it('should use emit on full match', async () => {
    wrapperComponent.items = testList;
    wrapperComponent.onFullMatch = jasmine.createSpy();

    await (await loader.getHarness(SiTypeaheadInputHarness)).typeText('so');
    expect(wrapperComponent.onFullMatch).toHaveBeenCalled();
  });

  it('should not use emit on partial match', async () => {
    wrapperComponent.items = testList;
    wrapperComponent.onFullMatch = jasmine.createSpy();

    await (await loader.getHarness(SiTypeaheadInputHarness)).typeText('s');
    expect(wrapperComponent.onFullMatch).not.toHaveBeenCalled();
  });

  it('should use emit on select', async () => {
    wrapperComponent.minLength = 0;
    wrapperComponent.onSelect = jasmine.createSpy();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await input.select({ text: 'test' });
    expect(wrapperComponent.onSelect).toHaveBeenCalled();
  });

  it('should wait specified number of milliseconds', async () => {
    wrapperComponent.minLength = 0;
    wrapperComponent.waitMs = 333;

    spyOn(window, 'setTimeout');

    await (await loader.getHarness(SiTypeaheadInputHarness)).focus();

    expect(setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 333);
  });

  it('should properly select item on click', async () => {
    wrapperComponent.minLength = 0;
    wrapperComponent.onModelChange = jasmine.createSpy();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await input.select({ text: 'item' });

    expect(wrapperComponent.onModelChange).toHaveBeenCalledWith('item');
  });

  it('should not clear value on select if `typeaheadClearValueOnSelect` is false', async () => {
    wrapperComponent.typeaheadClearValueOnSelect = false;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('item');
    await input.focus();
    await input.select({ text: 'item' });

    expect(await input.getValue()).toEqual('item');
  });

  it('should clear value on select if `typeaheadClearValueOnSelect` is true', async () => {
    wrapperComponent.typeaheadClearValueOnSelect = true;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.typeText('item');
    await input.focus();
    await input.select({ text: 'item' });

    expect(await input.getValue()).toEqual('');
  });

  it('should properly select item with arrow down and enter', fakeAsync(() => {
    wrapperComponent.items = testList;
    wrapperComponent.minLength = 0;
    wrapperComponent.onModelChange = jasmine.createSpy();

    fixture.detectChanges();

    const inputElement = wrapperElement.querySelector('input')! as HTMLInputElement;
    inputElement.dispatchEvent(new Event('focusin'));

    tick();

    inputElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        keyCode: DOWN_ARROW
      })
    );
    inputElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: ENTER
      })
    );

    tick();

    expect(wrapperComponent.onModelChange).toHaveBeenCalledWith('home');
  }));

  it('should not select any item when selecting the first item is disabled', async () => {
    wrapperComponent.minLength = 0;
    wrapperComponent.onModelChange = jasmine.createSpy();

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    await input.sendKeys(TestKey.TAB);

    expect(wrapperComponent.onModelChange).not.toHaveBeenCalledWith('item');
  });

  it('should remove on escape if enabled', async () => {
    wrapperComponent.minLength = 0;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    expect(await input.getItems()).toBeTruthy();
    await input.sendKeys(TestKey.ESCAPE);
    expect(await input.getItems()).toBeFalsy();
  });

  it('should not remove on escape if disabled', async () => {
    wrapperComponent.closeOnEsc = false;
    wrapperComponent.minLength = 0;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    expect(await input.getItems()).toBeTruthy();
    await input.sendKeys(TestKey.ESCAPE);
    expect(await input.getItems()).toBeTruthy();
  });

  it('should reduce typeahead height when less items are displayed and typeaheadScrollable = true', async () => {
    wrapperComponent.items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    wrapperComponent.scrollable = true;
    wrapperComponent.minLength = 0;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();

    const height = (await input.getTypeaheadDimensions())?.height;
    expect(height).toBeGreaterThan(0);
    await input.typeText('a');

    expect((await input.getTypeaheadDimensions())?.height).toBeLessThan(height!);
  });

  it('should make list scrollable and display specified number of items with additional height', async () => {
    wrapperComponent.items = testList;
    wrapperComponent.minLength = 0;
    wrapperComponent.scrollable = true;
    wrapperComponent.optionsInScrollableView = 3;
    wrapperComponent.scrollableAdditionalHeight = 11;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();

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
    const height = wrapperComponent.optionsInScrollableView * matchHeight;
    const expectedHeight =
      height +
      paddingTop +
      paddingBottom +
      marginTop +
      marginBottom +
      wrapperComponent.scrollableAdditionalHeight;
    expect((await input.getTypeaheadDimensions())?.height).toBe(expectedHeight);
  });

  it('should scroll down to selected item when scrollable', async () => {
    wrapperComponent.items = testList;
    wrapperComponent.minLength = 0;
    wrapperComponent.scrollable = true;
    wrapperComponent.optionsInScrollableView = 3;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    for (let i = 0; i < 12; i++) {
      await input.sendKeys(TestKey.DOWN_ARROW);
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
    wrapperComponent.items = testList;
    wrapperComponent.minLength = 0;
    wrapperComponent.scrollable = true;
    wrapperComponent.optionsInScrollableView = 3;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    for (let i = 0; i < 4; i++) {
      await input.sendKeys(TestKey.UP_ARROW);
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
    expect(await input.getItems()).toBeTruthy();
    await input.typeText('');
    expect(await input.getItems()).toBeFalsy();
  });

  it('should remove when focus is lost', async () => {
    wrapperComponent.minLength = 0;
    const items = new BehaviorSubject(testList);
    wrapperComponent.items = items;

    const input = await loader.getHarness(SiTypeaheadInputHarness);
    await input.focus();
    expect(await input.getItems()).toBeTruthy();
    await input.blur();
    expect(await input.getItems()).toBeFalsy();
    // Updating the items should not bring back typeahead overlay.
    items.next(['value']);
    expect(await input.getItems()).toBeFalsy();
  });
});
