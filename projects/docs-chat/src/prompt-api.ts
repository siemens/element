/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface BrowserLanguageModel {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): AsyncIterable<string>;
  destroy?(): void;
}

interface BrowserLanguageModelApi {
  availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  create(options: {
    initialPrompts: { role: 'system' | 'user' | 'assistant'; content: string }[];
  }): Promise<BrowserLanguageModel>;
}

export const getLanguageModelApi = (): BrowserLanguageModelApi | undefined =>
  Reflect.get(globalThis, 'LanguageModel') as BrowserLanguageModelApi | undefined;

export const isLanguageModelAvailable = async (): Promise<boolean> => {
  const languageModel = getLanguageModelApi();
  return languageModel !== undefined && (await languageModel.availability()) === 'available';
};

export const createLanguageModel = async (
  systemPrompt: string
): Promise<BrowserLanguageModel | undefined> => {
  const languageModel = getLanguageModelApi();
  if (languageModel && (await languageModel.availability()) === 'available') {
    return languageModel.create({
      initialPrompts: [{ role: 'system', content: systemPrompt }]
    });
  }
};
