"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../components/app-shell";
import AuthGuard from "../../components/auth-guard";
import { api, getSession, getStoredMessages, initials, saveStoredMessages, type DirectMessage, type PulseUser } from "../../lib/api";

export default function MessageThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const session = getSession();
  const targetId = Number(params.id);

  const [targetUser, setTargetUser] = useState<PulseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  useEffect(() => {
    if (!targetId || isNaN(targetId)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api<PulseUser>(`/users/${targetId}/basic`)
      .then((user) => {
        if (!active) return;
        setTargetUser(user);
        const stored = getStoredMessages(session?.user.id)[targetId] ?? [];
        if (stored.length) {
          setMessages(stored);
        } else if (user) {
          setMessages([
            {
              id: Date.now(),
              sender: user,
              recipient: session?.user ?? user,
              content: "Hi! I saw your profile and wanted to say hello.",
              read: true,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user basic info:", err);
        if (active) setTargetUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [targetId, session?.user.id]);

  if (loading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black text-[#e7e9ea]">
            Loading conversation...
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (!targetUser) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black text-[#e7e9ea]">
            User not found
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed || !session?.user || !targetUser) return;
    const nextMessage: DirectMessage = { id: Date.now(), sender: session.user, recipient: targetUser, content: trimmed, read: true, createdAt: new Date().toISOString() };
    const next = [...messages, nextMessage];
    setMessages(next);
    const stored = getStoredMessages(session?.user.id);
    stored[targetId] = next;
    saveStoredMessages(stored, session?.user.id);
    setDraft("");
  };

  return (
    <AuthGuard>
      <AppShell>
        <section className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden border-x border-[#2f3336] bg-black text-[#e7e9ea] max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-[#2f3336] px-4 py-3 sticky top-0 backdrop-blur-md bg-black/80 z-10">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">{initials(targetUser)}</span>
              <div>
                <p className="text-[15px] font-bold text-[#e7e9ea]">{targetUser.fullName}</p>
                <p className="text-xs text-[#71767b]">{targetUser.college}</p>
              </div>
            </div>
            <button onClick={() => router.push("/messages")} className="rounded-full border border-[#2f3336] px-4 py-1.5 text-[15px] font-bold text-[#e7e9ea] hover:bg-black transition">Back</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isMe = message.sender.id === (session?.user.id ?? 0);
              return (
                <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] ${isMe ? "bg-[var(--brand-primary)] text-white rounded-br-sm" : "bg-[#2f3336] text-[#e7e9ea] rounded-bl-sm"}`}>
                    {message.content}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[#2f3336] bg-black p-4">
            <div className="flex gap-2 items-center rounded-full bg-white dark:bg-black p-1 pr-2">
              <input 
                value={draft} 
                onChange={(event) => setDraft(event.target.value)} 
                onKeyDown={(event) => event.key === "Enter" && sendMessage()} 
                className="flex-1 rounded-full border border-[#2f3336] bg-white text-[#0f1419] placeholder-[#71767b] px-4 py-2 text-[15px] outline-none focus:border-[var(--brand-primary)] dark:bg-black dark:text-[#e7e9ea]" 
                placeholder="Start a new message" 
              />
              <button onClick={sendMessage} className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-[15px] font-bold text-white hover:opacity-90 disabled:opacity-50" disabled={!draft.trim()}>
                Send
              </button>
            </div>
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
