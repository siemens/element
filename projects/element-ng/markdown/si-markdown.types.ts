/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InputSignal, Type } from '@angular/core';
import { type Node, type Parent } from 'mdast';
import { type Transformer, type Plugin, type Preset, type PluggableList } from 'unified';

/** Interface an extension component must implement */
export interface SiMarkdownExtensionComponent {
  /** Node to be rendered */
  node: InputSignal<Node>;
  /** The parent node */
  parent: InputSignal<Parent>;
  /* Options passed to the component */
  options: InputSignal<any>;
}

/** Interface an highlighter component must implement */
export interface SiMarkdownHighlighterComponent {
  /** The code to be highlighter */
  code: InputSignal<string>;
  /** The language */
  language: InputSignal<string>;
  /** Function the highlighter can call to updated the displayed language */
  updateLanguage: InputSignal<(lang?: string) => void>;
  /* Options passed to the component */
  options: InputSignal<any>;
}

/** A combination of a component and options passed to it during run-time */
export interface ComponentWithOptions<T> {
  /** the component used to render the node */
  component: Type<T>;
  /** options passed to the component */
  options?: any;
}

/** AST node type handler */
export interface TypeHandler extends ComponentWithOptions<SiMarkdownExtensionComponent> {
  /** type of the AST node */
  type: string;
}

export type SiMarkdownHighlighter = ComponentWithOptions<SiMarkdownHighlighterComponent>;

export type UnifiedPlugin = Plugin<any> | Transformer<any> | Preset | PluggableList;

/** Combination of unified plugin with options */
export interface PluginWithOptions {
  plugin: UnifiedPlugin;
  options?: any;
}

/**
 * An extension to the si-markdown component
 */
export interface SiMarkdownExtension {
  /** `unified` plugins to install */
  plugins?: PluginWithOptions[];
  /** type handlers to install */
  types?: TypeHandler[];
  /** special code type handlers to install */
  codeTypes?: TypeHandler[];
}
