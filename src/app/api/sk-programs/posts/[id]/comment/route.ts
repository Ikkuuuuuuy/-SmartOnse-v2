import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Please sign in to comment.' },
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Comment text is required.' }, { status: 400 });
    }

    const cleanContent = content.trim();
    if (cleanContent.length > 500) {
      return NextResponse.json({ error: 'Comment must be 500 characters or fewer.' }, { status: 400 });
    }

    const newComment = await prisma.skComment.create({
      data: {
        postId,
        authorId: sessionUser.id,
        authorName: sessionUser.name,
        authorAvatar: null,
        content: cleanContent,
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        authorName: newComment.authorName,
        authorAvatar: newComment.authorAvatar,
        content: newComment.content,
        createdAt: newComment.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

