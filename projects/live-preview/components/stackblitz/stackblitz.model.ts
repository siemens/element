/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
type FilePaths = string[];
type Files = Record<string, string>;

export interface Project {
  /** The frontend framework / template name. */
  name: string;
  /** The files to include in the Stackblitz project. */
  files: Files;
}

export interface AssetProject extends Omit<Project, 'files'> {
  /** Base URL to load the project files from the application assets folder. */
  assetUrl: string;
  /** Array of file paths retrieved from the application asset folder. */
  files: FilePaths;
}

export type ProjectTemplates = (AssetProject | Project)[];

export interface StackblitzConfig {
  /**
   * Project templates for Stackblitz
   * Optional set of files and dependencies for to build a Stackblitz project.
   * The key is the template name e.g. angular.
   */
  templates: ProjectTemplates;
}
