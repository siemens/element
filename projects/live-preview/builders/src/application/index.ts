/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { createBuilder, type BuilderOutput } from '@angular-devkit/architect';
import { buildApplication, type ApplicationBuilderOptions } from '@angular/build';

import { loadPlugins } from '../load-plugins.js';

interface ApplicationOptions extends ApplicationBuilderOptions {
  plugins?: string[];
}

export default createBuilder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (options: ApplicationOptions, context: any): Promise<BuilderOutput> => {
    const plugins = options.plugins ? await loadPlugins(options.plugins, context) : [];

    const buildOptions = { ...options } as ApplicationBuilderOptions;
    delete (buildOptions as Record<string, unknown>).plugins;

    try {
      for await (const output of buildApplication(
        buildOptions,
        context as Parameters<typeof buildApplication>[1],
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
