/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from '../resize-observer/mock-resize-observer.spec';
import { runOnPushChangeDetection } from '../test-helpers';
import { SiStatusBarComponent, StatusBarItem } from './index';

@Component({
  imports: [SiStatusBarComponent],
  template: `<si-status-bar [items]="items" [muteButton]="muteButton" /> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'width()'
  }
})
class TestHostComponent {
  readonly width = signal<number | undefined>(undefined);
  items: StatusBarItem[] = [];
  muteButton?: boolean;
  ref = inject(ElementRef);
}

describe('SiStatusBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
  );

  beforeEach(() => {
    mockResizeObserver();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;

    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    restoreResizeObserver();
    vi.useRealTimers();
  });

  it('should display all items with relevant content', () => {
    component.items = [
      { title: 'Success', status: 'success', value: 200 },
      { title: 'Failure', status: 'danger', value: 404 }
    ];
    fixture.detectChanges();
    expect(element.querySelectorAll('si-status-bar-item')[0].innerHTML).toContain('200');
    expect(element.querySelectorAll('si-status-bar-item')[1].innerHTML).toContain('404');
  });

  it('should handle item click', () => {
    component.items = [{ title: 'Success', status: 'success', value: 200 }];
    fixture.detectChanges();
    expect(() =>
      element.querySelector<HTMLElement>('si-status-bar-item')!.click()
    ).not.toThrowError();
  });

  it('should invoke callback action if set', () => {
    const spy = vi.fn();
    component.items = [{ title: 'Success', status: 'success', value: 200, action: spy }];
    fixture.detectChanges();
    element.querySelector<HTMLElement>('si-status-bar-item')!.click();
    expect(spy).toHaveBeenCalledWith(component.items[0]);
  });

  it('shows an optional mute button', async () => {
    expect(element.querySelector('.mute-button')).toBeFalsy();

    component.muteButton = true;
    fixture.detectChanges();

    const mute = element.querySelector('.mute-button > si-icon div') as HTMLElement;
    expect(mute).toBeTruthy();
    expect(mute.classList.contains('element-sound-on')).toBe(true);

    component.muteButton = false;
    // uninstall clock before doing runOnPushChangeDetection
    vi.useRealTimers();
    await runOnPushChangeDetection(fixture);
    expect(mute.classList.contains('element-sound-on')).toBe(false);
  });

  describe('responsive mode', () => {
    const sizes = [575, 766, 989, 1300];

    const applySize = async (outerSize: number): Promise<void> => {
      component.width.set(outerSize);
      fixture.detectChanges();
      MockResizeObserver.triggerResize({});
      vi.advanceTimersByTime(200);
      fixture.detectChanges();
      await fixture.whenStable();
    };

    sizes.forEach(size => {
      it(`sets the correct amount of items for size ${size}`, async () => {
        component.muteButton = undefined;
        component.items = [
          { title: 'one with some text', status: 'success', value: 0 },
          { title: 'two with some text', status: 'warning', value: 0 },
          { title: 'three with some text', status: 'danger', value: 0 },
          { title: 'four with some text', status: 'danger', value: 0 },
          { title: 'five with some text', status: 'warning', value: 0 },
          { title: 'six with some text', status: 'warning', value: 0 },
          { title: 'seven with some text', status: 'warning', value: 0 }
        ];
        fixture.detectChanges();

        await applySize(size);

        const responsive = component.items.length * 152 > size;
        const container = element.querySelector('.responsive') as HTMLElement;

        if (!responsive) {
          expect(container).toBeFalsy();
        } else {
          const numItems = Math.floor(size / 152) - 1;
          const className = 'responsive-' + numItems;
          expect(container.classList.contains(className)).toBe(true);
        }
      });

      it(`sets the correct amount of items for size ${size} using value`, async () => {
        component.muteButton = undefined;
        component.items = [
          { value: 'one with some text', status: 'success', title: '' },
          { value: 'two with some text', status: 'warning', title: '' },
          { value: 'three with some text', status: 'danger', title: '' },
          { value: 'four with some text', status: 'danger', title: '' },
          { value: 'five with some text', status: 'warning', title: '' },
          { value: 'six with some text', status: 'warning', title: '' },
          { value: 'seven with some text', status: 'warning', title: '' }
        ];
        fixture.detectChanges();

        await applySize(size);

        const responsive = component.items.length * 152 > size;
        const container = element.querySelector('.responsive') as HTMLElement;

        if (!responsive) {
          expect(container).toBeFalsy();
        } else {
          const numItems = Math.floor(size / 152) - 1;
          const className = 'responsive-' + numItems;
          expect(container.classList.contains(className)).toBe(true);
        }
      });
    });

    it('shows the correct number of hidden active items', async () => {
      component.muteButton = undefined;
      component.items = [
        { title: 'one with some text', status: 'success', value: 1 },
        { title: 'two with some text', status: 'warning', value: 2 },
        { title: 'three with some text', status: 'danger', value: 1 },
        { title: 'four with some text', status: 'danger', value: 1 },
        { title: 'five with some text', status: 'warning', value: 1 },
        { title: 'six with some text', status: 'warning', value: 0 },
        { title: 'seven with some text', status: 'warning', value: 0 }
      ];
      fixture.detectChanges();

      await applySize(800);

      const container = element.querySelector('.responsive') as HTMLElement;
      expect(container.classList.contains('responsive-4')).toBe(true);

      const items = container.querySelectorAll('si-status-bar-item');
      expect(items[3].querySelector<HTMLElement>('.item-value')!.innerText).toContain('2+');
    });

    it('allows expanding in responsive mode', async () => {
      component.items = [
        { title: 'one with some text', status: 'success', value: 111 },
        { title: 'two with some text', status: 'warning', value: 222 },
        { title: 'three with some text', status: 'danger', value: 333 },
        { title: 'four with some text', status: 'danger', value: 444 }
      ];
      fixture.detectChanges();
      await applySize(575);
      const expander = element.querySelector('.collapse-expand') as HTMLElement;
      expect(expander).toBeTruthy();

      expander.click();
      fixture.detectChanges();
      vi.advanceTimersByTime(1000);

      expect(element.querySelector('.expanded')).toBeTruthy();

      expander.click();
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(element.querySelector('.expanded')).toBeFalsy();
    });
  });
});
