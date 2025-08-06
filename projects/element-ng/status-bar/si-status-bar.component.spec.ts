/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ResizeObserverService } from '@spike-rabbit/element-ng/resize-observer';

import { SiStatusBarComponent, StatusBarItem } from './index';

@Component({
  imports: [SiStatusBarComponent],
  template: `<si-status-bar [items]="items" [muteButton]="muteButton" /> `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
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
      imports: [TestHostComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
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
    const spy = jasmine.createSpy();
    component.items = [{ title: 'Success', status: 'success', value: 200, action: spy }];
    fixture.detectChanges();
    element.querySelector<HTMLElement>('si-status-bar-item')!.click();
    expect(spy).toHaveBeenCalledWith(component.items[0]);
  });

  it('shows an optional mute button', async () => {
    expect(element.querySelector('.mute-button')).toBeFalsy();

    component.muteButton = true;
    fixture.detectChanges();

    const mute = element.querySelector('.mute-button > si-icon-next div') as HTMLElement;
    expect(mute).toBeTruthy();
    expect(mute.classList.contains('element-sound-on')).toBeTrue();

    component.muteButton = false;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(mute.classList.contains('element-sound-on')).toBeFalse();
  });

  describe('responsive mode', () => {
    const sizes = [575, 766, 989, 1300];

    const applySize = (outerSize: number): void => {
      component.ref.nativeElement.style.width = outerSize + 'px';
      fixture.detectChanges();
      TestBed.inject(ResizeObserverService)._checkAll();
      flush();
      fixture.detectChanges();
    };

    sizes.forEach(size => {
      it(`sets the correct amount of items for size ${size}`, fakeAsync(() => {
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

        applySize(size);
        tick();

        const responsive = component.items.length * 152 > size;
        const container = element.querySelector('.responsive') as HTMLElement;

        if (!responsive) {
          expect(container).toBeFalsy();
        } else {
          const numItems = Math.floor(size / 152) - 1;
          const className = 'responsive-' + numItems;
          expect(container.classList.contains(className)).toBe(true);
        }
      }));

      it(`sets the correct amount of items for size ${size} using value`, fakeAsync(() => {
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

        applySize(size);
        tick();

        const responsive = component.items.length * 152 > size;
        const container = element.querySelector('.responsive') as HTMLElement;

        if (!responsive) {
          expect(container).toBeFalsy();
        } else {
          const numItems = Math.floor(size / 152) - 1;
          const className = 'responsive-' + numItems;
          expect(container.classList.contains(className)).toBe(true);
        }
      }));
    });

    it('shows the correct number of hidden active items', fakeAsync(() => {
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

      applySize(800);
      tick();

      const container = element.querySelector('.responsive') as HTMLElement;
      expect(container.classList.contains('responsive-4')).toBe(true);

      const items = container.querySelectorAll('si-status-bar-item');
      expect(items[3].querySelector<HTMLElement>('.item-value')!.innerText).toContain('2+');
    }));

    it('allows expanding in responsive mode', fakeAsync(() => {
      component.items = [
        { title: 'one with some text', status: 'success', value: 111 },
        { title: 'two with some text', status: 'warning', value: 222 },
        { title: 'three with some text', status: 'danger', value: 333 },
        { title: 'four with some text', status: 'danger', value: 444 }
      ];
      fixture.detectChanges();

      applySize(575);

      const expander = element.querySelector('.collapse-expand') as HTMLElement;
      expect(expander).toBeTruthy();

      expander.click();
      flush();
      fixture.detectChanges();

      expect(element.querySelector('.expanded')).toBeTruthy();

      expander.click();
      flush();
      fixture.detectChanges();

      expect(element.querySelector('.expanded')).toBeFalsy();
    }));
  });
});
