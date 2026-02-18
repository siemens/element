/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  ElementRef,
  signal,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import Map from 'ol/Map';

import { MapPointMetaData } from '../../models/map-point.interface';
import { SiMapPopoverClusterTemplateDirective } from './si-map-popover-cluster-template.directive';
import { SiMapPopoverTemplateDirective } from './si-map-popover-template.directive';
export interface RenderOptions {
  component?: Type<any>;
  mapPoints: MapPointMetaData | MapPointMetaData[];
  map?: Map;
}

@Component({
  selector: 'si-map-popover',
  imports: [SiMapPopoverTemplateDirective, SiMapPopoverClusterTemplateDirective],
  templateUrl: './si-map-popover.component.html',
  styleUrl: './si-map-popover.component.scss'
})
export class SiMapPopoverComponent {
  private readonly elementRef = viewChild.required<ElementRef>('popover');
  protected readonly maxHeight = signal<number | null>(null);

  protected readonly contentContainer = viewChild.required<ElementRef, ViewContainerRef>(
    'contentContainer',
    {
      read: ViewContainerRef
    }
  );

  protected readonly defaultContent = viewChild.required<ElementRef, TemplateRef<any>>(
    'defaultContent',
    {
      read: TemplateRef
    }
  );

  protected readonly defaultCluster = viewChild.required<ElementRef, TemplateRef<any>>(
    'defaultCluster',
    {
      read: TemplateRef
    }
  );

  public render({ component, mapPoints, map }: RenderOptions): void {
    this.contentContainer().clear();

    if (component) {
      this.renderCustomComponent(component, mapPoints);
    } else {
      this.renderDefault(mapPoints);
    }

    if (map) {
      const mapHeight = map.getTargetElement().getBoundingClientRect().height;
      const contentY = this.elementRef().nativeElement.getBoundingClientRect().top;
      const maxheight = mapHeight - contentY - 20;
      this.maxHeight.set(maxheight);
    }
  }

  private renderCustomComponent(
    component: Type<any>,
    mapPoints: MapPointMetaData | MapPointMetaData[]
  ): void {
    const componentRef = this.contentContainer().createComponent(component);

    // Assign map point meta data to component instance input
    componentRef.setInput(Array.isArray(mapPoints) ? 'mapPoints' : 'mapPoint', mapPoints);
    componentRef.changeDetectorRef.detectChanges();
  }

  private renderDefault(mapPoints: MapPointMetaData | MapPointMetaData[]): void {
    // Create an embedded view with the default content template
    const context = Array.isArray(mapPoints) ? { mapPoints } : { mapPoint: mapPoints };
    this.contentContainer().createEmbeddedView(this.defaultCluster(), context).detectChanges();
  }
}
