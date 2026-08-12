export type Role = "STUDENT" | "ACADEMIC_STAFF" | "ADMIN_STAFF" | "PROJECT_STAFF";
export type PulseUser = { id: number; fullName: string; email: string; role: Role; college: string; bio?: string | null; avatarUrl?: string | null; suspendedUntil?: string | null; clashWins?: number };
export type Session = { token: string; user: PulseUser };
export type Comment = { id: number; author: PulseUser; content: string; verifiedAnswer: boolean; createdAt: string; likeCount: number; likedByCurrentUser: boolean };
export type FeedPost = { id: number; author: PulseUser; communityName: string; content: string; postType: string; mediaUrl?: string | null; mediaType?: string | null; mediaName?: string | null; status: string; createdAt: string; likeCount: number; commentCount: number; likedByCurrentUser: boolean; viewCount?: number; repostCount?: number; shareCount?: number; comments?: Comment[]; communityId?: number };
export type Conversation = { participant: PulseUser; lastMessage: string; lastMessageAt: string; unreadCount: number };
export type DirectMessage = { id: number; sender: PulseUser; recipient: PulseUser; content: string; mediaUrl?: string | null; read: boolean; createdAt: string };
export type ModerationQueueItem = { postId: number; authorName: string; content: string; status: string; aiScore: number; flaggedReason: string; createdAt: string; highlightSpans?: any; authorViolationCount?: number; authorSuspendedUntil?: string };
export type UserSummary = { id: number; fullName: string; college: string; role: string; violationCount: number; suspendedUntil: string | null };
export type AnalyticsSummary = { totalPosts: number; flaggedPosts: number; removedPosts: number; pendingReview: number; flagRate: number; totalReports: number };
export type ThemeMode = "light" | "dark";
export type SearchResultItem = { kind: "user" | "post" | "community"; title: string; subtitle: string; id: number; path: string };
export type UserProfileResponse = { user: PulseUser; postCount: number; likesReceived: number; followersCount: number; followingCount: number; isFollowing: boolean };
export type ModerationResult = { overall_risk_score: number; priority_tier: string; action: string; post_status: string; category_scores: Record<string, number>; vulgarity_word_count: number; vulgarity_density_ratio: number; flagged_reasons: string[]; context_overrides: string[]; safe: boolean; urgent: boolean; triggered_categories: string[]; pii_found: Record<string, string[]>; flagged_links: string[]; highlight_spans: any[] };

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const sessionKey = "knust-pulse-session";
const themeKey = "knust-pulse-theme";
const followsKey = "knust-pulse-follows";
const messagesKey = "knust-pulse-messages";
const postsKey = "knust-pulse-posts";

export function getSession(): Session | null { if (typeof window === "undefined") return null; try { const raw = localStorage.getItem(sessionKey); return raw ? JSON.parse(raw) as Session : null; } catch { localStorage.removeItem(sessionKey); return null; } }
export function saveSession(session: Session) { localStorage.setItem(sessionKey, JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem(sessionKey); }

export function getTheme(): ThemeMode { if (typeof window === "undefined") return "dark"; return (localStorage.getItem(themeKey) as ThemeMode | null) ?? "dark"; }
export function saveTheme(theme: ThemeMode) { localStorage.setItem(themeKey, theme); }

export function getFollowIds(userId?: number): number[] { if (typeof window === "undefined") return []; try { const raw = localStorage.getItem(followsKey); const graph = raw ? JSON.parse(raw) as Record<number, number[]> : {}; const source = userId ? graph[userId] : graph[1] ?? []; return Array.isArray(source) ? source : []; } catch { return []; } }
export function toggleFollow(userId: number, followerId = 1): boolean { if (typeof window === "undefined") return false; const raw = localStorage.getItem(followsKey); const graph = raw ? JSON.parse(raw) as Record<number, number[]> : {}; const current = Array.isArray(graph[followerId]) ? graph[followerId] : []; const exists = current.includes(userId); const next = exists ? current.filter((id) => id !== userId) : [...current, userId]; graph[followerId] = next; localStorage.setItem(followsKey, JSON.stringify(graph)); return !exists; }
export function isFollowing(userId: number, followerId = 1): boolean { return getFollowIds(followerId).includes(userId); }
export function getFollowers(userId: number): number[] { if (typeof window === "undefined") return []; try { const raw = localStorage.getItem(followsKey); const graph = raw ? JSON.parse(raw) as Record<number, number[]> : {}; return Object.entries(graph).filter(([, ids]) => ids.includes(userId)).map(([followerId]) => Number(followerId)); } catch { return []; } }
export function getStoredMessages(userId?: number): Record<number, DirectMessage[]> { if (typeof window === "undefined") return {}; try { const key = userId ? `${messagesKey}-${userId}` : messagesKey; const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as Record<number, DirectMessage[]> : {}; } catch { return {}; } }
export function saveStoredMessages(messages: Record<number, DirectMessage[]>, userId?: number) { if (typeof window === "undefined") return; const key = userId ? `${messagesKey}-${userId}` : messagesKey; localStorage.setItem(key, JSON.stringify(messages)); }

export function getStoredPosts(): FeedPost[] | null { if (typeof window === "undefined") return null; try { const raw = localStorage.getItem(postsKey); return raw ? JSON.parse(raw) as FeedPost[] : null; } catch { return null; } }
export function saveStoredPosts(posts: FeedPost[]) { if (typeof window === "undefined") return; localStorage.setItem(postsKey, JSON.stringify(posts)); }

export async function api<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const session = getSession();
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authenticated && session?.token) headers.set("Authorization", `Bearer ${session.token}`);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  } catch {
    throw new Error("Network error \u2014 unable to reach the server. Check your connection.");
  }
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.message || body?.detail || body?.title || "Something went wrong. Please try again."); }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export function initials(user: PulseUser) { return user.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(); }
export function roleLabel(role: Role) { return ({ STUDENT: "Student", ACADEMIC_STAFF: "Academic staff", ADMIN_STAFF: "Administrator", PROJECT_STAFF: "System Admin" })[role]; }
export function timeAgo(value: string) { const diff = Math.max(0, Date.now() - new Date(value).getTime()); const minutes = Math.floor(diff / 60000); if (minutes < 1) return "now"; if (minutes < 60) return `${minutes}m`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h`; return `${Math.floor(hours / 24)}d`; }
