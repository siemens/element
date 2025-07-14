/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Link, LinkAction } from './link.model';

@Injectable()
export class SiLinkActionService {
  private actionSubject = new Subject<LinkAction>();

  /**
   * Observable which emits the link and param to run the action on.
   *
   * @defaultValue this.actionSubject.asObservable()
   */
  readonly action$ = this.actionSubject.asObservable();

  /**
   * Emit a new link and param pair to run the action on.
   */
  emit(link: Link, param: any): void {
    this.actionSubject.next({ link, param });
  }
}
