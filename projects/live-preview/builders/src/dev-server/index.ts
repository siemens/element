/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createBuilder, BuilderContext, targetFromTargetString } from '@angular-devkit/architect';
import { executeDevServerBuilder, DevServerBuilderOptions } from '@angular/build';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { loadPlugins } from '../load-plugins.js';
import { patchBuilderContext } from './patch-context.js';

export default createBuilder((options: DevServerBuilderOptions, context: BuilderContext) => {
  const buildTarget = targetFromTargetString(options.buildTarget);

  const result = from(context.getTargetOptions(buildTarget)).pipe(
    switchMap(async buildOptions => {
      const pluginPaths = (buildOptions as Record<string, unknown>).plugins as string[] | undefined;
      const plugins = pluginPaths ? await loadPlugins(pluginPaths, context) : [];

      patchBuilderContext(context, buildTarget);

      return plugins;
    }),
    switchMap(buildPlugins => {
      return executeDevServerBuilder(options, context, { buildPlugins });
    })
  );

  return result;
});
