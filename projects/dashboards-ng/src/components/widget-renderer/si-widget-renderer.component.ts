/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Widget, WidgetConfig } from '../../model/widgets.model';
import { SiWidgetHostComponent } from '../widget-host/si-widget-host.component';

/**
 * A presentational (dumb) component that renders a single widget instance from a
 * {@link WidgetConfig} using the provided {@link Widget} definition. It delegates
 * the actual rendering to the {@link SiWidgetHostComponent}.
 *
 * **Intended Usage**
 *
 * This component renders an individual widget outside of a dashboard or grid,
 * without requiring manual host wiring. It is a self-contained widget cell that
 * can be placed anywhere a single widget needs to be shown, for example in kiosk
 * mode or within a custom layout such as a carousel.
 *
 * **Example**
 *
 * ```html
 * <!-- Render a single widget instance -->
 * <si-widget-renderer [widgetConfig]="widgetConfig" [widget]="widget" />
 * ```
 */
@Component({
  selector: 'si-widget-renderer',
  imports: [SiWidgetHostComponent],
  templateUrl: './si-widget-renderer.component.html',
  styleUrl: './si-widget-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiWidgetRendererComponent {
  /** The configuration of the widget instance to render. */
  readonly widgetConfig = input.required<WidgetConfig>();

  /**
   * The {@link Widget} definition used to render the given {@link widgetConfig}.
   * It must match the config's `widgetId`.
   */
  readonly widget = input.required<Widget>();
}
