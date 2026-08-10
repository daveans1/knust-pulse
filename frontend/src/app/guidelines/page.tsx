"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "../lib/api";
import { FileText, AlertOctagon, Search, CheckCircle, FileSignature, Scale } from "lucide-react";

type Section = {
  id: string;
  emoji: React.ReactNode;
  title: string;
  content: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "overview",
    emoji: <FileText size={20} />,
    title: "Overview",
    content: (
      <div className="space-y-3 text-[15px] leading-relaxed">
        <p>
          KNUST Pulse is a campus social platform built for the KNUST community — students, academic staff, and administrators. We want it to be a space where you can share campus life, ask questions, connect with communities, and discuss ideas openly.
        </p>
        <p>
          To keep that space healthy, every post passes through our <strong>AI-powered Content Management System (CMS)</strong> before or after it goes live. This document explains what the system checks for, how content is rated, and what happens when something is flagged.
        </p>
      </div>
    ),
  },
  {
    id: "risk-tiers",
    emoji: <AlertOctagon size={20} />,
    title: "Content Risk Tiers",
    content: (
      <div className="space-y-4 text-[15px]">
        <p className="leading-relaxed">Every post receives a risk score from 0–100 across multiple categories. Based on the score, it is routed to one of four priority tiers:</p>
        <div className="space-y-3">
          {[
            { tier: "P1 · Urgent", score: "85 – 100", bg: "bg-red-500/10 border-red-500/30", badge: "bg-red-500", text: "text-red-500", action: "Auto-quarantined. Removed from all feeds immediately. Reviewed by a human admin.", desc: "Direct threats of violence, targeted self-harm instructions, severe harassment." },
            { tier: "P2 · High Risk", score: "65 – 84", bg: "bg-orange-500/10 border-orange-500/30", badge: "bg-orange-400", text: "text-orange-400", action: "Post is flagged and marked but stays visible. Goes into the admin review queue.", desc: "Strong personal attacks, high-density profanity, possible spam or academic fraud." },
            { tier: "P3 · Monitored", score: "40 – 64", bg: "bg-yellow-500/10 border-yellow-500/30", badge: "bg-yellow-400", text: "text-yellow-400", action: "Published normally. Tracked in safety logs. No immediate action.", desc: "Mild profanity, casual harsh language. Common in campus banter." },
            { tier: "P4 · Approved", score: "0 – 39", bg: "bg-green-500/10 border-green-500/30", badge: "bg-green-400", text: "text-green-400", action: "Published immediately. No flags.", desc: "Clean content that passes all checks." },
          ].map((t) => (
            <div key={t.tier} className={`rounded-xl border p-4 ${t.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`rounded-full px-3 py-0.5 text-[12px] font-bold text-white ${t.badge}`}>{t.tier}</span>
                <span className={`text-[13px] font-bold ${t.text}`}>Risk score: {t.score}</span>
              </div>
              <p className="text-[13px] font-semibold text-[#0f1419] dark:text-[#e7e9ea] mb-1">Action: {t.action}</p>
              <p className="text-[13px] text-[#536471] dark:text-[#71767b]">Typical triggers: {t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "what-we-filter",
    emoji: <Search size={20} />,
    title: "What the System Checks",
    content: (
      <div className="space-y-4 text-[15px]">
        <p className="leading-relaxed">Our system scores your post across four independent categories. Each category contributes to the overall risk score.</p>
        <div className="space-y-3">
          {[
            {
              cat: "A · Severe Harm & Threats",
              color: "text-red-500",
              dot: "bg-red-500",
              desc: "Looks for direct threats of physical violence, intimidation, or self-harm instructions aimed at other people. Examples: 'I will hurt you', 'come for you after class', 'beat you up'.",
              note: "Context matters: 'I killed that exam' or 'shoot a video' will not trigger this.",
            },
            {
              cat: "B · Targeted Harassment",
              color: "text-orange-400",
              dot: "bg-orange-400",
              desc: "Detects personal insults combined with direct targeting (you, he, she, they, @username). Examples: 'You are a worthless idiot', 'nobody likes you', 'you should just leave'.",
              note: "Generic frustration like 'this assignment is idiotic' won't score the same as targeting a person.",
            },
            {
              cat: "C · Vulgarity Density",
              color: "text-yellow-400",
              dot: "bg-yellow-400",
              desc: "Counts explicit profane words and measures the ratio to total words. One 'damn' in a long post scores low (15/100). Four or more vulgar words in a short sentence scores high (80+/100).",
              note: "Campus banter uses mild profanity — that's normal. Posts won't be removed just for one word unless it's combined with other categories.",
            },
            {
              cat: "D · Spam & Academic Fraud",
              color: "text-blue-400",
              dot: "bg-blue-400",
              desc: "Flags exam paper leaks, paid grades offers, scam promotions, or posts cramming multiple external links. Examples: 'exam answers for sale', 'buy your results', '100% pass guaranteed'.",
              note: "This directly targets academic integrity violations — a serious matter.",
            },
          ].map((c) => (
            <div key={c.cat} className="rounded-xl border border-[#e6ebe5] dark:border-[#2f3336] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${c.dot}`} />
                <span className={`font-bold text-[14px] ${c.color}`}>{c.cat}</span>
              </div>
              <p className="text-[14px] text-[#0f1419] dark:text-[#e7e9ea] leading-relaxed mb-2">{c.desc}</p>
              <p className="text-[13px] text-[#536471] dark:text-[#71767b]">✓ {c.note}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "safe-context",
    emoji: <CheckCircle size={20} />,
    title: "Safe Context — Words That Won't Flag You",
    content: (
      <div className="space-y-3 text-[15px] leading-relaxed">
        <p>The system understands context. Many words that look harmful are completely fine in everyday student speech. These will <strong>not</strong> trigger a flag:</p>
        <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
          <ul className="space-y-2 text-[14px] text-[#0f1419] dark:text-[#e7e9ea]">
            {[
              '"I killed that exam today 🔥" — positive slang, not a threat',
              '"We\'re shooting a video for the hall week" — photography context',
              '"The WiFi is absolute garbage" — technical complaint, not harassment',
              '"Damn, that lecture was actually good" — casual positive exclamation',
              '"Slay, bodied that, killed it" — positive campus slang',
              '"Garbage collector / garbage collection" — programming term',
              '"Fire up, attack the problem, attack that assignment" — motivational',
            ].map((ex) => (
              <li key={ex} className="flex items-start gap-2">
                <span className="text-green-500 shrink-0 font-bold">✓</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "rules",
    emoji: <FileSignature size={20} />,
    title: "Community Rules",
    content: (
      <div className="space-y-4 text-[15px]">
        <p className="leading-relaxed">Beyond what the AI checks, all KNUST Pulse members are expected to follow these rules. Violations may result in content removal or account suspension.</p>
        <div className="space-y-2">
          {[
            { n: "1", rule: "Be respectful", detail: "Disagree with ideas, not people. You can debate campus politics, exam policy, or hall week rankings — but keep it about the issue, not the person." },
            { n: "2", rule: "No threats or intimidation", detail: "Any content threatening physical harm, intimidation, or bullying of a specific person will be removed immediately, regardless of context." },
            { n: "3", rule: "No academic fraud", detail: "Selling, sharing, or soliciting leaked exam papers or paid grades is a serious academic offence. Such content will be removed and reported." },
            { n: "4", rule: "Keep profanity reasonable", detail: "Mild campus language is understood. But posts that are overwhelmingly vulgar — where every other word is explicit — will be flagged. Aim to express yourself clearly." },
            { n: "5", rule: "No spam", detail: "Don't flood the feed with repeated posts, unsolicited promotions, or external links. Share things that add genuine value to the campus community." },
            { n: "6", rule: "Respect privacy", detail: "Don't post other people's private information, photos, or contact details without consent." },
            { n: "7", rule: "No impersonation", detail: "Don't pretend to be a lecturer, SRC official, or other public figure. Be yourself." },
            { n: "8", rule: "Report harmful content", detail: "If you see something that violates these guidelines, use the three-dot menu on any post to report it. Admins review reports daily." },
          ].map((r) => (
            <div key={r.n} className="flex gap-4 rounded-xl border border-[#e6ebe5] dark:border-[#2f3336] p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">{r.n}</span>
              <div>
                <p className="font-bold text-[14px] text-[#0f1419] dark:text-[#e7e9ea]">{r.rule}</p>
                <p className="mt-0.5 text-[13px] text-[#536471] dark:text-[#71767b] leading-relaxed">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "appeals",
    emoji: <Scale size={20} />,
    title: "Appeals & Human Review",
    content: (
      <div className="space-y-3 text-[15px] leading-relaxed">
        <p>The AI is not perfect. If your post was flagged or removed and you believe it was an error:</p>
        <ul className="space-y-2">
          {[
            "Your flagged post is sent to a human admin in the Moderation Queue.",
            "Admins have full context and can approve, reject, or escalate flagged content.",
            "P1 (Urgent) content is auto-hidden pending human review — it is not permanently deleted until a human confirms.",
            "P2 (High Risk) content remains visible but labelled as under review while awaiting admin decision.",
            "If you believe your post was wrongly moderated, contact the KNUST Pulse admin team via the platform.",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="text-[var(--brand-primary)] font-bold shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 p-4 mt-2">
          <p className="text-[14px] font-semibold text-[#1d9bf0]">💡 Good to know</p>
          <p className="mt-1 text-[14px] text-[#0f1419] dark:text-[#e7e9ea]">The system is designed to be strict on real harm and loose on everyday campus language. If you&apos;re posting honestly and not targeting people, you&apos;ll almost never encounter a flag.</p>
        </div>
      </div>
    ),
  },
];

export default function GuidelinesPage() {
  const [active, setActive] = useState("overview");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const isLoggedIn = !!getSession();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-[#0f1419] dark:text-[#e7e9ea]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[#e6ebe5] dark:border-[#2f3336] bg-white/95 dark:bg-black/95 backdrop-blur px-4 py-3 flex items-center gap-4">
        <Link href="/" className="rounded-full p-2 hover:bg-[#e7e9ea1a] transition">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2z"></path></g></svg>
        </Link>
        <div>
          <h1 className="font-bold text-[17px]">Community Guidelines</h1>
          <p className="text-[13px] text-[#536471] dark:text-[#71767b]">KNUST Pulse Content Policy</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Sidebar nav (sticky on desktop) */}
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#536471] dark:text-[#71767b]">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${active === s.id ? "bg-[#1d9bf0]/10 text-[#1d9bf0]" : "text-[#536471] dark:text-[#71767b] hover:bg-[#e7e9ea1a] hover:text-[#0f1419] dark:hover:text-[#e7e9ea]"}`}
              >
                <span>{s.emoji}</span>
                <span>{s.title}</span>
              </a>
            ))}
            {mounted && !isLoggedIn && (
              <div className="mt-6 pt-6 border-t border-[#e6ebe5] dark:border-[#2f3336]">
                <Link href="/login" className="block w-full rounded-full bg-[#1d9bf0] px-4 py-2.5 text-center text-[14px] font-bold text-white hover:opacity-90 transition">
                  Sign in to KNUST Pulse
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Content */}
        <div className="space-y-12 pb-20">
          {/* Hero */}
          <div className="rounded-2xl bg-gradient-to-br from-[#1d9bf0]/10 to-[#f91880]/10 border border-[#1d9bf0]/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d9bf0] font-black text-white text-sm">KP</div>
              <div>
                <p className="font-bold text-[17px]">KNUST Pulse Community Guidelines</p>
                <p className="text-[13px] text-[#536471] dark:text-[#71767b]">Last updated: August 2026 · Version 2.0</p>
              </div>
            </div>
            <p className="text-[14px] text-[#536471] dark:text-[#71767b] leading-relaxed">
              These guidelines apply to all content posted on KNUST Pulse — posts, comments, direct messages, and community contributions. By using the platform, you agree to these terms.
            </p>
          </div>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{s.emoji}</span>
                <h2 className="font-bold text-[22px] text-[#0f1419] dark:text-[#e7e9ea]">{s.title}</h2>
              </div>
              <div className="text-[#0f1419] dark:text-[#e7e9ea]">{s.content}</div>
            </section>
          ))}

          {/* Footer CTA */}
          <div className="rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] bg-[#f7f9f9] dark:bg-black p-6 text-center">
            <p className="font-bold text-[18px] mb-2">Questions about these guidelines?</p>
            <p className="text-[14px] text-[#536471] dark:text-[#71767b] mb-4">Contact the KNUST Pulse admin team through the platform or reach out to your SRC representative.</p>
            {mounted && isLoggedIn ? (
              <Link href="/" className="inline-block rounded-full bg-[#1d9bf0] px-6 py-2.5 text-[14px] font-bold text-white hover:opacity-90 transition">
                Back to feed
              </Link>
            ) : mounted ? (
              <Link href="/login" className="inline-block rounded-full bg-[#1d9bf0] px-6 py-2.5 text-[14px] font-bold text-white hover:opacity-90 transition">
                Sign in to KNUST Pulse
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
