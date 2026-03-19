/**
 * app/api/al-assistant/route.js
 *
 * BUG 3 FIX:
 * The original route imported the OpenAI SDK and called OpenAI's API.
 * The practice-hub page calls THIS proxy route — but this route was calling
 * the wrong provider, so every AL message returned an error.
 *
 * Additionally the practice-hub page was calling Anthropic directly from the
 * browser (https://api.anthropic.com/v1/messages) with no API key — that
 * also fails with 401. Both sides needed fixing.
 *
 * This route now:
 *   1. Accepts POST { messages: [{role, content}] }
 *   2. Calls Anthropic API server-side using process.env.ANTHROPIC_API_KEY
 *   3. Returns { reply: "text" }
 *
 * The API key is NEVER sent to the browser.
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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[AL Assistant] ANTHROPIC_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AL is temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    // Only user/assistant turns — Anthropic does not accept system role in messages[]
    const validMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role:    m.role,
        // support both {text} shape (from practice-hub) and {content} shape
        content: typeof m.content === 'string' ? m.content : (m.text || ''),
      }))
      .filter(m => m.content.trim().length > 0);

    if (validMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system:     SYSTEM_PROMPT,
        messages:   validMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AL Assistant] Anthropic error:', response.status, errText);
      return NextResponse.json(
        { error: 'AL is temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const data  = await response.json();
    const reply = data.content?.[0]?.text?.trim()
      || "I'm not sure how to help with that — try asking in a different way! 😊";

    return NextResponse.json({ reply });

  } catch (err) {
    console.error('[AL Assistant] Unexpected error:', err);
    return NextResponse.json(
      { error: 'AL is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
