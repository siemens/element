/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { BuilderContext, Target } from '@angular-devkit/architect';
import type { JsonObject } from '@angular-devkit/core';

const BUILDER_REPLACEMENTS: Record<string, string> = {
  '@siemens/angular-builder:application': '@angular/build:application'
};

export const patchBuilderContext = (context: BuilderContext, buildTarget: Target): void => {
  const originalGetBuilderNameForTarget = context.getBuilderNameForTarget.bind(context);

  context.getBuilderNameForTarget = async (target: Target): Promise<string> => {
    const builderName = await originalGetBuilderNameForTarget(target);
    return BUILDER_REPLACEMENTS[builderName] ?? builderName;
  };

  const originalGetTargetOptions = context.getTargetOptions.bind(context);

  context.getTargetOptions = async (target: Target): Promise<JsonObject> => {
    const options = await originalGetTargetOptions(target);

    if (target.project === buildTarget.project && target.target === buildTarget.target) {
      delete (options as Record<string, unknown>).plugins;
    }

    return options;
  };
};
