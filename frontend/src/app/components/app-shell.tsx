"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearSession, getSession, getTheme, initials, roleLabel, saveTheme, type PulseUser, type ThemeMode } from "../lib/api";
import { seedUsers } from "../lib/seed-data";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function HomeIcon()          { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.29.19-.455.507-.455.84V19.5c0 .852.648 1.5 1.5 1.5H9c.852 0 1.5-.648 1.5-1.5v-7h3v7c0 .852.648 1.5 1.5 1.5h6.046c.852 0 1.5-.648 1.5-1.5V7.986c0-.333-.165-.65-.455-.84z"></path></g></svg>; }
function SearchIcon()        { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"></path></g></svg>; }
function CommIcon()          { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path></g></svg>; }
function MsgIcon()           { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V18.5c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5V5.5zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5V10.463z"></path></g></svg>; }
function ProfileIcon()       { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M17.863 13.44c1.477 1.58 2.366 3.681 2.367 5.946L20.229 21l-1.854-.001-.002-1.615c-.001-1.96-.929-3.799-2.49-5.044l1.98-1zM12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.105 0 2 .896 2 2s-.895 2-2 2-2-.896-2-2 .895-2 2-2zm-.53 13H3.77l-.002-1.615c-.001-2.264.89-4.366 2.367-5.944l1.98 1C6.553 13.585 5.625 15.424 5.624 17.384L5.622 19h5.851l-.003 2z"></path></g></svg>; }
function ShieldIcon()        { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M12 1.5l-10 4v6.5c0 5.55 4.27 10.74 10 12 5.73-1.26 10-6.45 10-12V5.5L12 1.5zm8 9c0 4.52-3.02 8.73-8 10.18C6.98 19.22 4 15.04 4 10.5v-5.4l8-3.2 8 3.2V10.5z"></path></g></svg>; }
function AnalyticsIcon()     { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>; }
function AnnouncementIcon()  { return <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-current"><g><path d="M19.202 2h-1.93l.716 4H4.998l1 6h11.5v7h2v-7h.246l.86-4H20.5l.718-4h-1.93L18.57 2h.632zM16.032 10l-.5 3H6.466l-.5-3h10.066z"></path></g></svg>; }
function SunIcon()           { return <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z"></path></g></svg>; }
function MoonIcon()          { return <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path></g></svg>; }
function PeopleIcon()        { return <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M17.863 13.44c1.477 1.58 2.366 3.681 2.367 5.946L20.229 21H3.773l-.002-1.615c-.001-2.264.89-4.366 2.367-5.944l1.98 1C6.553 15.585 5.625 17.424 5.624 19.384L5.622 19h12.756l-.003-1.616c-.001-1.96-.929-3.799-2.49-5.044l1.98-1zM12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.105 0 2 .896 2 2s-.895 2-2 2-2-.896-2-2 .895-2 2-2z"></path></g></svg>; }

const sharedNav: NavItem[] = [
  { href: "/", label: "Home", icon: <HomeIcon /> },
  { href: "/search", label: "Search", icon: <SearchIcon /> },
  { href: "/communities", label: "Communities", icon: <CommIcon /> },
  { href: "/messages", label: "Messages", icon: <MsgIcon /> },
];
const adminNav: NavItem[] = [
  { href: "/moderation", label: "Moderation", icon: <ShieldIcon /> },
  { href: "/safety", label: "Safety & Analytics", icon: <AnalyticsIcon /> },
];
const staffNav: NavItem[] = [{ href: "/announcements", label: "Announcements", icon: <AnnouncementIcon /> }];

// Removed static recommendedUsers

export default function AppShell({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PulseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<HTMLDivElement>(null);

  // Load user session
  useEffect(() => {
    const session = getSession();
    if (!session) return;
    setUser(session.user);
  }, []);

  // Load + apply saved theme (runs once, before transitions enabled)
  useEffect(() => {
    const saved = getTheme();
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
    document.documentElement.style.colorScheme = saved;
  }, []);

  // Apply theme changes
  const applyTheme = useCallback((next: ThemeMode) => {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    saveTheme(next);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search query sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSearchQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  const navItems = useMemo(() => {
    const isAdmin = user?.role === "ADMIN_STAFF" || user?.role === "PROJECT_STAFF";
    const isStaff = user?.role === "ACADEMIC_STAFF";
    return [
      ...sharedNav,
      ...(isStaff ? staffNav : []),
      ...(isAdmin ? adminNav : []),
      { href: `/profile/${user?.id ?? ""}`, label: "Profile", icon: <ProfileIcon /> },
    ];
  }, [user]);

  // Personalized recommendations
  const recommendedUsers = useMemo(() => {
    if (!user) return seedUsers.slice(0, 8);
    // If admin or staff, recommend other staff
    if (user.role === "ADMIN_STAFF" || user.role === "ACADEMIC_STAFF") {
      return seedUsers.filter(u => u.role !== "STUDENT" && u.id !== user.id).slice(0, 5);
    }
    // For students, prioritize same college or role
    const sameCollege = seedUsers.filter(u => u.college === user.college && u.id !== user.id);
    const others = seedUsers.filter(u => u.college !== user.college && u.id !== user.id);
    return [...sameCollege, ...others].slice(0, 8);
  }, [user]);

  const signOut = () => { clearSession(); router.push("/login"); };

  const runSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const toggleFollow = (id: number) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAdmin = user?.role === "ADMIN_STAFF" || user?.role === "PROJECT_STAFF";
  const isMessages = pathname === "/messages" || pathname.startsWith("/messages/");
  const hideRight = fullWidth || isMessages;

  return (
    <div className="min-h-screen bg-white text-[#0f1419] dark:bg-black dark:text-[#e7e9ea]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-[#e6ebe5] dark:border-[#2f3336] bg-white/95 dark:bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="KNUST Pulse">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1d9bf0] text-sm font-black text-white shadow-sm">KP</span>
            <span className="hidden font-bold text-lg tracking-tight text-[#1d9bf0] sm:block">KNUST Pulse</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={runSearch} className="hidden flex-1 max-w-sm md:block mx-auto">
            <label className="flex items-center gap-2 rounded-full bg-[#eff3f4] dark:bg-[#202327] px-4 py-2 text-sm text-[#536471] dark:text-[#71767b] focus-within:ring-1 focus-within:ring-[#1d9bf0] focus-within:bg-white dark:focus-within:bg-black transition">
              <SearchIcon />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b]"
                placeholder="Search Pulse"
              />
            </label>
          </form>

          {/* Right controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#e7e9ea1a] transition text-[#536471] dark:text-[#71767b]"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-[#e7e9ea1a] transition"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1d9bf0] text-xs font-bold text-white shrink-0">
                  {user ? initials(user) : "KP"}
                </span>
                <span className="hidden max-w-[120px] truncate text-[15px] font-semibold sm:block">
                  {user?.fullName ?? ""}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-black p-2 shadow-2xl">
                  {user && (
                    <div className="px-3 py-2 mb-1 border-b border-[#e6ebe5] dark:border-[#2f3336]">
                      <p className="font-bold text-sm truncate">{user.fullName}</p>
                      <p className="text-[12px] text-[#536471] dark:text-[#71767b]">{roleLabel(user.role)}</p>
                    </div>
                  )}
                  <Link href={`/profile/${user?.id}`} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-[14px] font-semibold hover:bg-[#eff3f4] dark:hover:bg-[#202327] transition">
                    View profile
                  </Link>
                  <Link href="/guidelines" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2 text-[14px] font-semibold hover:bg-[#eff3f4] dark:hover:bg-[#202327] transition">
                    Community guidelines
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); applyTheme(theme === "dark" ? "light" : "dark"); }}
                    className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-[14px] font-semibold hover:bg-[#eff3f4] dark:hover:bg-[#202327] transition"
                  >
                    {theme === "dark" ? <><SunIcon /><span>Light mode</span></> : <><MoonIcon /><span>Dark mode</span></>}
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-red-500 hover:bg-[#eff3f4] dark:hover:bg-[#202327] transition"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body grid ── */}
      <div className={`mx-auto grid max-w-[1440px] ${hideRight ? "lg:grid-cols-[275px_1fr]" : "lg:grid-cols-[275px_minmax(0,600px)_350px]"}`}>
        {/* Left sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:items-end lg:pr-4 lg:pt-2">
          <nav className="sticky top-20 flex flex-col gap-1 w-64">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-full px-4 py-3 text-[20px] font-semibold transition hover:bg-[#e7e9ea1a] ${active ? "font-bold text-[#1d9bf0]" : "text-[#0f1419] dark:text-[#e7e9ea]"}`}
                >
                  <span className={active ? "text-[#1d9bf0]" : ""}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  const textarea = document.querySelector('textarea');
                  if (textarea) { textarea.focus(); textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                } else {
                  router.push('/');
                }
              }}
              className="mt-4 rounded-full bg-[#1d9bf0] px-6 py-3 text-[17px] font-bold text-white hover:opacity-90 transition"
            >
              Post
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 border-x border-[#e6ebe5] dark:border-[#2f3336] min-h-screen">{children}</main>

        {/* Right sidebar */}
        {!hideRight && (
          <aside className="hidden lg:block lg:pl-4 lg:pt-2">
            <div className="sticky top-20 space-y-4 w-full max-w-[320px]">

              <section className="rounded-2xl bg-[#f7f9f9] dark:bg-black overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <h2 className="font-bold text-[18px]">Who to follow</h2>
                </div>

                <div className="px-4 pb-2 space-y-3">
                  {recommendedUsers
                    .filter((u) => u.id !== user?.id)
                    .slice(0, showAllRecs ? undefined : 3)
                    .map((rec) => (
                      <div key={rec.id} className="flex items-center gap-3">
                        <Link href={`/profile/${rec.id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1d9bf0] text-xs font-bold text-white hover:opacity-80 transition">
                          {initials(rec)}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/profile/${rec.id}`} className="block font-bold text-[14px] truncate hover:underline">
                            {rec.fullName}
                          </Link>
                          <p className="text-[12px] text-[#536471] dark:text-[#71767b] truncate">@{rec.email.split("@")[0]}</p>
                        </div>
                        <button
                          onClick={() => toggleFollow(rec.id)}
                          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
                            followed.has(rec.id)
                              ? "border border-[#cfd9de] dark:border-[#536471] text-[#0f1419] dark:text-[#e7e9ea] hover:border-red-400 hover:text-red-400"
                              : "bg-[#0f1419] dark:bg-[#e7e9ea] text-white dark:text-[#0f1419] hover:opacity-80"
                          }`}
                        >
                          {followed.has(rec.id) ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))}
                </div>
                
                {recommendedUsers.length > 3 && (
                  <button 
                    onClick={() => setShowAllRecs(!showAllRecs)} 
                    className="w-full text-left px-4 py-3 text-[14px] font-bold text-[#1d9bf0] hover:bg-[#e7e9ea1a] transition"
                  >
                    {showAllRecs ? "Show less" : "Show more"}
                  </button>
                )}
              </section>

              {/* Trending */}
              <section className="rounded-2xl bg-[#f7f9f9] dark:bg-black p-4">
                <h2 className="font-bold text-[18px] mb-3">Trending at KNUST</h2>
                <div className="space-y-3">
                  {[
                    { tag: "#KatangaHallWeek", term: "Katanga", posts: "2,847 posts" },
                    { tag: "#MidsemSeason",    term: "midsem",  posts: "1,203 posts" },
                    { tag: "#EduroamDown",     term: "Eduroam", posts: "892 posts" },
                    { tag: "#SRCElections",    term: "SRC",     posts: "654 posts" },
                    { tag: "#KNUSTPulse",      term: "KNUST",   posts: "431 posts" },
                  ].map((t) => (
                    <Link
                      key={t.tag}
                      href={`/search?q=${encodeURIComponent(t.term)}`}
                      className="block rounded-lg -mx-2 px-2 py-1.5 hover:bg-[#e7e9ea1a] transition"
                    >
                      <p className="text-[12px] text-[#536471] dark:text-[#71767b]">Trending · KNUST</p>
                      <p className="font-bold text-[15px]">{t.tag}</p>
                      <p className="text-[12px] text-[#536471] dark:text-[#71767b]">{t.posts}</p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Admin quick links */}
              {isAdmin && (
                <section className="rounded-2xl border border-red-900/30 bg-red-50 dark:bg-red-950/20 p-4">
                  <h2 className="font-bold text-[14px] text-red-700 dark:text-red-400 mb-2">⚠ Admin Tools</h2>
                  <div className="space-y-1.5">
                    <Link href="/moderation" className="block text-[13px] font-semibold text-red-600 dark:text-red-400 hover:underline">Moderation Queue</Link>
                    <Link href="/safety"     className="block text-[13px] font-semibold text-red-600 dark:text-red-400 hover:underline">Safety & Platform Analytics</Link>
                  </div>
                </section>
              )}

              {/* Guidelines link */}
              <Link href="/guidelines" target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] bg-[#f7f9f9] dark:bg-black px-4 py-3 text-[13px] text-[#536471] dark:text-[#71767b] hover:bg-[#eff3f4] dark:hover:bg-[#1d1f23] transition">
                <span className="font-bold text-[#1d9bf0]">Community Guidelines</span>
                <span className="ml-1">· Content policy · What we filter</span>
              </Link>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-black px-2 py-2 lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`grid place-items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-bold transition ${active ? "text-[#1d9bf0]" : "text-[#536471] dark:text-[#71767b]"}`}
            >
              <span>{item.icon}</span>
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
