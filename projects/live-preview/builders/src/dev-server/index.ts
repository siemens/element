/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { executeDevServerBuilder, type DevServerBuilderOptions } from '@angular/build';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { loadPlugins } from '../load-plugins.js';
import { patchBuilderContext } from './patch-context.js';

export default createBuilder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (options: DevServerBuilderOptions, context: any) => {
    const buildTarget = targetFromTargetString(options.buildTarget);

    return from(context.getTargetOptions(buildTarget)).pipe(
      switchMap(async buildOptions => {
        const pluginPaths = (buildOptions as Record<string, unknown>).plugins as
          | string[]
          | undefined;
        const plugins = pluginPaths ? await loadPlugins(pluginPaths, context) : [];

        patchBuilderContext(context, buildTarget);

        return plugins;
      }),
      switchMap(buildPlugins => {
        return executeDevServerBuilder(
          options,
          context as Parameters<typeof executeDevServerBuilder>[1],
          { buildPlugins }
        );
      })
    );
  }
);
