/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SiDummyComponent } from './components/si-dummy.component';
import { SiExampleViewerComponent } from './components/si-example-viewer/si-example-viewer.component';
import { SiLivePreviewWrapperComponent } from './components/si-live-preview-wrapper/si-live-preview-wrapper.component';

export const livePreviewRoutes: Routes = [
  {
    path: 'overview',
    children: [
      {
        path: '**',
        loadComponent: () =>
          import('./components/si-example-overview/si-example-overview.component').then(
            m => m.SiExampleOverviewComponent
          )
      }
    ]
  },
  {
    path: 'viewer/editor',
    loadComponent: () =>
      import('./components/si-example-editor/si-example-editor.component').then(
        m => m.SiExampleEditorComponent
      ),
    children: [{ path: '**', component: SiDummyComponent }]
  },
  {
    path: 'viewer/:mode',
    // Keep the renderer eager for the viewer/viewer route used by e2e tests.
    component: SiExampleViewerComponent,
    children: [{ path: '**', component: SiDummyComponent }]
  },
  {
    path: 'iframe',
    component: SiLivePreviewWrapperComponent,
    children: [{ path: '**', component: SiDummyComponent }]
  },
  { path: '', redirectTo: 'viewer/editor', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () =>
      import('./components/si-example-editor/si-example-editor.component').then(
        m => m.SiExampleEditorComponent
      )
  }
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
