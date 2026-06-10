/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { buildApplication, ApplicationBuilderOptions } from '@angular/build';

import { loadPlugins } from '../load-plugins.js';

interface ApplicationOptions extends ApplicationBuilderOptions {
  plugins?: string[];
}

export default createBuilder(
  async (options: ApplicationOptions, context: BuilderContext): Promise<BuilderOutput> => {
    const plugins = options.plugins ? await loadPlugins(options.plugins, context) : [];

    const buildOptions = { ...options };
    delete buildOptions.plugins;

    try {
      for await (const output of buildApplication(
        buildOptions as ApplicationBuilderOptions,
        context,
        { codePlugins: plugins }
      )) {
        if (!output.success) {
          return output;
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(`Build failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
);
