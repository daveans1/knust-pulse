"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../components/auth-guard";
import AppShell from "../components/app-shell";
import { api, getSession, timeAgo, type FeedPost } from "../lib/api";
import { useToast } from "../components/toast";


export default function AnnouncementsPage() {
  return (
    <AuthGuard>
      <AnnouncementsView />
    </AuthGuard>
  );
}

function AnnouncementsView() {
  const session = getSession();
  const isStaff = session?.user.role === "ACADEMIC_STAFF" || session?.user.role === "ADMIN_STAFF" || session?.user.role === "PROJECT_STAFF";

  const [items, setItems] = useState<FeedPost[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const feed = await api<FeedPost[]>("/posts");
      const announcements = feed.filter((post) => post.postType === "ANNOUNCEMENT");
      setItems(announcements);
    } catch (err: any) {
      toast(err.message || "Failed to load announcements.", "error");
    }
  };

  useEffect(() => { void load(); }, []);

  const publish = async () => {
    if (!draft.trim() || !isStaff) return;
    setPosting(true);
    try {
      await api<FeedPost>("/posts", {
        method: "POST",
        body: JSON.stringify({ content: draft.trim(), postType: "ANNOUNCEMENT", mediaUrl: null, communityId: null }),
      });
      setDraft("");
      await load();
    } catch (err: any) {
      toast(err.message || "Failed to publish announcement", "error");
    } finally {
      setPosting(false);
    }
  };

  return (
    <AppShell>
      <div className="bg-[var(--background)] min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#00563f] to-[#007a55] p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4c846]">Staff broadcast</p>
          <h1 className="mt-3 text-4xl font-bold">Announcements</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
            Official campus updates — classes, events, administration, and university-wide notices from academic and admin staff.
          </p>
        </section>

        <div className="p-4 space-y-4">
          {/* Compose — staff only */}
          {isStaff ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm">
              <h2 className="font-bold text-xl mb-3">New announcement</h2>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={280}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition"
                placeholder="Write your campus announcement…"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">{draft.length}/280</span>
                <button
                  onClick={publish}
                  disabled={!draft.trim() || posting}
                  className="rounded-full bg-[#00563f] hover:bg-[#004a34] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  {posting ? "Publishing…" : "Publish"}
                </button>
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              📢 Only academic and admin staff can publish announcements. Check back here for campus updates.
            </div>
          )}

          {/* Announcements list */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-bold text-xl">Recent announcements</h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {items.map((item) => (
                <article key={item.id} className="px-5 py-4 hover:bg-[var(--surface)] transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#00563f] text-xs font-bold text-white shrink-0">
                      {item.author.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.author.fullName}</p>
                      <p className="text-[11px] text-[var(--muted)]">{timeAgo(item.createdAt)}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold uppercase bg-[#00563f]/10 text-[#00563f] dark:text-[#4ade80] px-2 py-0.5 rounded-full">Official</span>
                  </div>
                  <p className="text-[15px] leading-relaxed">{item.content}</p>
                  <div className="mt-2 flex items-center gap-4 text-[12px] text-[var(--muted)]">
                    <span>❤ {item.likeCount}</span>
                    <span>💬 {item.commentCount}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
