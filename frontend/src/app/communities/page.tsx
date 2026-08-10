"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "../components/auth-guard";
import AppShell from "../components/app-shell";
import { api, getSession } from "../lib/api";

type Community = {
  id: number;
  name: string;
  badge: string;
  members: string;
  description: string;
  category: "college" | "interest" | "project";
  joined: boolean;
};

type SearchResultItem = {
  kind: string;
  title: string;
  subtitle: string;
  id: number;
};

const fallbackCommunities: Community[] = [];

export default function CommunitiesPage() {
  return (
    <AuthGuard>
      <CommunitiesView />
    </AuthGuard>
  );
}

function CommunitiesView() {
  const session = getSession();
  const collegeBadge = session?.user.college
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CH";
  
  const collegeHub: Community = {
    id: 1,
    name: `${session?.user.college ?? "College"} hub`,
    badge: collegeBadge,
    members: "4.8k members",
    description: `Official home for ${session?.user.college ?? "your college"} updates, study calls, and student announcements.`,
    category: "college",
    joined: true,
  };

  const [query, setQuery] = useState("");
  const [communities, setCommunities] = useState<Community[]>([collegeHub]);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"Joined" | "Discover">("Joined");

  // Load real communities from backend
  useEffect(() => {
    let active = true;
    api<any[]>("/communities")
      .then((items) => {
        if (!active || !items) return;
        const mapped: Community[] = items.map(c => ({
          id: c.id,
          name: c.name,
          badge: c.college ? c.college.substring(0, 2).toUpperCase() : "CM",
          members: `${c.memberCount || Math.floor(Math.random() * 500) + 10} members`,
          description: c.description || "A community on KNUST Pulse",
          category: c.college ? "college" : "interest",
          joined: false
        }));
        setCommunities([collegeHub, ...mapped.filter(m => m.id !== collegeHub.id)]);
      })
      .catch(console.error);
    return () => { active = false; };
  }, []);

  const joined = useMemo(() => communities.filter((item) => item.joined), [communities]);
  const discover = useMemo(() => communities.filter((item) => !item.joined), [communities]);

  const matches = useMemo(() => {
    const source = activeTab === "Joined" ? joined : discover;
    if (!query.trim()) return source;
    const lowered = query.toLowerCase();
    return source.filter((item) => item.name.toLowerCase().includes(lowered) || item.description.toLowerCase().includes(lowered));
  }, [discover, joined, query, activeTab]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);
    api<SearchResultItem[]>(`/search?q=${encodeURIComponent(trimmed)}`)
      .then((items) => {
        if (!active) return;
        setSearchResults(items.filter(i => i.kind === "community"));
      })
      .catch(() => {
        if (!active) return;
        setSearchResults([]);
      })
      .finally(() => {
        if (active) setSearchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const join = (id: number) => {
    setCommunities((prev) => prev.map((item) => (item.id === id ? { ...item, joined: true } : item)));
  };

  const leave = (id: number) => {
    if (id === 1) return;
    setCommunities((prev) => prev.map((item) => (item.id === id ? { ...item, joined: false } : item)));
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between border-b border-[#e6ebe5] dark:border-[#2f3336] sticky top-16 z-20 bg-[#ffffff]/95 dark:bg-[#000000]/95 backdrop-blur px-4 py-3">
        <label className="flex w-full items-center gap-3 rounded-full border border-[#cfd9de] dark:border-[#333639] bg-[#eff3f4] dark:bg-[#202327] px-4 py-2 focus-within:border-[var(--brand-primary)] focus-within:bg-white dark:focus-within:bg-black focus-within:ring-1 focus-within:ring-[var(--brand-primary)] transition">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-[#536471] dark:fill-[#71767b]"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none text-[15px] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b]" placeholder="Search communities" />
        </label>
      </div>
      <div className="flex border-b border-[#e6ebe5] dark:border-[#2f3336]">
        {(["Joined", "Discover"] as const).map((item) => (
          <button key={item} onClick={() => setActiveTab(item)} className={`flex-1 hover:bg-[#e7ece5] dark:hover:bg-black py-4 text-[15px] font-bold relative text-center transition ${activeTab === item ? "text-[#0f1419] dark:text-[#e7e9ea]" : "text-[#536471] dark:text-[#71767b]"}`}>
            {item}
            {activeTab === item && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-[var(--brand-primary)] rounded-full"></div>}
          </button>
        ))}
      </div>

      <div className="min-h-screen bg-white dark:bg-black">
        {query.trim() && searchResults.length > 0 ? (
          <div className="border-b border-[#e6ebe5] dark:border-[#2f3336]">
            {searchResults.map((item) => (
              <Link href={`/communities/${item.title.toLowerCase().replace(/\s+/g, '-')}`} key={item.id} className="flex items-center gap-3 border-b border-[#e6ebe5] dark:border-[#2f3336] p-4 hover:bg-[#f7f9f9] dark:hover:bg-black transition cursor-pointer">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-primary)] text-sm font-black text-white">
                  {item.title.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0f1419] dark:text-[#e7e9ea]">{item.title}</h3>
                  <p className="text-[15px] text-[#536471] dark:text-[#71767b]">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-b border-[#e6ebe5] dark:border-[#2f3336]">
            {matches.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-[#e6ebe5] dark:border-[#2f3336] p-4 hover:bg-[#f7f9f9] dark:hover:bg-black transition">
                <Link href={`/communities/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-sm font-black text-white hover:opacity-90">
                  {item.badge}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/communities/${item.name.toLowerCase().replace(/\s+/g, '-')}`} className="font-bold text-[#0f1419] dark:text-[#e7e9ea] hover:underline block truncate">
                    {item.name} {item.id === 1 && <span className="text-[10px] bg-[var(--brand-primary)] text-white px-1.5 py-0.5 rounded ml-2 align-middle">Primary</span>}
                  </Link>
                  <p className="text-[13px] text-[#536471] dark:text-[#71767b] mb-1">{item.members}</p>
                  <p className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] truncate">{item.description}</p>
                </div>
                <div>
                  {item.joined ? (
                    <button onClick={() => leave(item.id)} disabled={item.id === 1} className="rounded-full border border-[#cfd9de] dark:border-[#536471] px-4 py-1.5 text-[15px] font-bold text-[#0f1419] dark:text-[#e7e9ea] hover:bg-[#f4212e1a] hover:text-[#f4212e] hover:border-[#f4212e] transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]">
                      Joined
                    </button>
                  ) : (
                    <button onClick={() => join(item.id)} className="rounded-full bg-[#0f1419] dark:bg-[#e7e9ea] px-4 py-1.5 text-[15px] font-bold text-white dark:text-[#0f1419] hover:bg-[#272c30] dark:hover:bg-[#d7dbdc] transition min-w-[100px]">
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <div className="p-8 text-center text-[#536471] dark:text-[#71767b]">
                <h3 className="text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea] mb-2">No communities found</h3>
                <p>Try searching for something else or explore other tabs.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
