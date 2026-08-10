"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AuthGuard from "../components/auth-guard";
import AppShell from "../components/app-shell";
import { api, getSession, getStoredMessages, initials, saveStoredMessages, timeAgo, type Conversation, type DirectMessage } from "../lib/api";
// Removed checkSafetyLocal import
import { seedUsers } from "../lib/seed-data";
import { useToast } from "../components/toast";

export default function MessagesPage() {
  return (
    <AuthGuard>
      <MessagesView />
    </AuthGuard>
  );
}

function MessagesView() {
  const session = getSession();
  const currentUser = session?.user ?? { id: 1, fullName: "You", email: "you@st.knust.edu.gh", role: "STUDENT" as const, college: "KNUST" };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number>(-1);
  const [threadMessages, setThreadMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [showList, setShowList] = useState(true); // mobile: toggle between list and chat
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversations from backend
  useEffect(() => {
    api<Conversation[]>("/messages/conversations")
      .then(res => {
        if (res?.length) {
          setConversations(res);
          if (activeId === -1) setActiveId(res[0].participant.id);
        }
      })
      .catch(console.error);
  }, []);

  // Pick up ?to= param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const toId = Number(new URLSearchParams(window.location.search).get("to"));
    if (toId) {
      setActiveId(toId);
      setShowList(false);
      setConversations((prev) => {
        if (!prev.find(c => c.participant.id === toId)) {
          const newUser = seedUsers.find(u => u.id === toId);
          if (newUser) {
            return [{ participant: newUser, lastMessage: "", lastMessageAt: new Date().toISOString(), unreadCount: 0 }, ...prev];
          }
        }
        return prev;
      });
    }
  }, []);

  // Load conversation thread from local storage + API
  useEffect(() => {
    const stored = getStoredMessages(currentUser.id);
    const existing = stored[activeId] ?? [];
    if (existing.length) {
      setThreadMessages(existing);
    } else {
      const convo = conversations.find((c) => c.participant.id === activeId);
      if (convo && convo.lastMessage) {
        const starter: DirectMessage[] = [{
          id: Date.now(),
          sender: convo.participant,
          recipient: currentUser,
          content: convo.lastMessage,
          read: true,
          createdAt: convo.lastMessageAt,
        }];
        saveStoredMessages({ ...stored, [activeId]: starter }, currentUser.id);
        setThreadMessages(starter);
      } else {
        setThreadMessages([]);
      }
    }

    // Try backend
    if (activeId !== -1) {
      api<DirectMessage[]>(`/messages/with/${activeId}`)
        .then((msgs) => {
          if (msgs?.length) {
            setThreadMessages(msgs);
            saveStoredMessages({ ...getStoredMessages(currentUser.id), [activeId]: msgs }, currentUser.id);
          }
        })
        .catch(() => {});
    }
  }, [activeId, conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages]);

  const send = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    
    // Moderation is handled by the Java Backend.
    const msg: DirectMessage = {
      id: Date.now(),
      sender: currentUser,
      recipient: conversations.find((c) => c.participant.id === activeId)?.participant ?? currentUser,
      content: trimmed,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const nextThread = [...threadMessages, msg];
    setThreadMessages(nextThread);
    saveStoredMessages({ ...getStoredMessages(currentUser.id), [activeId]: nextThread }, currentUser.id);
    setDraft("");

    // Update conversation last message
    setConversations((prev) =>
      prev.map((c) => c.participant.id === activeId ? { ...c, lastMessage: trimmed, lastMessageAt: msg.createdAt, unreadCount: 0 } : c)
    );

    // Try backend
    api(`/messages`, { method: "POST", body: JSON.stringify({ recipientId: activeId, content: trimmed }) }).catch((err: any) => {
      console.error("Failed to send message via API:", err);
      toast(err.message || "Failed to send message.", "error");
      
      // Rollback optimistic update on error
      setThreadMessages(prev => prev.filter(m => m.id !== msg.id));
    });
  };

  const deleteMessage = async (msgId: number) => {
    if (!confirm("Delete this message?")) return;
    
    // Optimistic delete
    const originalMessages = [...threadMessages];
    setThreadMessages(prev => prev.filter(m => m.id !== msgId));
    
    try {
      await api(`/messages/${msgId}`, { method: "DELETE" });
      toast("Message deleted");
    } catch (err: any) {
      console.error("Failed to delete message:", err);
      toast(err.message || "Failed to delete message.", "error");
      setThreadMessages(originalMessages); // Rollback
    }
  };

  const activeParticipant = conversations.find((c) => c.participant.id === activeId)?.participant ?? 
                            (conversations.length > 0 ? conversations[0].participant : currentUser);

  return (
    // fullWidth suppresses the right sidebar in AppShell
    <AppShell fullWidth>
      {/* Full-height flex container that fills the centre column */}
      <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-black overflow-hidden">
        {/* Conversations list */}
        <aside className={`flex-shrink-0 w-[320px] border-r border-[#e6ebe5] dark:border-[#2f3336] flex flex-col ${showList ? "flex" : "hidden md:flex"}`}>
          <div className="px-4 py-3 border-b border-[#e6ebe5] dark:border-[#2f3336] sticky top-0 bg-white dark:bg-black z-10 flex justify-between items-center h-[57px]">
            <h1 className="text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea]">Messages</h1>
            <Link href="/search?q=&tab=Users" className="p-2 rounded-full hover:bg-[#e7e9ea1a] transition" title="New Chat">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0f1419] dark:fill-[#e7e9ea]">
                <g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V18.5c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5V5.5zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5V10.463z"></path><path d="M19 8h-3V5h-2v3h-3v2h3v3h2v-3h3z"></path></g>
              </svg>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#e6ebe5] dark:divide-[#2f3336]">
            {conversations.map((c) => (
              <button
                key={c.participant.id}
                onClick={() => { setActiveId(c.participant.id); setShowList(false); }}
                className={`flex w-full gap-3 px-4 py-3 text-left transition ${activeId === c.participant.id ? "bg-[#eff3f4] dark:bg-black border-r-2 border-[var(--brand-primary)]" : "hover:bg-[#f7f9f9] dark:hover:bg-black"}`}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-sm font-bold text-white relative">
                  {initials(c.participant)}
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--brand-primary)] text-[11px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-black">{c.unreadCount}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-[15px] text-[#0f1419] dark:text-[#e7e9ea] truncate">{c.participant.fullName}</span>
                    <span className="text-[12px] text-[#536471] dark:text-[#71767b] whitespace-nowrap">{timeAgo(c.lastMessageAt)}</span>
                  </div>
                  <p className={`mt-0.5 text-[14px] truncate ${c.unreadCount > 0 ? "font-semibold text-[#0f1419] dark:text-[#e7e9ea]" : "text-[#536471] dark:text-[#71767b]"}`}>{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <section className={`flex flex-col flex-1 min-w-0 ${showList ? "hidden md:flex" : "flex"}`}>
          {/* Chat header */}
          <header className="flex items-center gap-3 px-4 h-[53px] border-b border-[#e6ebe5] dark:border-[#2f3336] sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur z-10">
            <button onClick={() => setShowList(true)} className="md:hidden rounded-full p-1 hover:bg-[#e7e9ea1a]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0f1419] dark:fill-[#e7e9ea]"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2z"></path></g></svg>
            </button>
            <Link href={`/profile/${activeParticipant.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white">{initials(activeParticipant)}</div>
              <div>
                <p className="font-bold text-[15px] text-[#0f1419] dark:text-[#e7e9ea] leading-tight">{activeParticipant.fullName}</p>
                <p className="text-[12px] text-[#536471] dark:text-[#71767b]">{activeParticipant.college}</p>
              </div>
            </Link>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {threadMessages.map((msg) => {
              const isMe = msg.sender.id === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 group items-center`}>
                  {!isMe && (
                    <div className="grid h-8 w-8 shrink-0 self-end place-items-center rounded-full bg-[var(--brand-primary)] text-[10px] font-bold text-white">{initials(msg.sender)}</div>
                  )}
                  {isMe && (
                    <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-400/10 rounded-full transition" title="Delete message">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><g><path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 2.99-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.49.93-1.01.93H7.86c-.52 0-.97-.41-1.01-.93L6.08 8h11.83l-.78 11.07z"></path></g></svg>
                    </button>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${isMe ? "bg-[var(--brand-primary)] text-white rounded-br-sm" : "bg-[#eff3f4] dark:bg-[#2f3336] text-[#0f1419] dark:text-[#e7e9ea] rounded-bl-sm"}`}>
                    {msg.content}
                    <div className={`text-[11px] mt-1 ${isMe ? "text-white/70 text-right" : "text-[#536471] dark:text-[#71767b]"}`}>{timeAgo(msg.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e6ebe5] dark:border-[#2f3336] px-4 py-3 bg-white dark:bg-black">
            <div className="flex gap-2 items-center rounded-full bg-[#eff3f4] dark:bg-[#2f3336] px-4 py-2 focus-within:ring-1 focus-within:ring-[var(--brand-primary)]">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                className="flex-1 bg-transparent text-[15px] text-[#0f1419] dark:text-[#e7e9ea] placeholder-[#536471] dark:placeholder-[#71767b] outline-none"
                placeholder="Start a new message"
              />
              <button
                onClick={send}
                disabled={!draft.trim()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-white hover:opacity-90 transition disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current rotate-45"><g><path d="M2.504 21.866l.526-2.108C3.04 19.498 4 15.389 4 12s-.96-7.498-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.182H13v2H5.981z"></path></g></svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
