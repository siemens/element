/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { NoteWidgetEditorComponent } from './note-widget-editor.component';

describe('NoteWidgetEditorComponent', () => {
  let component: NoteWidgetEditorComponent;
  let fixture: ComponentFixture<NoteWidgetEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, NoteWidgetEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NoteWidgetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
