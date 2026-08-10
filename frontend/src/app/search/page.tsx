"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "../components/app-shell";
import AuthGuard from "../components/auth-guard";
import { api, type SearchResultItem } from "../lib/api";
import { buildSeedPosts, seedUsers, seedCommunities } from "../lib/seed-data";

function buildLocalResults(query: string): SearchResultItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: SearchResultItem[] = [];

  // Search posts
  buildSeedPosts().forEach((post) => {
    const score = (
      (post.content.toLowerCase().includes(q) ? 3 : 0) +
      (post.communityName.toLowerCase().includes(q) ? 1 : 0) +
      (post.author.fullName.toLowerCase().includes(q) ? 1 : 0)
    );
    if (score > 0) {
      results.push({
        kind: "post",
        id: post.id,
        title: post.content.slice(0, 80) + (post.content.length > 80 ? "…" : ""),
        subtitle: `${post.author.fullName} · ${post.communityName}`,
        path: `/posts/${post.id}`,
      });
    }
  });

  // Search users
  seedUsers.forEach((user) => {
    const matches =
      user.fullName.toLowerCase().includes(q) ||
      user.email.split("@")[0].toLowerCase().includes(q) ||
      (user.bio?.toLowerCase().includes(q) ?? false) ||
      user.college.toLowerCase().includes(q);
    if (matches) {
      results.push({
        kind: "user",
        id: user.id,
        title: user.fullName,
        subtitle: `@${user.email.split("@")[0]} · ${user.college}`,
        path: `/profile/${user.id}`,
      });
    }
  });

  // Search communities
  seedCommunities.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
      results.push({
        kind: "community",
        id: c.id,
        title: c.name,
        subtitle: c.description,
        path: `/communities/${c.slug}`,
      });
    }
  });

  return results;
}

function SearchView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [apiResults, setApiResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"All" | "Users" | "Posts" | "Communities">("All");

  // Sync query from URL params (reactive to trending tag clicks)
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    setQuery(urlQ);
    setDebouncedQuery(urlQ);
  }, [searchParams]);

  // Debounce: wait 300ms after last keystroke before triggering search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Update URL when user types in search box
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const newUrl = val.trim() ? `/search?q=${encodeURIComponent(val.trim())}` : "/search";
    router.replace(newUrl, { scroll: false });
  };

  // Try API, fall back to local seed search (uses debounced query)
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) { setApiResults([]); setLoading(false); return; }

    let active = true;
    setLoading(true);

    api<SearchResultItem[]>(`/search?q=${encodeURIComponent(trimmed)}`)
      .then((data) => {
        if (!active) return;
        setApiResults(data?.length ? data : null);
      })
      .catch(() => {
        if (active) setApiResults(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [debouncedQuery]);

  // Use API results if available; otherwise use local seed search
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    if (apiResults && apiResults.length > 0) return apiResults;
    return buildLocalResults(trimmed);
  }, [query, apiResults]);

  const filteredResults = results.filter((item) => {
    if (activeTab === "All") return true;
    if (activeTab === "Users") return item.kind === "user";
    if (activeTab === "Posts") return item.kind === "post";
    if (activeTab === "Communities") return item.kind === "community";
    return true;
  });

  return (
    <AppShell>
      <div className="bg-white dark:bg-black min-h-screen border-x border-[#e6ebe5] dark:border-[#2f3336]">
        <div className="sticky top-16 z-20 bg-white/95 dark:bg-black/95 backdrop-blur px-4 py-3 border-b border-[#e6ebe5] dark:border-[#2f3336]">
          <label className="flex w-full items-center gap-3 rounded-full border border-[#cfd9de] dark:border-[#333639] bg-[#eff3f4] dark:bg-[#202327] px-4 py-2 focus-within:border-[var(--brand-primary)] focus-within:bg-white dark:focus-within:bg-black focus-within:ring-1 focus-within:ring-[var(--brand-primary)] transition">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-[#536471] dark:fill-[#71767b]"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full bg-transparent outline-none text-[15px] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b]"
              placeholder="Search posts, people, communities…"
              autoFocus
            />
            {query && (
              <button onClick={() => handleQueryChange("")} className="text-[#536471] hover:text-[#e7e9ea] text-sm">✕</button>
            )}
          </label>
        </div>

        <div className="flex border-b border-[#e6ebe5] dark:border-[#2f3336]">
          {(["All", "Users", "Posts", "Communities"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-[15px] font-bold relative text-center transition hover:bg-[#e7ece5] dark:hover:bg-[#16181c] ${activeTab === tab ? "text-[#0f1419] dark:text-[#e7e9ea]" : "text-[#536471] dark:text-[#71767b]"}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-[var(--brand-primary)] rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {loading ? (
            <div className="p-8 text-center text-[#536471] dark:text-[#71767b]">Searching…</div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((item) => {
              const icon =
                item.kind === "user" ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-white"><g><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 4c2.206 0 4 1.794 4 4s-1.794 4-4 4-4-1.794-4-4 1.794-4 4-4zm0 14c-2.76 0-5.201-1.254-6.85-3.22C6.822 14.689 9.292 14 12 14s5.178.689 6.85 2.78C17.201 18.746 14.76 20 12 20z"></path></g></svg>
                ) : item.kind === "community" ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-white"><g><path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10C7.313 2 3.5 5.813 3.5 10.5 3.5 16.467 11.121 21.616 11.445 21.832l.555.37.555-.37C12.879 21.616 20.5 16.467 20.5 10.5 20.5 5.813 16.687 2 12 2z"></path></g></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-white"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V18.5c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5V5.5zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5V10.463z"></path></g></svg>
                );

              return (
                <Link key={`${item.kind}-${item.id}`} href={item.path} className="flex items-center gap-4 px-4 py-4 border-b border-[#e6ebe5] dark:border-[#2f3336] hover:bg-[#f7f9f9] dark:hover:bg-[#16181c] transition">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${item.kind === "user" ? "bg-[#1d9bf0]" : item.kind === "community" ? "bg-[#00ba7c]" : "bg-[#f91880]"}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#0f1419] dark:text-[#e7e9ea] truncate">{item.title}</h3>
                      <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${item.kind === "user" ? "bg-[#1d9bf0]/10 text-[#1d9bf0]" : item.kind === "community" ? "bg-[#00ba7c]/10 text-[#00ba7c]" : "bg-[#f91880]/10 text-[#f91880]"}`}>{item.kind}</span>
                    </div>
                    <p className="text-[14px] text-[#536471] dark:text-[#71767b] truncate">{item.subtitle}</p>
                  </div>
                </Link>
              );
            })
          ) : query.trim() ? (
            <div className="p-10 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea] mb-2">No results for &ldquo;{query}&rdquo;</h3>
              <p className="text-[#536471] dark:text-[#71767b]">Try a different search term — posts, usernames, communities, or hashtags.</p>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea] mb-2">Search KNUST Pulse</h3>
              <p className="text-[#536471] dark:text-[#71767b]">Find posts, people, and communities across campus.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Katanga", "Eduroam", "midsem", "SRC", "engineering"].map((term) => (
                  <button key={term} onClick={() => handleQueryChange(term)} className="rounded-full border border-[#e6ebe5] dark:border-[#2f3336] px-4 py-1.5 text-[14px] font-semibold hover:bg-[#e7e9ea1a] transition text-[#1d9bf0]">
                    #{term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#536471]">Loading search…</div>}>
        <SearchView />
      </Suspense>
    </AuthGuard>
  );
}
