/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page, userEvent } from '@vitest/browser/context';

import { SiCarouselItemDirective } from './si-carousel-item.directive';
import { SiCarouselComponent } from './si-carousel.component';

@Component({
  selector: 'si-test-carousel',
  imports: [SiCarouselComponent, SiCarouselItemDirective],
  template: `
    <si-carousel
      #carousel
      [autoPlay]="autoPlay()"
      [hidePageControls]="withoutPageControls()"
      [ariaRole]="ariaRole()"
      [previousButtonAriaLabel]="previousButtonAriaLabel()"
      [nextButtonAriaLabel]="nextButtonAriaLabel()"
      [slidePageAriaLabel]="slidePageAriaLabel()"
    >
      @for (item of items(); track item) {
        <div siCarouselItem class="carousel-item">{{ item }}</div>
      }
    </si-carousel>
  `
})
class TestCarouselComponent {
  readonly carousel = viewChild.required(SiCarouselComponent);

  ariaRoleValue: 'region' | 'group' = 'region';
  readonly autoPlay = signal<boolean | number>(false);
  readonly withoutPageControls = signal(false);
  readonly ariaRole = signal<'region' | 'group'>(this.ariaRoleValue);
  readonly previousButtonAriaLabel = signal('Previous slide');
  readonly nextButtonAriaLabel = signal('Next slide');
  readonly slidePageAriaLabel = signal('Slide {{page}} of {{total}}');
  readonly items = signal(Array.from({ length: 5 }, (_, i) => `Slide ${i + 1}`));
}

describe('SiCarouselComponent', () => {
  let fixture: ComponentFixture<TestCarouselComponent>;
  let testComponent: TestCarouselComponent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestCarouselComponent);
    testComponent = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('Aria role', () => {
    it('should have correct default aria role', () => {
      const carouselElement = fixture.nativeElement.querySelector('si-carousel');
      expect(carouselElement).toHaveAttribute('role', 'region');
      expect(carouselElement).toHaveAttribute('aria-roledescription', 'carousel');
    });

    it('should accept custom aria role', async () => {
      testComponent.ariaRole.set('group');
      await fixture.whenStable();

      const carouselElement = fixture.nativeElement.querySelector('si-carousel');
      expect(carouselElement).toHaveAttribute('role', 'group');
    });
  });

  describe('Navigation controls', () => {
    it('have navigation controls by default', () => {
      const pagerElement = fixture.nativeElement.querySelector('.carousel-pager-dot');
      expect(pagerElement).toBeInTheDocument();
    });

    it('should hide navigation controls when withoutPageControls is true', async () => {
      testComponent.withoutPageControls.set(true);
      await fixture.whenStable();

      const pagerElement = fixture.nativeElement.querySelector('.carousel-pager-dot');
      expect(pagerElement).not.toBeInTheDocument();
    });

    it('should not show pager when there is only one page', async () => {
      testComponent.items.set(['Only Slide']);
      await fixture.whenStable();

      const pagerElement = fixture.nativeElement.querySelector('.carousel-pager-dot');
      expect(pagerElement).not.toBeInTheDocument();
    });

    it('should only have tab index on visible pager dots', async () => {
      testComponent.items.set(Array.from({ length: 30 }, (_, i) => `Slide ${i + 1}`));
      await fixture.whenStable();
      const visiblePageButton = page.getByRole('button', { name: 'Slide 1 of 30' });
      await expect.element(visiblePageButton).toHaveProperty('tabIndex', 0);

      const pageButtonOutSideVisibleRange = page.getByRole('button', { name: 'Slide 30 of 30' });
      await expect.element(pageButtonOutSideVisibleRange).toHaveProperty('tabIndex', -1);
    });

    it('should navigate to correct page when pager dot is clicked', async () => {
      const slide3pagerDot = page.getByRole('button', { name: 'Slide 3 of 5' });
      await userEvent.click(slide3pagerDot);
      await fixture.whenStable();
      const carouselItems = fixture.nativeElement.querySelectorAll('.carousel-item');
      await vi.waitFor(async () => {
        await fixture.whenStable();
        expect(carouselItems[0]).toHaveAttribute('inert');
      });
      expect(carouselItems[2]).not.toHaveAttribute('inert');
    });
  });

  describe('Scroll', () => {
    it('should activate the next slide when scrolled horizontally', async () => {
      const viewport = fixture.nativeElement.querySelector('.carousel-viewport');
      const carouselItems = fixture.nativeElement.querySelectorAll('.carousel-item');

      // Scroll the viewport so the second slide becomes the most visible one.
      const delta =
        carouselItems[1].getBoundingClientRect().left - viewport.getBoundingClientRect().left;
      viewport.scrollLeft += delta;

      // The active slide is tracked by an IntersectionObserver, which reacts
      // asynchronously after scrolling, so wait until the DOM reflects the change.
      await vi.waitFor(async () => {
        await fixture.whenStable();
        expect(carouselItems[1]).not.toHaveAttribute('inert');
      });

      expect(carouselItems[0]).toHaveAttribute('inert');
    });
  });

  describe('Auto play', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should automatically navigate to the next slide with default duration', async () => {
      // The default auto play duration is 5000ms. Advance the fake timers past it
      // to trigger the navigation to the next slide.
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      testComponent.autoPlay.set(true);
      await fixture.whenStable();

      const carouselItems = fixture.nativeElement.querySelectorAll('.carousel-item');
      expect(carouselItems[0]).not.toHaveAttribute('inert');

      await vi.advanceTimersByTimeAsync(5000);

      // Wait for the carousel to process the navigation and update the DOM.
      await vi.waitFor(async () => {
        await fixture.whenStable();
        expect(carouselItems[1]).not.toHaveAttribute('inert');
      });

      expect(carouselItems[0]).toHaveAttribute('inert');
    });

    it('should automatically navigate to the next slide with specified duration', async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      testComponent.autoPlay.set(2000);
      await fixture.whenStable();

      const carouselItems = fixture.nativeElement.querySelectorAll('.carousel-item');
      expect(carouselItems[0]).not.toHaveAttribute('inert');
      await vi.advanceTimersByTimeAsync(2000);
      await fixture.whenStable();

      expect(carouselItems[1]).not.toHaveAttribute('inert');
      expect(carouselItems[0]).toHaveAttribute('inert');
    });

    it('should display pause button when auto play is enabled', async () => {
      await expect.element(page.getByRole('button', { name: 'Pause' })).not.toBeInTheDocument();
      testComponent.autoPlay.set(true);
      await fixture.whenStable();
      await expect.element(page.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });

    it('should toggle auto play when pause/play button is clicked', async () => {
      testComponent.autoPlay.set(true);
      await fixture.whenStable();

      const pauseButton = page.getByRole('button', { name: 'Pause' });

      await expect.element(pauseButton).toBeInTheDocument();
      await userEvent.click(pauseButton);
      await fixture.whenStable();
      await expect.element(pauseButton).not.toBeInTheDocument();
      const playButton = page.getByRole('button', { name: 'Play' });
      await expect.element(playButton).toBeInTheDocument();

      await userEvent.click(playButton);
      await fixture.whenStable();
      await expect.element(pauseButton).toBeInTheDocument();
      await expect.element(playButton).not.toBeInTheDocument();
    });

    it('should pause auto play when pause button is clicked and resume when play button is clicked', async () => {
      testComponent.autoPlay.set(true);
      await fixture.whenStable();
      const carouselItems = fixture.nativeElement.querySelectorAll('.carousel-item');
      expect(carouselItems[0]).not.toHaveAttribute('inert');

      await userEvent.click(page.getByRole('button', { name: 'Pause' }));

      // Advance time to see if auto play is paused. The active slide should not change.
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      await vi.advanceTimersByTimeAsync(5000);
      await fixture.whenStable();
      expect(carouselItems[0]).not.toHaveAttribute('inert');

      // Click the play button to resume auto play.
      await userEvent.click(page.getByRole('button', { name: 'Play' }));
      await vi.advanceTimersByTimeAsync(5000);
      await fixture.whenStable();
      expect(carouselItems[1]).not.toHaveAttribute('inert');
      expect(carouselItems[0]).toHaveAttribute('inert');
    });
  });
});
