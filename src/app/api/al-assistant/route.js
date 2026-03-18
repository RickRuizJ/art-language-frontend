/**
 * app/api/al-assistant/route.js
 *
 * Server-side proxy for the AL learning assistant.
 *
 * BUGS FIXED:
 * 1. The original route used the OpenAI SDK (`openai.chat.completions.create`)
 *    but the project has NO openai dependency in package.json. The SDK import
 *    would fail at startup with "Cannot find module 'openai'".
 *
 * 2. The practice-hub page was calling Anthropic's API directly from the browser
 *    (no key → 401). It now calls this proxy route which securely holds the key
 *    server-side.
 *
 * FIX: Rewrite to use the Anthropic Messages API via fetch (no SDK needed).
 *      Requires ANTHROPIC_API_KEY in Vercel environment variables.
 *      Response shape is preserved: { reply: string }
 *
 * Required Vercel env var:
 *   ANTHROPIC_API_KEY = sk-ant-...
 */

import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT =
  'You are AL, a friendly and encouraging English language learning assistant ' +
  'for students at Art & Language Campus. Help students with grammar, vocabulary, ' +
  'spelling, reading, and writing. Keep responses concise (3–4 sentences max), ' +
  'clear, and encouraging. Use simple language appropriate for language learners. ' +
  'Add relevant emojis occasionally to keep it fun.';

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[AL Assistant] ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'AL is temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    // Filter to only user/assistant turns (no system role in messages array)
    const validMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => typeof m.content === 'string' && m.content.trim().length > 0);

    if (validMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001', // Fast, affordable, great for tutoring
        max_tokens: 300,
        system:     SYSTEM_PROMPT,
        messages:   validMessages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[AL Assistant] Anthropic API error:', response.status, errorBody);
      return NextResponse.json(
        { error: 'AL is temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const data  = await response.json();
    const reply = data.content?.[0]?.text?.trim() || "I'm not sure how to help with that. Try asking in a different way!";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('[AL Assistant API Error]', error);
    return NextResponse.json(
      { error: 'AL is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
