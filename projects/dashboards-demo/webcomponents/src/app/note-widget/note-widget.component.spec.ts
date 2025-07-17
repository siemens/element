/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteWidgetComponent } from './note-widget.component';

describe('NoteWidgetComponent', () => {
  let component: NoteWidgetComponent;
  let fixture: ComponentFixture<NoteWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteWidgetComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NoteWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
