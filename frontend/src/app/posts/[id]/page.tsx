"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "../../components/app-shell";
import AuthGuard from "../../components/auth-guard";
import { api, getSession, timeAgo, initials, type FeedPost, type Comment } from "../../lib/api";
import { useToast } from "../../components/toast";

export default function PostDetailPage() {
  return (
    <AuthGuard>
      <PostDetailView />
    </AuthGuard>
  );
}

function PostDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast, confirm } = useToast();

  // Load post logic from API
  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([
      api<FeedPost>(`/posts/${id}`),
      api<Comment[]>(`/posts/${id}/comments`).catch(() => [] as Comment[]),
    ])
      .then(([postData, commentsData]) => {
        if (active) {
          setPost({ ...postData, comments: commentsData });
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setPost(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const submitReply = async () => {
    if (!replyText.trim() || !post) return;

    setSubmitting(true);
    try {
      const responseComment = await api<Comment>(`/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: replyText.trim() }),
      });
      const updatedComments = [responseComment, ...(post.comments || [])];
      setPost({
        ...post,
        comments: updatedComments,
        commentCount: (post.commentCount || 0) + 1,
      });
      setReplyText("");
    } catch (err: any) {
      toast(err.message || "Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!post) return;
    if (!(await confirm("Are you sure you want to delete this reply?"))) return;

    try {
      await api(`/posts/${post.id}/comments/${commentId}`, { method: "DELETE" });
      const updatedComments = (post.comments || []).filter((c) => c.id !== commentId);
      setPost({
        ...post,
        comments: updatedComments,
        commentCount: Math.max(0, (post.commentCount || 1) - 1),
      });
    } catch (err: any) {
      toast(err.message || "Failed to delete reply", "error");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-screen bg-white dark:bg-black"><span className="text-[#536471]">Loading post...</span></div>
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-screen bg-white dark:bg-black"><span className="text-[#536471]">Post not found.</span></div>
      </AppShell>
    );
  }

  const session = getSession();

  return (
    <AppShell>
      <div className="bg-white dark:bg-black min-h-screen border-x border-[#e6ebe5] dark:border-[#2f3336]">
        {/* Header */}
        <div className="sticky top-16 z-20 bg-white/95 dark:bg-black/95 backdrop-blur px-4 py-3 border-b border-[#e6ebe5] dark:border-[#2f3336] flex items-center gap-6">
          <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-[#e7e9ea1a] transition">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0f1419] dark:fill-[#e7e9ea]"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2z"></path></g></svg>
          </button>
          <h1 className="text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea]">Post</h1>
        </div>

        {/* Main Post */}
        <article className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-sm font-bold text-white">
                {initials(post.author)}
              </div>
              <div>
                <p className="font-bold text-[15px] text-[#0f1419] dark:text-[#e7e9ea] hover:underline">{post.author.fullName}</p>
                <p className="text-[14px] text-[#536471] dark:text-[#71767b]">@{post.author.email.split("@")[0]}</p>
              </div>
            </Link>
          </div>
          
          <div className="mt-3 text-[17px] text-[#0f1419] dark:text-[#e7e9ea] leading-normal whitespace-pre-wrap">
            {post.content}
          </div>

          {post.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#e6ebe5] dark:border-[#2f3336]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          )}

          <div className="mt-4 flex gap-4 text-[15px] text-[#536471] dark:text-[#71767b] border-b border-[#e6ebe5] dark:border-[#2f3336] pb-4">
            <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(post.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <Link href={`/communities/${post.communityName.toLowerCase().replace(/\s+/g, '-')}`} className="font-bold hover:underline">
              {post.communityName}
            </Link>
          </div>

          <div className="flex items-center justify-around py-3 border-b border-[#e6ebe5] dark:border-[#2f3336] text-[#536471] dark:text-[#71767b]">
            <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
              <span className="text-[13px] font-bold">{post.commentCount}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#00ba7c] transition">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
              <span className="text-[13px] font-bold">{post.repostCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#f91880] transition">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
              <span className="text-[13px] font-bold">{post.likeCount}</span>
            </button>
          </div>
        </article>

        {/* Reply Input */}
        <div className="flex gap-3 px-4 py-3 border-b border-[#e6ebe5] dark:border-[#2f3336]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
            {session ? initials(session.user) : "KP"}
          </div>
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent text-[17px] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b] outline-none"
              placeholder="Post your reply"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={submitReply}
                disabled={!replyText.trim() || submitting}
                className="rounded-full bg-[var(--brand-primary)] px-4 py-1.5 text-[15px] font-bold text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "Replying…" : "Reply"}
              </button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="divide-y divide-[#e6ebe5] dark:divide-[#2f3336]">
          {(!post.comments || post.comments.length === 0) ? (
            <div className="py-8 text-center text-[#536471]">No replies yet.</div>
          ) : (
            post.comments.map((comment) => {
              const canDelete = session && (session.user.id === comment.author.id || session.user.role === "ADMIN_STAFF" || session.user.role === "PROJECT_STAFF");
              return (
                <article key={comment.id} className="px-4 py-3 hover:bg-[#f7f9f9] dark:hover:bg-[#1d1f23] transition flex gap-3 group">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-sm font-bold text-white">
                    {initials(comment.author)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[15px] text-[#0f1419] dark:text-[#e7e9ea]">{comment.author.fullName}</span>
                        <span className="text-[14px] text-[#536471] dark:text-[#71767b]">@{comment.author.email.split("@")[0]} · {timeAgo(comment.createdAt)}</span>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-[#536471] dark:text-[#71767b] hover:text-red-500 p-1 rounded-full hover:bg-red-500/10 transition"
                          title="Delete reply"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><g><path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H3v2h1.06l.81 12.15C4.98 21.31 6.01 22 7.17 22h9.66c1.16 0 2.19-.69 2.3-1.85L20.06 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zm7.1 15.35c-.04.41-.39.65-.8.65H7.17c-.41 0-.76-.24-.8-.65L5.32 8h13.36l-1.05 11.85z"></path></g></svg>
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[15px] text-[#0f1419] dark:text-[#e7e9ea] leading-normal">{comment.content}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
