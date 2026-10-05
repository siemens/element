/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnChanges,
  OnDestroy,
  viewChild,
  viewChildren
} from '@angular/core';
import { elementBreadcrumbRoot, elementRight2 } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiLinkDirective } from '@siemens/element-ng/link';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { SiTooltipOverflowDirective } from '@siemens/element-ng/tooltip';
import {
  injectSiTranslateService,
  SiTranslatePipe,
  t
} from '@siemens/element-translate-ng/translate';
import { merge, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BreadcrumbItem, EnumeratedBreadcrumbItem } from './breadcrumb-item.model';
import { SiBreadcrumbItemTemplateDirective } from './si-breadcrumb-item-template.directive';

/**
 * Defines how many items should be displayed at the end of the breadcrumb if possible.
 */
const NUMBER_OF_SHOWN_ITEMS_AT_END = 2;

/**
 * Defines the width of the root icon in pixels.
 */
const ROOT_ICON_WIDTH = 24;

let controlIdCounter = 1;

@Component({
  selector: 'si-breadcrumb',
  imports: [
    NgTemplateOutlet,
    SiIconComponent,
    SiLinkDirective,
    SiResizeObserverDirective,
    SiTooltipOverflowDirective,
    SiTranslatePipe,
    SiBreadcrumbItemTemplateDirective
  ],
  templateUrl: './si-breadcrumb.component.html',
  styleUrl: './si-breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiBreadcrumbComponent implements OnChanges, OnDestroy {
  /** Array of breadcrumb items. */
  readonly items = input.required<BreadcrumbItem[]>();
  /**
   * Shows the "root" route as the provided title string instead of an icon.
   *
   * @defaultValue false
   */
  readonly showRootAsText = input(false, { transform: booleanAttribute });
  /**
   * Aria label for the main breadcrumb navigation. Needed for a11y.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_BREADCRUMB:Breadcrumb navigation`)
   * ```
   */
  readonly ariaLabel = input(t(() => $localize`:@@SI_BREADCRUMB:Breadcrumb navigation`));

  private translationSubscription?: Subscription;
  private itemsProcessed = false;
  private numberOfItems = 0;

  protected itemsShown: EnumeratedBreadcrumbItem[] = [];
  protected itemsHidden: EnumeratedBreadcrumbItem[] = [];
  protected breadcrumbShortened = false;
  protected ellipsesLevel = 0;
  // Record to allow for -1 (root).
  protected breadcrumbDropdownOpen: number | undefined = undefined;
  protected controlId = `__si-breadcrumb-${controlIdCounter++}-`;
  protected readonly icons = addIcons({ elementBreadcrumbRoot, elementRight2 });

  private readonly breadcrumbElement = viewChild.required<ElementRef>('breadcrumb');
  private readonly breadcrumbElements = viewChildren<ElementRef>('breadcrumbItem');

  private changeDetector = inject(ChangeDetectorRef);
  private translate = injectSiTranslateService();

  ngOnChanges(): void {
    // Reprocess items on every change and on init
    this.processItems();
  }

  ngOnDestroy(): void {
    this.translationSubscription?.unsubscribe();
  }

  private processItems(): void {
    this.numberOfItems = this.items().length;

    this.translationSubscription?.unsubscribe();
    if (this.numberOfItems) {
      this.translationSubscription = merge(this.translate.translationChange, of(undefined))
        .pipe(switchMap(() => this.translate.translateAsync(this.items().map(item => item.title))))
        .subscribe(translatedTitles => {
          // Add the level and mark the last item, keeping the full translated titles.
          let counter = -1;
          const enumeratedItems = this.items().map(item => {
            counter++;
            const title = translatedTitles[item.title];

            // If the root element should be displayed as text, set level not to 0.
            // This is used to distinguish in the template between icon and text.
            const level = counter === 0 && this.showRootAsText() ? -1 : counter;

            return {
              ...item,
              title,
              level,
              hide: false,
              lastItem: counter === this.numberOfItems - 1
            };
          });
          this.itemsShown = enumeratedItems;
          this.itemsHidden = [];
          this.breadcrumbShortened = false;
          this.breadcrumbDropdownOpen = undefined;
          this.itemsProcessed = true;
          this.resetBreadcrumb();
        });
    } else {
      this.itemsShown = [];
      this.itemsHidden = [];
      this.breadcrumbShortened = false;
      this.breadcrumbDropdownOpen = undefined;
      this.itemsProcessed = true;
      this.resetBreadcrumb();
    }
  }

  /** Toggle the ellipses dropdown to show the hidden breadcrumb levels. */
  protected toggleBreadcrumbDropdown(itemLevel: number): void {
    this.breadcrumbDropdownOpen = this.breadcrumbDropdownOpen === itemLevel ? undefined : itemLevel;
  }

  // Close dropdown on click anywhere else
  @HostListener('document:click', ['$event.target'])
  protected documentClick(targetElement: any): void {
    if (this.breadcrumbDropdownOpen) {
      if (!this.breadcrumbElement().nativeElement.contains(targetElement)) {
        // Close all dropdowns.
        this.breadcrumbDropdownOpen = undefined;
      }
    }
  }

  protected resetBreadcrumb(): void {
    if (this.itemsProcessed) {
      this.numberOfItems = this.items().length;
      // Add an additional the ellipses item to the end of the shownItems (breadcrumb items).
      const ellipsesItem = { title: '...', level: this.numberOfItems };
      this.itemsShown.push(ellipsesItem);
      if (this.breadcrumbShortened) {
        // If the breadcrumb was shortened before, remove the ellipses and add back itemsHidden (breadcrumb dropdown items).
        this.breadcrumbShortened = false;
        this.itemsShown.splice(this.ellipsesLevel, 1, ...this.itemsHidden);
        this.itemsHidden = [];
      }
      // Wait for the next change detection cycle to measure the updated item length.
      this.changeDetector.detectChanges();
      this.calculateBreadcrumb();
    }
  }

  private calculateBreadcrumb(): void {
    const maxWidth = this.breadcrumbElement().nativeElement.clientWidth;
    const breadcrumbElementsList = this.breadcrumbElements().map(item => item);
    // Measure the length of the last additional ellipses item, then remove it from itemsShown (breadcrumb items).
    const ellipsesWidth = breadcrumbElementsList[this.numberOfItems].nativeElement.offsetWidth;
    this.itemsShown.splice(this.numberOfItems, 1);
    let currentWidth = this.showRootAsText() ? 0 : ROOT_ICON_WIDTH;
    const numberOfItemsKeptAtEnd = Math.min(NUMBER_OF_SHOWN_ITEMS_AT_END, this.numberOfItems - 1);
    let reverseCounter = this.numberOfItems;
    // Test for numberOfItemsKeptAtEnd items from the end if they still fit, if not, set breadcrumbShortened to true.
    breadcrumbElementsList
      .slice(this.numberOfItems - numberOfItemsKeptAtEnd, this.numberOfItems)
      .reverse()
      .map(item => {
        if (!this.breadcrumbShortened) {
          const currentItemWidth = item.nativeElement.offsetWidth;
          if (currentWidth + currentItemWidth > maxWidth) {
            this.breadcrumbShortened = true;
            // Test if the ellipses item still fits, if not remove last (actually next in original order) item as well.
            if (currentWidth + ellipsesWidth > maxWidth) {
              reverseCounter++;
            }
          } else {
            currentWidth += currentItemWidth;
            reverseCounter--;
          }
        }
      });

    const start = this.showRootAsText() ? 0 : 1;
    let counter = start;
    // If breadcrumbShortened is not true yet, test for the rest of the items from the start
    // Whether they still fit, if not, set breadcrumbShortened to true.
    breadcrumbElementsList.slice(start, this.numberOfItems - numberOfItemsKeptAtEnd).map(item => {
      if (!this.breadcrumbShortened) {
        const currentItemWidth = item.nativeElement.offsetWidth;
        if (currentWidth + currentItemWidth > maxWidth) {
          this.breadcrumbShortened = true;
          // Test if the ellipses item still fits, if not remove last item as well.
          // If the counter is still on 1, instead remove last (actually next in original order) from
          // the previous reverse calculation
          if (currentWidth + ellipsesWidth > maxWidth) {
            if (counter > 1) {
              counter--;
            } else {
              reverseCounter++;
            }
          }
        } else {
          currentWidth += currentItemWidth;
          counter++;
        }
      }
    });
    // If breadcrumbShortened is true, move the items that do not fit to itemsHidden (breadcrumb dropdown items) and add ellipses item.
    if (this.breadcrumbShortened) {
      this.ellipsesLevel = counter;
      this.itemsHidden = this.itemsShown.slice(this.ellipsesLevel, reverseCounter);
      const ellipsesItem = { title: '...', level: this.ellipsesLevel };
      this.itemsShown.splice(this.ellipsesLevel, reverseCounter - this.ellipsesLevel, ellipsesItem);
    }
    // Manually detect changes to prevent them from not being detected on language change
    this.changeDetector.detectChanges();
  }
}
