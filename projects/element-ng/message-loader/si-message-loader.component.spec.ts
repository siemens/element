import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inputBinding, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiMessageLoaderComponent } from './si-message-loader.component';

describe('SiMessageLoaderComponent', () => {
  it('announces the default status when the loader appears', async () => {
    using announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue(undefined);
    const fixture = TestBed.createComponent(SiMessageLoaderComponent);
    await fixture.whenStable();

    expect(announce).toHaveBeenCalledExactlyOnceWith('Waiting for a response');
  });

  it('announces the initial custom status without repeating it on input changes', async () => {
    using announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue(undefined);
    const loadingText = signal('Generating summary');
    const fixture = TestBed.createComponent(SiMessageLoaderComponent, {
      bindings: [inputBinding('loadingText', loadingText)]
    });
    await fixture.whenStable();

    loadingText.set('Almost done');
    await fixture.whenStable();

    expect(announce).toHaveBeenCalledExactlyOnceWith('Generating summary');
  });
});
