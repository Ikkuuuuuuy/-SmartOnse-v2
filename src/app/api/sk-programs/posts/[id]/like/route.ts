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
        { error: 'Please sign in to react to posts.' },
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required.' }, { status: 400 });
    }

    const existingLike = await prisma.skPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: sessionUser.id,
        },
      },
    });

    let hasLiked = false;

    if (existingLike) {
      // Unlike
      await prisma.skPostLike.delete({
        where: { id: existingLike.id },
      });
      hasLiked = false;
    } else {
      // Like
      await prisma.skPostLike.create({
        data: {
          postId,
          userId: sessionUser.id,
        },
      });
      hasLiked = true;
    }

    const totalLikes = await prisma.skPostLike.count({
      where: { postId },
    });

    // Update denormalized count on post
    await prisma.skPost.update({
      where: { id: postId },
      data: { likesCount: totalLikes },
    });

    return NextResponse.json({
      success: true,
      hasLiked,
      likesCount: totalLikes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update like status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

