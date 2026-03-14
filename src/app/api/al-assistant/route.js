// app/api/al-assistant/route.js
// Backend API route for the AL AI assistant.
// The OpenAI API key is stored ONLY here in the backend — never exposed to the client.

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set in .env.local — never commit this value
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, systemPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',        // Fast and affordable; swap to gpt-4o for richer responses
      max_tokens: 180,              // Keep AL responses short
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are AL, a supportive English language learning assistant. Keep all responses short (max 3–4 sentences), simple, and encouraging.',
        },
        ...messages,
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('[AL Assistant API Error]', error);

    // Friendly error fallback — do not expose internal details to the client
    return NextResponse.json(
      { error: 'AL is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
