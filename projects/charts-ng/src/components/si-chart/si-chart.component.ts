/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild,
  viewChildren
} from '@angular/core';
import { Subscription } from 'rxjs';

import { echarts } from '../../shared/echarts.custom';
import {
  DataZoomComponentOption,
  EChartOption,
  EChartSeries,
  GridComponentOption
} from '../../shared/echarts.model';
import { themeSupport } from '../../shared/theme-support';
import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiCustomLegendComponent } from '../si-custom-legend/si-custom-legend.component';
import {
  CustomLegend,
  CustomLegendItem,
  CustomLegendProps
} from '../si-custom-legend/si-custom-legend.interface';
import {
  AxisPointerEvent,
  CustomLegendMultiLineInfo,
  DataZoomEvent,
  DataZoomRange,
  FilterMode,
  GridRectCoordinate,
  LegendItem,
  LineColor,
  SelectedLegendItem,
  SeriesSelectionState,
  SeriesUpdate
} from './si-chart.interfaces';

@Component({
  selector: 'si-chart',
  templateUrl: './si-chart.component.html',
  styleUrl: './si-chart.component.scss',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent]
})
export class SiChartComponent implements AfterViewInit, OnChanges, OnInit, OnDestroy {
  /**
   * reference to the wrapper container. Used for setting scroll position, etc.
   *
   * @defaultValue
   * ```
   * viewChild.required<ElementRef>('chartContainerWrapper')
   * ```
   */
  readonly chartContainerWrapper = viewChild.required<ElementRef>('chartContainerWrapper');
  protected readonly chartContainer = viewChild<ElementRef>('chart');
  protected readonly externalZoomSliderContainer = viewChild<ElementRef>('externalZoomSlider');
  protected readonly siCustomLegend = viewChildren('siCustomLegend', {
    read: SiCustomLegendComponent
  });

  /**
   * See [ECharts 5.x Documentation]{@link https://echarts.apache.org/en/option.html}
   * for all available options.
   */
  readonly options = input<EChartOption>();
  /** Used to override specific properties set in `options`. */
  readonly additionalOptions = input<EChartOption>();
  readonly title = input<string>();
  readonly subTitle = input<string>();
  /** @defaultValue true */
  readonly showLegend = model(true);
  /** @defaultValue false */
  readonly showCustomLegend = input(false);
  /**
   * the renderer to use: canvas or svg
   *
   * @defaultValue 'canvas'
   */
  readonly renderer = input<'canvas' | 'svg'>('canvas');
  /**
   * Enables the zoom slider below the chart.
   *
   * @defaultValue false
   */
  readonly zoomSlider = input(false);
  /**
   * Shows data shadow in dataZoom slider, use together with `zoomSlider`.
   *
   * @defaultValue true
   */
  readonly zoomSliderShadow = input(true);
  /**
   * realtime update mode for zoom slider
   *
   * @defaultValue true
   */
  readonly zoomSliderRealtime = input(true);
  /**
   * enable brush mode for zoom slider
   *
   * @defaultValue true
   */
  readonly zoomSliderBrush = input(true);
  /**
   * Enables zooming inside the chart with the mouse wheel/touch.
   *
   * @defaultValue false
   */
  readonly zoomInside = input(false);
  /** @defaultValue 1000 */
  readonly maxEntries = input(1000);
  /**
   * No auto dataZoom update) by default. Use together with `autoZoomSeriesIndex`.
   *
   * @defaultValue -1
   */
  readonly visibleEntries = model(-1);
  /**
   * No auto dataZoom update) by default. Use together with `autoZoomSeriesIndex`.
   *
   * @defaultValue -1
   */
  readonly visibleRange = model(-1);
  /**
   * No auto dataZoom update) by default. Use together with `visibleEntries`.
   *
   * @defaultValue -1
   */
  readonly autoZoomSeriesIndex = input(-1);
  /** The desired theme to load. */
  readonly theme = input<any>();
  /** Used to override specific options of loaded `theme`. */
  readonly themeCustomization = input<any>();
  /**
   * The name of the color palette (if any) of the loaded `theme`.
   *
   * @defaultValue undefined
   */
  readonly palette = input<string | undefined>();
  /**
   * Used to display `axisPointer` line either by click or mouse-move.
   *
   * @defaultValue false
   */
  readonly axisPointer = input<(boolean | string) | undefined>(false);
  readonly dataZoomRange = input<DataZoomRange>();
  readonly dataZoomMinValueSpan = input<number>();
  readonly dataZoomMaxValueSpan = input<number>();
  /** @defaultValue 'none' */
  readonly dataZoomFilterMode = input<FilterMode>('none');
  readonly customLegendAction = input<boolean>();
  /**
   * @defaultValue
   * ```
   * { legendItemName: '' }
   * ```
   */
  readonly selectedItem = input<SelectedLegendItem>({ legendItemName: '' });
  readonly eChartContainerHeight = input<string | null>();
  /**
   * Flag to use external zoom slider
   *
   * @defaultValue false
   */
  readonly externalZoomSlider = input(false);
  /** External XAxis Formatter from consumer */
  readonly externalXAxisFormatter = input<(value: any, visibleRange: number) => string>();
  /**
   * If true, add consumer-provided time range bar. Use together with `zoomSlider`.
   * @deprecated The input will be removed in future versions as the time range bar slot is deprecated.
   *
   * @defaultValue false
   */
  readonly showTimeRangeBar = input(false);

  /** Event emitted when data zoom changes. */
  readonly dataZoom = output<DataZoomEvent>();
  /** Event emitted when axis pointer moves. */
  readonly pointer = output<AxisPointerEvent>();
  readonly selectionChanged = output<any>();
  readonly chartSeriesClick = output<LegendItem>();
  /** Event emitted when chart grid is resized. */
  readonly chartGridResized = output<GridRectCoordinate>();
  readonly customLegendMultiLineInfoEvent = output<CustomLegendMultiLineInfo[]>();
  /** Emitted when datazoom changes, indicating the time range in milliseconds, 0 for full range */
  readonly timeRangeChange = output<number>();

  /** Allow to override options specific for a chart type. */
  protected actualOptions: EChartOption = {};

  protected customLegend: CustomLegend[] = [
    {
      customLegends: [
        { list: [], unit: '' },
        { list: [], unit: '' }
      ],
      legendAxis: 'both'
    }
  ];
  /** @internal */
  chart!: echarts.ECharts;
  private extZoomSliderChart!: echarts.ECharts;
  private echartElement!: HTMLElement;
  private eChartExtSliderElement!: HTMLElement;
  protected readonly inProgress = signal(false);
  protected readonly backgroundColor = signal('');
  protected readonly textColor = signal('');
  protected readonly titleColor = signal('');
  protected readonly subTitleColor = signal('');
  private selectedSeriesColors: LineColor = {};
  private unselectedSeriesColors: LineColor = {};
  private seriesSelectionState: SeriesSelectionState = {};
  protected readonly containerHeight = signal<number | null>(null);

  protected activeTheme: any;
  protected autoZoomUpdate = true;

  private subscriptions = new Subscription();
  private prevAxisPointer: any = {};
  private lastValidDataZoom: any = {};
  private presetDataZoomRange?: DataZoomRange;
  private dataZoomSetupDone = false;
  private requestedDataZoom?: DataZoomRange;
  private measureCanvas?: CanvasRenderingContext2D;
  private readonly cdRef = inject(ChangeDetectorRef);

  protected curWidth = 0;
  protected curHeight = 0;
  protected readonly timeBarBottom = signal(50);
  protected readonly timeBarLeft = signal(32);
  protected readonly timeBarRight = signal(32);
  protected readonly timeBarHeight = signal(32);

  private gridCoordinates: GridRectCoordinate = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    containerWidth: 0,
    containerHeight: 0
  };
  private customLegendsMultiLineInfo: CustomLegendMultiLineInfo[] = [];
  protected extZoomSliderOptions: EChartOption = {
    animation: false,
    dataZoom: [
      { type: 'slider', showDataShadow: false },
      { type: 'inside', showDataShadow: false }
    ],
    grid: [{ left: 32, right: 32, top: 0, height: 0, containLabel: false }],
    xAxis: [{ type: 'time', axisLine: { onZero: true }, zlevel: 1 }],
    yAxis: [{ type: 'value', boundaryGap: [0, '100%'], splitLine: { show: false }, show: false }],
    series: [{ type: 'line', showSymbol: false, lineStyle: { opacity: 0 }, data: [] }]
  };

  private echartMouseDown = (): void => this.handleChartMouseDown();
  private echartMouseUp = (event: MouseEvent): void => this.handleChartMouseUp(event);

  private echartExtSliderMouseDown = (): void => this.handleExtChartMouseDown();
  private echartExtSliderMouseUp = (event: MouseEvent): void => this.handleExtChartMouseUp(event);

  private readonly ngZone = inject(NgZone);
  protected readonly shapePaths: Record<string, string> = {
    circle: 'M6 0A6 6 0 1 1 6 12A6 6 0 1 1 6 0Z',
    rect: 'M0 0H12V12H0Z',
    roundRect: 'M2 0H10A2 2 0 0 1 12 2V10A2 2 0 0 1 10 12H2A2 2 0 0 1 0 10V2A2 2 0 0 1 2 0Z',
    triangle: 'M6 0L12 12H0L6 0Z',
    diamond: 'M6 0L12 6L6 12L0 6L6 0Z',
    pin: 'M6.00049 0C8.48577 0 10.5005 2.01472 10.5005 4.5C10.5005 5.51817 10.0175 6.461 9.46826 7.31836C8.42358 8.94924 7.16317 10.4497 6.00049 12C4.83781 10.4497 3.57642 8.94924 2.53174 7.31836C1.98255 6.461 1.49951 5.51817 1.49951 4.5C1.49951 2.01472 3.51521 0 6.00049 0Z'
  };
  /**
   * Allow consuming applications to re-draw chart on window resizes.
   */
  resize(): void {
    if (!this.chart) {
      return;
    }
    const rect = this.chartContainer()?.nativeElement.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width && height && (width !== this.curWidth || height !== this.curHeight)) {
      this.curWidth = width;
      this.curHeight = height;

      this.ngZone.runOutsideAngular(() => {
        this.chart.resize({ width, height: this.containerHeight() ?? height });
        if (this.externalZoomSlider()) {
          this.extZoomSliderChart.resize();
        }
        setTimeout(() => this.checkGridSizeChange());
      });
      this.afterChartResize();
    }
    this.updateCustomLegendMultiLineInfo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options?.currentValue) {
      this.actualOptions = this.options()!;
    }

    if (!this.chart) {
      return;
    }

    if (changes.eChartContainerHeight) {
      this.setContainerHeight();
    }

    const selectedLegendItem = changes.selectedItem;
    if (
      selectedLegendItem &&
      !selectedLegendItem.isFirstChange() &&
      selectedLegendItem.currentValue
    ) {
      const event = {
        name: selectedLegendItem.currentValue.legendItemName,
        type: 'legendToggleSelect'
      };
      this.dispatchEChartAction(event);
    }

    if (
      this.customLegendAction() &&
      changes.options &&
      !changes.options.isFirstChange() &&
      !changes.options.currentValue.color.length
    ) {
      this.actualOptions.color = changes.options.previousValue.color;
    }
    if (changes.theme || changes.renderer) {
      // need to completely redo the chart for the theme change to take effect
      return this.resetChart();
    }

    let updates = 0;
    let applyAll = false;
    let skipMerge = false;

    if (
      changes.forceAll ||
      changes.yAxis ||
      changes.xAxis ||
      changes.options ||
      changes.series ||
      changes.value
    ) {
      // this is to clean the legend item list
      if (this.showCustomLegend() && this.customLegend && this.customLegend.length > 0) {
        this.customLegend.forEach(cl => {
          cl.customLegends = [
            { list: [], unit: '' },
            { list: [], unit: '' }
          ];
        });
      }
      this.applyOptions();
      applyAll = true;
      skipMerge =
        changes.series?.previousValue &&
        changes.series.currentValue &&
        changes.series.currentValue.length < changes.series.previousValue.length;
      updates++;
    }

    if (!applyAll && (changes.title || changes.subTitle)) {
      // already called when `applyOptions()` has been called
      this.applyTitles();
      updates++;
    }

    if (
      applyAll ||
      changes.forceAll ||
      changes.zoomSlider ||
      changes.zoomSliderShadow ||
      changes.zoomSliderRealtime ||
      changes.zoomSliderBrush ||
      changes.zoomInside ||
      changes.axisPointer ||
      changes.autoZoomSeriesIndex ||
      changes.visibleEntries ||
      changes.visibleRange
    ) {
      this.applyDataZoom();
      updates++;
    }

    if (applyAll || changes.forceAll || changes.palette || changes.additionalOptions) {
      this.applyAdditionalOptions();
      updates++;
    }

    if (applyAll) {
      this.applyStyles();
      setTimeout(() => this.updateCustomLegendMultiLineInfo());
    }

    let skipDz = false;

    if (updates) {
      if (changes.dataZoomRange) {
        this.setDataZoomRange(true);
        skipDz = true;
      }

      const dz = this.actualOptions.dataZoom!;
      let currentDataZoom: DataZoomComponentOption | undefined;
      if (skipMerge && this.hasDataZoom() && this.hasData() && !skipDz) {
        // forced updated is required when adding/removing series, see:
        //   https://github.com/apache/incubator-echarts/issues/6202
        // in order not to mess up current datazoom, save the current value and add it to options
        this.saveCurrentDataZoom();
        if (this.lastValidDataZoom) {
          currentDataZoom = dz[0];
          const newDataZoom: DataZoomComponentOption = {};
          echarts.util.merge(newDataZoom, dz[0], true);
          echarts.util.merge(newDataZoom, this.lastValidDataZoom, true);
          dz[0] = newDataZoom;
        }
      }

      this.updateEChart(skipMerge);

      if (currentDataZoom) {
        dz[0] = currentDataZoom;
        this.updateEChart(false, { dataZoom: this.actualOptions.dataZoom });
      }
      this.applyColorsToCustomLegends();
    }

    if (!skipDz && changes.dataZoomRange) {
      // this is done after a possible setOptions call to ensure echarts has all the desired states
      this.setDataZoomRange();
    }

    this.cdRef.markForCheck();
  }

  ngOnInit(): void {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.measureCanvas = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.measureCanvas.font = '12px "Siemens Sans"';
    const externalXAxisFormatter = this.externalXAxisFormatter();
    if (this.externalZoomSlider() && externalXAxisFormatter) {
      const consumerFormatter = externalXAxisFormatter;
      this.extZoomSliderOptions.xAxis[0].axisLabel = {
        formatter: (value: any) => consumerFormatter(value, this.visibleRange())
      };
    }
    this.applyTheme();
    // this is to clean the legend item list
    if (this.showCustomLegend() && this.customLegend && this.customLegend.length > 0) {
      this.customLegend.forEach(cl => {
        cl.customLegends = [
          { list: [], unit: '' },
          { list: [], unit: '' }
        ];
      });
    }
    this.applyOptions();
    this.applyAdditionalOptions();
    this.applyDataZoom();
    this.applyStyles();
    if (this.customLegendAction()) {
      this.fetchSeriesColors();
    }
  }

  ngAfterViewInit(skipZoom?: boolean): void {
    this.ngZone.runOutsideAngular(() => {
      const chartContainerEl = this.chartContainer()!.nativeElement;
      // set current dimension to avoid initial resize() call on chart
      const rect = chartContainerEl.getBoundingClientRect();
      this.curWidth = Math.floor(rect.width);
      this.curHeight = Math.floor(rect.height);

      const opts = { renderer: this.renderer() };
      this.chart = echarts.init(chartContainerEl, this.activeTheme, opts);
      this.echartElement = chartContainerEl as HTMLElement;
      this.getEChartInner()?.addEventListener('mousedown', this.echartMouseDown);
      this.chart.setOption(this.actualOptions);
      setTimeout(() => this.checkGridSizeChange());

      if (this.externalZoomSlider()) {
        this.extZoomSliderChart = echarts.init(
          this.externalZoomSliderContainer()!.nativeElement,
          this.activeTheme,
          opts
        );
        this.eChartExtSliderElement = this.externalZoomSliderContainer()!
          .nativeElement as HTMLElement;
        this.getEChartExternalSliderInner()?.addEventListener(
          'mousedown',
          this.echartExtSliderMouseDown
        );
        this.extZoomSliderChart.setOption(this.extZoomSliderOptions);
        this.extZoomSliderChart.on('datazoom', (event: any) => this.handleExtDataZoom(event));
      }
      this.afterChartInit(skipZoom);
    });
    setTimeout(() => {
      this.resize();
      this.applyColorsToCustomLegends();
    });
  }

  private calculateTextWidth(text: string): number {
    if (!this.measureCanvas) {
      return 150;
    }
    return Math.ceil(this.measureCanvas.measureText(text).width);
  }

  private disposeChart(): void {
    if (this.chart && !this.chart.isDisposed()) {
      this.chart.dispose();
    }
    if (this.extZoomSliderChart && !this.extZoomSliderChart.isDisposed()) {
      this.extZoomSliderChart.dispose();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.disposeChart();
  }

  /**
   * Re-render the whole chart.
   */
  @HostListener('window:theme-switch')
  resetChart(): void {
    this.applyTheme();

    if (!this.actualOptions) {
      // this can happen if the SiThemeService fires the theme switch when the chart is not
      // yet completely initialized
      return;
    }

    this.disposeChart();
    this.applyPalette();
    const addOpts = this.additionalOptions();
    if (addOpts?.palette) {
      echarts.util.merge(this.actualOptions.palette, addOpts.palette, true);
    }
    this.themeChanged();
    this.applyStyles();
    this.applyTitles();
    this.ngAfterViewInit(true); // eslint-disable-line @angular-eslint/no-lifecycle-call
    this.cdRef.markForCheck();
  }

  protected handleLegendClick(legend: CustomLegendItem): void {
    this.doToggleSeriesVisibility(legend.name, legend.selected, legend);
    this.cdRef.markForCheck();
  }

  protected handleLegendHover(legend: CustomLegendItem, start: boolean): void {
    this.dispatchEChartAction({
      type: start ? 'highlight' : 'downplay',
      [legend.alternativeNaming ? 'name' : 'seriesName']: legend.name
    });
  }

  /**
   * Toggle visibility of a series.
   */
  toggleSeriesVisibility(name: string, visible: boolean): void {
    const legendItem = this.findCustomLegendItem(name);
    this.doToggleSeriesVisibility(name, visible, legendItem);
    this.cdRef.markForCheck();
  }

  private doToggleSeriesVisibility(
    name: string,
    visible: boolean,
    legendItem?: CustomLegendItem
  ): void {
    if (legendItem) {
      legendItem.selected = visible;
    }
    this.dispatchEChartAction({ type: visible ? 'legendSelect' : 'legendUnSelect', name });

    if (this.externalZoomSlider()) {
      this.ngZone.runOutsideAngular(() => {
        this.extZoomSliderChart.dispatchAction({
          type: visible ? 'legendSelect' : 'legendUnSelect',
          name
        });
      });
    }
    const opt = this.getOptionNoClone();
    if (Array.isArray(opt.legend)) {
      const selection: any = {};
      opt.legend.forEach((l: any) => Object.assign(selection, l.selected));
      this.handleSelectionChanged({ selected: selection });
    }
  }

  private findCustomLegendItem(name: string): CustomLegendItem | undefined {
    if (this.showCustomLegend()) {
      for (const cl of this.customLegend) {
        for (const l of cl.customLegends) {
          for (const item of l.list) {
            if (item.name === name) {
              return item;
            }
          }
        }
      }
    }
    return undefined;
  }

  protected getValidXAxis(): Set<number> | undefined {
    return undefined;
  }

  protected setZoomMode(): void {}

  private applyTheme(): void {
    // Set default theme if no theme provided
    const theme = this.theme();
    if (theme?.style) {
      this.activeTheme = theme.style();
    } else if (themeSupport._defaultTheme?.style) {
      this.activeTheme = themeSupport._defaultTheme.style();
    }
    const themeCustomization = this.themeCustomization();
    if (themeCustomization) {
      const custom = echarts.util.merge({}, themeCustomization);
      this.activeTheme = echarts.util.merge(custom, this.activeTheme);
    }
  }

  protected themeChanged(): void {}

  protected applyOptions(): void {}

  protected applyCustomLegendPosition(): void {
    if (this.showLegend() && this.showCustomLegend()) {
      this.customLegend.forEach(cl => {
        if (cl.customLegends?.[0].list && cl.customLegends?.[1].list) {
          const leftLegend = cl.customLegends[0];
          const rightLegend = cl.customLegends[1];

          // if we have left and right axis
          if (leftLegend.list.length > 0 && rightLegend.list.length > 0) {
            cl.legendAxis = 'both';
          } else if (leftLegend.list.length > 0 && rightLegend.list.length === 0) {
            // if we have only left axis data
            cl.legendAxis = 'left';
          } else if (leftLegend.list.length === 0 && rightLegend.list.length > 0) {
            // if we have only right axis data
            cl.legendAxis = 'right';
          } else {
            cl.legendAxis = 'both';
          }
        } else {
          cl.legendAxis = 'both';
        }
      });
      this.cdRef.markForCheck();
    }
  }

  private applyAdditionalOptions(): void {
    // need to merge palette before the additionalOptions so that overrides work as expected
    this.applyPalette();

    if (this.additionalOptions()) {
      echarts.util.merge(this.actualOptions, this.additionalOptions(), true);
    }
  }

  private applyPalette(): void {
    const paletteValue = this.palette() ?? 'default';
    if (paletteValue) {
      const palette = this.getThemeCustomValue(['colorPalettes', paletteValue], null);
      if (palette) {
        this.actualOptions.color = palette;
        if (this.customLegendAction()) {
          this.fetchSeriesColors(palette);
        }
      }
    }
  }

  protected applyDataZoom(): void {
    if (!this.actualOptions.grid) {
      return;
    }
    this.actualOptions.dataZoom ??= [];

    const sliderOptions: any = {};
    const dataZoomMinValueSpan = this.dataZoomMinValueSpan();
    if (dataZoomMinValueSpan) {
      sliderOptions.minValueSpan = dataZoomMinValueSpan;
    }
    const dataZoomMaxValueSpan = this.dataZoomMaxValueSpan();
    if (dataZoomMaxValueSpan) {
      sliderOptions.maxValueSpan = dataZoomMaxValueSpan;
    }
    sliderOptions.realtime = this.zoomSliderRealtime();
    sliderOptions.brushSelect = this.zoomSliderBrush();
    sliderOptions.showDataShadow = this.zoomSliderShadow();
    sliderOptions.filterMode = this.dataZoomFilterMode();
    sliderOptions.showDetail = false;
    // keep external zoom slider in sync, always at index 0
    Object.assign(this.extZoomSliderOptions.dataZoom![0], sliderOptions);

    const dz = this.actualOptions.dataZoom!;
    const sliderIdx = dz.findIndex(z => z.type === 'slider');
    const insideIdx = dz.findIndex(z => z.type === 'inside');
    const zoomSlider = this.zoomSlider();
    if (zoomSlider && sliderIdx === -1) {
      // for the non-external, merge with other options
      const customOptions = this.getThemeCustomValue(['dataZoom', 'options'], {});
      const dzSliderOptions: any = Object.assign({ type: 'slider' }, customOptions, sliderOptions);
      Object.assign(this.extZoomSliderOptions.dataZoom![0], customOptions);

      const externalZoomSlider = this.externalZoomSlider();
      if (externalZoomSlider) {
        dzSliderOptions.show = false;
      }
      dz.push(dzSliderOptions);

      const gridOptions = externalZoomSlider
        ? this.getThemeCustomValue(['externalZoomSlider', 'grid'], {})
        : this.getThemeCustomValue(['dataZoom', 'grid'], {});

      if (this.showTimeRangeBar()) {
        const timeBarOptions = this.getThemeCustomValue(['timeRangeBar'], {});
        if (customOptions.height && customOptions.bottom) {
          this.timeBarBottom.set(customOptions.height + customOptions.bottom);
        }
        this.timeBarHeight.set(timeBarOptions?.height ?? 32);

        if (!externalZoomSlider) {
          gridOptions.bottom = (gridOptions?.bottom ?? 0) + this.timeBarHeight();
        }
      }

      echarts.util.merge(this.actualOptions.grid, gridOptions, true);
    } else if (zoomSlider && sliderIdx >= 0) {
      // update existing
      const dzSliderOptions = dz[sliderIdx];
      Object.assign(dzSliderOptions, sliderOptions);
    } else if (!zoomSlider && sliderIdx >= 0) {
      dz.splice(sliderIdx, 1);
    }
    const zoomInside = this.zoomInside();
    if (zoomInside && insideIdx === -1) {
      dz.push({ type: 'inside', filterMode: this.dataZoomFilterMode() });
    } else if (!zoomInside && insideIdx >= 0) {
      dz.splice(insideIdx, 1);
    }

    if (this.actualOptions.xAxis) {
      this.handleAxisPointer(this.actualOptions);
    }
    this.cdRef.markForCheck();
  }

  private handleAxisPointer(options: EChartOption): void {
    const axisPointer = this.axisPointer();
    if (axisPointer !== undefined) {
      options.axisPointer ??= {};
    }
    if (axisPointer === true) {
      options.axisPointer.triggerOn = 'click';
    } else if (axisPointer === false) {
      options.axisPointer.triggerOn = 'mousemove|click';
    } else if (typeof axisPointer === 'string') {
      options.axisPointer.triggerOn = axisPointer;
    }
    if (Array.isArray(options.xAxis)) {
      const xAxisArray: any[] = options.xAxis;
      xAxisArray.forEach(axis => this.handleAxisPointerSingleAxis(axis));
    } else {
      this.handleAxisPointerSingleAxis(options.xAxis);
    }
  }

  private handleAxisPointerSingleAxis(xAxis: any): void {
    if (this.axisPointer()) {
      echarts.util.merge(xAxis, { axisPointer: { handle: { show: true } } }, true);
    } else {
      echarts.util.merge(xAxis, { axisPointer: { handle: { show: false } } }, true);
    }
  }

  protected hasDataZoom(): boolean {
    return !!this.actualOptions.dataZoom?.length;
  }

  protected getThemeValue(props: string[], defaultValue: any, ns?: string): any {
    if (!this.activeTheme) {
      return defaultValue;
    }

    let currentValue = this.activeTheme;
    if (ns) {
      currentValue = currentValue[ns];
    }
    for (let i = 0; currentValue && i < props.length; i++) {
      currentValue = currentValue[props[i]];
    }
    return currentValue ?? defaultValue;
  }

  protected getThemeCustomValue(props: string[], defaultValue: any): any {
    return this.getThemeValue(props, defaultValue, 'simpl');
  }

  protected applyTitles(): void {
    const title = this.title();
    const subTitle = this.subTitle();
    const options = this.actualOptions;
    if (this.showLegend() && this.showCustomLegend()) {
      if (options.title) {
        options.title.show = false;
      }
      options.legend?.forEach(legend => {
        legend.show = false;
        legend.height = 0;
      });
      if (options.grid) {
        const gridOptions = this.getThemeCustomValue(['customLegend', 'grid'], {});
        echarts.util.merge(options.grid, gridOptions, true);
      }

      this.titleColor.set(this.getThemeValue(['title', 'textStyle', 'color'], null));
      this.subTitleColor.set(
        this.getThemeValue(['title', 'subtextStyle', 'color'], this.titleColor)
      );
      this.textColor.set(this.getThemeValue(['legend', 'textStyle', 'color'], null));
      this.backgroundColor.set(this.getThemeValue(['backgroundColor'], null));
    } else if (title || subTitle) {
      options.title = {
        text: title,
        subtext: subTitle
      };
      if (subTitle) {
        this.modifyTopAlignment('subTitle');
      }
    } else if (!title && !subTitle) {
      this.modifyTopAlignment('noTitle');
    }
  }

  private modifyTopAlignment(key: string): void {
    const options = this.actualOptions;
    if (options.grid) {
      const gridOptions = this.getThemeCustomValue([key, 'grid'], {});
      echarts.util.merge(options.grid, gridOptions, true);
    }

    const legendOptions = this.getThemeCustomValue([key, 'legend'], {});
    options.legend?.forEach(legend => echarts.util.merge(legend, legendOptions, true));
  }

  protected afterChartInit(skipZoom?: boolean): void {
    this.chart.on('datazoom', (event: any) => this.handleDataZoom(event, 'echart'));
    if (!this.customLegendAction()) {
      // default generic si-chart behavior
      this.chart.on('legendselectchanged', (event: any) => this.handleSelectionChanged(event));
      this.chart.on('click', (event: any) => this.handleClickOnChart(event, false));
    } else {
      // custom chart behaviour
      this.chart.on('legendselectchanged', (event: any) =>
        this.handleSelectionChangedCustom(event)
      );
      this.chart.on('click', (event: any) => this.handleClickOnChart(event, true));
    }
    this.chart.on('updateaxispointer', (event: any) => this.handleUpdateAxisPointer(event));
    if (!skipZoom) {
      this.setDataZoomRange();
    }
    this.cdRef.markForCheck();
  }

  protected afterChartResize(): void {}

  private getEChartInner(): Element | null {
    return this.echartElement.querySelector(':scope > div:first-child');
  }

  private getEChartExternalSliderInner(): Element | null {
    return this.eChartExtSliderElement.querySelector(':scope > div:first-child');
  }

  private handleExtChartMouseDown(): void {
    window.addEventListener('mouseup', this.echartExtSliderMouseUp);
  }

  private handleExtChartMouseUp(event: MouseEvent): void {
    window.removeEventListener('mouseup', this.echartExtSliderMouseUp);
    const newEvent = new MouseEvent('mouseup', event);
    setTimeout(() => {
      this.getEChartExternalSliderInner()?.dispatchEvent(newEvent);
      this.cdRef.markForCheck();
    }, 1);
  }

  private handleChartMouseDown(): void {
    window.addEventListener('mouseup', this.echartMouseUp);
  }

  private handleChartMouseUp(event: MouseEvent): void {
    window.removeEventListener('mouseup', this.echartMouseUp);
    const newEvent = new MouseEvent('mouseup', event);
    setTimeout(() => {
      this.getEChartInner()?.dispatchEvent(newEvent);
      this.cdRef.markForCheck();
    }, 1);
  }

  private setDataZoomRange(skipUpdate?: boolean): void {
    // Checking if we received a valid dataZoomRange Object
    const dataZoomRange = this.dataZoomRange();
    if (dataZoomRange && Object.keys(dataZoomRange).length > 0) {
      // If series has data, then directly dispatch action for the dataZoom event
      // Else, Store the dataZoomRange values in presetDataZoomRange variable for applying zoom
      // after data is received in chart
      // No need to reassign presetDataZoomRange if earlier value is not consumed
      if (this.hasData()) {
        const dz = this.getPresetDataZoom(dataZoomRange);
        if (dz) {
          const requested = { ...dataZoomRange };
          this.presetDataZoomRange = undefined;

          this.updateDataZoom(dz);
          if (!skipUpdate) {
            this.updateEChart(false, { dataZoom: [dz] });
          }

          // update user with proper data
          setTimeout(() => {
            this.ngZone.runOutsideAngular(() => {
              this.requestedDataZoom = requested;
              this.handleDataZoom(dz, 'setDataZoomRange');
            });
          });

          return;
        }
      }
      this.presetDataZoomRange = dataZoomRange;
    }
  }

  private handleDataZoom(event: any, source?: string): void {
    // events can be batched
    if (event.batch?.length) {
      event = event.batch[0];
    }
    if (Number.isNaN(event.start) || Number.isNaN(event.end)) {
      // need to fix to the last valid dataZoom setting, see below
      this.chart.dispatchAction({ type: 'dataZoom', ...this.lastValidDataZoom });
      return;
    }

    const effectiveOpts = this.getOptionNoClone();
    // in case of pane by chart area, event.start and event.end are always undefined.
    // and in case of slider move, they has values in percentage(0-100)
    // so, to handle in case of pane, we need to get start and end values from datazoom property
    // following condition will be executed only if autozoom is false; and start and end are undefined(undefined means call is from pane)
    const dz = effectiveOpts.dataZoom[0];
    this.autoZoomUpdate = !!dz && dz.end === 100;
    // Due to chart updates outside Angular, we need to emit events back
    // inside Angular to activate Angular's change detection.
    const range = this.getVisibleRange();
    if (range) {
      range.source = source ?? event.source;
      this.calculateVisibleRange(range);
      if (this.requestedDataZoom) {
        range.requested = this.requestedDataZoom;
        this.requestedDataZoom = undefined;
      }

      this.ngZone.run(() => {
        this.dataZoom.emit(range);
        this.timeRangeChange.emit(
          dz.start === 0 && dz.end === 100 ? 0 : range.rangeEnd - range.rangeStart
        );
      });

      setTimeout(() => this.checkGridSizeChange());
      this.presetDataZoomRange = undefined;
      this.dataZoomSetupDone = true;

      // sync/store values
      this.updateDataZoom({ startValue: range.rangeStart, endValue: range.rangeEnd });

      if (event.source !== 'extSlider') {
        this.extZoomSliderChart?.dispatchAction({
          type: 'dataZoom',
          source: 'mainChart',
          startValue: range.rangeStart,
          endValue: range.rangeEnd
        });
      }
    }
    this.cdRef.markForCheck();
  }

  private handleExtDataZoom(event: any): void {
    if (event.batch?.length) {
      event = event.batch[0];
    }

    if (event.source === 'mainChart') {
      return;
    }

    const zoomModel = (this.extZoomSliderChart as any)._model;
    const range = this.doGetVisibleRange(zoomModel);
    if (range) {
      this.calculateVisibleRange(range);
      this.chart?.dispatchAction({
        type: 'dataZoom',
        source: 'extSlider',
        startValue: range.rangeStart,
        endValue: range.rangeEnd
      });
    }
  }

  protected handleSelectionChanged(event: any): void {
    this.selectionChanged.emit(event);

    for (const a in event.selected) {
      if (event.selected[a] !== false) {
        return;
      }
    }

    this.saveCurrentDataZoom();
  }

  /**
   * Creates two objects that stores the colors for selected and unselected series. Used only for custom legend actions.
   */
  protected fetchSeriesColors(colorsToBeUSed?: any): void {
    const options = this.actualOptions;
    if (!options.color?.length && this.activeTheme) {
      options.color = [...this.activeTheme.color];
    }
    if (!colorsToBeUSed && !this.activeTheme) {
      return;
    }
    options.series?.forEach((element, index) => {
      this.unselectedSeriesColors[element.name!] = {
        color: this.getThemeValue(['legend', 'unselected', 'color'], '#ccc'),
        index
      };
      const colors = colorsToBeUSed ?? this.activeTheme.color;
      this.selectedSeriesColors[element.name!] = { color: colors[index], index };
    });
  }

  /**
   * Handles legend select event in non echart native way.
   * @param event -  legend select
   */
  protected handleSelectionChangedCustom(event: any): void {
    const optionsToChange = this.styleSelectedSeries(event.name, false, event.dataIndex);
    this.ngZone.runOutsideAngular(() => {
      this.chart.setOption(optionsToChange);
      this.chart.dispatchAction({ type: 'legendSelect', name: event.name });
    });
  }

  /**
   * Handles click on series in non echart native way.
   * @param event -  click
   */
  protected handleClickOnChart(event: any, toggleVisibility: boolean): void {
    if (event.componentType !== 'series') {
      return;
    }
    if (toggleVisibility) {
      const optionsToChange = this.styleSelectedSeries(event.seriesName, true, event.dataIndex);
      this.chart.setOption(optionsToChange);
    } else {
      this.ngZone.run(() =>
        this.chartSeriesClick.emit({
          itemName: event.seriesName,
          dataIndex: event.dataIndex
        })
      );
    }
  }

  /**
   * Selects or unselects the series based on series state object
   * @param seriesName -  series to be selected/unselected
   * @param emit -  if true event is emitted otherwise no event is emitted
   */
  protected styleSelectedSeries(seriesName: string, emit: boolean, seriesDataIndex: number): any {
    if (this.seriesSelectionState?.[seriesName]) {
      const elementToStyle = this.actualOptions.series?.find(
        element => element.name === seriesName
      );
      this.seriesSelectionState[seriesName] = false;
      return this.selectSeries(elementToStyle, emit, seriesDataIndex);
    } else {
      const elementToStyle = this.actualOptions.series?.find(
        element => element.name === seriesName
      );
      this.seriesSelectionState[seriesName] = true;
      return this.unselectSeries(elementToStyle, emit, seriesDataIndex);
    }
  }

  /**
   * Selects the series
   * @param element -  to be styled as selected
   * @param emit -  if true event is emitted otherwise no event is emitted
   */
  protected selectSeries(element: any, emit: boolean, seriesDataIndex: number): any {
    const options = this.actualOptions;
    const optionsToChange = { color: options.color, series: [options.series] };
    const optionsColorIndex = this.selectedSeriesColors[element.name].index;
    optionsToChange.color[optionsColorIndex] = this.selectedSeriesColors[element.name].color;
    if (element.areaStyle) {
      element.areaStyle.opacity = 0.4;
      optionsToChange.series[this.selectedSeriesColors[element.name].index] = element;
    }
    if (emit) {
      this.chartSeriesClick.emit({
        itemName: element.name,
        dataIndex: seriesDataIndex,
        selected: false,
        color: this.selectedSeriesColors[element.name].color
      });
    }
    return optionsToChange;
  }

  /**
   * Unselects the series
   * @param element - to be styled as unselected
   * @param emit - if true event is emitted otherwise no event is emitted
   */
  protected unselectSeries(
    element: any,
    emit: boolean,
    seriesDataIndex: number
  ): {
    color: any;
    series: (EChartSeries | undefined)[];
  } {
    const options = this.actualOptions;
    const optionsToChange = { color: options.color, series: [options.series] };
    const optionsColorIndex = this.selectedSeriesColors[element.name].index;
    optionsToChange.color[optionsColorIndex] = this.unselectedSeriesColors[element.name].color;
    if (element.areaStyle) {
      element.areaStyle.opacity = 0;
      optionsToChange.series[this.unselectedSeriesColors[element.name].index] = element;
    }
    if (emit) {
      this.chartSeriesClick.emit({
        itemName: element.name,
        dataIndex: seriesDataIndex,
        selected: true,
        color: this.selectedSeriesColors[element.name].color
      });
    }
    return optionsToChange;
  }

  private isValidDataZoomValue(val: any): boolean {
    return val !== null && val !== undefined && !Number.isNaN(val);
  }

  private saveCurrentDataZoom(): void {
    const options = this.actualOptions;
    if (!options.grid || !options.dataZoom) {
      return;
    }

    // When the last item on the legend is disabled, remember the current valid
    // dataZoom setting. Due to a bug in ECharts it happens
    // that the zoom slider disappears not to ever reappear again. To work around
    // the problem, we simply inject the last valid dataZoom settings saved here
    // once the invalid values (NaN) are detected
    const currentOpts = this.getOptionNoClone();
    if (!currentOpts?.dataZoom?.[0]) {
      return;
    }

    const dz = currentOpts.dataZoom[0];
    if (dz) {
      this.lastValidDataZoom = {};
      if (this.isValidDataZoomValue(dz.startValue)) {
        this.lastValidDataZoom.startValue = dz.startValue;
      } else if (this.isValidDataZoomValue(dz.start)) {
        this.lastValidDataZoom.start = dz.start;
      }
      if (this.isValidDataZoomValue(dz.endValue)) {
        this.lastValidDataZoom.endValue = dz.endValue;
      } else if (this.isValidDataZoomValue(dz.end)) {
        this.lastValidDataZoom.end = dz.end;
      }
    }
  }

  /**
   * Get color by series name.
   */
  getSeriesColorBySeriesName(seriesName: string): string | undefined {
    return this.doGetSeriesColorBySeriesName(seriesName).color;
  }

  private doGetSeriesColorBySeriesName(seriesName: string): {
    color: string | undefined;
    altName: boolean;
  } {
    const ecModel = this.internalGetModel();
    const ecSeries = ecModel.getSeriesByName(seriesName);
    if (ecSeries && ecSeries.length > 0) {
      return { color: ecSeries[0].getData().getVisual('style')?.fill as string, altName: false };
    }

    let ret = { color: undefined as string | undefined, altName: false };
    ecModel.eachRawSeries((seriesModel: any) => {
      const idx = seriesModel.legendVisualProvider?.indexOfName(seriesName) ?? -1;
      if (idx >= 0) {
        ret = {
          color: seriesModel.legendVisualProvider.getItemVisual(idx, 'style')?.fill as string,
          altName: true
        };
      }
    });
    return ret;
  }

  private applyColorsToCustomLegends(): void {
    if (!this.showLegend() || !this.showCustomLegend()) {
      return;
    }
    this.customLegend.forEach(cl => {
      cl.customLegends.forEach(legendAxis => {
        legendAxis?.list.forEach(legend => {
          const color = this.doGetSeriesColorBySeriesName(legend.name);
          legend.color = color.color;
          legend.alternativeNaming = color.altName;
        });
      });
    });
    this.cdRef.markForCheck();
  }

  private handleUpdateAxisPointer(event: any): void {
    if (
      event.seriesIndex !== this.prevAxisPointer.seriesIndex ||
      event.dataIndex !== this.prevAxisPointer.dataIndex
    ) {
      this.prevAxisPointer.seriesIndex = event.seriesIndex;
      this.prevAxisPointer.dataIndex = event.dataIndex;

      if (this.axisPointer() && event.seriesIndex === undefined) {
        return;
      }

      // Due to chart updates outside Angular, we need to emit events back
      // inside Angular to activate Angular's change detection.
      this.ngZone.run(() => {
        this.pointer.emit({
          seriesIndex: event.seriesIndex,
          dataIndex: event.dataIndex
        });
      });
    }
  }

  /**
   * Get current data zoom range.
   */
  getVisibleRange(): DataZoomEvent | undefined {
    return this.doGetVisibleRange(this.internalGetModel());
  }

  protected internalGetModel(): any {
    return (this.chart as any)._model;
  }

  /**
   * returns the current EChart options, w/o cloning anything. Be very careful
   * not to change anything in the data structure in it.
   */
  getOptionNoClone(): any {
    return this.internalGetModel().option;
  }

  protected parsePercent(percent: string | number, all: number): number {
    if (typeof percent === 'string') {
      if (percent.match(/\d+%/)) {
        return (parseFloat(percent) / 100) * all;
      }
      return parseFloat(percent);
    }
    return percent;
  }

  private doGetVisibleRange(zoomModel: any): DataZoomEvent | undefined {
    const effectiveOpts: any = zoomModel.option;
    const xAxis = effectiveOpts.xAxis?.[0];
    const dz = effectiveOpts.dataZoom[0];

    const rangeStartArray: number[] = [];
    const rangeEndArray: number[] = [];
    for (let i = 0; i < effectiveOpts.xAxis?.length; i++) {
      const axis = zoomModel.getComponent('xAxis', i);
      const extent = axis?.axis?.scale?.getExtent();
      if (extent?.length) {
        if (this.isValidDataZoomValue(extent[0])) {
          rangeStartArray.push(extent[0]);
        }
        if (this.isValidDataZoomValue(extent[1])) {
          rangeEndArray.push(extent[1]);
        }
      }
    }

    const rangeStart = rangeStartArray.length ? Math.min(...rangeStartArray) : dz?.startValue;
    const rangeEnd = rangeEndArray.length ? Math.max(...rangeEndArray) : dz?.endValue;

    if (!this.isValidDataZoomValue(rangeEnd)) {
      return;
    }

    let gridWidth: number | undefined;
    if (effectiveOpts.grid && effectiveOpts.grid.length > 0) {
      const width = this.chart.getWidth();
      const grid = effectiveOpts.grid[0];
      gridWidth =
        width - this.parsePercent(grid.left, width) - this.parsePercent(grid.right, width);
    }

    return {
      rangeType: xAxis.type,
      rangeStart,
      rangeEnd,
      width: gridWidth,
      autoZoomUpdate: this.autoZoomUpdate
    };
  }

  protected updateEChart(force = false, options?: EChartOption): void {
    if (!this.chart) {
      return;
    }
    let axisDZUpdated = this.updateAxisAndDataZoom(options);
    options ??= this.actualOptions;
    const isFilledArray = (v: any): boolean => Array.isArray(v) && v.length > 0;
    if (
      isFilledArray(options.grid) &&
      isFilledArray(options.xAxis) &&
      isFilledArray(options.dataZoom)
    ) {
      // adjust grid for axis labels
      let max = 0;
      options.yAxis.forEach((axis: any) => {
        if (axis.position !== 'right' && isFilledArray(axis.data)) {
          axis.data.forEach((label: string) => {
            const width = this.calculateTextWidth(label);
            max = Math.max(max, width);
          });
        }
      });
      max += 16; // long text getting truncated, so add some padding
      const grids = options.grid as GridComponentOption[];
      grids.forEach(g => (g.left = Math.max(g.left as number, max)));

      // update dataZoom if not already set
      const zoom = options.dataZoom![0];
      if (
        !this.isValidDataZoomValue(zoom?.startValue) &&
        !this.isValidDataZoomValue(zoom?.endValue) &&
        !this.isValidDataZoomValue(zoom?.end)
      ) {
        const range = this.getVisibleRange();
        if (range) {
          this.updateDataZoom({ startValue: range.rangeStart, endValue: range.rangeEnd });
        }
      }

      // change in grid/axis requires a full update
      force = true;
      axisDZUpdated = true;
    }

    this.ngZone.runOutsideAngular(() => {
      this.chart.setOption(options!, force);
      this.setZoomMode();
      if (axisDZUpdated && this.externalZoomSlider()) {
        this.extZoomSliderChart.setOption(this.extZoomSliderOptions, false);
      }
    });

    setTimeout(() => this.checkGridSizeChange());
  }

  protected updateAxisAndDataZoom(inOptions?: EChartOption): boolean {
    const options = this.actualOptions;
    if (!options.xAxis) {
      return false;
    }

    const isFull = !inOptions || inOptions === options;
    inOptions = inOptions ?? {};
    if (!isFull && !inOptions.series && !options.dataZoom) {
      return false;
    }

    const xAxis = Array.isArray(options.xAxis) ? options.xAxis : [options.xAxis];
    if (!isFull && !inOptions.xAxis) {
      // for delta update, make sure we have same-sized axis array
      inOptions.xAxis = xAxis.map(() => ({}));
    }

    const minMax = this.getSeriesMinMax();

    // extend range if DZ is bigger than actual data
    const dz = inOptions?.dataZoom?.[0];
    if (
      dz?.startValue != null &&
      (minMax.min === undefined || (dz.startValue as number) < minMax.min)
    ) {
      minMax.min = dz.startValue as number;
    }
    if (
      dz?.endValue != null &&
      (minMax.max === undefined || (dz.endValue as number) > minMax.max)
    ) {
      minMax.max = dz.endValue as number;
    }

    // Update all sub chart index to be controlled by the dataZoom
    let xAxisIndexes: number[] = [];
    xAxis.forEach((axis, index) => {
      if (axis.gridIndex >= 0) {
        // set min/max the same on all axis so that datazoom can work
        axis.min = minMax.min;
        axis.max = minMax.max;

        if (!isFull) {
          inOptions.xAxis[index].min = minMax.min;
          inOptions.xAxis[index].max = minMax.max;
        }

        xAxisIndexes.push(index);
      }
    });

    // update dataZoom
    const effectiveOpts = this.getOptionNoClone();
    const effectiveXAxis = effectiveOpts.xAxis;
    if (effectiveXAxis.length > 1) {
      // 1. find out all visible series
      // 2. find out valid x index
      // 3. remove invalid x axis from the xAxisIndex array
      const validXAxis = this.getValidXAxis();
      if (validXAxis) {
        xAxisIndexes = xAxisIndexes.filter(index => validXAxis.has(index));
      }
    }

    if (xAxisIndexes.length) {
      const allDataZoom = options.dataZoom!;
      allDataZoom.forEach(zoom => (zoom.xAxisIndex = xAxisIndexes));
      if (!isFull && inOptions.dataZoom) {
        inOptions.dataZoom.forEach(zoom => (zoom.xAxisIndex = xAxisIndexes));
      }
    }

    // update external slider if required
    if (this.externalZoomSlider()) {
      const extSliderAxis = this.extZoomSliderOptions.xAxis[0];
      if (extSliderAxis.min !== minMax.min || extSliderAxis.max !== minMax.max) {
        extSliderAxis.min = minMax.min;
        extSliderAxis.max = minMax.max;
        this.extZoomSliderOptions.series![0].data = [
          [minMax.min, null],
          [minMax.max, null]
        ];
      }
    }

    return true;
  }

  /**
   * Send action to echart.
   * @see https://echarts.apache.org/en/api.html#action
   */
  dispatchEChartAction(action: echarts.Payload): void {
    if (!this.chart) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.chart.dispatchAction(action);
    });
    this.cdRef.markForCheck();
  }

  private getSeriesMinMax(visibleOnly = false): {
    min: number | undefined;
    max: number | undefined;
  } {
    const legend = visibleOnly ? this.internalGetModel().getComponent('legend') : undefined;
    let min: number | undefined;
    let max: number | undefined;
    this.actualOptions.series?.forEach(s => {
      const seriesData = s.data as any[];
      if (seriesData?.length > 1 && (!legend || legend.isSelected(s.name))) {
        const start = seriesData[0][0]?.valueOf();
        const last = seriesData[seriesData.length - 1];
        // end value is can be undefined sometimes, if we don't have milliseconds as a value, instead
        // we have value[] array of Date, so to handle that scenario we are taking value[0].valueOf() to
        // calculate the millisecond value i.e from Date(value[0])
        const end = last[0]?.valueOf() ?? last.value?.[0]?.valueOf();
        if (this.isValidDataZoomValue(start) && this.isValidDataZoomValue(end)) {
          if (min === undefined || start < min) {
            min = start;
          }
          if (max === undefined || end > max) {
            max = end;
          }
        }
      }
    });
    return { min, max };
  }

  private calculateVisibleRange(range: DataZoomEvent | undefined): void {
    const options = this.actualOptions;
    if (!options.xAxis || !this.hasDataZoom() || !range) {
      return;
    }
    if (!Array.isArray(options.xAxis) && options.xAxis.type === 'category') {
      this.visibleRange.set(Math.ceil(range.rangeEnd) - Math.floor(range.rangeStart));
    } else {
      this.visibleRange.set(Math.round(range.rangeEnd - range.rangeStart));
    }

    // once in range mode, disable the entries mode to prevent overriding the user
    this.visibleEntries.set(-1);
  }

  private getValueFromSeriesPoint(point: any): any[] {
    return Array.isArray(point) ? point : point.value;
  }

  private calculateZoomStartValue(): any {
    const options = this.actualOptions;
    if (!options.series) {
      return null;
    }

    const seriesData = options.series[this.autoZoomSeriesIndex()]?.data as any[];
    if (!seriesData) {
      return null;
    }

    if (this.visibleEntries() > -1) {
      const offset = Math.min(seriesData.length, this.visibleEntries());
      const data = seriesData[seriesData.length - offset];
      return data ? this.getValueFromSeriesPoint(data)[0] : null;
    } else if (this.visibleRange() > -1) {
      const minMax = this.getSeriesMinMax(true);
      if (minMax.min && minMax.max) {
        // make sure startValue is >= the min data value
        return Math.max(minMax.min, minMax.max - this.visibleRange());
      }
      const data = seriesData[seriesData.length - 1];
      return data ? this.getValueFromSeriesPoint(data)[0] - this.visibleRange() : null;
    }
    return null;
  }

  protected hasData(): boolean {
    return this.actualOptions.series?.some(s => (s.data as any[])?.length > 0) ?? false;
  }

  /**
   * Re-render the chart series data. This method should be called on series data changes.
   */
  refreshSeries(isLive: boolean = true, dzToSet?: DataZoomRange): void {
    dzToSet ??= this.presetDataZoomRange;
    const optionsToUpdate: any = {
      series: this.actualOptions.series
    };

    if (!isLive) {
      this.updateEChart(false, optionsToUpdate);
      return;
    }

    if (this.hasDataZoom() && this.hasData()) {
      if (dzToSet) {
        this.dataZoomSetupDone = true;

        const dz = this.getPresetDataZoom(dzToSet);
        if (dz) {
          const requested = { ...dzToSet };
          this.presetDataZoomRange = undefined;
          this.updateDataZoom(dz, optionsToUpdate);

          // dispatch the same async. reasoning: the sync here is needed to prevent
          // flickering, the async dispatch to ensure a DataZoomEvent is fired so
          // that any consumer of this event work as expected
          setTimeout(() => {
            this.ngZone.runOutsideAngular(() => {
              this.requestedDataZoom = requested;
              this.handleDataZoom(dz, 'refreshSeries');
            });
          });
        }
      } else if (!this.dataZoomSetupDone) {
        // need to do this async to have the data in ECharts
        setTimeout(() => {
          if (!this.dataZoomSetupDone && !this.dataZoomRange() && this.chart) {
            this.calculateVisibleRange(this.getVisibleRange());
          }
          this.dataZoomSetupDone = true;
        });
      } else if (this.zoomSlider() && this.autoZoomUpdate && this.autoZoomSeriesIndex() !== -1) {
        // this ensures the slider is at the end and the window size remains stable, showing new data
        const startValue = this.calculateZoomStartValue();
        if (this.isValidDataZoomValue(startValue)) {
          this.updateDataZoom({ startValue, end: 100 }, optionsToUpdate);
        }
        if (isLive) {
          this.dispatchEChartAction({ type: 'hideTip' });
        }
      } else {
        // this ensures the current displayed window stays stable as new data arrives
        const dz = this.getOptionNoClone().dataZoom[0];
        if (
          this.isValidDataZoomValue(dz.startValue) &&
          this.isValidDataZoomValue(dz.endValue) &&
          dz.end !== 100
        ) {
          this.updateDataZoom(
            { startValue: dz.startValue, endValue: dz.endValue },
            optionsToUpdate
          );
        }
      }
    }

    this.updateEChart(false, optionsToUpdate);
  }

  // this ensures DZ is in sync everywhere
  private updateDataZoom(dz: DataZoomRange, optionsToUpdate?: EChartOption): void {
    const options = this.actualOptions;
    if (options.dataZoom?.[0]) {
      this.doUpdateDZ(dz, options.dataZoom[0]);
    }
    if (optionsToUpdate && optionsToUpdate !== options) {
      if (Array.isArray(optionsToUpdate.dataZoom)) {
        this.doUpdateDZ(dz, optionsToUpdate.dataZoom[0]);
      } else if (optionsToUpdate.dataZoom) {
        this.doUpdateDZ(dz, optionsToUpdate.dataZoom);
      } else {
        optionsToUpdate.dataZoom = [{ ...dz }];
      }
    }
    if (this.externalZoomSlider()) {
      this.doUpdateDZ(dz, this.extZoomSliderOptions.dataZoom![0]);
    }
  }

  private doUpdateDZ(dz: DataZoomRange, dzOptions: DataZoomComponentOption): void {
    // make sure only to have value or percent
    if (this.isValidDataZoomValue(dz.startValue)) {
      dzOptions.startValue = dz.startValue;
      dzOptions.start = undefined;
    } else if (this.isValidDataZoomValue(dz.start)) {
      dzOptions.start = dz.start;
      dzOptions.startValue = undefined;
    }
    if (this.isValidDataZoomValue(dz.endValue)) {
      dzOptions.endValue = dz.endValue;
      dzOptions.end = undefined;
    } else if (this.isValidDataZoomValue(dz.end)) {
      dzOptions.end = dz.end;
      dzOptions.endValue = undefined;
    }
  }

  protected applyStyles(): void {
    const bodyStyle: CSSStyleDeclaration = window.getComputedStyle(document.body);
    const options = this.actualOptions;
    options.textStyle = {
      fontFamily: bodyStyle.fontFamily,
      fontSize: bodyStyle.fontSize
    };
    this.extZoomSliderOptions.textStyle = options.textStyle;
  }

  protected addLegendItem(
    name: string,
    visible?: boolean | null,
    index: number = 0,
    gridIndex: number = 0,
    customLegendProp?: CustomLegendProps,
    seriesSymbol?: string
  ): void {
    const options = this.actualOptions;
    if (!options.legend?.length) {
      return;
    }

    const legend = options.legend[options.legend.length > index ? index : 0];
    const unitText = customLegendProp ? customLegendProp.unit : undefined;
    const customLegendItem: CustomLegendItem = {
      name: '',
      displayName: '',
      color: '',
      selected: false,
      tooltip: customLegendProp ? customLegendProp.tooltip : '',
      symbol: this.getPath(seriesSymbol, false)
    };
    legend.data?.push({
      name,
      icon: this.getPath(seriesSymbol, true)
    });

    legend.selected ??= {};

    if (visible !== null && visible !== undefined) {
      legend.selected[name] = visible;
      customLegendItem.selected = visible;
    }
    const showCustomLegend = this.showCustomLegend();
    if (this.showLegend() && showCustomLegend) {
      if (visible !== false) {
        customLegendItem.selected = true;
      }
      customLegendItem.name = name;
      customLegendItem.displayName = customLegendProp?.displayName ?? name;

      if (showCustomLegend) {
        this.addCustomLegend(customLegendItem, unitText, index, gridIndex);
      }
    }
    this.cdRef.markForCheck();
  }

  private getPath(seriesSymbol: string | undefined, prefix: boolean): string {
    const path = seriesSymbol ? this.shapePaths[seriesSymbol] : this.shapePaths.circle;
    return prefix ? 'path://' + path : path;
  }

  private addCustomLegend(
    customLegendItem: CustomLegendItem,
    unitText: string | undefined,
    index: number,
    gridIndex: number = 0
  ): void {
    if (this.actualOptions.legend) {
      if (!this.customLegend[gridIndex].customLegends) {
        this.customLegend[gridIndex].customLegends = [
          { list: [], unit: '' },
          { list: [], unit: '' }
        ];
      }
      // index = 0 means left legend
      if (index === 0) {
        if (!this.customLegend[gridIndex]?.customLegends[0]?.list) {
          this.customLegend[gridIndex].customLegends[0] = { list: [customLegendItem] };
        } else {
          // legend with same id and name not found
          this.customLegend[gridIndex].customLegends[0].list.push(customLegendItem);
        }
        this.customLegend[gridIndex].customLegends[0].unit = unitText;
      } else {
        // index = 1 means right legend
        if (!this.customLegend[gridIndex]?.customLegends[1]?.list) {
          this.customLegend[gridIndex].customLegends[1] = { list: [customLegendItem] };
        } else {
          this.customLegend[gridIndex].customLegends[1].list.push(customLegendItem);
        }
        this.customLegend[gridIndex].customLegends[1].unit = unitText;
      }
      this.applyCustomLegendPosition();
    }
  }

  /**
   * Show loading indicator.
   */
  public startProgressIndication(): void {
    this.inProgress.set(true);
  }

  /**
   * Hide loading indicator.
   */
  public stopProgressIndication(): void {
    this.inProgress.set(false);
  }

  /**
   * Set the data zoom range for the chart in milliseconds.
   * As an example one hour is the value 3600000.
   */
  setTimeRange(range: number): void {
    const currentDZ = this.getVisibleRange();
    const minMax = this.getSeriesMinMax(true);
    if (!currentDZ || minMax.min == null || minMax.max == null) {
      return;
    }

    const mid = (currentDZ.rangeStart + currentDZ.rangeEnd) / 2;
    const halfRange = range / 2;

    let start = 0;
    let end = 0;

    if (range === 0 || range > minMax.max - minMax.min) {
      start = minMax.min;
      end = minMax.max;
    } else {
      start = mid - halfRange;
      end = mid + halfRange;

      // at start
      if (start < minMax.min) {
        start = minMax.min;
        end = start + range;
      }

      // at end. Special case: if already at end, keep end
      if (end > minMax.max || currentDZ.rangeEnd === minMax.max) {
        start = minMax.max - range;
        end = minMax.max;
      }
    }

    this.dispatchEChartAction({ type: 'dataZoom', startValue: start, endValue: end });
  }

  protected addDataInternal(series: SeriesUpdate<any>[]): void {
    const options = this.actualOptions;
    series.forEach(update => {
      const currentSeries = options.series![update.index];
      if (!currentSeries) {
        return;
      }
      const seriesData = currentSeries.data as any[];
      seriesData.push(update.data);
      if (this.maxEntries() > 0 && seriesData.length > this.maxEntries()) {
        seriesData.splice(0, seriesData.length - this.maxEntries());
      }
    });

    this.refreshSeries();
  }

  private getPresetDataZoom(range: DataZoomRange): any {
    let ret: any;
    if (range.visibleWidth && this.autoZoomSeriesIndex() !== -1) {
      this.visibleRange.set(range.visibleWidth);

      const startValue = this.calculateZoomStartValue();
      if (this.isValidDataZoomValue(startValue)) {
        this.autoZoomUpdate = true;
        ret = { startValue, end: 100 };
      }
    } else if (
      this.isValidDataZoomValue(range.startValue) &&
      this.isValidDataZoomValue(range.endValue)
    ) {
      // handling the case when startValue and endValue is given as a fixed time interval
      ret = {
        startValue: range.startValue,
        endValue: range.endValue
      };
      this.autoZoomUpdate = false;
    } else {
      ret = { ...range };
    }

    return ret;
  }

  private checkGridSizeChange(): void {
    if (!this.chart) {
      return;
    }
    const gridRectNew: GridRectCoordinate =
      this.internalGetModel()?.getComponent('grid')?.coordinateSystem?._rect;
    if (gridRectNew) {
      const nativeWrapper = this.chartContainerWrapper().nativeElement as HTMLElement;
      gridRectNew.containerWidth = nativeWrapper.offsetWidth;
      gridRectNew.containerHeight = nativeWrapper.offsetHeight;

      let isGridResized = false;

      for (const objKey of Object.keys(this.gridCoordinates) as (keyof GridRectCoordinate)[]) {
        if (this.gridSizeItemChanged(gridRectNew[objKey], this.gridCoordinates[objKey])) {
          isGridResized = true;
          break;
        }
      }

      if (isGridResized) {
        // update new coordinates and emit event
        this.gridCoordinates = gridRectNew;
        this.timeBarLeft.set(this.gridCoordinates.x);
        this.timeBarRight.set(
          this.gridCoordinates.containerWidth - this.gridCoordinates.x - this.gridCoordinates.width
        );

        if (this.externalZoomSlider() && Array.isArray(this.extZoomSliderOptions?.grid)) {
          this.extZoomSliderOptions.grid[0].left = this.timeBarLeft();
          this.extZoomSliderOptions.grid[0].right = this.timeBarRight();
          this.extZoomSliderChart.setOption({ grid: this.extZoomSliderOptions.grid }, false);
        }
        this.ngZone.run(() => this.chartGridResized.emit(this.gridCoordinates));
      }
    }
    this.cdRef.markForCheck();
  }

  private gridSizeItemChanged(a: any, b: any): boolean {
    return Array.isArray(a)
      ? a.length !== b.length || (a as any[]).some((item, index) => item !== b[index])
      : a !== b;
  }

  private setContainerHeight(): void {
    const newHeight = parseInt(this.eChartContainerHeight()!, 10) || null;
    if (newHeight !== this.containerHeight()) {
      this.containerHeight.set(newHeight);

      this.ngZone.runOutsideAngular(() => {
        this.chart?.resize({ width: this.curWidth, height: newHeight ?? this.curHeight });
        if (this.externalZoomSlider()) {
          this.extZoomSliderChart.resize();
        }
      });
    }
  }

  private updateCustomLegendMultiLineInfo(): void {
    const event: CustomLegendMultiLineInfo[] = [];
    this.siCustomLegend().forEach((legend, index) => {
      event.push({
        customLegendId: index,
        isCustomLegendMultilined: legend.customLegendContainer().nativeElement.offsetHeight > 20
      });
    });
    if (
      event.length !== this.customLegendsMultiLineInfo.length ||
      event.some(
        (e, index) =>
          e.isCustomLegendMultilined !==
          this.customLegendsMultiLineInfo[index].isCustomLegendMultilined
      )
    ) {
      this.customLegendsMultiLineInfo = event;
      this.customLegendMultiLineInfoEvent.emit(event);
    }
    this.cdRef.markForCheck();
  }
}
