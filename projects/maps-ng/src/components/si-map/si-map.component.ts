/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  model,
  NgZone,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  Type,
  viewChild
} from '@angular/core';
import {
  SiNoTranslateService,
  SiTranslateServiceBuilder,
  t
} from '@siemens/element-translate-ng/translate';
import { apply as applyMapboxStyle } from 'ol-mapbox-style';
import Control from 'ol/control/Control';
import { defaults as defaultControls } from 'ol/control/defaults';
import { Coordinate } from 'ol/coordinate';
import * as olExtent from 'ol/extent';
import Feature, { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Overlay, { Positioning } from 'ol/Overlay';
import RenderFeature from 'ol/render/Feature';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import { StyleLike } from 'ol/style/Style';
import View from 'ol/View';

import { SiMapPopoverComponent } from './components/si-map-popover/si-map-popover.component';
import { SiMapTooltipComponent } from './components/si-map-tooltip/si-map-tooltip.component';
import { ColorPalette } from './models/color-palette.type';
import {
  ANIMATION_DURATION,
  DEFAULT_CLUSTER_CLICK_ZOOM,
  DEFAULT_CLUSTER_DISTANCE,
  DEFAULT_FEATURE_CLICK_ZOOM,
  DEFAULT_FEATURE_SELECT_ZOOM,
  DEFAULT_GLOBAL_ZOOM,
  GEOJSON_LAYER,
  LAYER_NAME,
  POINTS_LAYER
} from './models/constants';
import { MapPoint, MapPointMetaData } from './models/map-point.interface';
import { OverlayNativeProperties } from './models/overlay-native-properties.interface';
import { MapService } from './services/map.service';
import { SelectCluster } from './services/SelectCluster';
import { styleJson } from './shared/themes/style';

interface ClusterHolder {
  feature?: Feature;
}

@Component({
  selector: 'si-map',

  imports: [SiMapTooltipComponent, SiMapPopoverComponent],
  templateUrl: './si-map.component.html',
  styleUrl: './si-map.component.scss',
  providers: [MapService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMapComponent implements AfterViewInit, OnChanges, OnDestroy, AfterViewChecked {
  /**
   * Points to be rendered on the map as features.
   */
  readonly points = model<MapPoint[]>();
  /**
   * Payload of a geo-JSON object.
   */
  readonly geoJson = input<any>();
  /**
   * Callback function to add custom styling to the drawn geo-JSON features.
   */
  readonly styleFunction = input<StyleLike>();
  /**
   * Projection format used to render the geo-JSON payload.
   *
   * @defaultValue 'EPSG:3857'
   */
  readonly geoJsonProjection = input('EPSG:3857');
  /**
   * Enable or disable animation of markers.
   *
   * @defaultValue false
   */
  readonly markerAnimation = input(false);
  /**
   * Enable or disable clustering of points on the map.
   *
   * @defaultValue false
   */
  readonly cluster = input(false);
  /**
   * Defines which colors should be used when points are grouped. Grouping means
   * that points are painted with their group color and they are displayed as
   * series in donut chart inside cluster.
   *
   * @defaultValue 'status'
   */
  readonly groupColors = input<Record<number, string> | ColorPalette>('status');
  /**
   * - **overlay**: Layer for popup element, an element to be displayed over the
   *   map and attached to a single map location.
   * - **controls**: List of controls to activate for map, additional controls
   *   like full screen, etc. can be added here.
   */
  readonly nativeProperties = input<OverlayNativeProperties>();
  /**
   * Type of background map, for example `'https://api.maptiler.com/maps/voyager/style.json?key=xxx'`
   * (Token key is required). The styleJson defines the tiler source and the
   * used styles for different layers, should only be used if the siemens
   * default styles by using `maptilerKey` isn't good enough.
   */
  readonly styleJson = input<any>();
  /**
   * Option to switch on/off the display of tooltip while hovering over single
   * point.
   *
   * @defaultValue false
   */
  readonly displayTooltipOnHover = input(false);
  /**
   * Option to switch on/off the display of popover when clicked.
   * Default set to true (on).
   *
   * @defaultValue true
   */
  readonly displayPopoverOnClick = input(true);

  /**
   * Option to switch on/off popover when hovered.
   * Default is set to false (off)
   *
   * @defaultValue false
   */
  readonly displayPopoverOnHover = input(false);

  /**
   * Provide your key for MapTiler, this will use the default siemens element
   * styles which can be used in both light and dark mode. Shouldn't be used
   * together with styleJson.
   */
  readonly maptilerKey = input<string>();
  /**
   * Option to switch on/off the display of tooltip while hovering over cluster.
   *
   * @defaultValue false
   */
  readonly displayTooltipOnClusterHover = input(false);
  /**
   * Defines range in which points are clustered. In pixels.
   *
   * @defaultValue DEFAULT_CLUSTER_DISTANCE
   */
  readonly clusterDistance = input<number>(DEFAULT_CLUSTER_DISTANCE);
  /**
   * Zoom level when calling the `select()` method on the component.
   * Defaults to 10.
   *
   * @defaultValue DEFAULT_FEATURE_SELECT_ZOOM
   */
  readonly featureSelectZoom = input<number>(DEFAULT_FEATURE_SELECT_ZOOM);
  /**
   * Max zoom level which is used when clicking on feature on the map.
   * Defaults to 15.
   *
   * @defaultValue DEFAULT_FEATURE_CLICK_ZOOM
   */
  readonly featureClickZoom = input<number>(DEFAULT_FEATURE_CLICK_ZOOM);
  /**
   * Max zoom level for clicking on a cluster on the map. Defaults to 15.
   *
   * @defaultValue DEFAULT_CLUSTER_CLICK_ZOOM
   */
  readonly clusterClickZoom = input<number>(DEFAULT_CLUSTER_CLICK_ZOOM);
  /**
   * Max zoom level on load or when clicking the reset button. Defaults to 5.
   *
   * @defaultValue DEFAULT_GLOBAL_ZOOM
   */
  readonly globalZoom = input<number>(DEFAULT_GLOBAL_ZOOM);
  /**
   * When enabled, features will be automatically zoom to on click.
   *
   * @defaultValue false
   */
  readonly autoZoomFeatureClick = input(false);
  /**
   * When disabled, clusters will no longer automatically be zoomed to on click.
   *
   * @defaultValue true
   */
  readonly autoZoomClusterClick = input(true);
  /**
   * Custom popover component
   */
  readonly popoverComponent = input<Type<any>>();

  /**
   * Custom popover component for clustering
   */
  readonly clusterPopoverComponent = input<Type<any>>();
  /**
   * Custom popover component
   */
  readonly popoverComponentProps = input<any>();
  /**
   * Close the popover on click
   *
   * @defaultValue true
   */
  readonly popoverCloseOnClick = input(true);

  /**
   * Padding (in pixels) applied to the map view when zooming to a cluster, preventing points from being clipped at the edges.
   * Specified as [top, right, bottom, left].
   *
   * @defaultValue [20, 20, 20, 20]
   */
  readonly fitClusterPadding = input<[number, number, number, number]>([20, 20, 20, 20]);
  /**
   * For Point geometry, padding (in pixels) to be cleared to fit the point inside the view after a click on it.
   * Values in the array are: [top, right, bottom, left].
   *
   * @defaultValue [20, 20, 20, 20]
   */
  readonly fitPointPadding = input<number[]>([20, 20, 20, 20]);
  /**
   * For GeoJson, padding (in pixels) to be cleared to fit the GeoJson inside the view after a click on it.
   * Values in the array are: [top, right, bottom, left].
   *
   * @defaultValue [20, 20, 20, 20]
   */
  readonly fitGeoJsonPadding = input<number[]>([20, 20, 20, 20]);
  /**
   * Cutoff text for tooltips, when cluster combines more than 4 features
   *
   * @deprecated Use `SiMapTooltipComponent` instead to set the `moreText` input e.g. `<si-map ...><si-map-tooltip [moreText]="'KEY_MORE'" /></si-map>`.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MAPS.TOOLTIP_MORE_TEXT:and {{length}} more...`)
   * ```
   */
  readonly moreText = input(
    t(() => $localize`:@@SI_MAPS.TOOLTIP_MORE_TEXT:and {{length}} more...`)
  );
  /**
   * Show multiple worlds, including points that cross the 180th meridian.
   *
   * @defaultValue true
   */
  readonly multiWorld = input(true);
  /**
   * Show the label permanently next to the point.
   * Normally the label is shown on hover or click.
   * By enabling this it will always be visible next to the marker.
   *
   * @defaultValue false
   */
  readonly alwaysShowLabels = input(false);
  /**
   * Maximum number of characters per line for always displayed labels of a point.
   * If the label exceeds this limit, it will be wrapped or trimmed.
   * If set to 0, label trimming will be disabled.
   * This setting is effective only when {@link alwaysShowLabels} is enabled.
   * Important: Changing this is not recommended in most cases and may cause issues with positioning of the labels.
   *
   * @defaultValue 20
   */
  readonly maxLabelLineLength = input(20);
  /**
   * Maximum number of lines for always displayed labels of a point.
   * If the label exceeds this limit, it will be trimmed.
   * This setting is effective only when {@link alwaysShowLabels} is enabled and {@link maxLabelLineLength} is not 0.
   * Important: Changing this is not recommended in most cases and may cause issues with positioning of the labels.
   *
   * @defaultValue 3
   */
  readonly maxLabelLines = input(3);
  /**
   * Emitted when points on the map are selected or de-selected
   */
  readonly pointsSelected = output<MapPoint[]>();
  /**
   * Emitted when the points are available as features. So consumers can call methods like `zoomToPoints()` on the actual point list.
   */
  readonly pointsRefreshed = output<void>();

  protected readonly popover = viewChild.required(SiMapPopoverComponent);
  protected readonly popoverElement = viewChild.required<ElementRef, ElementRef>('popover', {
    read: ElementRef
  });
  protected readonly defaultTooltip = viewChild(SiMapTooltipComponent);
  protected readonly projectedTooltip = contentChild(SiMapTooltipComponent);
  protected readonly tooltip = computed(() => this.projectedTooltip() ?? this.defaultTooltip()!);
  protected readonly mapReference = viewChild.required<ElementRef<HTMLElement>>('map');
  /** OpenLayers map instance. */
  map?: Map;

  tooltipOverlay!: Overlay;
  popoverOverlay!: Overlay;
  /** @defaultValue false */
  isClicked = false;
  /** @defaultValue [] */
  features: Feature[] = [];
  selected?: Feature;
  targetFeature?: Feature;
  protected attributionsLabel = t(() => $localize`:@@SI_MAPS.ATTRIBUTIONS_BUTTON:Attributions`);
  protected zoomInLabel = t(() => $localize`:@@SI_MAPS.ZOOM_IN_BUTTON:Zoom in`);
  protected zoomOutLabel = t(() => $localize`:@@SI_MAPS.ZOOM_OUT_BUTTON:Zoom out`);
  protected zoomToDefaultLabel = t(
    () => $localize`:@@SI_MAPS.ZOOM_TO_DEFAULT_BUTTON:Zoom to default view`
  );
  protected clusterInteraction?: SelectCluster;
  private selectedCluster?: Feature;
  private darkTheme: boolean | undefined = undefined;

  private readonly mapService = inject(MapService);
  private readonly ngZone = inject(NgZone);
  // We cannot use new inject function, as it may not be available in older translate version.
  // Older version could potentially be used in mobile.
  private readonly translateService =
    inject(SiTranslateServiceBuilder, { optional: true })?.buildService(inject(Injector)) ??
    inject(SiNoTranslateService);

  constructor() {
    const translations = this.translateService.translateSync([
      this.attributionsLabel,
      this.zoomInLabel,
      this.zoomOutLabel,
      this.zoomToDefaultLabel
    ]);
    this.attributionsLabel = translations[this.attributionsLabel];
    this.zoomInLabel = translations[this.zoomInLabel];
    this.zoomOutLabel = translations[this.zoomOutLabel];
    this.zoomToDefaultLabel = translations[this.zoomToDefaultLabel];
  }
  // this is to filter out non-data layers for performance of `forEachFeatureAtPixel()`
  private layerFilter = (layer: Layer<any>): boolean => {
    const name = layer.get(LAYER_NAME);
    return name === POINTS_LAYER || name === GEOJSON_LAYER;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }

    if (changes.groupColors) {
      this.mapService.setTheme(this.groupColors());
      // refresh the style of points-layer to reflect the color changes.
      this.refreshLayersStyle([POINTS_LAYER]);
    }

    if (changes.points) {
      this.refresh(this.points() ?? [], false);
    }

    if (changes.geoJson || changes.styleFunction) {
      const geojsonLayer = this.map
        .getLayers()
        .getArray()
        .find(layer => layer.get(LAYER_NAME) === GEOJSON_LAYER) as VectorLayer<VectorSource>;
      if (geojsonLayer) {
        if (changes.geoJson) {
          // If geojson-layer is already present and there is change in geojson,
          // update the features of geojson-layer with the latest geojson.
          const geoJson = this.geoJson();
          const features =
            geoJson && Object.keys(geoJson).length
              ? new GeoJSON({ featureProjection: this.geoJsonProjection() }).readFeatures(geoJson)
              : [];
          this.ngZone.runOutsideAngular(() =>
            geojsonLayer.setSource(new VectorSource({ features }))
          );
        }
        if (changes.styleFunction) {
          // If there is some change in styleFunction, update the style of geojson-layer.
          this.ngZone.runOutsideAngular(() => geojsonLayer.setStyle(this.styleFunction()));
        }
      } else {
        // If geojson-layer is not present, and change is detected in geojson or styleFunction,
        // create a new geojson-layer.
        this.ngZone.runOutsideAngular(() => this.setGeoJsonLayer());
      }
    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.init();
      this.map?.on('pointermove', event => this.onFeatureHover(event));
      this.map?.on('click', event => this.onClusterClick(event));
    });

    const dark = document.documentElement.classList.contains('app--dark');
    this.setTheme(dark, this.maptilerKey());

    setTimeout(() => this.fixCenter());
  }

  ngAfterViewChecked(): void {
    // making sure that if the map is not rendered updateSize() gets called
    // this is to make sure the map also gets rendered in ionic
    if (this.map && !this.map.isRendered()) {
      this.ngZone.runOutsideAngular(() => this.map!.updateSize());
    }
  }

  ngOnDestroy(): void {
    this.removePixelRatioListener();
    this.map?.setTarget(undefined);
  }

  @HostListener('window:theme-switch', ['$event'])
  onThemeSwitchInternal(event: Event): void {
    this.setTheme((event as CustomEvent).detail.dark, this.maptilerKey());
  }

  onThemeSwitch(dark: boolean): void {
    this.setTheme(dark, this.maptilerKey());
  }

  private removePixelRatioListener = (): void => {};

  private readonly updatePixelRatio = (): void => {
    // on browser zoom the pixel ratio changes. No other updates are needed as OL has a
    if (this.map && window.devicePixelRatio !== (this.map as any).pixelRatio_) {
      this.ngZone.runOutsideAngular(() => this.changeOpenLayerPixelRation());
    }

    this.removePixelRatioListener();
    const media = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    media.addEventListener('change', this.updatePixelRatio);
    this.removePixelRatioListener = () =>
      media.removeEventListener('change', this.updatePixelRatio);
  };

  /**
   * Changes the pixel ration in OL which is not supported directly by OL.
   */
  private changeOpenLayerPixelRation(): void {
    if (!this.map) {
      return;
    }

    // need to reset cached styles as they contain pre-rendered canvases
    this.mapService.resetCaches();

    // set private property
    (this.map as any).pixelRatio_ = devicePixelRatio;

    // force redraw of all layers
    this.map!.getLayers().forEach(layer => {
      if (layer instanceof Layer) {
        const source = layer.getSource();
        if (source?.tilePixelRatio_ !== undefined) {
          source.tilePixelRatio_ = devicePixelRatio;
          source.refresh();
        }
        if (source instanceof Cluster) {
          source.getSource()?.changed();
        } else {
          source?.changed();
        }
        layer.changed();
      }
    });
    this.map.updateSize();
  }

  /**
   * Initialize map and it's layers
   */
  init(): void {
    const tooltipContainer = this.tooltip().nativeElement;
    const popoverContainer = this.popoverElement().nativeElement;
    const mapContainer = this.mapReference().nativeElement;
    const initialView = {
      constrainResolution: true,
      showFullExtent: true,
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 24
    };

    this.tooltipOverlay = this.createOverlay(
      tooltipContainer,
      'top-center',
      this.nativeProperties(),
      true
    );
    this.popoverOverlay = this.createOverlay(
      popoverContainer,
      'top-center',
      this.nativeProperties()
    );

    const controls = defaultControls({
      attributionOptions: {
        label: '',
        tipLabel: this.attributionsLabel,
        expandClassName: 'element-state-info',
        collapseLabel: '',
        collapseClassName: 'element-left-2 flip-rtl'
      },
      zoomOptions: {
        zoomInLabel: '',
        zoomInTipLabel: this.zoomInLabel,
        zoomInClassName: 'element-plus',
        zoomOutLabel: '',
        zoomOutTipLabel: this.zoomOutLabel,
        zoomOutClassName: 'element-minus'
      },
      rotateOptions: {
        label: '',
        compassClassName: 'element-compass-needle'
      }
    });

    class ResetZoomControl extends Control {
      constructor(options: { label: string; callback: () => void }) {
        const button = document.createElement('button');
        button.className = 'element-zoom-reset';
        button.title = options.label;

        const element = document.createElement('div');
        element.className = 'ol-zoom-extent ol-unselectable ol-control';
        element.appendChild(button);

        super({ element: element });

        button.addEventListener('click', options.callback, false);
      }
    }

    controls.push(
      new ResetZoomControl({
        label: this.zoomToDefaultLabel,
        callback: () => {
          if (this.features.length) {
            this.zoomToFeatures(this.features, this.globalZoom());
          } else {
            // reset to original view
            this.map?.setView(new View(initialView));
          }
        }
      })
    );

    const nativeProperties = this.nativeProperties();
    if (nativeProperties?.controls) {
      nativeProperties.controls.forEach(e => controls.push(e));
    }

    this.map = new Map({
      controls,
      target: mapContainer,
      overlays: [this.tooltipOverlay, this.popoverOverlay],
      view: new View(initialView)
    });

    this.mapService.setZoomCallback(() => this.map?.getView().getZoom());

    this.mapService.setTheme(this.groupColors()); // Set theme before adding layers.

    const styleJsonValue = this.styleJson();
    if (styleJsonValue) {
      this.setMapStyle(undefined, undefined, styleJsonValue);
    }

    this.setGeoJsonLayer();

    const points = this.points();
    if (points?.length) {
      this.features = this.mapService.createFeatures(points, this.alwaysShowLabels());
    }
    this.setLayers();
    this.zoomToFeatures(this.features, this.globalZoom(), false);

    this.updatePixelRatio();
  }

  private centerValid(): boolean {
    const center = this.map?.getView()?.getCenter();
    return !!center && !isNaN(center[0]);
  }

  // workaround for center not being applied sometimes
  private fixCenter(): void {
    if (!this.centerValid()) {
      this.ngZone.runOutsideAngular(() => this.map?.getView()?.setCenter([0, 0]));
    }
  }

  /**
   * Setting up the layers for the map (cluster/vector layer)
   */
  private setLayers(): void {
    let layer: Layer;
    let labelLayer: Layer | undefined;
    const showLabels = this.features.some(feature => feature.getProperties().label?.text);
    if (this.cluster()) {
      const clusterLayer = this.mapService.clusterLayer(
        this.features,
        this.markerAnimation(),
        this.clusterDistance(),
        this.multiWorld()
      );

      this.clusterInteraction = new SelectCluster({
        maxZoom: this.featureClickZoom,
        zoomOnClick: this.autoZoomClusterClick,
        fitClusterPadding: this.fitClusterPadding,
        // Style the selection
        style: (feature: FeatureLike) => this.mapService.getClusterStyle(feature as Feature)
      });
      this.map?.addInteraction(this.clusterInteraction);

      if (showLabels) {
        labelLayer = this.mapService.labelLayer(
          this.features,
          this.multiWorld(),
          this.maxLabelLineLength(),
          this.maxLabelLines(),
          clusterLayer
        );
      }
      layer = clusterLayer;
    } else {
      layer = this.mapService.vectorLayer(this.features, this.multiWorld());
      if (showLabels) {
        labelLayer = this.mapService.labelLayer(
          this.features,
          this.multiWorld(),
          this.maxLabelLineLength(),
          this.maxLabelLines()
        );
      }
    }
    layer.set(LAYER_NAME, POINTS_LAYER);

    this.map?.addLayer(layer);
    if (labelLayer) {
      this.map?.addLayer(labelLayer);
    }
  }

  /**
   * Setting up the geoJson layer
   */
  setGeoJsonLayer(): void {
    const geoJson = this.geoJson();
    if (this.map && geoJson && Object.keys(geoJson).length > 0) {
      const layer = this.mapService.vectorLayer(
        new GeoJSON({ featureProjection: this.geoJsonProjection() }).readFeatures(geoJson),
        this.multiWorld()
      );
      layer.setStyle(this.styleFunction());
      layer.set(LAYER_NAME, GEOJSON_LAYER);
      this.ngZone.runOutsideAngular(() => this.map!.addLayer(layer));
    }
  }

  private setTheme(dark: boolean, maptilerKey?: string): void {
    if (maptilerKey && (this.darkTheme === undefined || this.darkTheme !== dark)) {
      this.setMapStyle(dark, maptilerKey);
      this.darkTheme = dark;
    }
    this.mapService.setTheme(this.groupColors());
    // reload the style to reflect the theme changes.
    this.refreshLayersStyle([POINTS_LAYER, GEOJSON_LAYER]);
  }

  private refreshLayersStyle(layerNames: string[]): void {
    this.ngZone.runOutsideAngular(() =>
      this.map
        ?.getLayers()
        .getArray()
        .forEach(layer => {
          if (layerNames.includes(layer.get(LAYER_NAME))) {
            (layer as VectorLayer<VectorSource>).setStyle(
              (layer as VectorLayer<VectorSource>).getStyle()
            );
          }
        })
    );
  }

  /**
   * Set Map style
   * @param dark - boolean if dark theme should be active or not
   * @param key - the api key for the maptiler styleJSON
   * @param styleJSON - a preexisting styleJSON as url with key already provided
   */
  setMapStyle(dark?: boolean, key?: string, styleJSON?: string): void {
    if (!this.map) {
      return;
    }

    if (styleJSON) {
      this.ngZone.runOutsideAngular(() => applyMapboxStyle(this.map!, styleJSON));
    } else if (key) {
      const layers = this.map.getLayers().getArray() as Layer[];
      layers.forEach((layer: Layer) => {
        if (layer.get('mapbox-source')) {
          this.map!.removeLayer(layer);
        }
      });
      this.mapboxStyles(styleJson(key, dark));
    }
  }

  /**
   * Set mapbox styles
   * @param styleJSON - the styleJSON as a JSON object
   */
  mapboxStyles(styleJSON: any): void {
    if (!this.map) {
      return;
    }
    this.ngZone.runOutsideAngular(() =>
      applyMapboxStyle(this.map!, styleJSON).then(mapOrLayer => {
        const map = mapOrLayer as Map;
        const layers = map.getLayers().getArray() as Layer[];
        layers.forEach((layer: Layer) => {
          if (layer.get('mapbox-source')) {
            // any needs to be used here otherwise library doesn't allow it
            (layer.getSource() as any).wrapX_ = this.multiWorld();
            this.map = map;
          }
        });
      })
    );
  }

  /**
   * Create overlay for tooltip and popover
   * @param nativeProperties - native properties
   * @param container - to create overlay in
   * @param position - overlay positioning
   */
  createOverlay(
    container: HTMLElement,
    position: Positioning,
    nativeProperties?: OverlayNativeProperties,
    isTooltip?: boolean
  ): Overlay {
    return (
      nativeProperties?.overlay ??
      new Overlay({
        element: container,
        positioning: position,
        // Stop event bubbling which allow to scroll in the popover
        stopEvent: true,
        autoPan: isTooltip ? true : false
      })
    );
  }

  /**
   * On feature hovering show tooltip and change cursor style
   * @param event - A hovering event
   */
  onFeatureHover(event: MapBrowserEvent): void {
    if (!this.map) {
      return;
    }

    const clusterHolder: ClusterHolder = {};
    const features = this.map.forEachFeatureAtPixel(
      event.pixel,
      feat => this.featureCallback(feat, clusterHolder),
      {
        hitTolerance: 2,
        layerFilter: this.layerFilter
      }
    );

    const element = this.map.getTargetElement();
    if (element) {
      // The cursor will change to pointer if displayPopoverOnClick is true or if Cluster Features are hovered.
      element.style.cursor =
        features?.length && (this.displayPopoverOnClick() || features.length > 1) ? 'pointer' : '';
      // The popover will be shown only for individual points, not for cluster.
      if (this.displayPopoverOnHover() && !this.isClicked) {
        if (features?.length === 1) {
          this.setPopOver(features[0], false, event);
        } else {
          this.popoverOverlay.setPosition(undefined);
        }
        return;
      }
    }

    this.doShowTooltip(features, clusterHolder.feature);
  }

  /** Display tooltip on hovering over feature type of Feature. */
  displayTooltip(feats: FeatureLike[]): void {
    if (!this.displayTooltipOnHover() || this.isClicked) {
      return;
    }
    for (const feat of feats) {
      const features = this.featureCallback(feat);
      if (features?.length === 1) {
        this.showTooltipContent(features[0]);
        return;
      }
    }
  }

  private doShowTooltip(features?: Feature[], cluster?: Feature): void {
    let shown = false;
    if (!this.isClicked && features?.length) {
      if (this.displayTooltipOnHover() && features?.length === 1) {
        shown = this.showTooltipContent(features[0]);
      } else if (this.selectedCluster !== cluster && this.displayTooltipOnClusterHover()) {
        shown = this.showClusterTooltipContent(features, cluster);
      }
    }
    if (!shown) {
      this.tooltipOverlay.setPosition(undefined);
    }
  }

  /**
   * Clicking on cluster event
   * @param event - openlayers event
   */
  onClusterClick(event: MapBrowserEvent): void {
    if (!this.map) {
      return;
    }
    if (!this.popoverCloseOnClick() && this.popoverElement()) {
      const popoverLoc = (
        this.popoverElement().nativeElement as HTMLElement
      ).firstElementChild!.getBoundingClientRect();
      const mapLoc = (this.mapReference().nativeElement as HTMLElement).getBoundingClientRect();
      const left = popoverLoc.left - mapLoc.left;
      const top = popoverLoc.top - mapLoc.top;
      const right = popoverLoc.right - mapLoc.left;
      const bottom = popoverLoc.bottom - mapLoc.top;
      if (
        left <= event.pixel[0] &&
        event.pixel[0] <= right &&
        top <= event.pixel[1] &&
        event.pixel[1] <= bottom
      ) {
        return;
      }
    }
    const clusterHolder: ClusterHolder = {};
    const clusterFeatures = this.map.forEachFeatureAtPixel(
      event.pixel,
      feat => this.featureCallback(feat, clusterHolder),
      {
        layerFilter: this.layerFilter
      }
    );
    if (clusterFeatures) {
      if (clusterFeatures.length > 1) {
        this.tooltipOverlay.setPosition(undefined);
        this.showClusterPopover(clusterHolder.feature!);
        this.emitSelection(clusterFeatures);
      } else if (clusterFeatures.length === 1) {
        if (clusterFeatures[0] instanceof RenderFeature) {
          this.closePopup();
          this.emitSelection();
        } else if (this.displayPopoverOnClick()) {
          this.featureClick(clusterFeatures[0], event, this.autoZoomFeatureClick());
          this.emitSelection(clusterFeatures);
        }
      }
    } else {
      this.closePopup();
      this.emitSelection();
    }
  }

  private emitSelection(features?: Feature[]): void {
    const points: MapPoint[] = (features ?? []).map(f => {
      const props = f.getProperties();
      return props.meta ?? (props as MapPoint);
    });
    this.ngZone.run(() => this.pointsSelected.emit(points));
  }

  /**
   * Zoom to cluster features
   * @param clusterFeatures - features to zoom in
   */
  zoomCluster(clusterFeatures: Feature[]): void {
    this.clusterInteraction?.zoomToCluster(clusterFeatures);
  }

  /**
   * Close popup
   */
  closePopup(): boolean {
    this.selectedCluster = undefined;
    this.popoverOverlay.setPosition(undefined);
    this.isClicked = false;
    return false;
  }

  /**
   * Return features inside feature object in case of cluster enabled/disabled
   * @param feat - feature to get features from
   */
  featureCallback(feat: FeatureLike, clusterHolder?: ClusterHolder): Feature[] | undefined {
    if (feat instanceof Feature) {
      const propFeatures = feat.getProperties().features;
      if (this.cluster() && propFeatures) {
        if (clusterHolder) {
          clusterHolder.feature = feat;
        }
        return propFeatures;
      }
      return [feat];
    }
    return undefined;
  }

  /**
   * Zoom to features, gets coordinates of points and creates bounding extent
   * @param points - list of points to zoom in, if empty all points will be zoomed to, need to be the same reference as the input
   * @param zoomLevel - number for level to zoom in
   */
  zoomToPoints(points: MapPoint[], zoomLevel: number, shouldAnimate = true): void {
    if (!points.length) {
      this.zoomToFeatures([], zoomLevel, shouldAnimate);
    } else {
      const features = points
        .map(point => this.points()?.indexOf(point))
        .filter(index => index !== undefined)
        .map(index => this.features[index]);
      this.zoomToFeatures(features, zoomLevel, shouldAnimate);
    }
  }

  /**
   * Zoom to features, gets coordinates of features and creates bounding extent
   * @param features - list of features to zoom in, if empty all features will be zoomed to
   * @param zoomLevel - number for level to zoom in
   */
  zoomToFeatures(features: Feature[], zoomLevel: number, shouldAnimate = true): void {
    if (!features.length) {
      features = this.features;
    }
    const coordinates: Coordinate[] = [];
    for (const f of features) {
      const coordinate = this.getFeatureCoordinate(f);
      if (coordinate) {
        coordinates.push(coordinate);
      }
    }
    this.zoomToCoordinates(coordinates, zoomLevel, shouldAnimate, this.fitPointPadding());
  }

  /**
   * Zoom to GeoJson using coordinates of point of click
   * @param coordinate - coordinates of point of click
   * @param zoomLevel - number for level to zoom in
   */
  zoomToGeoJson(coordinate: Coordinate, zoomLevel: number, shouldAnimate = true): void {
    this.zoomToCoordinates([coordinate], zoomLevel, shouldAnimate, this.fitGeoJsonPadding());
  }

  private zoomToCoordinates(
    coordinates: Coordinate[],
    maxZoom: number,
    animate = true,
    padding?: number[]
  ): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.map && coordinates.length) {
        const view = this.map.getView();
        view.fit(olExtent.boundingExtent(coordinates), {
          duration: animate && this.centerValid() ? ANIMATION_DURATION : undefined,
          maxZoom,
          padding
        });
      }
    });
  }

  /**
   * Refresh points with new set of points
   * @param points - to refresh with
   */
  refresh(points: MapPoint[], zoomToFeatures = true): void {
    this.points.set(points);
    this.ngZone.runOutsideAngular(() => this.doRefresh(points, zoomToFeatures));
  }

  private doRefresh(points: MapPoint[], zoomToFeatures: boolean): void {
    if (!this.map) {
      return;
    }

    this.mapService.resetCaches();

    this.isClicked = false;
    this.clear();

    const layers = this.map.getLayers().getArray() as Layer[];
    this.features = this.mapService.createFeatures(points, this.alwaysShowLabels());

    layers.forEach((layer: Layer) => {
      const source = layer.getSource();

      if (source instanceof Cluster && this.cluster()) {
        const vectorSource = source.getSource();
        vectorSource?.addFeatures(this.features);
      } else if (source instanceof VectorSource) {
        source.addFeatures(this.features);
      }
    });

    if (zoomToFeatures) {
      this.zoomToFeatures([], this.globalZoom());
    }
    // Emit change event to notify consumers that the actual features are available.
    // This is necessary to call methods like `zoomToPoints()`
    this.ngZone.run(() => this.pointsRefreshed.emit());
  }

  clear(): void {
    this.ngZone.runOutsideAngular(() => this.doClear());
  }

  private doClear(): void {
    if (!this.map) {
      return;
    }

    this.mapService.resetCaches();

    this.hideOverlays();
    const layers = this.map.getLayers().getArray() as Layer[];

    layers.forEach((layer: Layer) => {
      const source = layer.getSource();

      if (source instanceof Cluster && this.cluster()) {
        const vectorSource = source.getSource();
        vectorSource?.clear();
      }

      if (source instanceof VectorSource) {
        source.clear();
      }
    });
  }

  /**
   * Selecting the certain point on map with API
   * @param point - which select
   */
  select(point: MapPoint, maxZoomLevel?: number): void {
    this.ngZone.runOutsideAngular(() => this.doSelect(point, maxZoomLevel));
  }

  private doSelect(point: MapPoint, maxZoomLevel?: number): void {
    if (!this.map) {
      return;
    }

    const featPoint: Feature[] = this.mapService.createFeatures([point], this.alwaysShowLabels());
    const ext = featPoint[0]?.getGeometry()?.getExtent();

    if (ext) {
      const center = olExtent.getCenter(ext);
      this.map.setView(
        new View({
          center: [center[0], center[1]],
          zoom: maxZoomLevel ?? this.featureSelectZoom()
        })
      );
      this.featureClick(featPoint[0]);
      this.emitSelection(featPoint);
    }
  }

  /** API for feature clicking with extra properties. */
  featureClick(feature: Feature, event?: any, zoom?: boolean): void {
    this.targetFeature = feature;
    this.isClicked = true;
    this.tooltipOverlay.setPosition(undefined);

    this.setPopOver(feature, zoom, event);
  }

  private setPopOver(feature: Feature, zoom: boolean | undefined, event: any): void {
    const extraProperties = feature.getProperties().extraProps;
    const geometry = feature?.getGeometry();

    /*If a Point geometry is present on top of a GeoJson layer, and when clicked on the point,
    "else if" statement will prevent repetition of the popover render and zoom method.*/
    if (geometry && geometry instanceof Point) {
      if (zoom) {
        this.zoomToFeatures([feature], this.featureClickZoom());
      }
      const coordinates = geometry.getCoordinates();
      this.selected = feature;
      this.popoverOverlay.setPosition(coordinates);
      this.popoverOverlay.setOffset(this.mapService.getMarkerOffset(feature));
      this.popover().render({
        component: this.popoverComponent(),
        mapPoints: feature.getProperties() as MapPointMetaData
      });
      if (extraProperties) {
        feature.getProperties().click?.(extraProperties);
      }
    } else if (this.geoJson()) {
      const coordinates = event.coordinate;
      this.popoverOverlay.setPosition(coordinates);
      this.popoverOverlay.setOffset(this.mapService.getMarkerOffset(feature));
      this.popover().render({
        component: this.popoverComponent(),
        mapPoints: [feature.getProperties() as MapPointMetaData]
      });
      if (zoom) {
        this.zoomToGeoJson(coordinates, this.featureClickZoom());
      }
    }
  }

  /**
   * Show tooltip with content on hover over feature
   * @param feature - to show popup on
   */
  showTooltipContent(feature: Feature): boolean {
    const coordinates = this.getFeatureCoordinate(feature);
    if (coordinates) {
      this.tooltip().setTooltip(feature.getProperties().name as string);
      this.tooltipOverlay.setOffset(this.mapService.getMarkerOffset(feature));
      this.tooltipOverlay.setPosition(coordinates);
      return true;
    }
    return false;
  }

  /** Sends data into cluster tooltip based on number of
   * @param features - in it
   * */
  showClusterTooltipContent(features: Feature[], cluster?: Feature): boolean {
    const coordinates =
      this.getFeatureCoordinate(cluster) ?? this.calculateClusterCoordinates(features);

    const labels = features.map(f => f.getProperties().name);
    this.tooltip().setTooltip(labels);

    this.tooltipOverlay.setOffset([0, 20]);
    this.tooltipOverlay.setPosition(coordinates);
    return true;
  }

  hideOverlays(): void {
    this.tooltipOverlay.setPosition(undefined);
    this.popoverOverlay.setPosition(undefined);
  }

  private getFeatureCoordinate(feature?: Feature): Coordinate | undefined {
    const geometry = feature?.getGeometry();
    if (geometry instanceof Point) {
      return geometry.getCoordinates();
    }
    return undefined;
  }

  /**
   * Calculates cluster center coordinates (lon, lat) for cluster tooltip positioning base on
   * @param features - (lon, lan)
   */
  private calculateClusterCoordinates(features: Feature[]): [number, number] {
    let lon = 0;
    let lat = 0;
    for (const feat of features) {
      const coordinates = this.getFeatureCoordinate(feat);
      if (coordinates) {
        lon += coordinates[0];
        lat += coordinates[1];
      }
    }
    return [lon / features.length, lat / features.length];
  }

  private showClusterPopover(cluster: Feature<Geometry>): void {
    if (!cluster) {
      this.popoverOverlay.setPosition(undefined);
      return;
    }
    // Only show cluster popover when auto zoom on cluster click is disabled or when the zoom level is sufficient.
    const zoom = this.map?.getView().getZoom();
    const show = !this.autoZoomClusterClick() || (zoom && zoom >= this.clusterClickZoom());
    if (!show) {
      return;
    }
    this.popoverOverlay.setOffset([0, 20]);
    this.popoverOverlay.setPosition(this.getFeatureCoordinate(cluster));
    const features = cluster.getProperties().features as Feature<Geometry>[];
    this.popover().render({
      component: this.clusterPopoverComponent(),
      mapPoints: features.map(f => f.getProperties() as MapPointMetaData),
      map: this.map
    });
    // Remember the selected cluster to avoid showing the a tooltip for cluster which has an open popover.
    this.selectedCluster = cluster;
  }
}
