/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';

import { SiBreadcrumbComponent as TestComponent } from '.';
import {
  mockResizeObserver,
  MockResizeObserver,
  restoreResizeObserver
} from '../resize-observer/testing/resize-observer.mock';
import { BreadcrumbItem } from './breadcrumb-item.model';

const TEST_ITEMS: BreadcrumbItem[] = [
  { title: 'Root', link: '/' },
  { title: 'Level 1', link: ['/', 'level1'] },
  { title: 'Level 2 with a really long title', link: ['/', 'level1', 'level2'] },
  { title: 'Level 3', link: ['/', 'level1', 'level2', 'level3'] },
  { title: 'Level 4', link: ['/', 'level1', 'level2', 'level3', 'level4'] },
  { title: 'Level 5', link: ['/', 'level1', 'level2', 'level3', 'level4', 'level5'] },
  { title: 'Level 6', link: ['/', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6'] },
  {
    title: 'Level 7',
    link: ['/', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7']
  },
  {
    title: 'Level 8 thisHasALongNonSeparableTitle',
    link: ['/', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8']
  },
  { title: 'Level 9', link: '.' }
];

@Component({ template: '' })
class TestSubComponent {}

describe('SiBreadcrumbComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;
  let router: Router;
  const items = signal<BreadcrumbItem[]>([]);
  const showRootAsText = signal(false);

  const routes: Routes = [
    {
      path: '',
      component: TestSubComponent,
      children: [
        {
          path: 'pages',
          component: TestSubComponent
        }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideTranslateService({
          missingTranslationHandler: provideMissingTranslationHandlerForElement()
        }),
        provideNgxTranslateForElement()
      ]
    }).compileComponents();

    items.set([]);
    showRootAsText.set(false);
    mockResizeObserver();
    fixture = TestBed.createComponent(TestComponent, {
      bindings: [inputBinding('items', items), inputBinding('showRootAsText', showRootAsText)]
    });
    element = fixture.nativeElement;
    router = TestBed.inject(Router);
    vi.useFakeTimers();
  });

  afterEach(() => {
    restoreResizeObserver();
    vi.useRealTimers();
  });

  const tick = async (ms = 100): Promise<void> => {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('should contain items', () => {
    items.set([
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: '/pages/' },
      { title: 'Level 2' }
    ]);

    fixture.detectChanges();

    const breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb).toHaveTextContent('Level 1');
    expect(breadcrumb).toHaveTextContent('Level 2');
  });

  it('should contain items with correct active state', async () => {
    await router.navigateByUrl('/');

    items.set([
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: ['pages'] },
      { title: 'Level 2' }
    ]);

    fixture.detectChanges();

    let breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb.querySelector('a')).toHaveClass('active');
    expect(breadcrumb.querySelectorAll('a')[1]).not.toHaveClass('active');
    expect(breadcrumb.querySelectorAll('a')[2]).not.toHaveClass('active');

    await router.navigate(['pages']);

    fixture.detectChanges();

    breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb.querySelector('a')).not.toHaveClass('active');
    expect(breadcrumb.querySelectorAll('a')[1]).toHaveClass('active');
    expect(breadcrumb.querySelectorAll('a')[2]).not.toHaveClass('active');
  });

  it('should update items on translate', () => {
    const ngxTranslate = TestBed.inject(TranslateService);
    ngxTranslate.addLangs(['test']);
    ngxTranslate.setTranslation('test', {
      'test title in english': 'test title in another language'
    });

    items.set([
      { title: 'Root', link: '/' },
      { title: 'test title in english', link: '/pages/' }
    ]);

    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb')!).toHaveTextContent('test title in english');

    ngxTranslate.use('test');
    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb')!).toHaveTextContent(
      'test title in another language'
    );
  });

  it('should use icon for first item', () => {
    items.set([
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: '/pages/' },
      { title: 'Level 2' }
    ]);

    fixture.detectChanges();

    const iconElement = element
      .querySelector('.breadcrumb')!
      .querySelector('.breadcrumb li:first-child si-icon[data-icon="elementBreadcrumbRoot"]');
    expect(iconElement).toBeInTheDocument();
  });

  it('should update items on change', () => {
    items.set([
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: '/pages/' },
      { title: 'Level 2' }
    ]);

    fixture.detectChanges();

    const breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb).toHaveTextContent('Level 1');
    expect(breadcrumb).toHaveTextContent('Level 2');

    items.set([
      { title: 'Root', link: '/' },
      { title: 'Sub 1', link: '/pages/' },
      { title: 'Sub 2' }
    ]);
    fixture.detectChanges();

    expect(breadcrumb).toHaveTextContent('Sub 1');
    expect(breadcrumb).toHaveTextContent('Sub 2');
    expect(breadcrumb).not.toHaveTextContent('Level 1');
    expect(breadcrumb).not.toHaveTextContent('Level 2');
  });

  it('should dynamically resize', async () => {
    const testSizes = [500, 1000, 620, 380, 330, 150];

    items.set(TEST_ITEMS);

    for (const [i, size] of testSizes.entries()) {
      element.style.width = size + 'px';

      await tick();
      if (i !== 0) {
        MockResizeObserver.triggerResize({});
      }

      await tick();

      const breadcrumb = element.querySelector('.breadcrumb')!;
      const computedStyle = getComputedStyle(breadcrumb);

      let currentWidth = 0;
      const maxWidth =
        breadcrumb!.clientWidth -
        (parseFloat(computedStyle.getPropertyValue('padding-left')) +
          parseFloat(computedStyle.getPropertyValue('padding-right')));

      breadcrumb!.querySelectorAll<HTMLElement>('.item').forEach(childElement => {
        currentWidth += childElement.offsetWidth;
      });

      expect(currentWidth).toBeLessThan(maxWidth);
    }
  });

  it('should add a dropdown if it is too wide', () => {
    element.style.width = '500px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb .breadcrumb-ellipses-item')).toBeInTheDocument();
  });

  it('should move hidden items into a dropdown', () => {
    element.style.width = '500px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const itemsShown = element.querySelectorAll(
      '.breadcrumb .item:not(.breadcrumb-ellipses-item)'
    ).length;

    expect(itemsShown).toBeLessThan(items().length);

    const dropdownItems = element.querySelectorAll(
      '.breadcrumb .breadcrumb-ellipses-item .dropdown-menu .dropdown-item'
    ).length;
    expect(dropdownItems).toBe(items().length - itemsShown);
  });

  it('should display a certain number of items at the end if possible', () => {
    element.style.width = '500px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const shownItems = element.querySelectorAll('.breadcrumb .item:not(.breadcrumb-ellipses-item)');
    expect(shownItems.item(shownItems.length - 2)).toHaveTextContent('Level 8');
    expect(shownItems.item(shownItems.length - 1)).toHaveTextContent('Level 9');
  });

  it('should only display the first item if too small', () => {
    element.style.width = '70px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const itemsShown = element.querySelectorAll(
      '.breadcrumb .item:not(.breadcrumb-ellipses-item)'
    ).length;
    expect(itemsShown).toBe(1);
  });

  it('should open and close a dropdown on click', () => {
    element.style.width = '500px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const ellipsesElement = element.querySelector('.breadcrumb .breadcrumb-ellipses-item')!;
    const dropdownToggleElement = ellipsesElement.querySelector(
      '.breadcrumb-dropdown-toggle'
    ) as HTMLElement;
    const dropdownElement = ellipsesElement.querySelector('.dropdown-menu');
    const dropdownElementComputedStyle = window.getComputedStyle(dropdownElement!);

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    dropdownToggleElement.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');

    dropdownToggleElement.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
  });

  it('should close a dropdown on click anywhere else', () => {
    element.style.width = '500px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const ellipsesElement = element.querySelector('.breadcrumb .breadcrumb-ellipses-item')!;
    const dropdownToggleElement = ellipsesElement.querySelector(
      '.breadcrumb-dropdown-toggle'
    ) as HTMLElement;
    const dropdownElement = ellipsesElement.querySelector('.dropdown-menu');
    const dropdownElementComputedStyle = window.getComputedStyle(dropdownElement!);

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    dropdownToggleElement.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');

    element.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
  });

  it('should shorten long items and add a dropdown', () => {
    element.style.width = '740px';

    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const shortenedElement = element.querySelectorAll('.breadcrumb .shortened')[1]!;
    const shortenedBreadcrumbItemElement = shortenedElement.querySelector<HTMLElement>(
      '.breadcrumb-dropdown-toggle'
    );
    const dropdownElement = shortenedElement.querySelector('.dropdown-menu');

    expect(shortenedBreadcrumbItemElement).toHaveTextContent('Level 8');
    expect(shortenedBreadcrumbItemElement?.innerText).not.toContain(
      'Level 8 thisHasALongNonSeparableTitle'
    );
    expect(dropdownElement).toHaveTextContent('Level 8 thisHasALongNonSeparableTitle');
  });

  it('should close on dropdown on open of another one', () => {
    element.style.width = '500px';
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    const shortenedElement = element.querySelector('.breadcrumb .shortened')!;
    const ellipsesElement = element
      .querySelector('.breadcrumb')!
      .querySelector('.breadcrumb-ellipses-item')!;
    const shortenedDropdownToggleElement = shortenedElement.querySelector(
      '.breadcrumb-dropdown-toggle'
    ) as HTMLElement;
    const ellipsesDropdownToggleElement = ellipsesElement.querySelector(
      '.breadcrumb-dropdown-toggle'
    ) as HTMLElement;
    const shortenedDropdownElement = shortenedElement.querySelector('.dropdown-menu');
    const shortenedDropdownElementComputedStyle = window.getComputedStyle(
      shortenedDropdownElement!
    );
    const ellipsesDropdownElement = ellipsesElement.querySelector('.dropdown-menu');
    const ellipsesDropdownElementComputedStyle = window.getComputedStyle(ellipsesDropdownElement!);

    expect(shortenedDropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
    expect(ellipsesDropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    shortenedDropdownToggleElement.click();
    fixture.detectChanges();

    expect(shortenedDropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');
    expect(ellipsesDropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    ellipsesDropdownToggleElement.click();
    fixture.detectChanges();

    expect(shortenedDropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
    expect(ellipsesDropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');
  });

  it('should display root as text when enabled', () => {
    showRootAsText.set(true);
    items.set(TEST_ITEMS);

    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb .item') as HTMLElement).toHaveTextContent('Root');
  });
});
