/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AuthGuard from "../../components/auth-guard";
import AppShell from "../../components/app-shell";
import { api, getSession, initials, timeAgo, type FeedPost } from "../../lib/api";

function CommentModal({ post, onClose, onCommentAdded }: { post: FeedPost; onClose: () => void; onCommentAdded: (postId: number) => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await api(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: text.trim() }) });
      onCommentAdded(post.id);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to post comment");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16" onClick={onClose}>
      <div className="w-full max-w-[600px] rounded-2xl bg-white dark:bg-black border border-[#e6ebe5] dark:border-[#2f3336] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e6ebe5] dark:border-[#2f3336]">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[#e7e9ea1a]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0f1419] dark:fill-[#e7e9ea]"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42z"></path></g></svg>
          </button>
        </div>
        <div className="px-4 py-3 flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">{initials(post.author)}</div>
          <p className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] mt-1">{post.content.slice(0, 120)}{post.content.length > 120 ? "…" : ""}</p>
        </div>
        <div className="px-4 py-3 flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
            {getSession() ? initials(getSession()!.user) : "KP"}
          </div>
          <div className="flex-1">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus
              className="w-full resize-none bg-transparent text-[17px] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b] outline-none"
              placeholder="Post your reply" />
          </div>
        </div>
        <div className="flex justify-end px-4 py-3 border-t border-[#e6ebe5] dark:border-[#2f3336]">
          <button onClick={submit} disabled={!text.trim() || submitting}
            className="rounded-full bg-[var(--brand-primary)] px-5 py-2 text-[15px] font-bold text-white hover:opacity-90 transition disabled:opacity-50">
            {submitting ? "Replying…" : "Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? "community";
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<FeedPost[]>("/posts")
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          const exact = data.filter((p) => p.communityName && p.communityName.toLowerCase() === name.toLowerCase());
          if (exact.length > 0) {
            setPosts(exact);
          } else {
            const slugWords = slug.split("-").filter((w) => w.length > 3);
            const fuzzy = data.filter((p) => p.communityName && slugWords.some((w) => p.communityName.toLowerCase().includes(w)));
            setPosts(fuzzy);
          }
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch community posts:", err);
        if (active) setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [name, slug]);

  const toggleLike = async (postId: number) => {
    setPosts((prev) => prev.map((p) => p.id !== postId ? p : {
      ...p,
      likedByCurrentUser: !p.likedByCurrentUser,
      likeCount: p.likedByCurrentUser ? Math.max(0, p.likeCount - 1) : p.likeCount + 1,
    }));
    try {
      const updated = await api<FeedPost>(`/posts/${postId}/likes`, { method: "POST" });
      setPosts((prev) => prev.map((p) => p.id === postId ? updated : p));
    } catch {}
  };

  const handleRepost = async (postId: number) => {
    setPosts((prev) => prev.map((p) => p.id !== postId ? p : { ...p, repostCount: (p.repostCount ?? 0) + 1 }));
    try {
      const updated = await api<FeedPost>(`/posts/${postId}/repost`, { method: "POST" });
      setPosts((prev) => prev.map((p) => p.id === postId ? updated : p));
    } catch {}
  };

  const handleCommentAdded = (postId: number) => {
    setPosts((prev) => prev.map((p) => p.id !== postId ? p : { ...p, commentCount: p.commentCount + 1 }));
  };

  return (
    <AuthGuard>
      {commentPost && (
        <CommentModal post={commentPost} onClose={() => setCommentPost(null)} onCommentAdded={handleCommentAdded} />
      )}
      <AppShell>
        <section className="bg-white dark:bg-black min-h-screen border-x border-[#e6ebe5] dark:border-[#2f3336]">
          <div className="flex items-center gap-6 px-4 py-3 sticky top-16 z-20 bg-white/95 dark:bg-black/95 backdrop-blur border-b border-[#e6ebe5] dark:border-[#2f3336]">
            <Link href="/communities" className="rounded-full p-2 hover:bg-[#e7ece5] dark:hover:bg-black transition">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-[#0f1419] dark:fill-[#e7e9ea]"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>
            </Link>
            <div>
              <h2 className="font-display text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea]">{name}</h2>
              <p className="text-[13px] text-[#536471] dark:text-[#71767b]">{posts.length} posts</p>
            </div>
          </div>

          <div className="h-48 bg-gradient-to-r from-[#1d9bf0] to-[#00ba7c] dark:from-[#1d4070] dark:to-[#0a4a30]" />

          <div className="relative px-4 pb-4">
            <div className="flex justify-between items-start">
              <div className="relative -mt-16 w-32 h-32 rounded-full border-4 border-white dark:border-black bg-[var(--brand-primary)] flex items-center justify-center text-4xl font-bold text-white shadow-sm">
                {name.substring(0, 2).toUpperCase()}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setJoined(!joined)}
                  className={`rounded-full px-4 py-1.5 text-[15px] font-bold transition ${joined ? "border border-[#cfd9de] dark:border-[#536471] text-[#0f1419] dark:text-[#e7e9ea] hover:bg-[#f4212e1a] hover:text-[#f4212e] hover:border-[#f4212e]" : "bg-[#0f1419] text-white dark:bg-[#e7e9ea] dark:text-[#0f1419] hover:opacity-90"}`}>
                  {joined ? "Joined ✓" : "Join"}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <h1 className="font-display text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea]">{name}</h1>
              <p className="text-[15px] text-[#536471] dark:text-[#71767b]">@{slug.toLowerCase()}</p>
            </div>
            <p className="mt-3 text-[15px] text-[#0f1419] dark:text-[#e7e9ea]">
              Student posts, event updates, and community conversations from {name}.
            </p>
            <div className="mt-3 flex flex-wrap gap-5 text-[15px]">
              <span className="text-[#536471] dark:text-[#71767b]"><b className="text-[#0f1419] dark:text-[#e7e9ea]">{posts.length * 124}</b> Members</span>
              <span className="text-[#536471] dark:text-[#71767b]"><b className="text-[#0f1419] dark:text-[#e7e9ea]">{posts.length}</b> Posts</span>
            </div>
          </div>

          <div className="flex border-b border-[#e6ebe5] dark:border-[#2f3336]">
            <button className="flex-1 py-4 text-[15px] font-bold text-[#0f1419] dark:text-[#e7e9ea] relative hover:bg-[#e7ece5] dark:hover:bg-black transition text-center">
              Posts
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-[var(--brand-primary)] rounded-full" />
            </button>
            <button className="flex-1 py-4 text-[15px] font-bold text-[#536471] dark:text-[#71767b] hover:bg-[#e7ece5] dark:hover:bg-black transition text-center">About</button>
          </div>

          <div>
            {loading && <p className="p-5 text-center text-sm text-[#536471] dark:text-[#71767b]">Loading posts…</p>}
            {posts.map((post) => (
              <article key={post.id} onClick={() => router.push(`/posts/${post.id}`)} className="cursor-pointer border-b border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-black px-4 py-4 transition hover:bg-[#f7f9f9] dark:hover:bg-black sm:px-5">
                <div className="flex gap-3">
                  <div onClick={e => e.stopPropagation()}>
                    <Link href={`/profile/${post.author.id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white hover:opacity-90">
                      {initials(post.author)}
                    </Link>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1 text-[15px]" onClick={e => e.stopPropagation()}>
                      <Link href={`/profile/${post.author.id}`} className="font-bold text-[#0f1419] dark:text-[#e7e9ea] hover:underline">{post.author.fullName}</Link>
                      <span className="text-[#536471] dark:text-[#71767b]">@{post.author.email.split("@")[0]}</span>
                      <span className="text-[#536471] dark:text-[#71767b]">· {timeAgo(post.createdAt)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[#0f1419] dark:text-[#e7e9ea]">{post.content}</p>
                    {post.mediaUrl && post.postType === "IMAGE" && (
                      <img src={post.mediaUrl} alt="Post media" className="mt-3 max-h-[512px] rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] object-cover w-full" />
                    )}
                    {post.mediaUrl && post.postType === "VIDEO" && (
                      <video controls className="mt-3 max-h-[512px] rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] w-full">
                        <source src={post.mediaUrl} />
                      </video>
                    )}

                    <div className="mt-3 flex items-center gap-5 text-[#536471] dark:text-[#71767b] text-[13px] font-semibold" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setCommentPost(post)} className="flex items-center gap-1.5 group hover:text-[var(--brand-primary)] transition">
                        <div className="rounded-full p-2 group-hover:bg-[#1d9bf01a]">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                        </div>
                        <span>{post.commentCount}</span>
                      </button>
                      <button onClick={() => handleRepost(post.id)} className="flex items-center gap-1.5 group hover:text-[#00ba7c] transition">
                        <div className="rounded-full p-2 group-hover:bg-[#00ba7c1a]">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                        </div>
                        <span>{post.repostCount ?? 0}</span>
                      </button>
                      {/* Like */}
                      <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 group transition ${post.likedByCurrentUser ? "text-[var(--brand-accent)]" : "hover:text-[var(--brand-accent)]"}`}>
                        <div className={`rounded-full p-2 ${post.likedByCurrentUser ? "" : "group-hover:bg-[#f918801a]"}`}>
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d={post.likedByCurrentUser
                            ? "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                            : "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                          }></path></g></svg>
                        </div>
                        <span>{post.likeCount}</span>
                      </button>
                      {/* Views */}
                      <div className="flex items-center gap-1.5">
                        <div className="rounded-full p-2">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                        </div>
                        <span>{(post.viewCount ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {posts.length === 0 && !loading && (
              <div className="p-8 text-center text-[#536471] dark:text-[#71767b]">
                <h3 className="text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea] mb-2">No posts yet</h3>
                <p>Be the first to post in this community!</p>
              </div>
            )}
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
