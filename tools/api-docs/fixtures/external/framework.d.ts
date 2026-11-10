import * as i0 from '@angular/core';
import * as streams from 'rxjs';
import * as dragging from '@angular/cdk/drag-drop';

/** An external declaration using compiler-generated namespace aliases. */
export declare class ExternalDeclaration {
  changed: i0.EventEmitter<string>;
  stream: streams.Observable<string>;
  move: dragging.CdkDragMove<string>;
}
