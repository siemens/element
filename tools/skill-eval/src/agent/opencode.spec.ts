/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { OpenCode } from '@opencode/client';
import { describe, expect, it, vi } from 'vitest';

import { transcriptFixture } from '../testing/transcript';
import { type OpenCodeOptions, createOpenCodeConfiguration, runSession } from './opencode';

const options: OpenCodeOptions = {
  directory: '/fixture',
  home: '/isolated-home',
  log: '/logs/opencode.log',
  provider: 'openai',
  model: 'model',
  dependencies: '/fixture/node_modules'
};

describe('OpenCode configuration', () => {
  it('adds a gateway and skill source only when they are configured', () => {
    expect(createOpenCodeConfiguration(options)).not.toHaveProperty('skills');
    expect(createOpenCodeConfiguration(options).providers.openai.settings).toEqual({
      apiKey: '{env:SKILL_EVAL_API_KEY}'
    });
    expect(
      createOpenCodeConfiguration({
        ...options,
        baseUrl: 'https://gateway.example/v1',
        skillDirectory: '/skills'
      })
    ).toMatchObject({
      skills: ['/skills'],
      providers: { openai: { settings: { baseURL: 'https://gateway.example/v1' } } }
    });
  });

  it('denies by default and keeps narrowing denials after the allowances', () => {
    const permissions = createOpenCodeConfiguration(options).agents.evaluation.permissions;
    const index = (action: string, resource: string): number =>
      permissions.findIndex(rule => rule.action === action && rule.resource === resource);

    expect(permissions[0]).toEqual({ action: '*', resource: '*', effect: 'deny' });
    expect(index('edit', '*.spec.ts')).toBeGreaterThan(index('edit', 'src/*'));
    expect(index('read', '.npmrc')).toBeGreaterThan(index('read', '*'));
  });
});

describe('OpenCode V2 contract', () => {
  it('creates a fresh session, sends a prompt, waits, then exports all messages', async () => {
    const transcript = transcriptFixture();
    const calls: { path: string; body?: unknown }[] = [];
    const transport = vi.fn<typeof fetch>(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      calls.push({
        path: pathname,
        body: request.method === 'POST' && request.body ? await request.json() : undefined
      });
      if (pathname.endsWith('/wait')) {
        return new Response(undefined, { status: 204 });
      }
      return Response.json({ data: pathname.endsWith('/export') ? transcript : transcript.info });
    });
    const client = OpenCode.make({ baseUrl: 'http://example.test', fetch: transport });

    const result = await runSession(client, 'Implement a page', {
      directory: '/fixture',
      provider: 'test',
      model: 'model',
      timeout: 1000
    });

    expect(result).toEqual({ transcript, error: undefined });
    expect(calls).toMatchObject([
      {
        path: '/api/session',
        body: {
          agent: 'evaluation',
          location: { directory: '/fixture' },
          model: { providerID: 'test', id: 'model' }
        }
      },
      { path: '/api/session/ses_test/prompt', body: { text: 'Implement a page' } },
      { path: '/api/experimental/session/ses_test/wait' },
      { path: '/api/experimental/session/ses_test/export' }
    ]);
    expect(calls[1].body).not.toHaveProperty('skills');
  });

  it('interrupts a failed wait and keeps the partial transcript', async () => {
    const paths: string[] = [];
    const client = OpenCode.make({
      baseUrl: 'http://example.test',
      fetch: vi.fn<typeof fetch>(async input => {
        const pathname = new URL(input instanceof Request ? input.url : String(input)).pathname;
        paths.push(pathname);
        if (pathname.endsWith('/wait')) {
          return Response.json({ message: 'Unavailable' }, { status: 503 });
        }
        return Response.json({
          data: pathname.endsWith('/export') ? transcriptFixture() : transcriptFixture().info
        });
      })
    });

    const result = await runSession(client, 'Task', {
      directory: '/fixture',
      provider: 'test',
      model: 'model',
      timeout: 1000
    });

    expect(result.error).toBeDefined();
    expect(paths).toContain('/api/session/ses_test/interrupt');
    expect(result.transcript.messages).toHaveLength(2);
  });
});
