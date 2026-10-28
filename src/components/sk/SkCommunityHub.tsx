'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Send,
  Pin,
  Trophy,
  BookOpen,
  Users,
  Leaf,
  HeartPulse,
  Laptop,
  Calendar,
  DollarSign,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  caption?: string | null;
}

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
}

interface PostItem {
  id: string;
  caption: string;
  category: string;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  program?: { id: string; title: string; category: string } | null;
  media: MediaItem[];
  likesCount: number;
  hasLiked: boolean;
  commentsCount: number;
  comments: CommentItem[];
  createdAt: string;
}

interface ProgramItem {
  id: string;
  title: string;
  category: string;
  objective: string;
  targetAudience: string;
  schedule: string;
  budget: number;
  status: string;
}

interface SkCommunityHubProps {
  initialPrograms: ProgramItem[];
}

export default function SkCommunityHub({ initialPrograms }: SkCommunityHubProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'programs'>('feed');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Expanded comment drawer per post ID
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState('Youth Development');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newProgramId, setNewProgramId] = useState('');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');

  // Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Check if current user can publish SK posts
  const canPublish =
    user &&
    (user.role === 'sk_chairperson' ||
      user.role === 'sk_councilor' ||
      user.role === 'barangay_captain' ||
      user.role === 'super_admin');

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/sk-programs/posts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      }
    } catch (err) {
      console.error('Failed to load SK posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Like/Unlike
  const handleLike = async (postId: string) => {
    if (!user) {
      alert('Please log in to react to SK community updates.');
      return;
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newHasLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked: newHasLiked,
          likesCount: newHasLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
        };
      })
    );

    try {
      const res = await fetch(`/api/sk-programs/posts/${postId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, hasLiked: data.hasLiked, likesCount: data.likesCount }
                : p
            )
          );
        }
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  // Handle Submit Comment
  const handleCommentSubmit = async (postId: string) => {
    if (!user) {
      alert('Please log in to comment.');
      return;
    }

    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    try {
      const res = await fetch(`/api/sk-programs/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comment) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    commentsCount: p.commentsCount + 1,
                    comments: [...p.comments, data.comment],
                  }
                : p
            )
          );
          setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        }
      }
    } catch (err) {
      console.error('Comment submission error:', err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError('');
    if (!newCaption.trim()) {
      setPostError('Please enter a caption for your post.');
      return;
    }

    setSubmittingPost(true);
    try {
      const media = newImageUrl.trim()
        ? [{ url: newImageUrl.trim(), type: 'IMAGE' }]
        : [];

      const res = await fetch('/api/sk-programs/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: newCaption,
          category: newCategory,
          programId: newProgramId || null,
          isPinned: newIsPinned,
          media,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPostError(data.error || 'Failed to publish post.');
        setSubmittingPost(false);
        return;
      }

      // Success
      setShowCreateModal(false);
      setNewCaption('');
      setNewImageUrl('');
      setNewIsPinned(false);
      fetchPosts();
    } catch (err) {
      setPostError('Network error while publishing post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-[#9C2007] dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Sangguniang Kabataan • Barangay Onse, San Juan City
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          SK Youth <span className="text-[#9C2007] dark:text-rose-500">Community Hub</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-[0.25em]">
          Connect, Participate, &amp; Engage in Youth Initiatives
        </p>

        {/* Navigation Tabs */}
        <div className="pt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              activeTab === 'feed'
                ? 'bg-[#9C2007] text-white shadow-md shadow-[#9C2007]/25 scale-105'
                : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50'
            }`}
          >
            📱 Community Feed &amp; Updates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('programs')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              activeTab === 'programs'
                ? 'bg-[#9C2007] text-white shadow-md shadow-[#9C2007]/25 scale-105'
                : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50'
            }`}
          >
            📋 Official Program Catalog ({initialPrograms.length})
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB 1: SOCIAL FEED (FACEBOOK/INSTAGRAM STYLE) */}
      {/* ========================================================================= */}
      {activeTab === 'feed' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post Banner for SK Officials & Admins */}
          {canPublish && (
            <div className="bg-white dark:bg-[#0E1B33] rounded-3xl p-5 border border-slate-200/80 dark:border-blue-900/50 shadow-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#9C2007]/10 flex items-center justify-center text-[#9C2007] font-black text-sm shrink-0">
                  SK
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1c325c] text-slate-500 dark:text-slate-400 text-left rounded-2xl text-xs font-medium transition cursor-pointer"
                >
                  Post an SK announcement, event photos, or project update...
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="p-3 rounded-2xl bg-[#9C2007] hover:bg-[#8B1A05] text-white transition cursor-pointer shadow-md shadow-[#9C2007]/20 shrink-0"
                  title="Create New Post"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            {['ALL', 'Sports', 'Education', 'Leadership', 'Skills', 'Environment', 'Health'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Feed List */}
          {loadingPosts ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#9C2007] mx-auto" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Loading SK community feed...
              </p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/50 p-8 space-y-2">
              <p className="text-base font-bold text-slate-800 dark:text-white">No posts in this category yet</p>
              <p className="text-xs text-slate-500">Stay tuned for upcoming SK updates and youth programs!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200/80 dark:border-blue-900/50 shadow-xl overflow-hidden space-y-4"
              >
                {/* Post Header */}
                <div className="p-5 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#9C2007] to-rose-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-md">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        post.authorName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                          {post.authorName}
                        </h2>
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-900/40">
                            <Pin className="w-2.5 h-2.5" />
                            Pinned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-semibold text-[#9C2007] dark:text-rose-400">
                          {post.authorRole}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#152747] text-slate-600 dark:text-slate-300">
                    {post.category}
                  </span>
                </div>

                {/* Post Caption */}
                <div className="px-5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {post.caption}
                </div>

                {/* Linked Program Pill */}
                {post.program && (
                  <div className="mx-5 p-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <span className="text-[#9C2007] dark:text-rose-300 font-bold truncate">
                      📌 Linked Program: <strong>{post.program.title}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('programs')}
                      className="text-[10px] font-black uppercase text-[#9C2007] dark:text-rose-400 hover:underline shrink-0 ml-2"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                )}

                {/* Post Media (Images) */}
                {post.media && post.media.length > 0 && (
                  <div className="px-5">
                    {post.media.map((med) => (
                      <div
                        key={med.id}
                        onClick={() => setLightboxImage(med.url)}
                        className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#070D18] border border-slate-200 dark:border-blue-900/40 cursor-pointer group"
                      >
                        <img
                          src={med.url}
                          alt={med.caption || 'SK Program Media'}
                          className="w-full max-h-[420px] object-cover group-hover:scale-[1.01] transition duration-300"
                        />
                        {med.caption && (
                          <div className="p-2.5 bg-black/70 text-white text-[11px] font-medium backdrop-blur-xs">
                            {med.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Stats & Actions Bar */}
                <div className="px-5 pt-2 border-t border-slate-100 dark:border-blue-900/40">
                  <div className="flex items-center justify-between py-2 text-xs text-slate-500">
                    <span>
                      {post.likesCount} {post.likesCount === 1 ? 'reaction' : 'reactions'}
                    </span>
                    <span>
                      {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 dark:border-blue-900/40 text-xs">
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                        post.hasLiked
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400'
                          : 'hover:bg-slate-100 dark:hover:bg-[#152747] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          post.hasLiked ? 'fill-current text-[#9C2007] dark:text-rose-400' : ''
                        }`}
                      />
                      <span>{post.hasLiked ? 'Liked' : 'Like'}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenComments((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#152747] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'SK Onse Update',
                            text: post.caption.slice(0, 100),
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Post link copied to clipboard!');
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-[#152747] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section Drawer */}
                {openComments[post.id] && (
                  <div className="bg-slate-50 dark:bg-[#070D18] p-5 pt-3 border-t border-slate-100 dark:border-blue-900/40 space-y-3">
                    {/* Existing Comments */}
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      ) : (
                        post.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="bg-white dark:bg-[#0E1B33] p-3 rounded-2xl border border-slate-200/80 dark:border-blue-900/40 text-xs space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {comm.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comm.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        placeholder="Write a supportive comment..."
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/50 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#9C2007] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                        className="p-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white disabled:opacity-50 transition cursor-pointer shadow-xs shrink-0"
                      >
                        {submittingComment[post.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OFFICIAL PROGRAM CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white dark:bg-[#0E1B33] p-7 md:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-slate-200/80 dark:border-blue-900/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-[#9C2007] dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                    {program.category}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full ${
                      program.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                    }`}
                  >
                    {program.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-snug">
                  {program.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6">
                  {program.objective}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-blue-900/40 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Target:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-right truncate max-w-[180px]">
                    {program.targetAudience}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Schedule:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-right truncate max-w-[180px]">
                    {program.schedule}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Budget Allocation:
                  </span>
                  <span className="font-black text-[#9C2007] dark:text-rose-400">
                    ₱{program.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE SK POST */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0E1B33] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/60 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/40 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                  Publish SK Community Update
                </h3>
                <p className="text-xs text-slate-500">Post announcements, event highlights, or photos</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-[#152747]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Post Caption &amp; Announcement *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Share what the SK is up to, program highlights, results, or invite youth to participate..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-slate-900 dark:text-white focus:ring-1 focus:ring-[#9C2007] outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-[#9C2007] outline-none text-xs font-semibold"
                  >
                    <option value="Sports & Wellness">Sports &amp; Wellness</option>
                    <option value="Education">Education &amp; Scholarship</option>
                    <option value="Governance & Leadership">Governance &amp; Leadership</option>
                    <option value="Skills & Livelihood">Skills &amp; Livelihood</option>
                    <option value="Environment">Environment &amp; Cleanliness</option>
                    <option value="Health & Wellness">Health &amp; Wellness</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Link to Program (Optional)
                  </label>
                  <select
                    value={newProgramId}
                    onChange={(e) => setNewProgramId(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-[#9C2007] outline-none text-xs"
                  >
                    <option value="">None / Standalone</option>
                    {initialPrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#9C2007]" />
                  <span>Image URL (Optional)</span>
                </label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg or /images/Permato.webp"
                  className="w-full p-3 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl text-slate-900 dark:text-white focus:ring-1 focus:ring-[#9C2007] outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={newIsPinned}
                  onChange={(e) => setNewIsPinned(e.target.checked)}
                  className="rounded text-[#9C2007] focus:ring-[#9C2007] cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin to top of SK community feed
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-900/40 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider text-[11px] shadow-md shadow-[#9C2007]/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Publish Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Expanded SK View"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white font-black text-sm uppercase tracking-wider flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

