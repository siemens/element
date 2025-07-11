/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { generateKeyEvent } from './components/test-helper.spec';
import { SiDateInputDirective } from './si-date-input.directive';
import { SiDatepickerOverlayComponent } from './si-datepicker-overlay.component';
import { CloseCause, SiDatepickerOverlayDirective } from './si-datepicker-overlay.directive';
import { DatepickerConfig } from './si-datepicker.model';

@Component({
  imports: [FormsModule, SiDateInputDirective],
  template: `<input siDateInput type="text" class="form-control" [(ngModel)]="inputText" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: SiDatepickerOverlayDirective,
      outputs: ['siDatepickerClose']
    }
  ]
})
class WrapperComponent {
  inputText = '02.01.2022';
  closeCause?: CloseCause;
  readonly config = signal<DatepickerConfig>({ weekStartDay: 'monday' });
  public readonly datepickerOverlay = inject(SiDatepickerOverlayDirective);

  constructor() {
    this.datepickerOverlay.siDatepickerClose.subscribe(cause => (this.closeCause = cause));
  }

  show(): ComponentRef<SiDatepickerOverlayComponent> | undefined {
    const ref = this.datepickerOverlay.showOverlay(false, { config: this.config() });

    return ref;
  }

  close(): void {
    this.datepickerOverlay.closeOverlay();
  }

  @HostListener('document:keydown.Escape')
  escape(): void {}
}

describe('SiDatepickerOverlayDirective', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let component: WrapperComponent;

  const show = async (): Promise<void> => {
    const actual = component.show();
    expect(actual).toBeTruthy();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(actual?.instance).toBeTruthy();
    const datepicker = document.querySelector('si-datepicker');
    expect(datepicker).toBeTruthy();
  };

  const close = async (): Promise<void> => {
    component.close();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('si-datepicker')).toBeFalsy();
  };

  const backdropClick = async (): Promise<void> => {
    const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    backdrop.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [WrapperComponent]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open', async () => {
    await show();
  });

  it('should toggle open/close/open', async () => {
    await show();
    expect(component.datepickerOverlay.isShown()).toBeTruthy();
    await close();
    expect(component.datepickerOverlay.isShown()).toBeFalsy();
    await show();
    expect(component.datepickerOverlay.isShown()).toBeTruthy();
  });

  it('should emit datepicker close', async () => {
    const close$ = spyOn(component.datepickerOverlay.siDatepickerClose, 'emit').and.callThrough();
    await show();
    await close();
    expect(component.datepickerOverlay.isShown()).toBeFalsy();
    expect(close$).toHaveBeenCalled();
  });

  describe('with backdrop click', async () => {
    it('should emit backdrop', async () => {
      await show();
      expect(component.datepickerOverlay.isShown()).toBeTruthy();
      await backdropClick();
      expect(component.closeCause).toBe(CloseCause.Backdrop);
      expect(document.querySelector('si-datepicker')).toBeFalsy();
    });
  });

  describe('with escape', async () => {
    it('should emit escape', async () => {
      spyOn(component, 'escape');
      await show();
      expect(component.datepickerOverlay.isShown()).toBeTruthy();
      const picker = document.querySelector('si-datepicker');
      expect(picker).toBeTruthy();
      picker?.dispatchEvent(generateKeyEvent('Escape'));

      expect(component.closeCause).toBe(CloseCause.Escape);
      expect(document.querySelector('si-datepicker')).toBeFalsy();
      expect(component.escape).not.toHaveBeenCalled();
    });
  });

  describe('with close', async () => {
    it('should emit detach', async () => {
      await show();
      await close();
      expect(component.closeCause).toBe(CloseCause.Detach);
      expect(document.querySelector('si-datepicker')).toBeFalsy();
    });
  });
});
