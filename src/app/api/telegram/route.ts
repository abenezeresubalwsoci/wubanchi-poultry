import { NextRequest, NextResponse } from 'next/server';
import { telegramBotResponse } from '@/ai/flows/telegram-bot-flow';

/**
 * API Route handler for Telegram Bot Webhooks.
 * Receives messages from Telegram, processes them with Genkit, and replies.
 */
export async function POST(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not configured.');
    return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });
  }

  try {
    const body = await req.json();

    // Telegram sends updates; we are looking for a 'message' with 'text'
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = message.chat.id;
    const userText = message.text;

    // Process the message with Gemini via our Genkit flow
    const aiResponse = await telegramBotResponse(userText);

    // Send the response back to Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: aiResponse,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
