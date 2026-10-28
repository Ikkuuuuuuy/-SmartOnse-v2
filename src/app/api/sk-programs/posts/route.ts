import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { normalizeRole, ROLES } from '@/lib/rbac';

// GET /api/sk-programs/posts - Retrieve community posts
export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    const currentUserId = sessionUser?.id || null;

    let posts = await prisma.skPost.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 25,
        },
        likes: {
          select: { userId: true },
        },
        program: {
          select: { id: true, title: true, category: true },
        },
      },
    });

    // Auto-seed initial interactive sample posts if table is currently empty
    if (posts.length === 0) {
      const defaultAuthor = (await prisma.user.findFirst({
        where: { role: { in: ['sk_chairperson', 'super_admin', 'barangay_captain'] } },
      })) || (await prisma.user.findFirst());

      if (defaultAuthor) {
        await prisma.skPost.create({
          data: {
            authorId: defaultAuthor.id,
            authorName: 'Hon. John Michael D. Permato',
            authorRole: 'SK Chairperson',
            authorAvatar: '/images/Permato.webp',
            caption: '🏆 HIGHLIGHTS: Opening Ceremony & Day 1 of the SK Inter-Purok Youth Basketball & Volleyball Tournament 2026! Over 120 youth athletes from Purok 1 to 6 participated at the Onse Covered Court. Let’s keep playing with true sportsmanship and keep our youth active and drug-free! Mabuhay ang Kabataang Onse! 🏀🏐🇵🇭',
            category: 'Sports & Wellness',
            isPinned: true,
            likesCount: 18,
            media: {
              create: [
                { url: '/images/Permato.webp', type: 'IMAGE', caption: 'SK Chair Permato giving the ceremonial toss', order: 0 },
              ],
            },
            comments: {
              create: [
                { authorId: defaultAuthor.id, authorName: 'Ana Marie Santos', content: 'Ang saya ng opening! Go Purok 3! 🔥' },
                { authorId: defaultAuthor.id, authorName: 'Mark Jayson Dela Cruz', content: 'Sino champion sa 3-point shootout Chairman?' },
              ],
            },
          },
        });

        await prisma.skPost.create({
          data: {
            authorId: defaultAuthor.id,
            authorName: 'Hon. Alexis Adrianne R. Luciano',
            authorRole: 'SK Kagawad (Digital Arts & Media)',
            authorAvatar: '/images/Luciano.webp',
            caption: '💻 Free Digital Media & Tech Innovation Workshop Batch 1 is officially underway! Our youth are learning graphic design, video editing for short-form content, and freelance basics. Slots for Batch 2 are now open at the SK Digital Hub! Register online via SmartOnse.',
            category: 'Skills & Livelihood',
            isPinned: false,
            likesCount: 12,
            comments: {
              create: [
                { authorId: defaultAuthor.id, authorName: 'Christian Gomez', content: 'Salamat po SK sa libreng workshop na ito! Laking tulong sa paghahanap ng online work.' },
              ],
            },
          },
        });

        // Re-fetch after seeding
        posts = await prisma.skPost.findMany({
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          include: {
            media: { orderBy: { order: 'asc' } },
            comments: { orderBy: { createdAt: 'asc' }, take: 25 },
            likes: { select: { userId: true } },
            program: { select: { id: true, title: true, category: true } },
          },
        });
      }
    }

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      category: post.category,
      isPinned: post.isPinned,
      authorId: post.authorId,
      authorName: post.authorName,
      authorRole: post.authorRole,
      authorAvatar: post.authorAvatar,
      program: post.program,
      media: post.media,
      likesCount: post.likes.length,
      hasLiked: currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false,
      commentsCount: post.comments.length,
      comments: post.comments.map((c) => ({
        id: c.id,
        authorName: c.authorName,
        authorAvatar: c.authorAvatar,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: post.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, posts: formattedPosts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve posts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/sk-programs/posts - Create a new post (SK Officials & Admins)
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const role = normalizeRole(sessionUser.role);
    const canPost =
      role === ROLES.SUPER_ADMIN ||
      role === ROLES.BARANGAY_CAPTAIN ||
      role === ROLES.SK_CHAIRPERSON ||
      role === ROLES.SK_COUNCILOR;

    if (!canPost) {
      return NextResponse.json(
        { error: 'Forbidden: Only SK Officials and Council Leaders can publish posts.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { caption, category, programId, media, isPinned } = body;

    if (!caption || typeof caption !== 'string' || !caption.trim()) {
      return NextResponse.json({ error: 'Post caption is required.' }, { status: 400 });
    }

    // Determine author role title
    const roleTitleMap: Record<string, string> = {
      [ROLES.SK_CHAIRPERSON]: 'SK Chairperson',
      [ROLES.SK_COUNCILOR]: 'SK Kagawad',
      [ROLES.BARANGAY_CAPTAIN]: 'Punong Barangay',
      [ROLES.SUPER_ADMIN]: 'Barangay Administrator',
    };

    const newPost = await prisma.skPost.create({
      data: {
        authorId: sessionUser.id,
        authorName: sessionUser.name,
        authorRole: roleTitleMap[role] || 'SK Leader',
        authorAvatar: sessionUser.role === ROLES.SK_CHAIRPERSON ? '/images/Permato.webp' : null,
        caption: caption.trim(),
        category: category || 'Youth Program',
        programId: programId || null,
        isPinned: Boolean(isPinned),
        media: {
          create: Array.isArray(media)
            ? media.map((m: { url: string; type?: string; caption?: string }, idx: number) => ({
                url: m.url,
                type: m.type || 'IMAGE',
                caption: m.caption || null,
                order: idx,
              }))
            : [],
        },
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to publish post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
