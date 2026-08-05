/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
export interface DocsLanguageModel {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): AsyncIterable<DocsLanguageModelChunk>;
  destroy?(): void;
}

export interface DocsLanguageModelChunk {
  type: 'content' | 'reasoning';
  content: string;
}

interface BrowserLanguageModel {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): AsyncIterable<string>;
  destroy(): void;
}

interface BrowserLanguageModelApi {
  availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  create(options: {
    initialPrompts: { role: 'system' | 'user' | 'assistant'; content: string }[];
  }): Promise<BrowserLanguageModel>;
}

const streamResponse = async function* (
  response: Response
): AsyncGenerator<DocsLanguageModelChunk> {
  if (!response.body) {
    throw new Error('Language model relay returned no response body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let bufferedContent = '';
  let bufferedReasoning = '';
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) {
        continue;
      }
      const data = line.slice(6);
      if (data === '[DONE]') {
        return;
      }
      const delta = (
        JSON.parse(data) as {
          choices?: { delta?: { content?: unknown; reasoning?: unknown } }[];
        }
      ).choices?.[0]?.delta;
      const reasoning =
        delta?.reasoning ?? (Reflect.get(delta ?? {}, 'reasoning_content') as unknown);
      if (typeof reasoning === 'string') {
        yield { type: 'reasoning', content: (bufferedReasoning += reasoning) };
      }
      const content = delta?.content;
      if (typeof content === 'string') {
        yield { type: 'content', content: (bufferedContent += content) };
      }
    }
    if (done) {
      break;
    }
  }
};

export const getLanguageModelApi = (): BrowserLanguageModelApi | undefined =>
  Reflect.get(globalThis, 'LanguageModel') as BrowserLanguageModelApi | undefined;

const relayUrl = 'http://127.0.0.1:8765';

const isBrowserLanguageModelAvailable = async (): Promise<boolean> => {
  const languageModel = getLanguageModelApi();
  return languageModel !== undefined && (await languageModel.availability()) === 'available';
};

const isRelayAvailable = (): Promise<boolean> => {
  if (!['127.0.0.1', 'localhost'].includes(globalThis.location.hostname)) {
    return Promise.resolve(false);
  }

  return fetch(`${relayUrl}/health`).then(
    response => response.ok,
    () => false
  );
};

export const isLanguageModelAvailable = async (): Promise<boolean> => {
  return (await isBrowserLanguageModelAvailable()) || (await isRelayAvailable());
};

export const createLanguageModel = async (systemPrompt: string): Promise<DocsLanguageModel> => {
  const languageModel = getLanguageModelApi();
  if (languageModel && (await languageModel.availability()) === 'available') {
    const model = await languageModel.create({
      initialPrompts: [{ role: 'system', content: systemPrompt }]
    });
    return {
      prompt: input => model.prompt(input),
      promptStreaming: async function* (input: string): AsyncGenerator<DocsLanguageModelChunk> {
        for await (const content of model.promptStreaming(input)) {
          yield { type: 'content', content };
        }
      },
      destroy: () => model.destroy()
    };
  }
  if (!(await isRelayAvailable())) {
    throw new Error('No language model is available.');
  }

  return {
    prompt: async input => {
      const response = await fetch(`${relayUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, input })
      });
      if (!response.ok) {
        throw new Error(`Language model relay failed with status ${response.status}.`);
      }
      const result = (await response.json()) as { content: string };
      return result.content;
    },
    promptStreaming: async function* (input: string): AsyncGenerator<DocsLanguageModelChunk> {
      const response = await fetch(`${relayUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, input, stream: true })
      });
      if (!response.ok) {
        throw new Error(`Language model relay failed with status ${response.status}.`);
      }
      yield* streamResponse(response);
    }
  };
};
