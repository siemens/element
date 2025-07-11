/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DoCheck,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BlinkService, STATUS_ICON, TextMeasureService } from '@siemens/element-ng/common';
import {
  elementDown2,
  elementSoundMute,
  elementSoundOn,
  addIcons,
  SiIconNextComponent
} from '@siemens/element-ng/icon';
import {
  ResizeObserverService,
  SiResizeObserverDirective
} from '@siemens/element-ng/resize-observer';
import {
  injectSiTranslateService,
  SiTranslateModule
} from '@siemens/element-translate-ng/translate';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { SiStatusBarItemComponent } from './si-status-bar-item/si-status-bar-item.component';
import { StatusBarItem } from './si-status-bar-item/si-status-bar-item.model';

interface ExtendedStatusBarItem extends StatusBarItem {
  isSpecial?: boolean;
  mutePadding?: boolean;
}

// this is a function because Angular compiler exports arrows for no good reason
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function itemSortFunction(a: StatusBarItem, b: StatusBarItem): number {
  return a.status && b.status ? STATUS_ICON[a.status].severity - STATUS_ICON[b.status].severity : 0;
}

let idCounter = 1;

/**
 * The status bar is the main component within an application to inform users at all times
 * about important status information.
 */
@Component({
  selector: 'si-status-bar',
  imports: [
    NgClass,
    NgTemplateOutlet,
    SiIconNextComponent,
    SiStatusBarItemComponent,
    SiResizeObserverDirective,
    SiTranslateModule
  ],
  templateUrl: './si-status-bar.component.html',
  styleUrl: './si-status-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiStatusBarComponent implements DoCheck, OnDestroy, OnChanges {
  private static readonly itemMinWidth = 100;
  private static readonly itemMaxWidth = 152;
  private static readonly itemSpacing = 4;
  private static readonly itemPaddingX = 44; // padding + icon size + icon margin
  private static readonly itemPaddingXdeprecated = 20; // padding + color bar
  private static readonly muteButtonWidth = 48;

  /**
   * Array of status bar items.
   */
  readonly items = input.required<StatusBarItem[]>();
  /**
   * When true, items with a value have a blinking background
   *
   * @defaultValue false
   */
  readonly blink = input(false, { transform: booleanAttribute });
  /**
   * State of the mute button. Set to `undefined` for no button.
   */
  readonly muteButton = input<boolean>();
  /**
   * Text/translation key on mute button for screen reader
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_STATUS_BAR.MUTE:Mute/unmute`
   * ```
   */
  readonly muteButtonText = input($localize`:@@SI_STATUS_BAR.MUTE:Mute/unmute`);
  /**
   * Text/translation key for "All OK" status in mobile
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_STATUS_BAR.ALL_OK:All OK`
   * ```
   */
  readonly allOkText = input($localize`:@@SI_STATUS_BAR.ALL_OK:All OK`);
  /**
   * compact mode
   *
   * @defaultValue false
   */
  readonly compact = input(false, { transform: booleanAttribute });
  /**
   * blink pulse generator for synchronized blinking with other components
   */
  readonly blinkPulse = input<Observable<boolean>>();
  /**
   * Text for the navbar expand button. Required for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_STATUS_BAR.EXPAND:Expand`
   * ```
   */
  readonly expandButtonText = input($localize`:@@SI_STATUS_BAR.EXPAND:Expand`);
  /**
   * Text for the navbar collapse button. Required for a11y
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_STATUS_BAR.COLLAPSE:Collapse`
   * ```
   */
  readonly collapseButtonText = input($localize`:@@SI_STATUS_BAR.COLLAPSE:Collapse`);

  /**
   * Emitted when the mute toggle button is clicked
   */
  readonly muteToggle = output();

  private readonly theBar = viewChild.required<ElementRef>('thebar');
  private readonly content = viewChild.required<ElementRef>('content');
  private readonly custom = viewChild.required<ElementRef>('custom');

  protected readonly responsiveItems = signal<ExtendedStatusBarItem[]>([]);
  protected responsiveMode = 0;
  protected readonly expanded = signal(0);
  protected readonly placeholderHeight = signal(0);
  protected readonly contentHeight = signal<number | undefined>(undefined);
  protected readonly blinkOnOff = signal<boolean | undefined>(undefined);
  protected readonly icons = addIcons({ elementDown2, elementSoundMute, elementSoundOn });
  protected statusId = `__si-status-bar-${idCounter++}`;

  private timer: any;

  private blinkSubs?: Subscription;

  private readonly element = inject(ElementRef);
  private readonly blinkService = inject(BlinkService);
  private readonly translateService = injectSiTranslateService();
  private readonly resizeObserver = inject(ResizeObserverService);
  private readonly measureService = inject(TextMeasureService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.resizeObserver
      .observe(this.element.nativeElement, 100, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resizeHandler());
    this.translateService.translationChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resizeHandler());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.blinkService && changes.blink) {
      this.blinkSubs?.unsubscribe();
      if (this.blink()) {
        const pulse = this.blinkPulse() ?? this.blinkService.pulse$;
        this.blinkSubs = pulse.subscribe(onOff => {
          this.blinkOnOff.set(onOff);
        });
      }
    }
    this.resizeHandler();
  }

  ngDoCheck(): void {
    if (this.responsiveMode) {
      this.calcResponsiveItems();
    }
  }

  ngOnDestroy(): void {
    this.blinkSubs?.unsubscribe();
  }

  protected onItemClicked(item: StatusBarItem): void {
    if (item.action) {
      item.action(item);
    }
  }

  protected toggleExpand(): void {
    clearTimeout(this.timer);
    if (!this.expanded()) {
      this.expanded.set(2);
      this.placeholderHeight.set(this.theBar().nativeElement.offsetHeight);
      this.contentHeight.set(0);

      this.timer = window.setTimeout(() => {
        this.contentHeight.set(this.content().nativeElement.scrollHeight);
        window.setTimeout(() => {
          this.contentHeight.set(undefined);
        }, 500);
      }, 10);
    } else {
      this.contentHeight.set(this.content().nativeElement.scrollHeight);
      this.expanded.set(1);

      window.setTimeout(() => {
        this.contentHeight.set(0);
        window.setTimeout(() => {
          this.placeholderHeight.set(0);
          this.expanded.set(0);
        }, 500);
      }, 10);
    }
  }

  protected resizeHandler(): void {
    const size = this.element.nativeElement.clientWidth;
    const muteWidth = this.muteButton() !== undefined ? SiStatusBarComponent.muteButtonWidth : 0;
    const customWidth = this.custom().nativeElement.scrollWidth ?? 0;
    const minWidth =
      this.items().length * (SiStatusBarComponent.itemMinWidth + SiStatusBarComponent.itemSpacing) +
      SiStatusBarComponent.itemSpacing +
      muteWidth +
      customWidth;
    if (size < minWidth) {
      this.setResponsiveMode(true);
    } else if (this.items().length) {
      this.calculateRequiredWidth(muteWidth, customWidth);
    }
  }

  private setResponsiveMode(responsive: boolean): void {
    if (responsive) {
      const size = this.element.nativeElement.clientWidth;
      this.responsiveMode = Math.max(Math.floor(size / SiStatusBarComponent.itemMaxWidth) - 1, 2);
    } else {
      this.responsiveMode = 0;
    }

    if (this.responsiveMode) {
      this.contentHeight.set(this.expanded() ? this.content().nativeElement.scrollHeight : 0);
    } else {
      this.expanded.set(0);
      this.placeholderHeight.set(0);
      this.contentHeight.set(undefined);
    }
  }

  private calcResponsiveItems(): void {
    const activeItems: ExtendedStatusBarItem[] = this.items()
      .filter(item => item.value)
      .sort(itemSortFunction);

    if (activeItems.length > this.responsiveMode) {
      activeItems[this.responsiveMode - 1] = {
        status: activeItems[this.responsiveMode - 1].status,
        color: activeItems[this.responsiveMode - 1].color,
        value: activeItems.length - this.responsiveMode + 1 + '+',
        title: '',
        action: () => this.toggleExpand(),
        isSpecial: true
      };
      activeItems.length = this.responsiveMode;
    } else if (!activeItems.length) {
      activeItems.push({
        status: 'success',
        title: '',
        value: this.allOkText(),
        isSpecial: true
      });
    }
    if (activeItems.length === this.responsiveMode) {
      activeItems[activeItems.length - 1].mutePadding = true;
    }
    this.responsiveItems.set(activeItems);
  }

  private calculateRequiredWidth(muteWidth: number, customWidth: number): void {
    const keys: string[] = [];
    for (const item of this.items()) {
      keys.push(item.title, item.value.toString());
    }
    this.translateService
      .translateAsync(keys)
      .pipe(first())
      .subscribe(translations => {
        const size = this.element.nativeElement.clientWidth;

        const requiredWidth = this.items().reduce(
          (acc, item) => {
            const titleWidth = this.measureService.measureText(translations[item.title]);
            const valueWidth = this.measureService.measureText(
              translations[item.value],
              undefined,
              { fontWeight: 'bold' }
            );
            const textWidth = Math.max(titleWidth, valueWidth);
            const itemWidth =
              Math.max(
                SiStatusBarComponent.itemMinWidth,
                textWidth +
                  (item.color
                    ? SiStatusBarComponent.itemPaddingXdeprecated
                    : SiStatusBarComponent.itemPaddingX)
              ) + SiStatusBarComponent.itemSpacing;
            return acc + itemWidth;
          },
          muteWidth + customWidth + SiStatusBarComponent.itemSpacing
        );

        this.setResponsiveMode(size < requiredWidth);
      });
  }
}
