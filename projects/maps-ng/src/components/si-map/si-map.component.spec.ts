/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Layer, Vector as VectorLayer } from 'ol/layer';
import RenderFeature from 'ol/render/Feature';
import { Cluster, Vector as VectorSource } from 'ol/source';
import { mockGeoJson } from 'src/app/mocks/geojson.mock';
import { mockPoints, singlePoint } from 'src/app/mocks/points.mock';

import { SiMapComponent, SiMapModule, SiMapPopoverComponent, SiMapTooltipComponent } from '.';
import { MapService } from './services/map.service';

const mockFeature = new Feature({
  geometry: new Point([4456989.943596791, 1369860.9690134972]),
  name: 'name',
  description: 'description'
});

describe('SiMapComponent', () => {
  let fixture: ComponentFixture<SiMapComponent>;
  let component: SiMapComponent;
  let componentRef: ComponentRef<SiMapComponent>;

  beforeAll(() => {
    // Define style variables from element.ts to prevent test failures
    document.documentElement.style.setProperty('--element-status-information', '#0070F2');
    document.documentElement.style.setProperty('--element-status-success', '#00A04B');
    document.documentElement.style.setProperty('--element-status-warning', '#FF7F00');
    document.documentElement.style.setProperty('--element-status-danger', '#D8371C');
    document.documentElement.style.setProperty('--element-status-caution', '#FFD322');
    document.documentElement.style.setProperty('--element-status-critical', '#B71E24');
    document.documentElement.style.setProperty('--element-ui-0', '#0070F2');
    document.documentElement.style.setProperty('--element-ui-3', '#004987');
    document.documentElement.style.setProperty('--element-base-1', '#FFFFFF');
    document.documentElement.style.setProperty('--element-text-primary', '#1F2937');
    document.documentElement.style.setProperty('--element-data-red-2', '#D8371C');
    document.documentElement.style.setProperty('--element-data-orange-4', '#FF7F00');
    document.documentElement.style.setProperty('--element-data-green-2', '#00A04B');
    document.documentElement.style.setProperty('--element-petrol', '#007C7C');
    document.documentElement.style.setProperty('--element-data-17', '#004A87');
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [SiMapModule, TranslateModule.forRoot()],
      providers: [MapService]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SiMapComponent);
    component = fixture.componentInstance;

    // gives the map a dimension, otherwise ol spams the log with warnings
    const host: HTMLElement = fixture.nativeElement;
    host.style.blockSize = '200px';
    host.style.inlineSize = '200px';

    componentRef = fixture.componentRef;
    componentRef.setInput('points', mockPoints);
    componentRef.setInput('geoJson', mockGeoJson);
    componentRef.setInput('cluster', true);
    componentRef.setInput('groupColors', { 1: 'red', 2: 'blue', 3: 'green' });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should define popup html and right overlay position when clustering is enabled', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    componentRef.setInput('cluster', true);
    component.isClicked = false;
    spyOn(component, 'showTooltipContent').and.callThrough();

    fixture.detectChanges();
    component.showTooltipContent(mockFeature);
    expect(component.showTooltipContent).toHaveBeenCalled();
    const tooltip = fixture.debugElement.query(By.directive(SiMapTooltipComponent));
    expect(tooltip.nativeElement.innerHTML).toContain('name');
    expect(component.tooltipOverlay.getPosition()).toEqual([4456989.943596791, 1369860.9690134972]);
  });

  it('should return correct features', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    componentRef.setInput('cluster', false);
    component.isClicked = false;

    fixture.detectChanges();
    const feats = component.featureCallback(mockFeature);
    expect(feats).toBeDefined();
  });

  it('should zoom to features', () => {
    componentRef.setInput('cluster', true);

    const feats = [
      new Feature(new Point([1373214.9745276642, 5690661.889241241])),
      new Feature(new Point([1484534.4653209378, 5533397.832975035]))
    ];

    component.zoomToFeatures(feats, 7);
    expect(component.map?.getView().getMinZoom()).toBeDefined();
  });

  it('should open cluster with elements and zoom in when clicking to cluster', () => {
    componentRef.setInput('cluster', true);
    componentRef.setInput('markerAnimation', true);
    spyOn(window, 'alert');
    const popover = fixture.debugElement.query(
      By.directive(SiMapPopoverComponent)
    ).componentInstance;
    spyOn(popover, 'render');
    fixture.detectChanges();
    const feature = new Feature(new Point([1373214.9745276642, 5690661.889241241]));
    feature.setProperties({
      name: 'name',
      description: 'description',
      click: (params: any) => {
        alert(params.buildingType);
      },
      extraProps: { buildingType: 'office' }
    });
    component.featureClick(feature);
    expect(component.popoverOverlay.getPosition()).toEqual([1373214.9745276642, 5690661.889241241]);
    expect(popover.render).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('office');
  });

  it('should add new cluster layer with features', () => {
    componentRef.setInput('cluster', true);
    component.init();
    fixture.detectChanges();
    component.refresh(mockPoints);
    let isAnimatedCluster = false;
    component.map?.getLayers().forEach(layer => {
      if (layer instanceof Layer && layer.getSource() instanceof Cluster) {
        isAnimatedCluster = true;
      }
    });
    expect(isAnimatedCluster).toBeTruthy();
  });

  it('should add new vector layer with features', () => {
    componentRef.setInput('cluster', false);
    component.init();
    component.refresh(mockPoints);
    let isVector = false;
    component.map?.getLayers().forEach(layer => {
      if (layer instanceof VectorLayer) {
        if (layer.getSource() instanceof VectorSource) {
          isVector = true;
        }
      }
    });
    expect(isVector).toBeTruthy();
  });

  it('#refresh() with empty array should remove all points', () => {
    componentRef.setInput('cluster', false);
    component.init();
    component.refresh([]);
    component.map?.getLayers().forEach(layer => {
      if (layer instanceof VectorLayer) {
        if (layer.getSource() instanceof VectorSource) {
          expect(layer.getSource().getFeatures().length).toBe(0);
        }
      }
    });
  });

  it('should no display tooltip if feature is Clicked', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    spyOn(component, 'featureClick').and.callThrough();
    fixture.detectChanges();
    component.select(singlePoint);
    expect(component.featureClick).toHaveBeenCalled();
    expect(component.tooltipOverlay.getPosition()).toBeUndefined();
    expect(component.popoverOverlay.getPosition()).toEqual([2041131.9192873053, 5850738.242670742]);
  });

  it('should display popover component on hover when hovered', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    spyOn(component, 'onFeatureHover').and.callThrough();
    const event: any = {
      pixel: [320, 420]
    };
    fixture.detectChanges();
    component.onFeatureHover(event);
    expect(component.onFeatureHover).toHaveBeenCalled();
  });

  it('should emit clicked MapPoint', () => {
    spyOn(component.pointsSelected, 'emit').and.callThrough();
    fixture.detectChanges();
    component.select(singlePoint);
    expect(component.pointsSelected.emit).toHaveBeenCalledWith([singlePoint]);
  });

  it('should display tooltip only on features of type Feature', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    component.isClicked = false;
    componentRef.setInput('cluster', true);
    spyOn(component, 'showTooltipContent').and.callThrough();
    const tooltip = fixture.debugElement.query(
      By.directive(SiMapTooltipComponent)
    ).componentInstance;
    spyOn<any>(tooltip, 'setTooltip');
    const feat = new Feature({
      geometry: new Point([4456989.943596791, 1369860.9690134972])
    });
    const feats = [feat];
    fixture.detectChanges();
    component.displayTooltip(feats);

    expect(component.showTooltipContent).toHaveBeenCalled();
    expect(component.tooltipOverlay.getPosition()).toEqual([4456989.943596791, 1369860.9690134972]);
  });

  it('do not display tooltip if feature is type of RenderFeature', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    component.isClicked = false;
    componentRef.setInput('cluster', true);
    spyOn(component, 'showTooltipContent').and.callThrough();
    fixture.detectChanges();
    const feat = new RenderFeature('Point', [0, 0], [0], 0, {}, 1);
    const feats = [feat];
    component.displayTooltip(feats);
    expect(component.tooltipOverlay.getPosition()).toBeUndefined();
  });

  it('if clicking outside the clusters and features should close the popup', () => {
    componentRef.setInput('displayTooltipOnHover', true);
    component.isClicked = false;
    componentRef.setInput('cluster', true);
    spyOn(component, 'closePopup').and.callThrough();
    spyOn(component.pointsSelected, 'emit').and.callThrough();
    const event: any = {
      pixel: [410, 255]
    };
    fixture.detectChanges();
    component.onClusterClick(event);
    expect(component.closePopup).toHaveBeenCalled();
    expect(component.pointsSelected.emit).toHaveBeenCalledWith([]);
    expect(component.popoverOverlay.getPosition()).toBeUndefined();
  });

  it('zoomCluster should zoom to clusters', () => {
    const feat = new Feature({
      geometry: new Point([4456989.943596791, 1369860.9690134972])
    });
    const feats = [feat];
    fixture.detectChanges();
    component.zoomCluster(feats);
    expect(component.map?.getView().calculateExtent(component.map.getSize())).toBeDefined();
  });

  it('update map style to light map on theme change', () => {
    componentRef.setInput('maptilerKey', 'asdfghjkl');
    spyOn(component, 'setMapStyle');
    component.onThemeSwitch(false);
    expect(component.setMapStyle).toHaveBeenCalledWith(false, 'asdfghjkl');
  });

  it('update map style to dark map on theme change', () => {
    componentRef.setInput('maptilerKey', 'qwertyuiop');
    spyOn(component, 'setMapStyle');
    component.onThemeSwitch(true);
    expect(component.setMapStyle).toHaveBeenCalledWith(true, 'qwertyuiop');
  });

  it('set tooltip offset and position', () => {
    const feat = [
      new Feature({
        geometry: new Point([4456989.943596791, 1369860.9690134972])
      })
    ];
    spyOn(component.tooltipOverlay, 'setOffset');
    spyOn(component.tooltipOverlay, 'setPosition');
    component.showClusterTooltipContent(feat);
    expect(component.tooltipOverlay.setOffset).toHaveBeenCalledWith([0, 20]);
    expect(component.tooltipOverlay.setPosition).toHaveBeenCalled();
  });
});
