/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, input, viewChild } from '@angular/core';
import { elementGoTo } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { LOG_EVENT } from '@siemens/live-preview';
import { MapPoint, MapPointMetaData, SiMapComponent } from '@siemens/maps-ng';
import { mockPoints, singlePoint } from 'src/app/mocks/points.mock';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-custom-popover',
  imports: [SiIconComponent],
  template: `
    <div style="max-block-size: 200px;">
      @for (point of mapPoints(); track $index) {
        <div class="d-flex gap-3 py-4 border-bottom">
          <div class="d-flex flex-column flex-grow-1">
            <h4>{{ point.name }}</h4>
            <small class="text-secondary text-truncate">{{ point.description }}</small>
          </div>
          <button
            type="button"
            class="btn btn-circle btn-ghost me-2 align-self-center"
            aria-label="Show details"
            (click)="pointClick(point)"
          >
            <si-icon class="icon" [icon]="icons.elementGoTo" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomClusterPopoverComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly icons = addIcons({ elementGoTo });
  readonly mapPoints = input.required<MapPointMetaData[]>();
  protected pointClick(point: MapPointMetaData): void {
    this.logEvent('Clicked on point', point);
  }
}

@Component({
  selector: 'app-sample',
  imports: [SiMapComponent],
  templateUrl: './si-map-custom-cluster-popover.html',
  host: { class: 'h-100 d-flex flex-column p-5' }
})
export class SampleComponent {
  readonly map = viewChild.required(SiMapComponent);
  readonly points: MapPoint[] = mockPoints;
  readonly maptilerKey = environment.maptilerKey;
  readonly popoverComponent = CustomClusterPopoverComponent;

  protected refresh(): void {
    this.map().refresh(this.points);
  }

  protected select(): void {
    this.map().select(singlePoint);
  }

  protected clear(): void {
    this.map().clear();
  }
}
