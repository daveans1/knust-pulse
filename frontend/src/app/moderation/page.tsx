"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../components/auth-guard";
import AppShell from "../components/app-shell";
import { api, getSession, timeAgo, type ModerationQueueItem } from "../lib/api";
import Highlighter from "react-highlight-words";
import { AlertOctagon, AlertTriangle, Search, Eye, Lock } from "lucide-react";
import { useToast } from "../components/toast";

const fallbackQueue: ModerationQueueItem[] = [];

type TierConfig = { label: string; text: string; bg: string; icon: React.ReactNode };

const tierConfig: Record<number, TierConfig> = {
  1: { label: "Quarantined", text: "text-red-500", bg: "bg-red-500/10", icon: <AlertOctagon size={16} /> },
  2: { label: "Remove & Review", text: "text-orange-500", bg: "bg-orange-500/10", icon: <AlertTriangle size={16} /> },
  3: { label: "Hide & Review", text: "text-yellow-500", bg: "bg-yellow-500/10", icon: <Search size={16} /> },
  4: { label: "Flag Passive", text: "text-blue-500", bg: "bg-blue-500/10", icon: <Eye size={16} /> },
};

function scoreToPriority(score: number): number {
  if (score >= 85) return 1;
  if (score >= 60) return 2;
  if (score >= 30) return 3;
  return 4;
}

function HighlightedText({ text, spans }: { text: string; spans?: any[] }) {
  if (!spans || spans.length === 0) return <span>{text}</span>;
  
  const searchWords = spans.map((span) => {
    if (Array.isArray(span)) return text.substring(span[0], span[1]);
    return text.substring(span.start, span.end);
  });

  return (
    <Highlighter
      highlightClassName="bg-red-500/20 text-red-500 px-1 rounded-md"
      searchWords={searchWords}
      autoEscape={true}
      textToHighlight={text}
    />
  );
}

export default function ModerationPage() {
  return (
    <AuthGuard>
      <ModerationView />
    </AuthGuard>
  );
}

function ModerationView() {
  const session = getSession();
  const isAdmin = session?.user.role === "ADMIN_STAFF" || session?.user.role === "PROJECT_STAFF";

  const [queue, setQueue] = useState<ModerationQueueItem[]>(fallbackQueue);
  const [offline, setOffline] = useState(false);
  const [filterTier, setFilterTier] = useState<number | "all">("all");
  const [deciding, setDeciding] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const { toast } = useToast();

  const loadQueue = async () => {
    let apiItems: ModerationQueueItem[] = [];
    try {
      apiItems = await api<ModerationQueueItem[]>("/moderation/queue");
      setOffline(false);
    } catch {
      setOffline(true);
      apiItems = fallbackQueue;
    }

    try {
      const stored = localStorage.getItem("knust-pulse-moderation-reports");
      const userReports: ModerationQueueItem[] = stored ? JSON.parse(stored) : [];
      if (userReports.length) {
        const combined = [...userReports, ...apiItems].filter(
          (item, idx, self) => self.findIndex((i) => i.postId === item.postId) === idx
        );
        setQueue(combined);
        return;
      }
    } catch (err) {
      console.error("Error loading local moderation reports:", err);
    }
    setQueue(apiItems);
  };

  useEffect(() => { void loadQueue(); }, []);

  // Connect to SSE for real-time alerts
  useEffect(() => {
    if (!isAdmin) return;
    const token = session?.token;
    if (!token) return;

    const eventSource = new EventSource(`${getApiUrl()}/moderation/stream?access_token=${token}`);
    
    eventSource.addEventListener("urgent_alert", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast(`Urgent Escalation: ${data.author} just posted a severe violation!`, "error");
        void loadQueue(); // Auto-refresh queue
      } catch (err) {}
    });

    return () => eventSource.close();
  }, [isAdmin, session]);

  const decide = async (postId: number, decision: "APPROVE" | "REMOVE" | "REVIEW") => {
    setDeciding(postId);
    try {
      const stored = localStorage.getItem("knust-pulse-moderation-reports");
      if (stored) {
        const list: ModerationQueueItem[] = JSON.parse(stored);
        localStorage.setItem("knust-pulse-moderation-reports", JSON.stringify(list.filter((i) => i.postId !== postId)));
      }
    } catch (err) {}

    try {
      await api<ModerationQueueItem>(`/moderation/posts/${postId}/decision`, { method: "PATCH", body: JSON.stringify({ decision }) });
      await loadQueue();
    } catch {
      setOffline(true);
      if (decision === "REVIEW") {
        setQueue((prev) => prev.map((item) => item.postId === postId ? { ...item, status: "ESCALATED" } : item));
      } else {
        setQueue((prev) => prev.filter((item) => item.postId !== postId));
      }
    } finally {
      setDeciding(null);
    }
  };

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Access Restricted</h1>
          <p className="text-gray-600 dark:text-[#a1a1aa] max-w-sm leading-relaxed">The moderation center is restricted to authorized trust and safety personnel only.</p>
        </div>
      </AppShell>
    );
  }

  const sorted = [...queue].sort((a, b) => b.aiScore - a.aiScore);
  const filtered = filterTier === "all" ? sorted : sorted.filter(item => scoreToPriority(item.aiScore) === filterTier);

  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  queue.forEach(item => { const t = scoreToPriority(item.aiScore); tierCounts[t as keyof typeof tierCounts]++; });

  const handleBulkAction = async (decision: "APPROVE" | "REMOVE") => {
    if (selectedItems.size === 0) return;
    const itemsToProcess = Array.from(selectedItems);
    for (const id of itemsToProcess) await decide(id, decision);
    setSelectedItems(new Set());
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f7f9f9] dark:bg-[#09090b] text-black dark:text-white">
        {/* Sleek Header */}
        <div className="relative px-8 pt-12 pb-8 z-20 border-b border-black/10 dark:border-white/5 overflow-hidden bg-[#f7f9f9] dark:bg-[#09090b]/90 backdrop-blur-3xl sticky top-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-[#09090b]/50 to-[#09090b] z-0 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500/30 to-transparent z-0" />
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="text-[12px] font-bold tracking-widest text-red-500 uppercase">Live Queue</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">Moderation Center</h1>
              <p className="text-gray-600 dark:text-[#a1a1aa] max-w-lg text-sm leading-relaxed">Real-time content evaluation. High-risk items are automatically quarantined here for human verification before publishing.</p>
            </div>
            
            <div className="flex gap-2 bg-white dark:bg-[#18181b] p-1.5 rounded-2xl border border-black/10 dark:border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
              <button onClick={() => { setFilterTier("all"); setSelectedItems(new Set()); }} className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filterTier === "all" ? "bg-gray-200 dark:bg-[#27272a] text-black dark:text-white shadow-md" : "text-gray-600 dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/5 hover:bg-black/10 dark:bg-white/5"}`}>
                All ({queue.length})
              </button>
              {([1, 2, 3] as const).map(tier => {
                const cfg = tierConfig[tier];
                return (
                  <button key={tier} onClick={() => { setFilterTier(tier); setSelectedItems(new Set()); }} className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${filterTier === tier ? "bg-gray-200 dark:bg-[#27272a] text-black dark:text-white shadow-md" : "text-gray-600 dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/5 hover:bg-black/10 dark:bg-white/5"}`}>
                    <span className={cfg.text}>{cfg.icon}</span>
                    <span className="hidden sm:inline">{cfg.label}</span>
                    <span className="bg-gray-200 dark:bg-black/40 px-2 py-0.5 rounded-md text-xs">{tierCounts[tier]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clean bulk actions */}
        {selectedItems.size > 0 && (
          <div className="px-8 py-4 bg-white dark:bg-[#18181b] border-b border-black/10 dark:border-white/5 flex items-center justify-between sticky top-[138px] z-10 animate-in fade-in slide-in-from-top-4">
            <span className="text-sm font-medium">{selectedItems.size} items selected</span>
            <div className="flex gap-3">
              <button onClick={() => handleBulkAction("APPROVE")} className="px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 hover:bg-green-500/20 text-green-500 rounded-lg text-sm font-semibold transition-colors">Approve Selected</button>
              <button onClick={() => handleBulkAction("REMOVE")} className="px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition-colors">Remove Selected</button>
            </div>
          </div>
        )}

        {/* Queue Items Layout */}
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 bg-black/5 hover:bg-black/10 dark:bg-white/5 text-black dark:text-white/40 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">✨</div>
              <h3 className="text-xl font-semibold mb-2">Queue is clear</h3>
              <p className="text-gray-600 dark:text-[#a1a1aa]">No pending items require your attention.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const tier = scoreToPriority(item.aiScore);
              const cfg = tierConfig[tier];
              const isSuspended = item.authorSuspendedUntil && new Date(item.authorSuspendedUntil) > new Date();
              
              return (
                <article key={item.postId} className={`group relative bg-white dark:bg-[#18181b] border ${selectedItems.has(item.postId) ? 'border-[var(--brand-primary)]' : 'border-black/10 dark:border-white/5'} rounded-2xl overflow-hidden transition-all hover:border-black/10 dark:border-white/10`}>
                  
                  {/* Score Indicator Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${tier === 1 ? 'bg-red-500' : tier === 2 ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  
                  <div className="p-6 pl-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox"
                          checked={selectedItems.has(item.postId)}
                          onChange={() => {
                            const next = new Set(selectedItems);
                            if (next.has(item.postId)) next.delete(item.postId);
                            else next.add(item.postId);
                            setSelectedItems(next);
                          }}
                          className="w-4 h-4 rounded bg-[#f7f9f9] dark:bg-[#09090b] border-black/20 dark:border-white/20 text-[var(--brand-primary)] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-[15px]">{item.authorName}</h3>
                            {isSuspended ? (
                              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">Suspended</span>
                            ) : item.authorViolationCount ? (
                              <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider">{item.authorViolationCount} Strikes</span>
                            ) : null}
                          </div>
                          <p className="text-[12px] text-gray-600 dark:text-[#a1a1aa] mt-0.5">{timeAgo(item.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          Risk Score: {Math.round(item.aiScore)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#f7f9f9] dark:bg-[#09090b]/50 border border-black/10 dark:border-white/5 rounded-xl p-5 mb-5 text-[15px] leading-relaxed">
                      <HighlightedText text={item.content} spans={item.highlightSpans} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-[#a1a1aa]">Flagged for:</span>
                        <span className="font-medium text-black dark:text-white">{item.flaggedReason}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(item.postId, "APPROVE")}
                          disabled={deciding === item.postId}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-black/5 hover:bg-black/10 dark:bg-white/5 hover:bg-green-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => decide(item.postId, "REMOVE")}
                          disabled={deciding === item.postId}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-black/5 hover:bg-black/10 dark:bg-white/5 hover:bg-red-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
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
