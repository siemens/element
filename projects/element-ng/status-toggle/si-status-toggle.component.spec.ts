/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SiStatusToggleComponent } from './si-status-toggle.component';
import { StatusToggleItem } from './status-toggle.model';

@Component({
  imports: [SiStatusToggleComponent],
  template: `<si-status-toggle #toggle [items]="items" [disabled]="disabled" [(value)]="value" />`
})
class HostComponent {
  disabled = false;
  value = 'A';
  items: StatusToggleItem[] = [
    { text: 'Val #1', value: 'A', icon: 'element-not-checked' },
    { text: 'Val #2', value: 'B', icon: 'element-issue' },
    { text: 'Val #3', value: 'D', icon: 'element-checked', disabled: true }
  ];
  readonly toggle = viewChild.required<SiStatusToggleComponent>('toggle');
}

@Component({
  imports: [SiStatusToggleComponent, ReactiveFormsModule],
  template: `<si-status-toggle #toggle [items]="items" [formControl]="formControl" />`
})
class FormHostComponent {
  readonly formControl = new FormControl('A');

  items: StatusToggleItem[] = [
    { text: 'Val #1', value: 'A', icon: 'element-not-checked' },
    { text: 'Val #2', value: 'B', icon: 'element-issue' },
    { text: 'Val #3', value: 'D', icon: 'element-checked', disabled: true }
  ];

  readonly toggle = viewChild.required<SiStatusToggleComponent>('toggle');
}

describe('SiStatusToggleComponent', () => {
  let element: HTMLElement;

  const touchClick = (fixture: ComponentFixture<any>, el: HTMLElement, touch: boolean): void => {
    const rect = el.getBoundingClientRect();
    const clientX = Math.floor(rect.x + rect.width / 2);
    const clientY = Math.floor(rect.y + rect.height / 2);

    if (touch) {
      const makeTouches = (): Touch[] => [
        new Touch({ clientX, clientY, identifier: 0, target: el })
      ];

      el.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: makeTouches(),
          changedTouches: makeTouches()
        })
      );
      fixture.detectChanges();
      el.dispatchEvent(
        new TouchEvent('touchmove', {
          bubbles: true,
          cancelable: true,
          changedTouches: makeTouches()
        })
      );
      fixture.detectChanges();
      el.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
          changedTouches: makeTouches()
        })
      );
      fixture.detectChanges();
    } else {
      el.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          clientX,
          clientY,
          relatedTarget: el,
          buttons: 1
        })
      );
      fixture.detectChanges();
      el.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          relatedTarget: el,
          buttons: 1
        })
      );
      fixture.detectChanges();
      el.dispatchEvent(
        new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          relatedTarget: el,
          buttons: 1
        })
      );
      fixture.detectChanges();
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, FormHostComponent]
    });
  });

  describe('direct usage', () => {
    let component: HostComponent;
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
      component.value = 'A';
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be able to disable all buttons', () => {
      component.disabled = true;
      fixture.detectChanges();

      const container = element.querySelector<HTMLElement>('.status-toggle-container')!;
      expect(container).toHaveClass('disabled');
    });

    it('should be able to disable a single button (3th)', () => {
      fixture.detectChanges();
      const items = element.querySelectorAll('.status-toggle-item');
      expect(items[2]).toHaveClass('disabled');
    });

    if ('TouchEvent' in window) {
      it('should emit clicked button value with touch', fakeAsync(() => {
        fixture.detectChanges();
        tick();

        spyOn(component.toggle().itemClick, 'emit');

        touchClick(fixture, element.querySelectorAll<HTMLElement>('.status-toggle-item')[1], true);
        tick();

        expect(component.toggle().value()).toEqual('B');
        expect(component.toggle().itemClick.emit).toHaveBeenCalledWith('B');
      }));
    }

    it('should emit clicked button value with mouse', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      spyOn(component.toggle().itemClick, 'emit');

      touchClick(fixture, element.querySelectorAll<HTMLElement>('.status-toggle-item')[1], false);
      tick();

      expect(component.toggle().value()).toEqual('B');
      expect(component.toggle().itemClick.emit).toHaveBeenCalledWith('B');
    }));
  });

  describe('as form control', () => {
    let fixture: ComponentFixture<FormHostComponent>;
    let component: FormHostComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(FormHostComponent);
      component = fixture.componentInstance;
      element = fixture.nativeElement;
    });

    it('should set the initial value', () => {
      fixture.detectChanges();
      expect(component.toggle().value()).toBe('A');
    });

    it('updates the value in the form', fakeAsync(() => {
      fixture.detectChanges();

      touchClick(fixture, element.querySelectorAll<HTMLElement>('.status-toggle-item')[1], false);
      tick();

      expect(component.formControl.value).toBe('B');
    }));

    it('sets the disabled state', () => {
      component.formControl.disable();
      fixture.detectChanges();

      const container = element.querySelector<HTMLElement>('.status-toggle-container')!;
      expect(container).toHaveClass('disabled');
    });
  });
});
