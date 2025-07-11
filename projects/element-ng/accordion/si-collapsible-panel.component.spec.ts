/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiCollapsiblePanelComponent } from './index';

@Component({
  imports: [SiTranslateModule, SiCollapsiblePanelComponent],
  template: `
    <si-collapsible-panel [heading]="heading">
      <div style="height: 100px;">This is the content</div>
    </si-collapsible-panel>
    <si-collapsible-panel>
      <span si-panel-heading
        ><mark>{{ heading }}</mark></span
      >
      <div style="height: 100px;">This is the content</div>
    </si-collapsible-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  heading!: string;
}

describe('SiCollapsiblePanel', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  const toggleCollapsePanel = (e?: HTMLElement): void =>
    (e ?? element).querySelector<HTMLElement>('.collapsible-header')?.click();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SiTranslateModule,
        NoopAnimationsModule,
        SiCollapsiblePanelComponent,
        TestHostComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render section header', () => {
    component.heading = 'This is the heading';
    fixture.detectChanges();

    const header = element.querySelector('.collapsible-header') as HTMLElement;
    expect(header).toBeTruthy();
    expect(header.innerHTML).toContain('This is the heading');
  });

  it('should collapse/expand on click', fakeAsync(() => {
    component.heading = 'This is the heading';
    fixture.detectChanges();

    const header = element.querySelector<HTMLElement>('.collapsible-header') as HTMLElement;
    expect(header.classList.contains('open')).toBeFalse();

    toggleCollapsePanel();
    flush();
    fixture.detectChanges();

    expect(header.classList.contains('open')).toBeTrue();

    const content = element.querySelector('.collapsible-content') as HTMLElement;
    expect(content.innerHTML).toContain('This is the content');
  }));

  it('should collapse/expand on #doToggle() API', fakeAsync(() => {
    component.heading = 'This is the heading';
    fixture.detectChanges();

    const header = element.querySelector('.collapsible-header') as HTMLElement;
    expect(header.classList.contains('open')).toBeFalse();

    toggleCollapsePanel();
    fixture.detectChanges();

    expect(header.classList.contains('open')).toBeTrue();

    const content = element.querySelector('.collapsible-content') as HTMLElement;
    expect(content.innerHTML).toContain('This is the content');

    toggleCollapsePanel();
    flush();
    fixture.detectChanges();

    expect(header.classList.contains('open')).toBeFalse();
  }));

  it('should show show custom header selected by si-panel-heading directive', () => {
    component.heading = 'This is the highlighted heading';
    fixture.detectChanges();
    const highlighted = fixture.debugElement.query(By.css('mark'));
    expect(highlighted.nativeElement.innerHTML).toContain('This is the highlighted heading');
  });
});
