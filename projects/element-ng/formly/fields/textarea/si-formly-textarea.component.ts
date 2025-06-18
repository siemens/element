/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-textarea',
  styleUrl: './si-formly-textarea.component.scss',
  templateUrl: './si-formly-textarea.component.html',
  imports: [FormsModule, ReactiveFormsModule, FormlyModule]
})
export class SiFormlyTextareaComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit, AfterViewInit
{
  private readonly textArea = viewChild.required<ElementRef>('textArea');

  protected contentGrowTextarea(): string {
    return this.props.autoGrow ? `attr(data-replicated-value) ' '` : 'none';
  }

  protected resizeConfiguration(): string {
    return this.props.resizable ? 'vertical' : 'none';
  }

  protected maxHeightConfiguration(): string {
    return this.props.maxHeight ?? 'auto';
  }

  ngOnInit(): void {
    this.formControl.valueChanges.subscribe(() => {
      this.assignValueToParent();
    });
  }

  ngAfterViewInit(): void {
    this.assignValueToParent();
  }

  private assignValueToParent(): void {
    this.model.i = (this.model.i ?? 0) + 1;
    this.textArea().nativeElement.parentNode.dataset.replicatedValue =
      this.textArea().nativeElement.value;
  }
}
