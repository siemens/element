/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterModule, Routes } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ResizeObserverService } from '@spike-rabbit/element-ng/resize-observer';
import { runOnPushChangeDetection } from '@spike-rabbit/element-ng/test-helpers';
import { SiTranslateNgxTModule } from '@spike-rabbit/element-translate-ng/ngx-translate';

import { SiBreadcrumbComponent as TestComponent } from '.';
import { BreadcrumbItem } from './breadcrumb-item.model';

const TEST_ITEMS = [
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

/**
 * Defines the width of the root icon in pixels.
 */
const ROOT_ICON_WIDTH = 24;

@Component({
  imports: [TestComponent, SiTranslateNgxTModule],
  template: `<si-breadcrumb [items]="items" [showRootAsText]="showRootAsText" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  items: BreadcrumbItem[] = [];
  showRootAsText = false;
}

@Component({ template: '' })
class TestSubComponent {}

describe('SiBreadcrumbComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let wrapperElement: HTMLElement;
  let element: HTMLElement;
  let router: Router;

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot(routes),
        SiTranslateNgxTModule,
        TranslateModule.forRoot(),
        WrapperComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    wrapperElement = fixture.nativeElement;
    element = fixture.debugElement.query(By.directive(TestComponent)).nativeElement;
    router = TestBed.inject(Router);
  });

  it('should contain items', () => {
    wrapperComponent.items = [
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: '/pages/' },
      { title: 'Level 2' }
    ];

    fixture.detectChanges();

    const breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb.innerHTML).toContain('Level 1');
    expect(breadcrumb.innerHTML).toContain('Level 2');
  });

  it('should contain items with correct active state', async () => {
    await router.navigateByUrl('/');

    wrapperComponent.items = [
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: ['pages'] },
      { title: 'Level 2' }
    ];

    fixture.detectChanges();

    let breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb.querySelector('a')?.classList.contains('active')).toBeTrue();
    expect(breadcrumb.querySelectorAll('a')[1]?.classList.contains('active')).toBeFalse();
    expect(breadcrumb.querySelectorAll('a')[2]?.classList.contains('active')).toBeFalse();

    await router.navigate(['pages']);

    fixture.detectChanges();

    breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb.querySelector('a')?.classList.contains('active')).toBeFalse();
    expect(breadcrumb.querySelectorAll('a')[1]?.classList.contains('active')).toBeTrue();
    expect(breadcrumb.querySelectorAll('a')[2]?.classList.contains('active')).toBeFalse();
  });

  it('should update items on translate', () => {
    const ngxTranslate = TestBed.inject(TranslateService);
    ngxTranslate.addLangs(['test']);
    ngxTranslate.setTranslation('test', {
      'test title in english': 'test title in another language'
    });

    wrapperComponent.items = [
      { title: 'Root', link: '/' },
      { title: 'test title in english', link: '/pages/' }
    ];

    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb')!.innerHTML).toContain('test title in english');

    ngxTranslate.use('test');
    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb')!.innerHTML).toContain(
      'test title in another language'
    );
  });

  it('should use icon for first item', () => {
    wrapperComponent.items = [
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: '/pages/' },
      { title: 'Level 2' }
    ];

    fixture.detectChanges();

    const rootClasses = element
      .querySelector('.breadcrumb')!
      .querySelector('.breadcrumb li:first-child si-icon-next div')!.classList;
    expect(rootClasses.contains('element-breadcrumb-root')).toBeTruthy();
  });

  it('should update items on change', () => {
    wrapperComponent.items = [
      { title: 'Root', link: '/' },
      { title: 'Level 1', link: '/pages/' },
      { title: 'Level 2' }
    ];

    fixture.detectChanges();

    const breadcrumb = element.querySelector('.breadcrumb')!;
    expect(breadcrumb.innerHTML).toContain('Level 1');
    expect(breadcrumb.innerHTML).toContain('Level 2');

    wrapperComponent.items = [
      { title: 'Root', link: '/' },
      { title: 'Sub 1', link: '/pages/' },
      { title: 'Sub 2' }
    ];
    runOnPushChangeDetection(fixture);

    expect(breadcrumb.innerHTML).toContain('Sub 1');
    expect(breadcrumb.innerHTML).toContain('Sub 2');
    expect(breadcrumb.innerHTML).not.toContain('Level 1');
    expect(breadcrumb.innerHTML).not.toContain('Level 2');
  });

  it('should dynamically resize', fakeAsync(() => {
    let maxWidth = 0;
    let currentWidth = 0;

    const testSizes = [500, 1000, 620, 380, 330, 150];

    wrapperComponent.items = TEST_ITEMS;

    testSizes.forEach((size, i) => {
      wrapperElement.style.width = size + 'px';

      if (i === 0) {
        fixture.detectChanges();
      } else {
        TestBed.inject(ResizeObserverService)._checkAll();
      }
      flush();
      fixture.detectChanges();

      const breadcrumb = element.querySelector('.breadcrumb')!;
      const computedStyle = getComputedStyle(breadcrumb);

      currentWidth = ROOT_ICON_WIDTH;
      maxWidth =
        breadcrumb!.clientWidth -
        (parseFloat(computedStyle.getPropertyValue('padding-left')) +
          parseFloat(computedStyle.getPropertyValue('padding-right')));

      breadcrumb!.querySelectorAll<HTMLElement>('.item').forEach(childElement => {
        currentWidth += childElement.offsetWidth;
      });

      expect(currentWidth).toBeLessThan(maxWidth);
    });
  }));

  it('should add a dropdown if it is too wide', () => {
    wrapperElement.style.width = '500px';
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    expect(element.querySelector('.breadcrumb .breadcrumb-ellipses-item')).not.toBeNull();
  });

  it('should move hidden items into a dropdown', () => {
    wrapperElement.style.width = '500px';
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    const itemsShown = element.querySelectorAll(
      '.breadcrumb .item:not(.breadcrumb-ellipses-item)'
    ).length;

    expect(itemsShown).toBeLessThan(wrapperComponent.items.length);

    const dropdownItems = element.querySelectorAll(
      '.breadcrumb .breadcrumb-ellipses-item .dropdown-menu .dropdown-item'
    ).length;
    expect(dropdownItems).toBe(wrapperComponent.items.length - itemsShown);
  });

  it('should display a certain number of items at the end if possible', () => {
    wrapperElement.style.width = '500px';
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    const items = element.querySelectorAll('.breadcrumb .item:not(.breadcrumb-ellipses-item)');
    expect(items.item(items.length - 2).innerHTML).toContain('Level 8');
    expect(items.item(items.length - 1).innerHTML).toContain('Level 9');
  });

  it('should only display the first item if too small', () => {
    wrapperElement.style.width = '70px';
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    const itemsShown = element.querySelectorAll(
      '.breadcrumb .item:not(.breadcrumb-ellipses-item)'
    ).length;
    expect(itemsShown).toBe(1);
  });

  it('should open and close a dropdown on click', () => {
    wrapperElement.style.width = '500px';
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    const ellipsesElement = element.querySelector('.breadcrumb .breadcrumb-ellipses-item')!;
    const dropdownToggleElement = ellipsesElement.querySelector(
      '.breadcrumb-dropdown-toggle'
    ) as HTMLElement;
    const dropdownElement = ellipsesElement.querySelector('.dropdown-menu');
    const dropdownElementComputedStyle = window.getComputedStyle(dropdownElement!);

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    dropdownToggleElement?.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');

    dropdownToggleElement?.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
  });

  it('should close a dropdown on click anywhere else', () => {
    wrapperElement.style.width = '500px';
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    const ellipsesElement = element.querySelector('.breadcrumb .breadcrumb-ellipses-item')!;
    const dropdownToggleElement = ellipsesElement.querySelector(
      '.breadcrumb-dropdown-toggle'
    ) as HTMLElement;
    const dropdownElement = ellipsesElement.querySelector('.dropdown-menu');
    const dropdownElementComputedStyle = window.getComputedStyle(dropdownElement!);

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    dropdownToggleElement?.click();
    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');

    if (dropdownToggleElement) {
      wrapperElement.click();
    }

    fixture.detectChanges();

    expect(dropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
  });

  it('should shorten long items and add a dropdown', () => {
    wrapperElement.style.width = '500px';

    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    const shortenedElement = element.querySelectorAll('.breadcrumb .shortened')[1]!;
    const shortenedBreadcrumbItemElement = shortenedElement.querySelector<HTMLElement>(
      '.breadcrumb-dropdown-toggle'
    );
    const dropdownElement = shortenedElement.querySelector('.dropdown-menu');

    expect(shortenedBreadcrumbItemElement?.innerHTML).toContain('Level 8');
    expect(shortenedBreadcrumbItemElement?.innerText).not.toContain(
      'Level 8 thisHasALongNonSeparableTitle'
    );
    expect(dropdownElement?.innerHTML).toContain('Level 8 thisHasALongNonSeparableTitle');
  });

  it('should close on dropdown on open of another one', () => {
    wrapperElement.style.width = '500px';
    wrapperComponent.items = TEST_ITEMS;

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

    shortenedDropdownToggleElement?.click();
    fixture.detectChanges();

    expect(shortenedDropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');
    expect(ellipsesDropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');

    ellipsesDropdownToggleElement?.click();
    fixture.detectChanges();

    expect(shortenedDropdownElementComputedStyle.getPropertyValue('display')).toEqual('none');
    expect(ellipsesDropdownElementComputedStyle.getPropertyValue('display')).not.toEqual('none');
  });

  it('should display root as text when enabled', () => {
    wrapperComponent.showRootAsText = true;
    wrapperComponent.items = TEST_ITEMS;

    fixture.detectChanges();

    expect((element.querySelector('.breadcrumb .item') as HTMLElement).innerText).toBe('Root');
  });
});
