/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SessionTransferData } from '@opencode/client';
import { type ProviderResponse, type SkillCallEntry } from 'promptfoo';

export type NormalizedResponse = Omit<ProviderResponse, 'metadata'> & {
  metadata: { skillCalls: SkillCallEntry[]; toolCalls: number };
};

export const normalizeTranscript = (transcript: SessionTransferData): NormalizedResponse => {
  const assistants = transcript.messages.filter(message => message.type === 'assistant');
  const tools = assistants.flatMap(message => message.content.filter(part => part.type === 'tool'));
  const skillCalls = tools.flatMap(tool => {
    if (tool.name !== 'skill' || tool.state.status === 'streaming') {
      return [];
    }
    return [
      {
        name: typeof tool.state.input.id === 'string' ? tool.state.input.id : '',
        input: tool.state.input,
        is_error: tool.state.status !== 'completed',
        source: 'tool' as const
      }
    ];
  });
  const { cost, tokens } = transcript.info;
  const prompt = tokens.input + tokens.cache.read + tokens.cache.write;
  return {
    output:
      assistants
        .at(-1)
        ?.content.filter(part => part.type === 'text')
        .map(part => part.text)
        .join('\n') ?? '',
    tokenUsage: {
      total: prompt + tokens.output,
      prompt,
      completion: tokens.output,
      cached: tokens.cache.read
    },
    cost: cost > 0 ? cost : undefined,
    metadata: { skillCalls, toolCalls: tools.length }
  };
};
