/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestBed } from '@angular/core/testing';
import { SiNoTranslateService, SiTranslateService } from '@siemens/element-translate-ng/translate';

import { injectSiMapTranslations } from './si-maplibre-translate';

describe('MapLibre translations', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SiTranslateService, useClass: SiNoTranslateService }]
    });
  });

  it('returns translations for all MapLibre locale keys', () => {
    const mapTranslations = TestBed.runInInjectionContext(injectSiMapTranslations);
    const locales = [
      'AttributionControl.ToggleAttribution',
      'AttributionControl.MapFeedback',
      'FullscreenControl.Enter',
      'FullscreenControl.Exit',
      'GeolocateControl.FindMyLocation',
      'GeolocateControl.LocationNotAvailable',
      'LogoControl.Title',
      'Map.Title',
      'Marker.Title',
      'NavigationControl.ResetBearing',
      'NavigationControl.ZoomIn',
      'NavigationControl.ZoomOut',
      'Popup.Close',
      'ScaleControl.Feet',
      'ScaleControl.Meters',
      'ScaleControl.Kilometers',
      'ScaleControl.Miles',
      'ScaleControl.NauticalMiles',
      'GlobeControl.Enable',
      'GlobeControl.Disable',
      'TerrainControl.Enable',
      'TerrainControl.Disable',
      'CooperativeGesturesHandler.WindowsHelpText',
      'CooperativeGesturesHandler.MacHelpText',
      'CooperativeGesturesHandler.MobileHelpText'
    ];
    expect(Object.keys(mapTranslations())).toEqual(locales);
    expect(mapTranslations()).toMatchObject({
      'AttributionControl.ToggleAttribution': 'Toggle attribution'
    });
  });
});
