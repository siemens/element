/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SessionMessageAssistant, type SessionTransferData } from '@opencode/client';

export const transcriptFixture = (): SessionTransferData => ({
  info: {
    id: 'ses_test',
    projectID: 'project',
    location: { directory: '/fixture' },
    time: { created: 1, updated: 2 },
    outcome: 'succeeded',
    cost: 0.12,
    tokens: { input: 100, output: 20, reasoning: 5, cache: { read: 30, write: 10 } }
  },
  messages: [
    {
      id: 'message_tools',
      time: { created: 1 },
      type: 'assistant',
      agent: 'evaluation',
      model: { providerID: 'test', id: 'model' },
      content: [
        {
          type: 'tool',
          id: 'skill_call',
          name: 'skill',
          time: { created: 1 },
          state: {
            status: 'completed',
            input: { id: 'element' },
            content: [{ type: 'text', text: 'Skill body' }]
          }
        },
        {
          type: 'tool',
          id: 'fetch_call',
          name: 'webfetch',
          time: { created: 1 },
          state: {
            status: 'completed',
            input: { url: 'https://element.siemens.io/llms.txt' },
            content: [{ type: 'text', text: 'Docs' }]
          }
        }
      ]
    } satisfies SessionMessageAssistant,
    {
      id: 'message_final',
      time: { created: 2 },
      type: 'assistant',
      agent: 'evaluation',
      model: { providerID: 'test', id: 'model' },
      content: [{ type: 'text', text: 'Implemented' }],
      tokens: { input: 3, output: 2, reasoning: 0, cache: { read: 0, write: 0 } }
    }
  ]
});
