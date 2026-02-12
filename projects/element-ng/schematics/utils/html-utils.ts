/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  HtmlParser,
  ParseTreeResult,
  RecursiveVisitor,
  visitAll,
  type Element,
  type Attribute
} from '@angular/compiler';

export const findElement = (template: string, filter: (node: Element) => boolean): Element[] => {
  const { rootNodes, errors } = parseTemplate(template);
  // Only evaluate templates without parse errors.
  if (!errors.length) {
    const visitor = new ElementCollector(filter);
    visitAll(visitor, rootNodes);
    return visitor.matches;
  }

  return [];
};

export const findAttribute = (
  template: string,
  filter: (node: Attribute) => boolean
): Attribute[] => {
  const { rootNodes, errors } = parseTemplate(template);
  // Only evaluate templates without parse errors.
  if (!errors.length) {
    const visitor = new AttributeCollector(filter);
    visitAll(visitor, rootNodes);
    return visitor.matches;
  }

  return [];
};

const parseTemplate = (template: string): ParseTreeResult => {
  return new HtmlParser().parse(template, '', {
    // Allows for ICUs to be parsed.
    tokenizeExpansionForms: true,
    // Explicitly disable blocks so that their characters are treated as plain text.
    tokenizeBlocks: true,
    preserveLineEndings: true
  });
};

class ElementCollector extends RecursiveVisitor {
  private filter: (node: Element) => boolean;
  /**
   * All elements which match the filter
   *
   * @defaultValue []
   */
  public matches: Element[] = [];

  constructor(filter: (node: Element) => boolean) {
    super();
    this.filter = filter;
  }

  override visitElement(ast: Element, context: any): any {
    if (this.filter(ast)) {
      this.matches.push(ast);
    }
    super.visitElement(ast, context);
  }
}

class AttributeCollector extends RecursiveVisitor {
  private filter: (node: Attribute) => boolean;
  /**
   * All attributes which match the filter
   *
   * @defaultValue []
   */
  public matches: Attribute[] = [];

  constructor(filter: (node: Attribute) => boolean) {
    super();
    this.filter = filter;
  }

  override visitAttribute(ast: Attribute, context: any): any {
    if (this.filter(ast)) {
      this.matches.push(ast);
    }
    super.visitAttribute(ast, context);
  }
}
