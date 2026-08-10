"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../components/auth-guard";
import AppShell from "../components/app-shell";
import { api, getSession, timeAgo, type FeedPost } from "../lib/api";
import { useToast } from "../components/toast";

const fallbackAnnouncements: FeedPost[] = [
  {
    id: 9001,
    author: { id: 15, fullName: "Admin Staff", email: "admin@knust.edu.gh", role: "ADMIN_STAFF", college: "Staff Lounge" },
    communityName: "Announcements",
    content: "Course registration support desk will run from 09:00 to 16:00 at the Admissions Block. All students are encouraged to resolve any outstanding registration issues before the deadline.",
    postType: "ANNOUNCEMENT",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likeCount: 37,
    commentCount: 2,
    likedByCurrentUser: false,
  },
  {
    id: 9002,
    author: { id: 14, fullName: "Dr. Grace Asante", email: "grace.asante@knust.edu.gh", role: "ACADEMIC_STAFF", college: "College of Engineering" },
    communityName: "Announcements",
    content: "EE 346 mid-semester results are now on the portal. Office hours on Thursday 2–4pm for any queries. Please check carefully before the appeal window closes Friday.",
    postType: "ANNOUNCEMENT",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likeCount: 52,
    commentCount: 8,
    likedByCurrentUser: false,
  },
  {
    id: 9003,
    author: { id: 15, fullName: "Admin Staff", email: "admin@knust.edu.gh", role: "ADMIN_STAFF", college: "Staff Lounge" },
    communityName: "Announcements",
    content: "🔔 Reminder: The library closes at 10pm this week for maintenance. The reading room in Prempeh II will remain open until 8pm. Plan your study sessions accordingly.",
    postType: "ANNOUNCEMENT",
    status: "PUBLISHED",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likeCount: 91,
    commentCount: 14,
    likedByCurrentUser: false,
  },
];

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

  const [items, setItems] = useState<FeedPost[]>(fallbackAnnouncements);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const feed = await api<FeedPost[]>("/posts");
      const announcements = feed.filter((post) => post.postType === "ANNOUNCEMENT");
      if (announcements.length) setItems(announcements);
    } catch (err) {
      console.error("Failed to load announcements:", err);
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
      <div className="bg-white dark:bg-black min-h-screen">
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
            <section className="rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-[#16181c] p-5 shadow-sm">
              <h2 className="font-bold text-xl text-[#0f1419] dark:text-[#e7e9ea] mb-3">New announcement</h2>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={280}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-[#0f1419] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b] px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition"
                placeholder="Write your campus announcement…"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[#536471] dark:text-[#71767b]">{draft.length}/280</span>
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
            <div className="rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] bg-[#f7f9f9] dark:bg-[#16181c] p-4 text-sm text-[#536471] dark:text-[#71767b]">
              📢 Only academic and admin staff can publish announcements. Check back here for campus updates.
            </div>
          )}

          {/* Announcements list */}
          <section className="rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-[#16181c] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e6ebe5] dark:border-[#2f3336]">
              <h2 className="font-bold text-xl text-[#0f1419] dark:text-[#e7e9ea]">Recent announcements</h2>
            </div>
            <div className="divide-y divide-[#e6ebe5] dark:divide-[#2f3336]">
              {items.map((item) => (
                <article key={item.id} className="px-5 py-4 hover:bg-[#f7f9f9] dark:hover:bg-[#1d1f23] transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#00563f] text-xs font-bold text-white shrink-0">
                      {item.author.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f1419] dark:text-[#e7e9ea]">{item.author.fullName}</p>
                      <p className="text-[11px] text-[#536471] dark:text-[#71767b]">{timeAgo(item.createdAt)}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold uppercase bg-[#00563f]/10 text-[#00563f] dark:text-[#4ade80] px-2 py-0.5 rounded-full">Official</span>
                  </div>
                  <p className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] leading-relaxed">{item.content}</p>
                  <div className="mt-2 flex items-center gap-4 text-[12px] text-[#536471] dark:text-[#71767b]">
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
