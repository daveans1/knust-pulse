/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "./components/auth-guard";
import AppShell from "./components/app-shell";
import { useToast } from "./components/toast";
import { api, getApiUrl, getSession, initials, timeAgo, type FeedPost } from "./lib/api";
import { buildSeedPosts } from "./lib/seed-data";
import { getStoredPosts, saveStoredPosts } from "./lib/api";

const fallbackPosts: FeedPost[] = buildSeedPosts().slice(0, 20);

export default function HomePage() {
  return (
    <AuthGuard>
      <Feed />
    </AuthGuard>
  );
}

function CommentModal({ post, onClose, onCommentAdded }: { post: FeedPost; onClose: () => void; onCommentAdded: (postId: number) => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await api(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ content: text.trim() }) });
      onCommentAdded(post.id);
      onClose();
    } catch (err: any) {
      toast(err.message || "Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 px-4 pb-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-[600px] rounded-2xl bg-white dark:bg-black border border-[#e6ebe5] dark:border-[#2f3336] shadow-2xl my-auto flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e6ebe5] dark:border-[#2f3336]">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-[#e7e9ea1a] transition">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0f1419] dark:fill-[#e7e9ea]"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42z"></path></g></svg>
          </button>
        </div>
        <div className="px-4 py-3 flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">{initials(post.author)}</div>
          <div>
            <span className="font-bold text-[#0f1419] dark:text-[#e7e9ea]">{post.author.fullName}</span>
            <p className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] mt-1">{post.content.slice(0, 120)}{post.content.length > 120 ? "…" : ""}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
            {getSession() ? initials(getSession()!.user) : "KP"}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-[17px] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b] outline-none"
              placeholder="Post your reply"
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end px-4 py-3 border-t border-[#e6ebe5] dark:border-[#2f3336]">
          <button
            onClick={submit}
            disabled={!text.trim() || submitting}
            className="rounded-full bg-[var(--brand-primary)] px-5 py-2 text-[15px] font-bold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Replying…" : "Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ post, onClose, onReported }: { post: FeedPost; onClose: () => void; onReported: () => void }) {
  const [reason, setReason] = useState("Targeted Harassment / Bullying");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = [
    "Targeted Harassment / Bullying",
    "Hate Speech or Discrimination",
    "Threats of Violence or Physical Harm",
    "Excessive Vulgarity / Profanity",
    "Academic Fraud / Exam Leak",
    "Spam or Scam",
    "Other",
  ];

  const submit = async () => {
    setSubmitting(true);
    const finalReason = reason === "Other" && customReason.trim() ? customReason.trim() : reason;
    
    // Store in localStorage for offline Moderation Queue sync
    try {
      const stored = localStorage.getItem("knust-pulse-moderation-reports");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift({
        postId: post.id,
        authorName: post.author.fullName,
        content: post.content,
        status: "FLAGGED",
        aiScore: 78,
        flaggedReason: "User Report: " + finalReason,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("knust-pulse-moderation-reports", JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save offline moderation report:", err);
    }

    try {
      await api(`/posts/${post.id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: finalReason }),
      });
    } catch {
      // Offline fallback handled via localStorage
    } finally {
      setSubmitting(false);
      onReported();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-black border border-[#e6ebe5] dark:border-[#2f3336] p-6 shadow-2xl space-y-4 text-[#0f1419] dark:text-[#e7e9ea]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e6ebe5] dark:border-[#2f3336] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚩</span>
            <h3 className="font-bold text-[18px]">Report Post</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#e7e9ea1a] text-[#536471] dark:text-[#71767b]">✕</button>
        </div>

        <p className="text-[13px] text-[#536471] dark:text-[#71767b]">
          Reported posts are immediately flagged and sent to the Admin Moderation Queue for review.
        </p>

        <div className="space-y-2">
          <label className="block text-[13px] font-bold">Select reason:</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {reportReasons.map((r) => (
              <label key={r} className={`flex items-center gap-3 rounded-xl border p-3 text-[14px] font-medium cursor-pointer transition ${reason === r ? "border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]" : "border-[#e6ebe5] dark:border-[#2f3336] hover:bg-[#e7e9ea1a]"}`}>
                <input type="radio" name="reportReason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[#1d9bf0]" />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {reason === "Other" && (
          <div>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe why this post violates community guidelines..."
              rows={2}
              className="w-full rounded-xl border border-[#e6ebe5] dark:border-[#2f3336] bg-transparent p-3 text-[14px] outline-none focus:border-[#1d9bf0]"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[#e6ebe5] dark:border-[#2f3336]">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-[14px] font-bold text-[#536471] dark:text-[#71767b] hover:bg-[#e7e9ea1a]">Cancel</button>
          <button onClick={submit} disabled={submitting} className="rounded-full bg-red-500 hover:bg-red-600 px-5 py-2 text-[14px] font-bold text-white transition disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>(fallbackPosts);
  const [postText, setPostText] = useState("");
  const { toast, confirm } = useToast();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFileName, setMediaFileName] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedType, setUploadedType] = useState<"IMAGE" | "VIDEO" | null>(null);
  const [filter, setFilter] = useState<"For you" | "Trending">("For you");
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [reportPostItem, setReportPostItem] = useState<FeedPost | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api<FeedPost[]>(`/posts?filter=${filter === "For you" ? "foryou" : "trending"}`)
      .then((items) => { 
        if (active && items?.length) { 
          // Merge with stored offline posts
          const stored = getStoredPosts() || [];
          const merged = [...stored];
          items.forEach(apiItem => {
            if (!merged.find(m => m.id === apiItem.id)) merged.push(apiItem);
          });
          setPosts(merged); 
        } 
      })
      .catch((err) => { 
        if (active) {
          showToast(err.message || "Failed to load feed. Check connection.");
          const stored = getStoredPosts() || [];
          setPosts(stored);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter]);

  const visible = useMemo(() => posts.filter((p, i, a) => a.findIndex((c) => c.id === p.id) === i), [posts]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const publish = async () => {
    if (!postText.trim() && !uploadedUrl) return;

    setPosting(true);
    const payload = {
      content: postText.trim(),
      mediaUrl: uploadedUrl ?? null,
      postType: uploadedType ?? "TEXT",
    };
    try {
      const created = await api<FeedPost>("/posts", { method: "POST", body: JSON.stringify(payload) });
      if (created.status === "PUBLISHED") {
        setPosts((prev) => [created, ...prev]);
      } else {
        showToast(`Post not published: it was ${created.status.toLowerCase()} by moderation.`);
      }
      setOfflineMode(false);
    } catch (err: any) {
      showToast(err.message || "Failed to publish post");
    } finally {
      setPostText("");
      setUploadedUrl(null);
      setUploadedType(null);
      setMediaPreview(null);
      setMediaFileName("");
      setPosting(false);
    }
  };

  const toggleLike = async (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId ? p : {
          ...p,
          likedByCurrentUser: !p.likedByCurrentUser,
          likeCount: p.likedByCurrentUser ? Math.max(0, p.likeCount - 1) : p.likeCount + 1,
        }
      )
    );
    try {
      const updated = await api<FeedPost>(`/posts/${postId}/likes`, { method: "POST" });
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      setOfflineMode(true);
    }
  };

  const handleRepost = async (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => p.id !== postId ? p : { ...p, repostCount: (p.repostCount ?? 0) + 1 })
    );
    try {
      const updated = await api<FeedPost>(`/posts/${postId}/repost`, { method: "POST" });
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      setOfflineMode(true);
    }
  };

  const handleCommentAdded = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => p.id !== postId ? p : { ...p, commentCount: p.commentCount + 1 })
    );
  };

  const removePost = async (postId: number) => {
    if (!(await confirm("Delete this post?"))) return;
    try { 
      await api(`/posts/${postId}`, { method: "DELETE" }); 
    } catch (err) {
      console.error("Failed to delete post on backend:", err);
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMediaFileName(file.name);
    setMediaPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = getSession()?.token;
      const res = await fetch(`${getApiUrl()}/upload`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUploadedUrl(data.url);
        setUploadedType(file.type.startsWith("video/") ? "VIDEO" : "IMAGE");
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
      toast("Failed to upload file", "error");
    }
  };

  const session = getSession();

  return (
    <AppShell>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#1d9bf0] text-white px-6 py-3 text-sm font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span>🚩</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {commentPost && (
        <CommentModal
          post={commentPost}
          onClose={() => setCommentPost(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {reportPostItem && (
        <ReportModal
          post={reportPostItem}
          onClose={() => setReportPostItem(null)}
          onReported={() => showToast("Report submitted to Admin Moderation Queue.")}
        />
      )}

      {/* Feed tabs */}
      <div className="flex border-b border-[#e6ebe5] dark:border-[#2f3336] sticky top-16 z-20 bg-white/95 dark:bg-black/95 backdrop-blur">
        {(["For you", "Trending"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`flex-1 py-4 text-sm font-bold relative text-center transition hover:bg-[#e7ece5] dark:hover:bg-black ${filter === item ? "text-[#0f1419] dark:text-[#e7e9ea]" : "text-[#536471] dark:text-[#71767b]"}`}
          >
            {item}
            {filter === item && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[var(--brand-primary)] rounded-full" />}
          </button>
        ))}
      </div>

      {/* Compose box */}
      <section className="border-b border-[#e6ebe5] dark:border-[#2f3336] p-4 flex gap-3 bg-white dark:bg-black">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">
          {session ? initials(session.user) : "KP"}
        </span>
        <div className="flex-1">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full resize-none bg-white dark:bg-black text-[#0f1419] dark:text-[#e7e9ea] border-0 pt-2 text-xl outline-none placeholder-[#536471] dark:placeholder-[#71767b]"
            placeholder="What is happening?!"
          />
          {mediaPreview && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#eff3f4] dark:bg-black px-3 py-2 text-sm text-[#536471] dark:text-[#71767b]">
              <span>📎</span>
              <span className="truncate">{mediaFileName}</span>
              <button onClick={() => { setMediaPreview(null); setMediaFileName(""); setUploadedUrl(null); setUploadedType(null); }} className="ml-auto text-red-400 hover:text-red-500">✕</button>
            </div>
          )}
          {offlineMode && <p className="mt-1 text-[12px] text-yellow-600 dark:text-yellow-400">Offline mode — posts and likes will save locally</p>}
          <div className="mt-3 flex items-center justify-between border-t border-[#e6ebe5] dark:border-[#2f3336] pt-3">
            <label className="cursor-pointer text-[var(--brand-primary)] hover:bg-[#1d9bf01a] rounded-full p-2 transition">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path></g></svg>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#536471] dark:text-[#71767b]">{postText.length}/280</span>
              <button onClick={publish} disabled={!postText.trim() || posting} className="rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-bold text-white hover:bg-[#1a8cd8] transition disabled:opacity-50">
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="divide-y divide-[#e6ebe5] dark:divide-[#2f3336]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-4 sm:px-5 flex gap-3">
              <div className="h-10 w-10 rounded-full animate-skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded animate-skeleton" />
                <div className="h-4 w-5/6 rounded animate-skeleton" />
                <div className="h-4 w-2/3 rounded animate-skeleton" />
                <div className="h-32 w-full rounded-2xl animate-skeleton mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Posts */}
      <div>
        {visible.map((post) => (
          <article key={post.id} onClick={() => router.push(`/posts/${post.id}`)} className="cursor-pointer border-b border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-black px-4 py-4 transition hover:bg-[#f7f9f9] dark:hover:bg-black sm:px-5">
            <div className="flex gap-3">
              <div onClick={e => e.stopPropagation()}>
                <Link href={`/profile/${post.author.id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white hover:opacity-90">
                  {initials(post.author)}
                </Link>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-x-1 text-sm" onClick={e => e.stopPropagation()}>
                    <Link href={`/profile/${post.author.id}`} className="font-bold text-[#0f1419] dark:text-[#e7e9ea] hover:underline">{post.author.fullName}</Link>
                    <span className="text-[#536471] dark:text-[#71767b]">@{post.author.email.split("@")[0]}</span>
                    <span className="text-[#536471] dark:text-[#71767b]">· {timeAgo(post.createdAt)}</span>
                  </div>
                  {/* Flag / Report button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setReportPostItem(post); }}
                    className="rounded-full p-1.5 hover:bg-red-500/10 text-[#536471] dark:text-[#71767b] hover:text-red-500 transition"
                    title="Report post to Admin"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><g><path d="M3 2h2v20H3V2zm3 3h12l-3 4 3 4H6V5z"></path></g></svg>
                  </button>
                </div>
                {post.communityName && post.communityName !== "KNUST Pulse" && (
                  <div onClick={e => e.stopPropagation()}>
                    <Link href={`/communities/${post.communityName.toLowerCase().replace(/\s+/g, "-")}`} className="mt-0.5 block text-xs font-bold text-[var(--brand-primary)] hover:underline">{post.communityName}</Link>
                  </div>
                )}
                <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[#0f1419] dark:text-[#e7e9ea]">{post.content}</p>
                {post.mediaUrl && post.postType === "IMAGE" && (
                  <img src={post.mediaUrl} alt="Post attachment" className="mt-3 max-h-[512px] rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] object-cover w-full" />
                )}
                {post.mediaUrl && post.postType === "VIDEO" && (
                  <video controls className="mt-3 max-h-[512px] rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] w-full">
                    <source src={post.mediaUrl} />
                  </video>
                )}

                {/* Engagement bar */}
                <div className="mt-3 flex items-center justify-between text-[#536471] dark:text-[#71767b]" onClick={e => e.stopPropagation()}>
                  {/* Comment */}
                  <button onClick={() => setCommentPost(post)} className="flex items-center gap-1.5 group hover:text-[var(--brand-primary)] transition text-[13px] font-semibold">
                    <div className="rounded-full p-2 group-hover:bg-[#1d9bf01a]">
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                    </div>
                    <span>{post.commentCount}</span>
                  </button>
                  {/* Repost */}
                  <button onClick={() => handleRepost(post.id)} className="flex items-center gap-1.5 group hover:text-[#00ba7c] transition text-[13px] font-semibold">
                    <div className="rounded-full p-2 group-hover:bg-[#00ba7c1a]">
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                    </div>
                    <span>{post.repostCount ?? 0}</span>
                  </button>
                  {/* Like */}
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 group transition text-[13px] font-semibold ${post.likedByCurrentUser ? "text-[var(--brand-accent)]" : "hover:text-[var(--brand-accent)]"}`}>
                    <div className={`rounded-full p-2 ${post.likedByCurrentUser ? "" : "group-hover:bg-[#f918801a]"}`}>
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d={post.likedByCurrentUser
                        ? "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                        : "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                      }></path></g></svg>
                    </div>
                    <span>{post.likeCount}</span>
                  </button>
                  {/* Views */}
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                    <div className="rounded-full p-2">
                      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                    </div>
                    <span>{(post.viewCount ?? 0).toLocaleString()}</span>
                  </div>
                  {/* Delete own post */}
                  {session?.user?.id === post.author.id && (
                    <button onClick={() => removePost(post.id)} className="group hover:text-red-500 transition">
                      <div className="rounded-full p-2 group-hover:bg-red-500/10">
                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M8 5.5V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v1.5h4.5v2h-1.5v13.5c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V7.5H3.5v-2H8zm2-1.5v1.5h4V4h-4zM7 7.5v13.5h10V7.5H7zM9.5 10v9h2v-9h-2zm3 0v9h2v-9h-2z"></path></g></svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
