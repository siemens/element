/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { GridStackWidget } from 'gridstack';
import { expectTypeOf } from 'vitest';

import { TEST_WIDGET } from '../../test/test-widget/test-widget';
import { createWidgetConfig, Widget, WidgetConfig } from './widgets.model';

describe('WidgetConfig', () => {
  it('inherits supported GridStack widget options without redefining their types', () => {
    type SupportedOptions = Omit<
      GridStackWidget,
      'id' | 'content' | 'lazyLoad' | 'resizeToContentParent' | 'sizeToContent' | 'subGridOpts'
    >;

    expectTypeOf<Pick<WidgetConfig, keyof SupportedOptions>>().toEqualTypeOf<SupportedOptions>();
    expectTypeOf<WidgetConfig['id']>().toEqualTypeOf<string>();
  });

  it('omits options that are incompatible with the widget host', () => {
    expectTypeOf<WidgetConfig>().not.toHaveProperty('content');
    expectTypeOf<WidgetConfig>().not.toHaveProperty('lazyLoad');
    expectTypeOf<WidgetConfig>().not.toHaveProperty('resizeToContentParent');
    expectTypeOf<WidgetConfig>().not.toHaveProperty('sizeToContent');
    expectTypeOf<WidgetConfig>().not.toHaveProperty('subGridOpts');
  });
});

describe('createWidgetConfig', () => {
  it('copies native GridStack options from widget defaults', () => {
    const defaults = {
      w: 4,
      h: 3,
      minW: 2,
      minH: 2,
      maxW: 6,
      maxH: 5,
      noMove: true,
      noResize: true,
      locked: true,
      autoPosition: true,
      print: { hide: true }
    } satisfies Widget['defaults'];

    const config = createWidgetConfig({ ...TEST_WIDGET, defaults });

    expect(config).toMatchObject(defaults);
    expect(config).toMatchObject({ heading: TEST_WIDGET.name, widgetId: TEST_WIDGET.id });
  });

  it('preserves legacy sizing defaults without adding competing native values', () => {
    const defaults = { width: 4, height: 3, minWidth: 2, minHeight: 2 };

    const config = createWidgetConfig({ ...TEST_WIDGET, defaults });

    expect(config).toMatchObject(defaults);
    expect(config).not.toHaveProperty('w');
    expect(config).not.toHaveProperty('h');
    expect(config).not.toHaveProperty('minW');
    expect(config).not.toHaveProperty('minH');
  });

  it('preserves the default minimum width for existing widget editors', () => {
    const config = createWidgetConfig({ ...TEST_WIDGET, defaults: undefined });

    expect(config).toMatchObject({ minWidth: 3 });
  });
});
