import { NextResponse } from 'next/server';
import { processChatbotMessage } from '@/lib/chatbot/chatbotEngine';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate Limiter: 20 messages per minute per IP to prevent spamming / bot abuse
    const rateLimit = checkRateLimit(`chatbot:${ip}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          reply: 'Masyadong mabilis ang inyong pagpapadala ng mensahe. Pakihintay po ng ilang segundo bago magtanong muli.',
          category: 'general',
        },
        { status: 429, headers: { 'Retry-After': '5' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return NextResponse.json({
        reply: 'Mabuhay! Ano ang maitutulong ko tungkol sa mga serbisyo, clearances, o opisyal ng Barangay Onse?',
        category: 'general',
      });
    }

    // Input length limit
    if (message.length > 500) {
      return NextResponse.json({
        reply: 'Masyadong mahaba ang inyong mensahe. Pakisulat po ito nang mas maikli upang mas mabilis masagot.',
        category: 'general',
      });
    }

    const result = await processChatbotMessage(message);

    return NextResponse.json({
      reply: result.reply,
      category: result.category,
    });
  } catch (err: unknown) {
    console.error('[Chatbot Error]', err);
    return NextResponse.json(
      {
        reply: 'Kasalukuyang nagre-refresh ang OnseBot. Maaari kayong tumawag sa Barangay Desk sa (02) 8723-0011 / (02) 8123-4567.',
      },
      { status: 500 }
    );
  }
}
