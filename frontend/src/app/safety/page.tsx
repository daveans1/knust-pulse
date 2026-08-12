"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../components/auth-guard";
import AppShell from "../components/app-shell";
import { api, getSession, type UserSummary, type ModerationResult } from "../lib/api";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

type SafetyMetrics = {
  totalAnalyzed: number;
  autoApproved: number;
  flagRate: number;
  urgentCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  approvedCount: number;
  avgRiskScore: number;
  categoryBreakdown: {
    severe_harm: number;
    harassment: number;
    vulgarity: number;
    spam: number;
  };
  collegeScores: Array<{ college: string; score: number; posts: number }>;
};

const fallbackMetrics: SafetyMetrics = {
  totalAnalyzed: 0,
  autoApproved: 0,
  flagRate: 0,
  urgentCount: 0,
  highRiskCount: 0,
  mediumRiskCount: 0,
  approvedCount: 0,
  avgRiskScore: 0,
  categoryBreakdown: { severe_harm: 0, harassment: 0, vulgarity: 0, spam: 0 },
  collegeScores: [],
};

const tierColors: Record<string, { bg: string; text: string; label: string; ring: string }> = {
  "1": { bg: "bg-red-500/10", text: "text-red-500", label: "Quarantined", ring: "ring-red-500/30" },
  "2": { bg: "bg-orange-500/10", text: "text-orange-400", label: "Remove & Review", ring: "ring-orange-500/30" },
  "3": { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Hide & Review", ring: "ring-yellow-500/30" },
  "4": { bg: "bg-green-500/10", text: "text-green-400", label: "Flag Passive / Allow", ring: "ring-green-500/30" },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-[#a1a1aa]">
        <span>{label}</span>
        <span className="text-black dark:text-white">{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  );
}

export default function SafetyPage() {
  const session = getSession();
  const isAdmin = session?.user.role === "ADMIN_STAFF" || session?.user.role === "PROJECT_STAFF";

  return (
    <AuthGuard>
      <AppShell fullWidth>
        {isAdmin ? <SafetyView /> : <AccessDeniedView />}
      </AppShell>
    </AuthGuard>
  );
}

function AccessDeniedView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-3xl font-bold mb-3 tracking-tight">Access Restricted</h1>
      <p className="text-gray-600 dark:text-[#a1a1aa] max-w-sm leading-relaxed">The Safety & Analytics Center is restricted to authorized administrative personnel.</p>
    </div>
  );
}

function SafetyView() {
  const [metrics, setMetrics] = useState<SafetyMetrics>(fallbackMetrics);
  const [violators, setViolators] = useState<UserSummary[]>([]);
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<ModerationResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  useEffect(() => {
    const engineUrl = process.env.NEXT_PUBLIC_MODERATION_ENGINE_URL || "https://knust-pulse-ai.onrender.com";
    fetch(`${engineUrl}/health`)
      .then((r) => { if (r.ok) setBackendAvailable(true); })
      .catch(() => {});

    // Load top violators
    api<UserSummary[]>("/analytics/violators")
      .then((res) => { if (res) setViolators(res); })
      .catch(() => {});

    // Load actual summary metrics
    api<SafetyMetrics>("/analytics/summary")
      .then((res) => { if (res) setMetrics(res); })
      .catch(() => {});
  }, []);

  const runTest = async () => {
    if (!testText.trim()) return;
    setTesting(true);
    try {
      const engineUrl = process.env.NEXT_PUBLIC_MODERATION_ENGINE_URL || "https://knust-pulse-ai.onrender.com";
      const response = await fetch(`${engineUrl}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, author_id: "anonymous" }),
      });
      if (response.ok) {
        setTestResult(await response.json());
      } else {
        alert("AI Engine returned an error. Ensure the Python API is running.");
      }
    } catch {
      alert("AI Engine is completely offline. Ensure the Python API is running.");
    } finally {
      setTesting(false);
    }
  };

  const tierData = [
    { label: "Quarantined", count: metrics.urgentCount, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Remove & Review", count: metrics.highRiskCount, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Hide & Review", count: metrics.mediumRiskCount, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Flag Passive", count: metrics.approvedCount, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="bg-[#f7f9f9] dark:bg-[#09090b] text-black dark:text-white min-h-screen">
      {/* Sleek Header */}
      <div className="px-8 py-10 border-b border-black/10 dark:border-white/5 sticky top-0 bg-[#f7f9f9] dark:bg-[#09090b]/90 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-2 w-2 rounded-full ${backendAvailable ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`} />
              <span className="text-[11px] font-bold tracking-widest text-black dark:text-white/50 uppercase">Safety & Analytics</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Intelligence</h1>
          </div>
          <Link href="/moderation" className="px-5 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-sm font-semibold transition-colors border border-black/10 dark:border-white/5">
            Open Moderation Queue →
          </Link>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Analyzed Today", value: metrics.totalAnalyzed.toLocaleString(), color: "text-blue-400" },
            { label: "Auto-Approved", value: `${((metrics.autoApproved / metrics.totalAnalyzed) * 100).toFixed(1)}%`, color: "text-green-400" },
            { label: "Flag Rate", value: `${Math.round(metrics.flagRate)}%`, color: "text-orange-400" },
            { label: "Avg Risk Score", value: metrics.avgRiskScore.toFixed(1), color: "text-black dark:text-white" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#18181b] p-6 transition hover:border-black/10 dark:border-white/10">
              <p className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa]">{kpi.label}</p>
              <p className={`text-4xl font-bold mt-2 tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Top Violators & Enforcement */}
            <section className="rounded-3xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#18181b] overflow-hidden">
              <div className="p-6 border-b border-black/10 dark:border-white/5">
                <h2 className="text-lg font-bold">Top Violators & Enforcement Actions</h2>
                <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mt-1">Users actively carrying penalty strikes or suspensions</p>
              </div>
              
              {violators.length === 0 ? (
                <div className="p-10 text-center text-gray-600 dark:text-[#a1a1aa] text-sm">
                  No users currently have penalty strikes.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/5 hover:bg-black/10 dark:bg-white/5 text-gray-600 dark:text-[#a1a1aa] font-medium">
                      <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Strikes</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {violators.map(user => {
                        const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
                        return (
                          <tr key={user.id} className="hover:bg-black/5 hover:bg-black/10 dark:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-black dark:text-white">{user.fullName}</div>
                              <div className="text-[11px] text-gray-600 dark:text-[#a1a1aa] mt-0.5">{user.college}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-[#a1a1aa]">{user.role.replace("_", " ")}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${user.violationCount > 1 ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                {user.violationCount} Strikes
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isSuspended ? (
                                <span className="px-2.5 py-1 rounded-md font-bold text-xs bg-red-500/10 text-red-500">
                                  SUSPENDED
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-md font-bold text-xs bg-green-500/10 text-green-500">
                                  ACTIVE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Interactive Playground */}
            <section className="rounded-3xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#18181b] p-6">
              <h2 className="text-lg font-bold mb-1">Content Analysis Playground</h2>
              <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mb-6">Test the live 5-category pipeline</p>
              
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#f7f9f9] dark:bg-[#09090b] text-black dark:text-white placeholder-[#a1a1aa] p-5 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] resize-none transition-all"
                rows={4}
                placeholder="Paste any text here to analyze..."
              />
              
              <div className="mt-4 flex gap-3 flex-wrap">
                <button onClick={runTest} disabled={!testText.trim() || testing} className="rounded-xl bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50">
                  {testing ? "Analyzing..." : "Analyze"}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setTestText("I killed that exam today! 🔥")} className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2.5 text-xs font-semibold hover:bg-black/5 hover:bg-black/10 dark:bg-white/5 transition text-gray-600 dark:text-[#a1a1aa]">Safe context</button>
                  <button onClick={() => setTestText("This shit is so damn bullshit I'm done with this place")} className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2.5 text-xs font-semibold hover:bg-black/5 hover:bg-black/10 dark:bg-white/5 transition text-gray-600 dark:text-[#a1a1aa]">High Vulgarity</button>
                  <button onClick={() => setTestText("You are a worthless idiot who should just leave KNUST")} className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2.5 text-xs font-semibold hover:bg-black/5 hover:bg-black/10 dark:bg-white/5 transition text-gray-600 dark:text-[#a1a1aa]">Harassment</button>
                </div>
              </div>

              {testResult && (
                <div className={`mt-8 rounded-2xl p-6 bg-[#f7f9f9] dark:bg-[#09090b] border border-black/10 dark:border-white/5`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className={`text-xl font-bold ${tierColors[testResult.priority_tier || "4"]?.text}`}>{tierColors[testResult.priority_tier || "4"]?.label}</p>
                      <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mt-1 uppercase tracking-wider font-semibold">Action: {testResult.action}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-4xl font-bold tracking-tight ${tierColors[testResult.priority_tier || "4"]?.text}`}>{testResult.overall_risk_score.toFixed(1)}</p>
                      <p className="text-xs text-gray-600 dark:text-[#a1a1aa] mt-1 font-medium">Risk Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <ScoreBar label="Severe Harm / Threats" score={testResult.category_scores?.severe_harm || 0} color="bg-red-600" />
                    <ScoreBar label="Indirect Harm / Self-Harm" score={testResult.category_scores?.indirect_harm || 0} color="bg-red-500" />
                    <ScoreBar label="Hate Speech" score={testResult.category_scores?.hate_speech || 0} color="bg-orange-600" />
                    <ScoreBar label="Sexual Harassment" score={testResult.category_scores?.sexual_harassment || 0} color="bg-orange-500" />
                    <ScoreBar label="Harassment / Bullying" score={testResult.category_scores?.harassment || 0} color="bg-yellow-500" />
                    <ScoreBar label="Vulgarity Density" score={testResult.category_scores?.vulgarity_density || 0} color="bg-yellow-400" />
                    <ScoreBar label="Spam / Fraud" score={testResult.category_scores?.spam || 0} color="bg-blue-500" />
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            {/* CMS Priority Routing */}
            <section className="rounded-3xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#18181b] p-6">
              <h2 className="text-lg font-bold mb-4">Pipeline Routing</h2>
              <div className="space-y-3">
                {tierData.map((t) => (
                  <div key={t.label} className={`rounded-2xl p-4 flex items-center justify-between border border-black/10 dark:border-white/5 ${t.bg}`}>
                    <span className={`text-sm font-semibold ${t.color}`}>{t.label}</span>
                    <span className={`text-xl font-bold ${t.color}`}>{t.count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Category Breakdown */}
            <section className="rounded-3xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#18181b] p-6">
              <h2 className="text-lg font-bold mb-6">Flagged Categories</h2>
              <div className="space-y-4">
                {[
                  { label: "Harassment", count: metrics.categoryBreakdown.harassment, color: "bg-orange-500" },
                  { label: "Vulgarity", count: metrics.categoryBreakdown.vulgarity, color: "bg-yellow-500" },
                  { label: "Severe Harm", count: metrics.categoryBreakdown.severe_harm, color: "bg-red-500" },
                  { label: "Spam", count: metrics.categoryBreakdown.spam, color: "bg-blue-500" },
                ].map((cat) => {
                  const total = Object.values(metrics.categoryBreakdown).reduce((a, b) => a + b, 0);
                  return (
                    <div key={cat.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-600 dark:text-[#a1a1aa]">{cat.label}</span>
                        <span className="text-black dark:text-white">{cat.count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5">
                        <div className={`h-full rounded-full ${cat.color}`} style={{ width: total > 0 ? `${(cat.count / total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            
            {/* College Safety Scorecard */}
            <section className="rounded-3xl border border-black/10 dark:border-white/5 bg-white dark:bg-[#18181b] p-6">
              <h2 className="text-lg font-bold mb-6">College Safety Score</h2>
              <div className="space-y-4">
                {(metrics.collegeScores || []).length > 0 ? (metrics.collegeScores || []).map((c) => (
                  <div key={c.college} className="flex items-center gap-4">
                    <div className="w-12 text-xs font-bold text-gray-600 dark:text-[#a1a1aa] text-right">{c.college}</div>
                    <div className="flex-1 h-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5">
                      <div className={`h-full rounded-full ${c.score >= 90 ? "bg-green-500" : c.score >= 80 ? "bg-yellow-500" : "bg-orange-500"}`} style={{ width: `${c.score}%` }} />
                    </div>
                    <div className="w-8 text-xs font-bold text-black dark:text-white text-right">{c.score}</div>
                  </div>
                )) : (
                  <div className="text-sm text-[#536471] dark:text-[#71767b] text-center py-4">No evaluations available yet</div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
