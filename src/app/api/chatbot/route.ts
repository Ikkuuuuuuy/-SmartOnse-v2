import { NextResponse } from 'next/server';
import { processChatbotMessage } from '@/lib/chatbot/chatbotEngine';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        reply: 'Mabuhay! Please type a question regarding Barangay Onse services, officials, or announcements.',
      });
    }

    const result = await processChatbotMessage(message);

    return NextResponse.json({
      reply: result.reply,
      category: result.category,
    });
  } catch (err: any) {
    console.error('[Chatbot Error]', err);
    return NextResponse.json(
      {
        reply: 'Mabuhay! Our virtual assistant is currently refreshing. You may contact the Barangay Desk at (02) 8123-4567 for immediate assistance.',
        error: err.message,
      },
      { status: 500 }
    );
  }
}

