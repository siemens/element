/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/// <reference types="./ol-ext.d.ts" />
import { Injectable } from '@angular/core';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import Chart from 'ol-ext/style/Chart';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Layer from 'ol/layer/Layer';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { Options as IconOptions } from 'ol/style/Icon';
import ImageStyle from 'ol/style/Image';

import { ColorPalette } from '../models/color-palette.type';
import {
  ANIMATION_DURATION,
  CLUSTER_CHARTS_FRAGMENTS,
  CLUSTER_RADIUS_SIZE,
  DEFAULT_CLUSTER_TYPE,
  DEFAULT_DONUT_RATIO,
  DEFAULT_ICON,
  DEFAULT_ICON_SCALE,
  DEFAULT_OFFSET,
  DEFAULT_STROKE_WEIGHT,
  MAX_CLUSTER_BUILDINGS,
  SIEMENS_FONT,
  SIEMENS_FONT_LABELS
} from '../models/constants';
import { Grouping } from '../models/grouping.model';
import {
  IconMarkerOptions,
  LabelOptions,
  MapPoint,
  MarkerOptions
} from '../models/map-point.interface';
import { themeElement, ThemeType } from '../shared/themes/element';
import { getMarker } from '../shared/themes/marker';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private styleCache: Record<string, Style[]> = {};
  private clusterStyleCache: Record<string, Style[]> = {};
  private labelStyleCache: Record<string, Style[]> = {};
  private grouping?: Grouping;

  private _theme?: ThemeType;

  private wrappedTextCache: Record<string, string> = {};
  private labelTextStyleCache: Record<string, Text[]> = {};

  resetCaches(): void {
    this.styleCache = {};
    this.clusterStyleCache = {};
    this.labelStyleCache = {};
    this.wrappedTextCache = {};
    this.labelTextStyleCache = {};
  }

  private wrapLabelText(labelText: string, maxLength: number, maxLines: number): string {
    const cacheKey = `${labelText}_${maxLength}_${maxLines}`;
    if (this.wrappedTextCache[cacheKey]) {
      return this.wrappedTextCache[cacheKey];
    }

    let wrappedText = '';
    let currentLine = '';
    let lineCount = 0;
    const words = labelText.split(/[ \n]/g);
    if (maxLength > 0) {
      for (const word of words) {
        const strippedWord =
          word.length > maxLength ? word.substring(0, maxLength - 3) + '...' : word;
        if ((currentLine.length || -1) + 1 + strippedWord.length > maxLength) {
          if (lineCount + 1 >= maxLines) {
            const wrappedLine = currentLine.endsWith('...')
              ? currentLine
              : (currentLine.length > maxLength
                  ? currentLine.substring(0, maxLength - 3)
                  : currentLine) + '...';
            wrappedText += (wrappedText ? '\n' : '') + wrappedLine;
            return (this.wrappedTextCache[cacheKey] = wrappedText);
          } else {
            wrappedText += (wrappedText ? '\n' : '') + currentLine;
          }
          currentLine = '';
          lineCount++;
        }
        currentLine += (currentLine ? ' ' : '') + strippedWord;
      }
      if (currentLine) {
        wrappedText += (wrappedText ? '\n' : '') + currentLine;
      }
    } else {
      wrappedText = labelText;
    }

    return (this.wrappedTextCache[cacheKey] = wrappedText);
  }

  private getLabelTextStyle(
    text: string = '',
    maxLength: number,
    maxLines: number,
    markerSizes: [number, number],
    markerOffset: [number, number]
  ): Text[] {
    const cacheKey = `${text}_${maxLength}_${SIEMENS_FONT_LABELS}_${markerSizes[0]}_${markerSizes[1]}_${markerOffset[0]}_${markerOffset[1]}`;
    if (this.labelTextStyleCache[cacheKey]) {
      return this.labelTextStyleCache[cacheKey];
    }

    const wrappedText = this.wrapLabelText(text, maxLength, maxLines);
    const margin = 6;
    const extraPadding = 1;
    const halfWidth = markerSizes[0] / 2;
    const halfHeight = markerSizes[1] / 2;
    const placementOffsets = [
      {
        offsetX: markerOffset[0],
        offsetY: margin + markerOffset[1],
        align: { h: 'center', v: 'top' }
      },
      {
        offsetX: markerOffset[0],
        offsetY: -margin - markerSizes[1] + markerOffset[1],
        align: { h: 'center', v: 'bottom' }
      },
      {
        offsetX: -margin - halfWidth + markerOffset[0],
        offsetY: markerOffset[1] - halfHeight,
        align: { h: 'right', v: 'middle' }
      },
      {
        offsetX: margin + halfWidth - markerOffset[0],
        offsetY: markerOffset[1] - halfHeight,
        align: { h: 'left', v: 'middle' }
      }
    ] as const;

    return (this.labelTextStyleCache[cacheKey] = placementOffsets.map(
      offset =>
        new Text({
          text: wrappedText,
          font: SIEMENS_FONT_LABELS,
          fill: new Fill({ color: this.theme.textColor }),
          stroke: new Stroke({ color: this.theme.strokeColor, width: 4 }),
          offsetX: offset.offsetX,
          offsetY: offset.offsetY,
          padding: [
            offset.offsetY >= 0 ? offset.offsetY + extraPadding : 0,
            offset.offsetX < 0 ? -offset.offsetX - extraPadding : 0,
            offset.offsetY < 0 ? -offset.offsetY - extraPadding : 0,
            offset.offsetX >= 0 ? offset.offsetX + extraPadding : 0
          ],
          textAlign: offset.align.h,
          textBaseline: offset.align.v,
          overflow: true
        })
    ));
  }

  private zoomCallback: () => number | undefined = () => undefined;

  private getZoom(): number {
    return this.zoomCallback?.() ?? 3;
  }

  setZoomCallback(callback?: () => number | undefined): void {
    this.zoomCallback = callback ?? (() => undefined);
  }

  setTheme(groupColors: Record<number, string> | ColorPalette | undefined): void {
    this.resetCaches();
    this.grouping = new Grouping(groupColors);
    this._theme = undefined;
  }

  get theme(): ThemeType {
    this._theme ??= themeElement.style();
    return this._theme;
  }

  /**
   * Create feature with parameters
   * @param points - the list of points
   */
  createFeatures(points: MapPoint[], alwaysShowLabels = false): Feature[] {
    return points.map(
      point =>
        new Feature({
          geometry: new Point(fromLonLat([point.lon, point.lat])),
          // Append MapPointMetaData that will be available in getProperties()
          meta: point,
          name: point.name,
          description: point.description,
          marker: point.marker,
          label: alwaysShowLabels ? ({ text: point.name } as LabelOptions) : undefined,
          group: point.group,
          extraProps: point.extraProperties,
          click: point.click
        })
    );
  }

  /**
   * Initialize animated cluster layer for points if clustering is enabled
   * @param features - for the source
   * @param markerAnimation - animation value for markers
   * @param clusterDistance - number distance between clusters
   * @param multiWorld - boolean if points should be repeated on multiple world maps
   */
  clusterLayer(
    features: Feature[],
    markerAnimation: boolean,
    clusterDistance: number,
    multiWorld: boolean
  ): Layer {
    return new AnimatedCluster({
      className: 'animated-cluster',
      zIndex: 1000,
      source: new Cluster({
        wrapX: multiWorld,
        distance: this.calculateClusteringDistance(clusterDistance, CLUSTER_RADIUS_SIZE),
        minDistance: CLUSTER_RADIUS_SIZE * 2,
        source: new VectorSource({
          features
        })
      }),
      animationDuration: markerAnimation ? ANIMATION_DURATION : 0,
      style: (feature: Feature) => this.getClusterStyle(feature)
    });
  }

  /**
   * Create vector layer when clustering is disabled
   * @param features - list of Features
   * @param multiWorld - boolean if points should be repeated on multiple world maps
   */
  vectorLayer(
    features: Feature[],
    multiWorld: boolean,
    defaultStyle: boolean = false
  ): VectorLayer<VectorSource> {
    return new VectorLayer({
      className: 'vector-layer',
      zIndex: 1000,
      source: new VectorSource({
        features,
        wrapX: multiWorld
      }),
      style: !defaultStyle
        ? feature => this.getFeatureStyle(feature as Feature, false, features)
        : undefined
    });
  }

  labelLayer(
    features: Feature[],
    multiWorld: boolean,
    maxLabelLength: number,
    maxLines: number,
    clusterLayer?: Layer
  ): VectorLayer<VectorSource> {
    const clusterSource = clusterLayer?.getSource() as Cluster<Feature<Point>>;
    return new VectorLayer({
      className: 'vector-layer',
      zIndex: 1200,
      source: new VectorSource({
        features,
        wrapX: multiWorld
      }),
      declutter: true,
      style: feature =>
        this.getLabelStyle(
          feature as Feature<Point>,
          features as Feature<Point>[],
          maxLabelLength,
          maxLines,
          clusterSource,
          false
        )
    });
  }

  /**
   * Cluster styling
   *
   * @param feature - Feature
   */
  getClusterStyle(feature: Feature): Style[] {
    const features = feature.getProperties().features;
    if (!features) {
      return this.getFeatureStyle(feature, true, features);
    }
    const uid = feature.getProperties().geometry.ol_uid;
    const size = features.length;

    if (size === 1) {
      return this.getFeatureStyle(feature, true, features);
    }

    let style: Style[] = this.clusterStyleCache[uid];

    if (!style) {
      style = [
        new Style({
          image: new Circle({
            radius: CLUSTER_RADIUS_SIZE,
            fill: new Fill({
              color: this.theme.fillColor
            }),
            stroke: new Stroke({
              color: this.theme.strokeColor,
              width: 6
            })
          })
        }),
        new Style({
          image: this.getClusterChart(features, this.grouping!),
          text: new Text({
            text: size > MAX_CLUSTER_BUILDINGS ? `${MAX_CLUSTER_BUILDINGS}+` : size.toString(),
            placement: 'point',
            textAlign: 'center',
            textBaseline: 'middle',
            fill: new Fill({ color: this.theme.textColor }),
            font: SIEMENS_FONT
          })
        })
      ];

      this.clusterStyleCache[uid] = style;
    }

    return style;
  }

  /**
   * Separate feature styling with icon
   * @param feature - to style
   * @param cluster - indication
   * @param grouping - colors
   */
  getFeatureStyle(feature: Feature, cluster: boolean, features: Feature[], dummy = false): Style[] {
    const subFeatures = feature.getProperties()?.features;
    const feat = cluster && features ? subFeatures[0] : feature;
    const marker: MarkerOptions = feat.getProperties().marker;

    if (feat) {
      const uid = feat.getProperties().geometry.ol_uid + (dummy ? '~' : '');
      let style = this.styleCache[uid];

      if (!style) {
        style = [
          new Style(
            dummy
              ? {}
              : {
                  image: this.getMarkerStyle(feat, this.grouping!, marker)
                }
          )
        ];

        this.styleCache[uid] = style;
      }

      return style;
    }

    return [
      new Style({
        stroke: new Stroke({
          color: this.theme.strokeColor,
          width: DEFAULT_STROKE_WEIGHT
        })
      })
    ];
  }

  getLabelStyle(
    feature: Feature<Point>,
    features: Feature<Point>[],
    maxLabelLength: number,
    maxLines: number,
    clusterSource?: Cluster<Feature<Point>>,
    dummy = false
  ): Style[] {
    const featureStyle = this.getFeatureStyle(feature, false, features, true);

    // const marker: MarkerOptions = feature.getProperties().marker;
    const label: LabelOptions = feature.getProperties().label;

    if (dummy || !label?.text) {
      return featureStyle;
    }

    // Determine if the feature is clustered
    let isClustered = !!clusterSource;

    if (clusterSource) {
      let clusterFeatures = [];

      // Here we iterate over all clusters and check if the feature is among them
      clusterSource.getFeatures().forEach(cluster => {
        clusterFeatures = cluster.get('features');
        if (clusterFeatures && clusterFeatures.length === 1 && clusterFeatures[0] === feature) {
          isClustered = false;
        }
      });
    }

    // Only show labels for features that are not clustered
    if (!isClustered) {
      const uid = feature.getProperties().geometry.ol_uid + '~' + this.getZoom();
      let style = this.labelStyleCache[uid];

      if (!style) {
        const labelStyles = this.getLabelTextStyle(
          label?.text,
          maxLabelLength,
          maxLines,
          this.getMarkerSize(feature),
          this.getMarkerOffset(feature)
        );
        style = labelStyles.map(
          labelStyle =>
            new Style({
              text: labelStyle
            })
        );

        this.labelStyleCache[uid] = style;
      }

      return [...featureStyle, ...style];
    }

    return featureStyle;
  }

  getMarkerOffset(feature: Feature): [number, number] {
    const marker = feature.getProperties()?.marker;
    const markerType = marker?.type;
    const [, height] = this.getMarkerSize(feature);
    const offsetVertical = !markerType || markerType === 'status' ? 0 : height / 2;
    return [0, offsetVertical];
  }

  getMarkerSize(feature: Feature): [number, number] {
    const marker = feature.getProperties()?.marker;
    const markerType = marker?.type;
    const scale = (markerType === 'icon' ? marker?.icon?.scale : 1) ?? 1;
    const height =
      !markerType || markerType === 'status'
        ? 32
        : markerType === 'dot'
          ? 28
          : DEFAULT_OFFSET * 2 * scale;
    const width =
      !markerType || markerType === 'status'
        ? 22
        : markerType === 'dot'
          ? 28
          : DEFAULT_OFFSET * 2 * scale;
    return [width, height];
  }

  private getClusterChart(features: Feature[], grouping: Grouping): ImageStyle {
    const { data, colors } = this.getClusterChartData(features, grouping);

    const chart = new Chart({
      type: DEFAULT_CLUSTER_TYPE,
      radius: CLUSTER_RADIUS_SIZE,
      donutRatio: DEFAULT_DONUT_RATIO,
      colors,
      data,
      rotateWithView: true,
      snapToPixel: true,
      stroke: new Stroke({
        color: colors.length > 1 ? this.theme.strokeColor : 'rgba(0,0,0,0)',
        width: colors.length > 1 ? DEFAULT_STROKE_WEIGHT : 0
      }),
      overflow: true
    } as any); // types are wrong here and don't match the actual API

    return chart;
  }

  private getClusterChartData(
    features: Feature[],
    grouping: Grouping
  ): { data: number[]; colors: string[] } {
    const theme = this.theme;
    const groups: Record<number, number> = {};
    const ungrouped: number[] = [];
    const ungroupedColors: string[] = [];

    features.forEach(feat => {
      const props = feat.getProperties();
      const groupId = props.group;

      // Ungrouped features are considered as they have group on their own.
      if (groupId == null) {
        ungrouped.push(1);
        ungroupedColors.push(
          this.getStatusMarkerColor(theme, props.marker) ?? theme.defaultMarkerColor
        );
        return;
      }

      if (groups[groupId]) {
        groups[groupId] = groups[groupId] + 1;
      } else {
        groups[groupId] = 1;
      }
    });

    const data: number[] = [];
    this.transformChartData(data, Object.values(groups), features.length);
    this.transformChartData(data, ungrouped, features.length);

    // Corresponding colors of groups are based on matching index
    const colors = [
      ...Object.keys(groups).map(groupId => grouping.getColor(Number(groupId))),
      ...ungroupedColors
    ];

    return { data, colors };
  }

  /**
   * Calculates minimal safe distance for clustering to avoid overlapping of clusters
   */
  private calculateClusteringDistance(distance: number, clusterRadius: number): number {
    const safeDistance = clusterRadius * 2;
    return Math.max(safeDistance, distance);
  }

  private transformChartData(data: number[], series: number[], size: number): void {
    const fragmentSize = size / CLUSTER_CHARTS_FRAGMENTS;

    for (const value of series) {
      let fragment = value / fragmentSize;

      // Any fragment smaller than 1 must be represented at least as one fragment in the chart
      if (fragment > 0 && fragment < 1) {
        fragment = 1;
      }

      data.push(fragment);
    }
  }

  private getMarkerStyle(
    feature: Feature,
    grouping: Grouping,
    marker?: MarkerOptions
  ): Icon | Circle | undefined {
    if (!marker || marker.type === 'status') {
      return this.getStatusMarker(marker ?? { type: 'status', status: 'default' });
    }

    const color = this.getMarkerColor(feature, grouping, marker);

    if (marker.type === 'dot') {
      return this.getDotMarker(color);
    }

    if (marker.type === 'icon') {
      return this.getIconMarker(color, marker.icon);
    }

    return undefined;
  }

  /**
   * Decides what color should Marker be painted with.
   *
   * Markers are painted with group colors if group id is present. If marker color is specified,
   * it takes precedence over the group color.
   */
  private getMarkerColor(feature: Feature, grouping: Grouping, marker?: MarkerOptions): string {
    let color = this.theme.defaultMarkerColor;

    const groupId = feature.getProperties().group;
    if (groupId) {
      color = grouping.getColor(groupId);
    }

    if (marker?.color) {
      color = marker.color;
    }

    if (marker?.status) {
      color = this.theme.status[marker.status];
    }

    return color;
  }

  private getDotMarker(color: string): Circle {
    return new Circle({
      radius: 10,
      fill: new Fill({
        color
      }),
      stroke: new Stroke({
        color: this.theme.strokeColor,
        width: 6
      })
    });
  }

  private getIconMarker(color: string, iconConf?: IconMarkerOptions): Icon {
    const defaultIconStyle: IconOptions = {
      color,
      src: DEFAULT_ICON,
      scale: DEFAULT_ICON_SCALE
    };

    return new Icon({ ...defaultIconStyle, ...iconConf });
  }

  private getStatusMarkerColor(theme: ThemeType, marker?: MarkerOptions): string | undefined {
    if (!marker) {
      return theme.status.default;
    }
    if (marker.type === 'status') {
      return theme.status[marker.status!];
    }
    return marker.color;
  }

  private getStatusMarker(marker: MarkerOptions): Icon {
    marker.color = this.getStatusMarkerColor(this.theme, marker);

    const svg = getMarker(marker.status!, this.theme);
    const svgb64 = 'data:image/svg+xml;base64,' + btoa(svg);

    return new Icon({
      size: [64, 64],
      color: 'transparent', // Note: must be 'transparent' or '#fff' for OL to keep the colors
      width: 42,
      height: 42,
      displacement: [0, 16],
      src: svgb64
    });
  }
}
