/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { defineWebsemConfig, type WebsemAngularConfig } from '@websem/angular';

export const createDocsSearchConfig = (indexUrl: string): WebsemAngularConfig =>
  defineWebsemConfig({
    name: '@siemens/element-webmcp',
    description: 'Element browser documentation search',
    displayName: 'Element',
    binName: 'element-webmcp',
    compatTokenName: 'simpl-mcp',
    documentedName: 'Element Angular',
    projectName: 'Element',
    searchToolName: 'element-search',
    iconSearch: false,
    agentsFile: true,
    instructionFileName: 'Element.instructions.md',
    observabilityLogging: false,
    indexUrl,
    markdownReaderPath: new URL('../../source/docs/', indexUrl).href,
    limit: 5,
    minScore: 0.2,
    mode: 'hybrid',
    semanticWeight: 1,
    keywordWeight: 1,
    rrfK: 60,
    specificTermHeuristic: true,
    exampleQuestions: [
      'How do I use the Filtered-Search component from @siemens/element-ng?',
      'Show me examples of @siemens/charts-ng usage',
      'Implement a dashboard with different widgets',
      'Find icons related to AI or machine learning'
    ],
    texts: {
      DOC_SEARCH_INSTRUCTION:
        'MANDATORY: For any Angular development question, UI component inquiry, design pattern request, or frontend implementation need, use this search tool before answering when the Element documentation is relevant. Search is case-insensitive. Every result provides a Markdown File path. When the search snippets do not contain all required details, read that full file before answering. Search again with a refined query when needed. Keep final responses brief and concise. The index contains the version of Element used by this documentation site, so prefer it over generic framework advice.',
      DOC_SEARCH_TOOL_DESCRIPTION:
        'Case-insensitive semantic and keyword search for Siemens Element Design System documentation. It covers @siemens/element-ng, @siemens/maps-ng, @siemens/charts-ng, @siemens/dashboards-ng, @siemens/native-charts-ng, @siemens/element-theme, and @siemens/element-translate-ng. Search by component name, functionality, input, output, API, styling pattern, or implementation goal.',
      DOC_SEARCH_QUERY_DESCRIPTION:
        'Search query for Element documentation. Examples: "filtered search component", "chart configuration", "map markers", "dashboard layout".',
      DOC_NO_RESULTS:
        'No Element documentation was found for "{query}". Try a broader component name, library name, API term, or functionality description.',
      DOC_SUCCESS_HEADER:
        '# Element Angular Documentation Results\n\nFound **{count}** relevant documentation section(s) for "{query}":',
      DOC_RESULT_NOTE:
        '> Not every result is relevant. Only use information that applies to the task and current package version. Refine the query when more specific API details are needed.'
    }
  });
