/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const relayHost = '127.0.0.1';
const relayPort = 8765;
const apiUrl = 'https://api.siemens.com/llm/v1/chat/completions';
const model = 'gpt-oss-120b';
const localOriginPattern = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/;

const sendJson = (response, status, body, origin) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }
  response.end(JSON.stringify(body));
};

const readJson = async request => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 200_000) {
      throw new Error('Relay request is too large.');
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const writeStreamDelta = (response, field, content) => {
  response.write(
    `data: ${JSON.stringify({ choices: [{ delta: { [field]: content } }] })}\n\n`
  );
};

const streamResponse = async (apiResponse, response) => {
  const decoder = new TextDecoder();
  let buffer = '';
  let inlineContent = '';
  let isReasoning = false;

  const emitReasoning = content => writeStreamDelta(response, 'reasoning_content', content);

  const flushInlineContent = () => {
    const markers = isReasoning ? ['</think>', '</thinking>'] : ['<think>', '<thinking>'];
    const marker = markers.find(candidate => inlineContent.includes(candidate));
    const index = marker ? inlineContent.indexOf(marker) : -1;
    if (index >= 0) {
      const content = inlineContent.slice(0, index);
      if (content) {
        writeStreamDelta(response, isReasoning ? 'reasoning_content' : 'content', content);
      }
      inlineContent = inlineContent.slice(index + marker.length);
      isReasoning = !isReasoning;
      flushInlineContent();
      return;
    }

    const suffixLength = Math.max(...markers.map(marker => marker.length - 1));
    if (inlineContent.length > suffixLength) {
      const content = inlineContent.slice(0, -suffixLength);
      writeStreamDelta(response, isReasoning ? 'reasoning_content' : 'content', content);
      inlineContent = inlineContent.slice(-suffixLength);
    }
  };

  const processEvent = event => {
    const data = event
      .split('\n')
      .filter(line => line.startsWith('data: '))
      .map(line => line.slice(6))
      .join('\n');
    if (!data) {
      return;
    }
    if (data === '[DONE]') {
      if (inlineContent) {
        writeStreamDelta(response, isReasoning ? 'reasoning_content' : 'content', inlineContent);
      }
      response.write('data: [DONE]\n\n');
      return;
    }

    const eventData = JSON.parse(data);
    const delta = eventData.choices?.[0]?.delta;
    const reasoning =
      delta?.reasoning_content ?? delta?.reasoning ?? delta?.analysis ?? delta?.thinking;
    if (typeof reasoning === 'string') {
      emitReasoning(reasoning);
    }
    if (typeof delta?.content !== 'string') {
      if (typeof reasoning !== 'string') {
        response.write(`data: ${data}\n\n`);
      }
      return;
    }
    inlineContent += delta.content;
    flushInlineContent();
  };

  for await (const chunk of apiResponse.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    events.forEach(processEvent);
  }
  if (buffer) {
    processEvent(buffer);
  }
};

const handleRequest = async (request, response, apiKey) => {
  const origin = request.headers.origin;
  if (!origin || !localOriginPattern.test(origin)) {
    sendJson(response, 403, { error: 'Local docs origin required.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Vary', 'Origin');
    response.end();
    return;
  }
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { available: true }, origin);
    return;
  }
  if (request.method !== 'POST' || request.url !== '/prompt') {
    sendJson(response, 404, { error: 'Not found.' }, origin);
    return;
  }

  const body = await readJson(request);
  if (
    typeof body.systemPrompt !== 'string' ||
    typeof body.input !== 'string' ||
    (body.stream !== undefined && typeof body.stream !== 'boolean')
  ) {
    sendJson(response, 400, { error: 'Invalid prompt.' }, origin);
    return;
  }

  const apiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: body.systemPrompt },
        { role: 'user', content: body.input }
      ],
      max_tokens: 2_000,
      temperature: 0.2,
      stream: body.stream === true
    })
  });
  if (!apiResponse.ok) {
    sendJson(response, 502, { error: 'Siemens LLM request failed.' }, origin);
    return;
  }

  if (body.stream) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    await streamResponse(apiResponse, response);
    response.end();
    return;
  }

  const result = await apiResponse.json();
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    sendJson(response, 502, { error: 'Siemens LLM returned no answer.' }, origin);
    return;
  }
  sendJson(response, 200, { content }, origin);
};

const startRelay = apiKey =>
  new Promise(resolve => {
    const server = createServer((request, response) => {
      void handleRequest(request, response, apiKey).catch(error => {
        console.error(`Docs chat relay request failed: ${error.message}`);
        if (!response.headersSent) {
          sendJson(response, 502, { error: 'Docs chat relay request failed.' });
        } else {
          response.end();
        }
      });
    });
    server.once('error', error => {
      console.warn(`Docs chat relay unavailable: ${error.message}`);
      resolve(undefined);
    });
    server.listen(relayPort, relayHost, () => {
      console.log(`Docs chat relay listening on http://${relayHost}:${relayPort}`);
      resolve(server);
    });
  });

const [command, ...args] = process.argv.slice(2);
if (!command) {
  throw new Error('A docs server command is required.');
}

const apiKey = process.env.OPENAI_API_KEY;
const relay = apiKey ? await startRelay(apiKey) : undefined;
const docsServer = spawn(command, args, { env: process.env, stdio: 'inherit' });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => docsServer.kill(signal));
}

docsServer.on('error', error => {
  relay?.close();
  throw error;
});
docsServer.on('exit', code => {
  relay?.close();
  process.exitCode = code ?? 0;
});
