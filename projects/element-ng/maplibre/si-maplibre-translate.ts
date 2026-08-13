/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectSiTranslateService, t } from '@siemens/element-translate-ng/translate';
import { map } from 'rxjs';

const createDefaultLocale = (): Record<string, string> => ({
  'AttributionControl.ToggleAttribution': t(
    () => $localize`:@@SI_MAP.TOGGLE_ATTRIBUTION:Toggle attribution`
  ),
  'AttributionControl.MapFeedback': t(() => $localize`:@@SI_MAP.MAP_FEEDBACK:Map feedback`),
  'FullscreenControl.Enter': t(() => $localize`:@@SI_MAP.FULLSCREEN_ENTER:Enter full screen`),
  'FullscreenControl.Exit': t(() => $localize`:@@SI_MAP.FULLSCREEN_EXIT:Exit full screen`),
  'GeolocateControl.FindMyLocation': t(
    () => $localize`:@@SI_MAP.FIND_MY_LOCATION:Find my location`
  ),
  'GeolocateControl.LocationNotAvailable': t(
    () => $localize`:@@SI_MAP.LOCATION_NOT_AVAILABLE:Location not available`
  ),
  'LogoControl.Title': t(() => $localize`:@@SI_MAP.LOGO_TITLE:MapLibre logo`),
  'Map.Title': t(() => $localize`:@@SI_MAP.MAP_TITLE:Map`),
  'Marker.Title': t(() => $localize`:@@SI_MAP.MARKER_TITLE:Map marker`),
  'NavigationControl.ResetBearing': t(
    () => $localize`:@@SI_MAP.RESET_BEARING:Reset bearing to north`
  ),
  'NavigationControl.ZoomIn': t(() => $localize`:@@SI_MAP.ZOOM_IN:Zoom in`),
  'NavigationControl.ZoomOut': t(() => $localize`:@@SI_MAP.ZOOM_OUT:Zoom out`),
  'Popup.Close': t(() => $localize`:@@SI_MAP.POPUP_CLOSE:Close popup`),
  'ScaleControl.Feet': t(() => $localize`:@@SI_MAP.SCALE_FEET:ft`),
  'ScaleControl.Meters': t(() => $localize`:@@SI_MAP.SCALE_METERS:m`),
  'ScaleControl.Kilometers': t(() => $localize`:@@SI_MAP.SCALE_KILOMETERS:km`),
  'ScaleControl.Miles': t(() => $localize`:@@SI_MAP.SCALE_MILES:mi`),
  'ScaleControl.NauticalMiles': t(() => $localize`:@@SI_MAP.SCALE_NAUTICAL_MILES:nm`),
  'GlobeControl.Enable': t(() => $localize`:@@SI_MAP.GLOBE_ENABLE:Enable globe`),
  'GlobeControl.Disable': t(() => $localize`:@@SI_MAP.GLOBE_DISABLE:Disable globe`),
  'TerrainControl.Enable': t(() => $localize`:@@SI_MAP.TERRAIN_ENABLE:Enable terrain`),
  'TerrainControl.Disable': t(() => $localize`:@@SI_MAP.TERRAIN_DISABLE:Disable terrain`),
  'CooperativeGesturesHandler.WindowsHelpText': t(
    () => $localize`:@@SI_MAP.WINDOWS_HELP:Use Ctrl + scroll to zoom the map`
  ),
  'CooperativeGesturesHandler.MacHelpText': t(
    () => $localize`:@@SI_MAP.MAC_HELP:Use ⌘ + scroll to zoom the map`
  ),
  'CooperativeGesturesHandler.MobileHelpText': t(
    () => $localize`:@@SI_MAP.MOBILE_HELP:Use two fingers to move the map`
  )
});

/**
 * Provides translated MapLibre locale strings as an Angular signal. The record uses MapLibre's
 * original locale keys, such as `AttributionControl.ToggleAttribution`, and updates when the
 * active Element language changes.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class MapComponent {
 *   protected readonly mapTranslations = injectSiMapTranslations();
 * }
 * ```
 *
 * ```html
 * <mgl-map [locale]="mapTranslations()" />
 * ```
 *
 * @returns A signal containing a MapLibre locale record, for example
 * `{ 'AttributionControl.ToggleAttribution': 'Toggle attribution' }`.
 */
export const injectSiMapTranslations = (): Signal<Record<string, string>> => {
  const translateService = injectSiTranslateService();
  const initialValue = createDefaultLocale();
  return toSignal(
    translateService
      .translateAsync(Object.values(initialValue))
      .pipe(
        map(translations =>
          Object.fromEntries(
            Object.entries(initialValue).map(([key, value]) => [key, translations[value]])
          )
        )
      ),
    {
      initialValue
    }
  );
};
