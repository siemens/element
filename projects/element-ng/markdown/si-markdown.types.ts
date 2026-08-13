/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InputSignal, Type } from '@angular/core';
import { SourceReference } from '@siemens/element-ng/source-chip';
import {
  type Definition,
  type FootnoteDefinition,
  type Root,
  type RootContent,
  type Node,
  type Parent
} from 'mdast';
import { type Transformer, type Plugin, type Preset, type PluggableList } from 'unified';

/** Interface an extension component must implement */
export interface SiMarkdownExtensionComponent {
  /** Node to be rendered */
  node: InputSignal<Node>;
  /** The parent node */
  parent: InputSignal<Parent>;
  /** Options passed to the component */
  options: InputSignal<any>;
}

/** Interface a code highlighter component must implement */
export interface SiMarkdownHighlighterComponent {
  /** The code to be highlighted */
  code: InputSignal<string>;
  /** The language */
  language: InputSignal<string>;
  /** Function the highlighter can call to updated the displayed language */
  updateLanguage: InputSignal<(lang?: string) => void>;
  /** Options passed to the component */
  options: InputSignal<any>;
}

/** A combination of a component and options passed to it during run-time */
export interface ComponentWithOptions<T> {
  /** The component used to render the node */
  component: Type<T>;
  /** Options passed to the component */
  options?: any;
}

/** AST node type handler */
export interface TypeHandler extends ComponentWithOptions<SiMarkdownExtensionComponent> {
  /** type of the AST node */
  type: string;
}

export type SiMarkdownHighlighter = ComponentWithOptions<SiMarkdownHighlighterComponent>;

export type UnifiedPlugin = Plugin<any> | Transformer<any> | Preset | PluggableList;

export type UnifiedPluginOptions = ((meta: SiMarkdownMetadata) => any) | any;

/** Combination of unified plugin with options */
export interface PluginWithOptions {
  /** The plugin */
  plugin: UnifiedPlugin;
  /** Options passed during plugin registration */
  options?: UnifiedPluginOptions;
}

/** An extension to the si-markdown component */
export interface SiMarkdownExtension {
  /** `unified` plugins to install */
  plugins?: PluginWithOptions[];
  /** Type handlers to install */
  types?: TypeHandler[];
  /** Special code type handlers to install */
  codeTypes?: TypeHandler[];
}

/** Citation metadata associated with a markdown response. */
export interface SiMarkdownCitation extends SourceReference {
  /** Identifier referenced by bracket notation, such as `[source-1]`. */
  identifier?: string;
  /** Zero-based, end-exclusive source range of the citation reference in the markdown source. */
  position?: {
    startIndex: number;
    endIndex: number;
  };
}

/** Options passed to makeProcessor() */
export interface SiMarkdownMetadata {
  citations?: SiMarkdownCitation[];
}

/** Inline node that references an item in the source citation array. */
export interface Citation extends Node {
  type: 'citation';
  citationIndex: number;
  /** Text replaced by a position-based citation. */
  text?: string;
}

/** Container for one or more adjacent citation nodes. */
export interface Citations extends Node {
  type: 'citations';
  children: Citation[];
}

/** Extra node for collecting all footnotes */
export interface Footnotes extends Parent {
  type: 'footnotes';
  children: FootnoteDefinition[];
}

export type ExtendedRootContent = RootContent | Footnotes | Citations;

/** Extended root with references */
export type SiMarkdownRoot = Omit<Root, 'children'> & {
  children: ExtendedRootContent[];
  references?: {
    footnoteDefinitions?: Map<string, FootnoteDefinition>;
    definitions?: Map<string, Definition>;
  };
};
