/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
  SimpleChanges,
  viewChildren
} from '@angular/core';
import { GridItemHTMLElement, GridStack, GridStackNode, GridStackOptions } from 'gridstack';

import { DEFAULT_GRIDSTACK_OPTIONS, GridConfig } from '../../model/gridstack.model';
import { WidgetConfig, WidgetPositionConfig } from '../../model/widgets.model';
import { SiWidgetHostComponent } from '../widget-host/si-widget-host.component';

export interface GridWrapperEvent {
  event: Event;
  items?: GridStackNode[];
  grid: GridStack;
  el?: GridItemHTMLElement;
}

@Component({
  selector: 'si-gridstack-wrapper',
  imports: [SiWidgetHostComponent],
  templateUrl: './si-gridstack-wrapper.component.html',
  styleUrl: './si-gridstack-wrapper.component.scss'
})
export class SiGridstackWrapperComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Grid items to render inside the gridstack
   *
   * @defaultValue []
   */
  readonly widgetConfigs = input<WidgetConfig[]>([]);

  /**
   * Whenever gridstack allows to drag, resize or delete the grid item
   *
   * @defaultValue false
   */
  readonly editable = input(false);

  /**
   * Module configuration
   */
  readonly gridConfig = input<GridConfig>();

  /**
   * Emits dashboard grid events.
   */
  readonly gridEvent = output<GridWrapperEvent>();
  /**
   * Emits the id of a widget instance that shall be removed.
   */
  readonly widgetInstanceRemove = output<string>();

  /**
   * Emits the id of a widget instance that shall be edited.
   */
  readonly widgetInstanceEdit = output<WidgetConfig>();

  private readonly widgetHosts = viewChildren(SiWidgetHostComponent);
  private readonly widgetHostsMap = computed(
    () => new Map(this.widgetHosts().map(host => [host.widgetConfig().id, host]))
  );

  protected grid?: GridStack;

  private readonly ngZone = inject(NgZone);
  private readonly elementRef = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (changes.widgetConfigs && !changes.widgetConfigs.firstChange) {
      const configs = changes.widgetConfigs.currentValue;
      const newIds = new Set(configs.map(w => w.id));
      const hostMap = this.widgetHostsMap();

      const hasAdds = configs.some(w => !hostMap.has(w.id));

      if (hasAdds) {
        this.startBatch();
      }

      if (isPlatformBrowser(this.platformId)) {
        for (const [id, host] of hostMap) {
          if (!newIds.has(id)) {
            this.grid?.removeWidget(host.elementRef.nativeElement);
          }
        }
      }
    }

    if (changes.editable && !changes.editable.firstChange) {
      this.grid?.enableMove(changes.editable.currentValue);
      this.grid?.enableResize(changes.editable.currentValue);
    }
  }

  ngOnInit(): void {
    const initialViewMode: GridStackOptions = {
      disableDrag: !this.editable(),
      disableResize: !this.editable()
    };

    const options: GridStackOptions = {
      ...DEFAULT_GRIDSTACK_OPTIONS,
      ...this.gridConfig()?.gridStackOptions,
      ...initialViewMode
    };

    this.grid = GridStack.init(options, this.elementRef.nativeElement.firstChild as HTMLElement);
    this.startBatch();
    this.hookEvents(this.grid);
  }

  ngOnDestroy(): void {
    this.grid?.destroy();
  }

  private startBatch(): void {
    this.grid?.batchUpdate(true);
    // this ensures that si-widget-host components are rendered before turning off batch mode.
    afterNextRender(() => this.grid?.batchUpdate(false), { injector: this.injector });
  }

  /**
   *
   * Returns the position of a specific widget in the grid.
   */
  getWidgetLayout(widgetId: string): WidgetPositionConfig | undefined {
    const gridItem = this.widgetHostsMap().get(widgetId);
    if (!gridItem) {
      return undefined;
    }
    const element = gridItem.elementRef.nativeElement as HTMLElement;
    return {
      id: widgetId,
      x: Number(element.getAttribute('gs-x')) || 0,
      y: Number(element.getAttribute('gs-y')) || 0,
      width: Number(element.getAttribute('gs-w')) || 0,
      height: Number(element.getAttribute('gs-h')) || 0
    };
  }

  private hookEvents(grid: GridStack): void {
    grid.on(
      'added removed dragstop resizestop disable enable dropped resize resizestart drag dragstart change',
      (event: Event) => {
        this.ngZone.run(() => {
          this.gridEvent.emit({
            event,
            grid
          });
        });
      }
    );
  }
}
