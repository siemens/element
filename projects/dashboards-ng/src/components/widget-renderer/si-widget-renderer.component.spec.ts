/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';

import { TEST_WIDGET, TEST_WIDGET_CONFIG_0 } from '../../../test/test-widget/test-widget';
import { SiWidgetHostComponent } from '../widget-host/si-widget-host.component';
import { SiWidgetRendererComponent } from './si-widget-renderer.component';

describe('SiWidgetRendererComponent', () => {
  let fixture: ComponentFixture<SiWidgetRendererComponent>;

  const getWidgetHost = (): SiWidgetHostComponent | undefined => {
    const debugEl = fixture.debugElement.query(
      (el: any) => el.componentInstance instanceof SiWidgetHostComponent
    );
    return debugEl?.componentInstance as SiWidgetHostComponent | undefined;
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(SiWidgetRendererComponent);
  });

  describe('renders widget host', () => {
    it('should pass the widgetConfig to the widget host', async () => {
      fixture.componentRef.setInput('widgetConfig', {
        ...TEST_WIDGET_CONFIG_0,
        heading: 'Custom Heading'
      });
      fixture.componentRef.setInput('widget', TEST_WIDGET);
      await fixture.whenStable();
      const cardHeader = page.getByText('Custom Heading');
      await expect.element(cardHeader).toBeInTheDocument();
    });

    it("should pass the widget's componentFactory to the widget host", async () => {
      fixture.componentRef.setInput('widgetConfig', TEST_WIDGET_CONFIG_0);
      fixture.componentRef.setInput('widget', TEST_WIDGET);
      await fixture.whenStable();
      const host = getWidgetHost();
      expect(host!.componentFactory()).toEqual(TEST_WIDGET.componentFactory);
    });
  });
});
