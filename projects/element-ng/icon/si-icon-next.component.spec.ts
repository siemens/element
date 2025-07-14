/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiThemeService } from '@siemens/element-ng/theme';

import { provideIconConfig, SiIconNextComponent } from './si-icon-next.component';
import { addIcons, IconService } from './si-icons';

// It seems like the debug element is not able to query the SVGs.
// So we have to use document directly.
// I don't know why.

describe('SiSvgIconComponent', () => {
  describe('with one instance', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    @Component({
      imports: [SiIconNextComponent],
      template: ` <si-icon-next [icon]="icon()" />`
    })
    class TestHostComponent {
      readonly icon = signal<string>('element-user');
      readonly icons = addIcons({
        elementSvg:
          'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' id="svg"></svg>',
        element2Svg:
          'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' id="svg-2"></svg>'
      });
    }

    describe('with enabled svg icons', () => {
      beforeEach(async () => {
        TestBed.configureTestingModule({
          providers: [provideIconConfig({ disableSvgIcons: false })]
        });
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should fallback to icon-font', () => {
        expect(fixture.debugElement.query(By.css('.element-user'))).toBeTruthy();
      });

      describe('with icon from registry', () => {
        beforeEach(() => {
          component.icon.set('element-2-svg');
          fixture.detectChanges();
        });

        it('should load icon', () => {
          expect(document.getElementById('svg-2')).toBeTruthy();
        });

        it('should load icon override from theme', () => {
          const themeService = TestBed.inject(SiThemeService);
          themeService.applyTheme({
            name: 'oem',
            schemes: {},
            icons: {
              element2Svg:
                'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' id="svg-oem"></svg>'
            }
          });
          fixture.detectChanges();
          expect(document.getElementById('svg-oem')).toBeTruthy();
        });
      });

      describe('with icon from import', () => {
        beforeEach(() => {
          component.icon.set(component.icons.elementSvg);
          fixture.detectChanges();
        });

        it('should load icon', () => {
          expect(document.getElementById('svg')).toBeTruthy();
        });

        it('should load icon override from theme', () => {
          const themeService = TestBed.inject(SiThemeService);
          themeService.applyTheme({
            name: 'oem',
            schemes: {},
            icons: {
              elementSvg:
                'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' id="svg-oem"></svg>'
            }
          });
          fixture.detectChanges();
          expect(document.getElementById('svg-oem')).toBeTruthy();
        });
      });
    });

    describe('with disabled svg icons', () => {
      beforeEach(async () => {
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should always use the icon-font', () => {
        component.icon.set('element-svg');
        fixture.detectChanges();
        expect(document.getElementById('svg')).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.element-svg'))).toBeTruthy();
      });
    });
  });

  describe('with multiple instances', () => {
    @Component({
      selector: 'si-icon-1-test',
      imports: [SiIconNextComponent],
      template: `<si-icon-next [icon]="icons.elementSvg" />`
    })
    class IconTest1Component {
      readonly icons = addIcons({
        elementSvg:
          'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' id="svg"></svg>'
      });
    }
    @Component({
      selector: 'si-icon-2-test',
      imports: [SiIconNextComponent],
      template: `<si-icon-next [icon]="icons.elementSvg" />`
    })
    class IconTest2Component {
      icons = addIcons({
        elementSvg:
          'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' id="svg-different"></svg>'
      });
    }

    @Component({
      imports: [IconTest1Component, IconTest2Component],
      template: `@if (show1()) {
          <si-icon-1-test />
        }
        @if (show2()) {
          <si-icon-2-test />
        }`
    })
    class TestHostComponent {
      readonly show1 = signal(false);
      readonly show2 = signal(false);
    }

    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let iconService: IconService;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      iconService = TestBed.inject(IconService);
    });

    it('should not override an existing icon', () => {
      component.show2.set(true);
      fixture.detectChanges();
      component.show1.set(true);
      fixture.detectChanges();
      expect(iconService.getIcon('elementSvg') + '').toContain('svg-different');
    });

    it('should delete unused icons', () => {
      component.show1.set(true);
      component.show2.set(true);
      fixture.detectChanges();
      component.show1.set(false);
      fixture.detectChanges();
      expect(iconService.getIcon('elementSvg')).toBeTruthy();
      component.show2.set(false);
      fixture.detectChanges();
      expect(iconService.getIcon('elementSvg')).toBeFalsy();
    });
  });
});
