/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MockResizeObserver,
  mockResizeObserver,
  restoreResizeObserver
} from '../resize-observer/testing/resize-observer.mock';
import { SiStatusBarComponent, StatusBarItem } from './index';

@Component({
  imports: [SiStatusBarComponent],
  template: `<si-status-bar [items]="items()" [muteButton]="muteButton()" /> `,
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
  readonly items = signal<StatusBarItem[]>([]);
  readonly muteButton = signal<boolean | undefined>(undefined);
}

describe('SiStatusBarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(() => {
    mockResizeObserver();
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    restoreResizeObserver();
  });

  it('should display all items with relevant content', async () => {
    component.items.set([
      { title: 'Success', status: 'success', value: 200 },
      { title: 'Failure', status: 'danger', value: 404 }
    ]);
    await fixture.whenStable();
    expect(element.querySelectorAll('si-status-bar-item')[0]).toHaveTextContent('200');
    expect(element.querySelectorAll('si-status-bar-item')[1]).toHaveTextContent('404');
  });

  it('should handle item click', async () => {
    component.items.set([{ title: 'Success', status: 'success', value: 200 }]);
    await fixture.whenStable();
    expect(() =>
      element.querySelector<HTMLElement>('si-status-bar-item')!.click()
    ).not.toThrowError();
  });

  it('should invoke callback action if set', async () => {
    const spy = vi.fn();
    component.items.set([{ title: 'Success', status: 'success', value: 200, action: spy }]);
    await fixture.whenStable();
    element.querySelector<HTMLElement>('si-status-bar-item')!.click();
    expect(spy).toHaveBeenCalledWith(component.items()[0]);
  });

  it('shows an optional mute button', async () => {
    expect(element.querySelector('.mute-button')).not.toBeInTheDocument();

    component.muteButton.set(true);
    await fixture.whenStable();

    const mute = element.querySelector('.mute-button > si-icon') as HTMLElement;
    expect(mute).toBeInTheDocument();
    expect(mute).toHaveAttribute('data-icon', 'elementSoundOn');

    component.muteButton.set(false);
    await fixture.whenStable();
    expect(mute).not.toHaveAttribute('data-icon', 'elementSoundOn');
  });

  describe('responsive mode', () => {
    const sizes = [575, 766, 989, 1300];

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const applySize = (outerSize: number): void => {
      component.width.set(outerSize);
      fixture.detectChanges();
      MockResizeObserver.triggerResize({});
      vi.advanceTimersByTime(200);
      fixture.detectChanges();
    };

    sizes.forEach(size => {
      it(`sets the correct amount of items for size ${size}`, () => {
        component.muteButton.set(undefined);
        component.items.set([
          { title: 'one with some text', status: 'success', value: 0 },
          { title: 'two with some text', status: 'warning', value: 0 },
          { title: 'three with some text', status: 'danger', value: 0 },
          { title: 'four with some text', status: 'danger', value: 0 },
          { title: 'five with some text', status: 'warning', value: 0 },
          { title: 'six with some text', status: 'warning', value: 0 },
          { title: 'seven with some text', status: 'warning', value: 0 }
        ]);
        fixture.detectChanges();

        applySize(size);

        const responsive = component.items().length * 152 > size;
        const container = element.querySelector('.responsive') as HTMLElement;

        if (!responsive) {
          expect(container).not.toBeInTheDocument();
        } else {
          const numItems = Math.floor(size / 152) - 1;
          const className = 'responsive-' + numItems;
          expect(container).toHaveClass(className);
        }
      });

      it(`sets the correct amount of items for size ${size} using value`, () => {
        component.muteButton.set(undefined);
        component.items.set([
          { value: 'one with some text', status: 'success', title: '' },
          { value: 'two with some text', status: 'warning', title: '' },
          { value: 'three with some text', status: 'danger', title: '' },
          { value: 'four with some text', status: 'danger', title: '' },
          { value: 'five with some text', status: 'warning', title: '' },
          { value: 'six with some text', status: 'warning', title: '' },
          { value: 'seven with some text', status: 'warning', title: '' }
        ]);
        fixture.detectChanges();

        applySize(size);

        const responsive = component.items().length * 152 > size;
        const container = element.querySelector('.responsive') as HTMLElement;

        if (!responsive) {
          expect(container).not.toBeInTheDocument();
        } else {
          const numItems = Math.floor(size / 152) - 1;
          const className = 'responsive-' + numItems;
          expect(container).toHaveClass(className);
        }
      });
    });

    it('shows the correct number of hidden active items', () => {
      component.muteButton.set(undefined);
      component.items.set([
        { title: 'one with some text', status: 'success', value: 1 },
        { title: 'two with some text', status: 'warning', value: 2 },
        { title: 'three with some text', status: 'danger', value: 1 },
        { title: 'four with some text', status: 'danger', value: 1 },
        { title: 'five with some text', status: 'warning', value: 1 },
        { title: 'six with some text', status: 'warning', value: 0 },
        { title: 'seven with some text', status: 'warning', value: 0 }
      ]);
      fixture.detectChanges();

      applySize(800);

      const container = element.querySelector('.responsive') as HTMLElement;
      expect(container).toHaveClass('responsive-4');

      const items = container.querySelectorAll('si-status-bar-item');
      expect(items[3].querySelector<HTMLElement>('.item-value')).toHaveTextContent('2+');
    });

    it('allows expanding in responsive mode', () => {
      component.items.set([
        { title: 'one with some text', status: 'success', value: 111 },
        { title: 'two with some text', status: 'warning', value: 222 },
        { title: 'three with some text', status: 'danger', value: 333 },
        { title: 'four with some text', status: 'danger', value: 444 }
      ]);
      fixture.detectChanges();
      applySize(575);
      const expander = element.querySelector('.collapse-expand') as HTMLElement;
      expect(expander).toBeTruthy();

      expander.click();
      fixture.detectChanges();
      vi.advanceTimersByTime(1000);

      expect(element.querySelector('.expanded')).toBeInTheDocument();

      expander.click();
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(element.querySelector('.expanded')).not.toBeInTheDocument();
    });
  });
});
