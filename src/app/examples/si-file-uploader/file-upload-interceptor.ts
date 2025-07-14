/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

/**
 * This interceptor simulates the upload with progress or failure for demo purposes
 */
@Injectable({ providedIn: 'root' })
export class FileUploadInterceptor implements HttpInterceptor {
  count = 1;
  uploadShallFail = false;
  thirdTrySuccess = true;
  noDelay = false;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.endsWith('api/file-upload') || req.method !== 'POST') {
      return next.handle(req);
    }

    this.count++;

    const body: FormData = req.body;
    let size = 0;
    body.forEach(value => {
      if (value instanceof File) {
        size += value.size;
      }
    });

    if (this.uploadShallFail) {
      return new Observable(observer => {
        observer.error(
          new HttpErrorResponse({
            status: 401,
            statusText: 'User is not authorized to upload files.'
          })
        );
        observer.complete();
      });
    } else if (this.evaluateThirdTrySuccess()) {
      return new Observable(observer => {
        const totalTime = 2000 + Math.floor(Math.random() * 4000);
        this.emitProgress(observer, totalTime, size);
        setTimeout(() => {
          observer.next(new HttpResponse<string>({ body: 'Upload succeeded.', status: 200 }));
          observer.complete();
        }, this.getDelay(totalTime));
      });
    } else {
      return new Observable(observer => {
        setTimeout(() => {
          observer.error(new HttpErrorResponse({ status: 418, statusText: "I'm a teapot" }));
          observer.complete();
        }, this.getDelay(1000));
      });
    }
  }

  private getDelay(delay: number): number {
    return this.noDelay ? 0 : delay;
  }

  private evaluateThirdTrySuccess(): boolean {
    return !this.thirdTrySuccess || this.count % 3 === 0;
  }

  private emitProgress(
    observer: Subscriber<HttpEvent<any>>,
    time: number,
    totalSize: number
  ): void {
    if (this.noDelay) {
      return;
    }
    const inc = Math.floor(totalSize / 10);
    const timeInc = Math.floor(time / 10);
    let size = inc;
    let timeout = timeInc;
    for (let i = 1; i < 10; i++) {
      const event: HttpProgressEvent = {
        type: HttpEventType.UploadProgress,
        loaded: size,
        total: totalSize
      };
      setTimeout(() => observer.next(event), timeout);
      timeout += timeInc;
      size += inc;
    }
  }
}
