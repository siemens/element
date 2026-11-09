/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { Mock } from 'vitest';

import { ElementDimensions, ResizeObserverService } from './resize-observer.service';

@Component({
  template: `<div #theDiv style="width: 100px; height: 100px">Testli</div>`
})
class TestHostComponent {
  readonly theDiv = viewChild.required<ElementRef>('theDiv');
}

describe('ResizeObserverService', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let service: ResizeObserverService;
  let subscriptions: Subscription;
  let spy: Mock<(dim: ElementDimensions) => void>;

  const subscribe = (initial: boolean): void => {
    subscriptions.add(
      service.observe(component.theDiv().nativeElement, 50, initial).subscribe(dim => spy(dim))
    );
  };

  beforeEach(async () => {
    subscriptions = new Subscription();
    service = TestBed.inject(ResizeObserverService);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    spy = vi.fn();
  });

  afterEach(() => subscriptions.unsubscribe());

  const resize = (width: number, height: number): void => {
    const style = component.theDiv().nativeElement.style;
    style.width = `${width}px`;
    style.height = `${height}px`;
  };

  it('emits initial size event when asked', async () => {
    subscribe(true);
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }))
    );
  });

  it('emits no initial size event when not asked', async () => {
    subscribe(false);
    await new Promise<void>(resolve => setTimeout(resolve, 10));
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits on width change', async () => {
    subscribe(false);
    resize(200, 100);
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }))
    );
  });

  it('emits on height change', async () => {
    subscribe(false);
    resize(100, 200);
    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 200 }))
    );
  });

  it('can handle multiple subscriptions on same element', async () => {
    subscribe(true);

    const spy2: Mock<(dim: ElementDimensions) => void> = vi.fn();
    subscriptions.add(
      service.observe(component.theDiv().nativeElement, 50, true).subscribe(dim => spy2(dim))
    );

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));
      expect(spy2).toHaveBeenCalledWith(expect.objectContaining({ width: 100, height: 100 }));
    });

    resize(200, 100);
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));
      expect(spy2).toHaveBeenCalledWith(expect.objectContaining({ width: 200, height: 100 }));
    });
  });
});
