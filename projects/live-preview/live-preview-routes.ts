/**
 * Copyright (c) Siemens 2016 - 2026
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
    children: [{ path: '**', component: SiExampleOverviewComponent }]
  },
  {
    path: 'viewer/:mode',
    component: SiExampleViewerComponent,
    children: [{ path: '**', component: SiDummyComponent }]
  },
  {
    path: 'iframe',
    component: SiLivePreviewWrapperComponent,
    children: [{ path: '**', component: SiDummyComponent }]
  },
  { path: '', redirectTo: 'viewer/editor', pathMatch: 'full' },
  { path: '**', component: SiExampleViewerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(livePreviewRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class SiLivePreviewRoutingModule {}

/**
 * @deprecated Use {@link SiLivePreviewRoutingModule} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
export { SiLivePreviewRoutingModule as SimplLivePreviewRoutingModule };
