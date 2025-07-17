/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ComponentRef,
  ElementRef,
  inject,
  input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  OutputRefSubscription,
  SimpleChanges,
  viewChild,
  ViewContainerRef
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

  readonly gridstackContainer = viewChild('gridstackContainer', { read: ViewContainerRef });

  private grid!: GridStack;
  private markedForRender: WidgetConfig[] = [];
  private gridItems: {
    id: string;
    component: ComponentRef<SiWidgetHostComponent>;
  }[] = [];
  private readonly itemIdAttr = 'item-id';

  private widgetIdSubscriptionMap = new Map<string, OutputRefSubscription[]>();

  private ngZone = inject(NgZone);
  private elementRef = inject(ElementRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.widgetConfigs) {
      const { currentValue, previousValue, firstChange } = changes.widgetConfigs;

      this.grid?.batchUpdate(true);
      if (firstChange) {
        this.markedForRender = currentValue;
      } else {
        // Get newly added items
        const toBeAdded = currentValue.filter(
          (item: WidgetConfig) => !previousValue.find((i: WidgetConfig) => i.id === item.id)
        );

        // Get deleted items
        const toBeRemoved = previousValue.filter(
          (item: WidgetConfig) => !currentValue.find((i: WidgetConfig) => i.id === item.id)
        );

        if (toBeAdded) {
          this.mount(toBeAdded);
        }

        if (toBeRemoved) {
          this.unmount(toBeRemoved);
        }
      }

      // Detect changes
      this.updateViewComponents(currentValue);
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
  }

  ngOnDestroy(): void {
    this.widgetIdSubscriptionMap.forEach(subscriptions => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    });
    this.widgetIdSubscriptionMap.clear();
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
    const tmp = widgets.map(w => ({ ...w, w: w.width, h: w.height }));
    if (this.grid) {
      const gridItems = this.grid.getGridItems();
      gridItems.forEach(gridItem => {
        const config = tmp.find(widget => widget.id === gridItem.getAttribute('item-id'));
        this.grid.update(gridItem, { ...config });
      });
    }
  }

  private addToView(item: WidgetConfig): void {
    const componentRef = this.gridstackContainer()!.createComponent(SiWidgetHostComponent);
    componentRef.setInput('widgetConfig', item);
    const subscriptions: OutputRefSubscription[] = [];
    const subscriptionRemove = componentRef.instance.remove.subscribe(widgetId => {
      const widgetSubscriptions = this.widgetIdSubscriptionMap.get(widgetId);
      if (widgetSubscriptions) {
        widgetSubscriptions.forEach(sub => sub.unsubscribe());
      }
      this.widgetInstanceRemove.emit(widgetId);
    });
    subscriptions.push(subscriptionRemove);
    const subscriptionEdit = componentRef.instance.edit.subscribe(widgetConfig => {
      this.widgetInstanceEdit.emit(widgetConfig);
    });
    subscriptions.push(subscriptionEdit);
    this.widgetIdSubscriptionMap.set(item.id, subscriptions);
    const element = componentRef.location.nativeElement as HTMLElement;
    element.setAttribute(this.itemIdAttr, item.id!);
    this.gridItems.push({ id: item.id!, component: componentRef });
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
      const index = this.gridItems.findIndex(i => i.id === widgetId);
      this.gridItems[index].component.destroy();
      this.gridItems.splice(index, 1);
    }
  }

  /**
   * GridItemComponents are created dynamically, change detection won't trigger as there is no \@Input binding.
   * We have to update instance and run ChangeDetectionRef manually.
   */
  private updateViewComponents(newConfigs: WidgetConfig[]): void {
    // TODO: lookup by id would fasten the update
    for (const config of newConfigs) {
      const gridItem = this.gridItems.find(item => item.id === config.id);
      if (gridItem) {
        gridItem.component.setInput('widgetConfig', config);
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
