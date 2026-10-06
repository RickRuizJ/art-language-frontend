import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;
const buckets = globalThis.__alRateBuckets || new Map();
globalThis.__alRateBuckets = buckets;

const SYSTEM_PROMPT =
  'You are AL, a friendly and encouraging English language learning assistant ' +
  'for students at Art & Language Campus. Help students with grammar, vocabulary, ' +
  'spelling, reading, and writing. Keep responses concise (3–4 sentences max), ' +
  'clear, and encouraging. Use simple language appropriate for language learners.';

async function verifySession(request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return null;
  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: auth },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.user || null;
  } catch {
    return null;
  }
}

function allowedByRateLimit(userId) {
  const now = Date.now();
  const bucket = buckets.get(userId) || { start: now, count: 0 };
  if (now - bucket.start > WINDOW_MS) { bucket.start = now; bucket.count = 0; }
  bucket.count += 1;
  buckets.set(userId, bucket);
  return bucket.count <= MAX_REQUESTS;
}

export async function POST(request) {
  try {
    const user = await verifySession(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowedByRateLimit(user.id)) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });

    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    if (!messages.length) return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AL is temporarily unavailable.' }, { status: 503 });

    const validMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: String(typeof m.content === 'string' ? m.content : (m.text || '')).slice(0, 2000) }))
      .filter(m => m.content.trim());
    if (!validMessages.length) return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 });

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, system: SYSTEM_PROMPT, messages: validMessages }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return NextResponse.json({ error: 'AL is temporarily unavailable.' }, { status: 502 });
    const data = await response.json();
    const reply = data.content?.[0]?.text?.trim() || "I'm not sure how to help with that. Try asking another way.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[AL Assistant]', err);
    return NextResponse.json({ error: 'AL is temporarily unavailable.' }, { status: 500 });
  }
}
