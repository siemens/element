/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SiDummyComponent } from './components/si-dummy.component';
import { SiExampleOverviewComponent } from './components/si-example-overview/si-example-overview.component';
import { SiExampleViewerComponent } from './components/si-example-viewer/si-example-viewer.component';
import { SiLivePreviewWrapperComponent } from './components/si-live-preview-wrapper/si-live-preview-wrapper.component';

export const livePreviewRoutes: Routes = [
  {
    path: 'overview',
    children: [
      // those need to be explicit for Ionic router related components like tabs
      { path: 'route1', component: SiDummyComponent },
      { path: 'route2', component: SiDummyComponent },
      { path: 'route3', component: SiDummyComponent },
      { path: 'route4', component: SiDummyComponent },
      { path: 'route5', component: SiDummyComponent },
      { path: '**', component: SiExampleOverviewComponent }
    ]
  },
  {
    path: 'viewer/:mode',
    component: SiExampleViewerComponent,
    children: [
      { path: 'route1', component: SiDummyComponent },
      { path: 'route2', component: SiDummyComponent },
      { path: 'route3', component: SiDummyComponent },
      { path: 'route4', component: SiDummyComponent },
      { path: 'route5', component: SiDummyComponent },
      { path: '**', component: SiDummyComponent }
    ]
  },
  {
    path: 'iframe',
    component: SiLivePreviewWrapperComponent,
    children: [
      { path: 'route1', component: SiDummyComponent },
      { path: 'route2', component: SiDummyComponent },
      { path: 'route3', component: SiDummyComponent },
      { path: 'route4', component: SiDummyComponent },
      { path: 'route5', component: SiDummyComponent },
      { path: '**', component: SiDummyComponent }
    ]
  },
  { path: '', redirectTo: 'viewer/editor', pathMatch: 'full' },
  { path: '**', component: SiExampleViewerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(livePreviewRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class SiLivePreviewRoutingModule {}

export { SiLivePreviewRoutingModule as SimplLivePreviewRoutingModule };
