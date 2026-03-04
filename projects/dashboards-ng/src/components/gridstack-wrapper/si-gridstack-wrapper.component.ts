/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ComponentRef,
  computed,
  ElementRef,
  inject,
  input,
  inputBinding,
  IterableDiffer,
  IterableDiffers,
  NgZone,
  OnChanges,
  OnInit,
  output,
  outputBinding,
  signal,
  SimpleChanges,
  viewChild,
  ViewContainerRef,
  WritableSignal
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
  templateUrl: './si-gridstack-wrapper.component.html',
  styleUrl: './si-gridstack-wrapper.component.scss'
})
export class SiGridstackWrapperComponent implements OnInit, OnChanges {
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

  readonly gridstackContainer = viewChild('gridstackContainer', { read: ViewContainerRef });

  private grid!: GridStack;
  private markedForRender: WidgetConfig[] = [];
  private readonly gridItems = signal<
    {
      id: string;
      component: ComponentRef<SiWidgetHostComponent>;
    }[]
  >([]);
  private readonly gridItemsMap = computed(
    () => new Map(this.gridItems().map(item => [item.id, item]))
  );
  private readonly itemIdAttr = 'item-id';

  private ngZone = inject(NgZone);
  private elementRef = inject(ElementRef);
  private iterableDiffers = inject(IterableDiffers);
  private widgetConfigsDiffer?: IterableDiffer<WidgetConfig>;
  private readonly widgetConfigSignals = new Map<string, WritableSignal<WidgetConfig>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.widgetConfigs) {
      const { currentValue, firstChange } = changes.widgetConfigs;

      this.grid?.batchUpdate(true);
      if (firstChange) {
        this.markedForRender = currentValue;
        this.widgetConfigsDiffer = this.iterableDiffers
          .find(currentValue)
          .create((_, item: WidgetConfig) => item.id);
      } else {
        this.diffWidgetConfigs(currentValue);
      }

      this.updateLayout(currentValue);
      this.grid?.batchUpdate(false);
    }

    if (changes.editable) {
      const { currentValue, firstChange } = changes.editable;

      if (!firstChange) {
        this.grid.enableMove(currentValue);
        this.grid.enableResize(currentValue);
      }
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
    this.hookEvents(this.grid);

    this.mount(this.markedForRender);
    // Run initial diff to prime the differ with the current state
    this.widgetConfigsDiffer?.diff(this.markedForRender);
  }

  mount(items: WidgetConfig[]): void {
    if (items.length > 0) {
      items.forEach(item => {
        this.addToView(item);
      });
    }
  }

  unmount(items: WidgetConfig[]): void {
    if (items.length > 0) {
      items.forEach(item => {
        this.removeFromView(item.id);
      });
    }
  }

  getLayout(): WidgetPositionConfig[] {
    const gridItems = this.grid?.getGridItems();
    if (gridItems.length > 0) {
      const positions = gridItems.map(gridItemHTMLElement => {
        const id = gridItemHTMLElement.getAttribute('item-id')!;
        const x = Number(gridItemHTMLElement.getAttribute('gs-x')) || 0;
        const y = Number(gridItemHTMLElement.getAttribute('gs-y')) || 0;
        const width = Number(gridItemHTMLElement.getAttribute('gs-w')) || 0;
        const height = Number(gridItemHTMLElement.getAttribute('gs-h')) || 0;
        return { id, x, y, width, height };
      });
      return positions;
    } else {
      return [];
    }
  }

  private updateLayout(widgets: WidgetConfig[]): void {
    const widgetConfigMap = new Map(widgets.map(w => [w.id, { ...w, w: w.width, h: w.height }]));

    if (this.grid) {
      const gridItems = this.grid.getGridItems();
      gridItems.forEach(gridItem => {
        const itemId = gridItem.getAttribute('item-id');
        const config = widgetConfigMap.get(itemId!);
        if (config) {
          this.grid.update(gridItem, config);
        }
      });
    }
  }

  private addToView(item: WidgetConfig): void {
    const configSignal = signal(item);
    this.widgetConfigSignals.set(item.id, configSignal);

    const componentRef = this.gridstackContainer()!.createComponent(SiWidgetHostComponent, {
      bindings: [
        inputBinding('widgetConfig', configSignal),
        outputBinding<string>('remove', widgetId => {
          this.widgetInstanceRemove.emit(widgetId);
        }),
        outputBinding<WidgetConfig>('edit', widgetConfig => {
          this.widgetInstanceEdit.emit(widgetConfig);
        })
      ]
    });

    const element = componentRef.location.nativeElement as HTMLElement;
    element.setAttribute(this.itemIdAttr, item.id!);
    this.gridItems.update(items => [...items, { id: item.id!, component: componentRef }]);
    this.grid.makeWidget(element, {
      w: item.width,
      h: item.height,
      x: item.x,
      y: item.y,
      minW: item.minWidth,
      minH: item.minHeight
    });
  }

  private removeFromView(widgetId: string): void {
    const gridItemElements = this.grid.getGridItems();

    const toRemove = gridItemElements.find(
      (el: HTMLElement) => el.getAttribute(this.itemIdAttr) === widgetId
    );

    if (toRemove) {
      this.grid.removeWidget(toRemove);
      const gridItemToRemove = this.gridItemsMap().get(widgetId);
      gridItemToRemove?.component.destroy();
      this.widgetConfigSignals.delete(widgetId);
      this.gridItemsMap().delete(widgetId);
      this.gridItems.set(Array.from(this.gridItemsMap().values()));
    }
  }

  /**
   * Uses IterableDiffer to detect added, removed, and identity-changed items.
   * Only widgets whose object reference changed get their signal updated.
   */
  private diffWidgetConfigs(configs: WidgetConfig[]): void {
    const changes = this.widgetConfigsDiffer?.diff(configs);
    if (changes) {
      const toMount: WidgetConfig[] = [];
      const toUnmount: WidgetConfig[] = [];

      changes.forEachAddedItem(record => toMount.push(record.item));
      changes.forEachRemovedItem(record => toUnmount.push(record.item));
      changes.forEachIdentityChange(record =>
        this.widgetConfigSignals.get(record.item.id)?.set(record.item)
      );

      if (toMount.length) {
        this.mount(toMount);
      }
      if (toUnmount.length) {
        this.unmount(toUnmount);
      }
    }
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
