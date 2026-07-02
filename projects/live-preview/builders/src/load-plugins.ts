/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { BuilderContext } from '@angular-devkit/architect';
import type { Plugin } from 'esbuild';
import { resolve, isAbsolute } from 'path';
import { pathToFileURL } from 'url';

export const loadPlugins = async (
  pluginPaths: string[],
  context: BuilderContext
): Promise<Plugin[]> => {
  const workspaceRoot = context.workspaceRoot;
  const plugins: Plugin[] = [];

  for (const pluginPath of pluginPaths) {
    const fullPath = isAbsolute(pluginPath) ? pluginPath : resolve(workspaceRoot, pluginPath);

    try {
      const moduleUrl = pathToFileURL(fullPath).href;
      const module = await import(moduleUrl);

      let plugin: Plugin | Plugin[] | ((...args: unknown[]) => Plugin | Plugin[]);

      if (module.default) {
        plugin = module.default;
      } else if (typeof module === 'function') {
        plugin = module;
      } else {
        plugin = module;
      }

      if (typeof plugin === 'function') {
        const result = plugin();
        if (Array.isArray(result)) {
          plugins.push(...result);
        } else {
          plugins.push(result);
        }
      } else if (Array.isArray(plugin)) {
        plugins.push(...plugin);
      } else {
        plugins.push(plugin);
      }

      context.logger.info(`Loaded esbuild plugin from: ${pluginPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      context.logger.error(`Failed to load plugin from ${pluginPath}: ${errorMessage}`);
      throw new Error(`Failed to load plugin from ${pluginPath}`, { cause: error });
    }
  }

  return plugins;
};
