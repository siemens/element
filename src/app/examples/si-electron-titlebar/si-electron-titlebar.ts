/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  runsInElectron,
  SiElectrontitlebarComponent
} from '@spike-rabbit/element-ng/electron-titlebar';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { LOG_EVENT } from '@spike-rabbit/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiElectrontitlebarComponent],
  templateUrl: './si-electron-titlebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private _location = inject(Location);

  logEvent = inject(LOG_EVENT);
  // zoom levels of possible zoom % | index 5 = the default (100%)
  // private zoomLevels = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300];
  // private zoomLevel100 = 5;
  // private zoomLevelCurrent = 5;

  // to get the boolean if the application runs in electron or not use the import from above:
  runsInElectron = runsInElectron();

  goForward(): void {
    this._location.forward();
    this.logEvent('successfully browsed forward');
  }

  goBack(): void {
    this._location.back();
    this.logEvent('successfully browsed back');
  }

  onReload(): void {
    location.reload();
    this.logEvent('successfully reloaded the application');
  }

  zoomIn(): void {
    // get zoomLevelCurrent
    // and set zoomLevelCurrent + 1
    // setZoom(this.zoomLevels[this.zoomLevelCurrent])
    this.logEvent('successfully zoomed in');
  }

  zoomOut(): void {
    // get this.zoomLevelCurrent
    // and set this.zoomLevelCurrent -1
    // setZoom(this.zoomLevels[this.zoomLevelCurrent])
    this.logEvent('successfully zoomed out');
  }

  zoom100(): void {
    // this.zoomLevelCurrent = this.zoomLevel100;
    this.logEvent('successfully reseted the zoom');
  }

  items: MenuItem[] = [
    {
      type: 'action',
      label: 'Zoom in',
      icon: 'element-zoom-in',
      action: (): void => this.zoomIn()
    },
    {
      type: 'action',
      label: 'Zoom out',
      icon: 'element-zoom-out',
      action: (): void => this.zoomOut()
    },
    {
      type: 'action',
      label: 'Reset Zoom',
      icon: 'element-empty',
      action: (): void => this.zoom100()
    },
    { type: 'divider' },
    {
      type: 'action',
      label: 'Refresh',
      icon: 'element-refresh',
      action: (): void => this.onReload()
    }
  ];
}
