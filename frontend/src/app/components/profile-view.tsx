/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "./app-shell";
import { useToast } from "./toast";
import { api, getSession, initials, roleLabel, timeAgo, toggleFollow, type FeedPost, type PulseUser, type UserProfileResponse } from "../lib/api";

export default function ProfileView({ userId }: { userId?: number }) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast, confirm } = useToast();
  const currentSession = getSession();
  const currentId = currentSession?.user.id;
  const targetId = userId ?? currentId;

  const removePost = async (postId: number) => {
    const ok = await confirm("Are you sure you want to delete this post?");
    if (!ok) return;
    try {
      await api(`/posts/${postId}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setProfile((prev) => prev ? { ...prev, postCount: Math.max(0, prev.postCount - 1) } : prev);
      toast("Post deleted successfully", "success");
    } catch (err: any) {
      toast(err?.message || "Failed to delete post", "error");
    }
  };

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);

    api<UserProfileResponse>(`/users/${targetId}`)
      .then((data) => {
        setProfile(data);
        setFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });

    api<FeedPost[]>(`/users/${targetId}/posts`)
      .then(setPosts)
      .catch(() => {
        setPosts([]);
      });
  }, [targetId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="h-10 w-10 rounded-full bg-[var(--brand-primary)] animate-pulse mb-4" />
          <p className="text-[#536471] dark:text-[#71767b]">Loading profile…</p>
        </div>
      </AppShell>
    );
  }

  if (loadError || !profile) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <p className="text-lg font-bold text-[#0f1419] dark:text-[#e7e9ea] mb-2">User not found or failed to load profile.</p>
          <p className="text-[#536471] dark:text-[#71767b]">{loadError || "Profile data is unavailable."}</p>
        </div>
      </AppShell>
    );
  }

  const ownProfile = currentId === profile.user.id;

  const handleToggleFollow = async () => {
    if (!currentId || ownProfile) return;
    const wasFollowing = following;
    // Optimistic
    setFollowing(!wasFollowing);
    setFollowersCount((prev) => wasFollowing ? Math.max(0, prev - 1) : prev + 1);

    try {
      let updatedProfile: UserProfileResponse;
      if (wasFollowing) {
        updatedProfile = await api<UserProfileResponse>(`/users/${targetId}/follow`, { method: "DELETE" });
      } else {
        updatedProfile = await api<UserProfileResponse>(`/users/${targetId}/follow`, { method: "POST" });
      }
      if (updatedProfile) {
        setFollowing(updatedProfile.isFollowing);
        setFollowersCount(updatedProfile.followersCount);
        setProfile(updatedProfile);
      }
      toast(wasFollowing ? "Unfollowed user" : "Followed user", "success");
    } catch (err: any) {
      // Revert on error
      setFollowing(wasFollowing);
      setFollowersCount((prev) => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
      toast(err?.message || "Failed to update follow status", "error");
    }
  };


  return (
    <AppShell>
      <section className="bg-white dark:bg-black min-h-screen">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-[#1d9bf0]/30 to-[#f91880]/30 dark:from-[#1d9bf0]/20 dark:to-[#f91880]/20" />
        <div className="relative px-4 pb-4">
          <div className="flex justify-between items-start">
            <div className="relative -mt-16 h-32 w-32 rounded-full border-4 border-white dark:border-black bg-[var(--brand-primary)] flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-md">
              {profile.user.avatarUrl
                ? <img src={profile.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : initials(profile.user)}
            </div>
            <div className="mt-4 flex gap-2">
              {!ownProfile ? (
                <>
                  <Link
                    href={`/messages?to=${profile.user.id}`}
                    className="rounded-full border border-[#cfd9de] dark:border-[#536471] p-2 text-[#0f1419] dark:text-[#e7e9ea] hover:bg-[#0f14191a] dark:hover:bg-[#e7e9ea1a] transition grid place-items-center w-9 h-9"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5V18.5c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5V5.5zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5V10.463z"></path></g></svg>
                  </Link>
                  <button
                    onClick={handleToggleFollow}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${following
                      ? "border border-[#cfd9de] dark:border-[#536471] text-[#0f1419] dark:text-[#e7e9ea] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                      : "bg-[#0f1419] text-white dark:bg-[#e7e9ea] dark:text-[#0f1419] hover:opacity-90"
                    }`}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-3">
            <h1 className="font-display text-xl font-bold text-[#0f1419] dark:text-[#e7e9ea] flex items-center gap-2">
              {profile.user.fullName}
              {profile.user.suspendedUntil && new Date(profile.user.suspendedUntil) > new Date() && (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-sm border border-red-500/20">
                  Suspended
                </span>
              )}
            </h1>
            <p className="text-[15px] text-[#536471] dark:text-[#71767b]">@{profile.user.email.split("@")[0]}</p>
          </div>
          <p className="mt-3 text-[15px] text-[#0f1419] dark:text-[#e7e9ea] whitespace-pre-wrap">
            {profile.user.bio || "Member of the KNUST Pulse campus community."}
          </p>
          <div className="mt-3 flex gap-4 text-[15px] text-[#536471] dark:text-[#71767b] flex-wrap">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path></g></svg>
              {profile.user.college}
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M7.5 4a.5.5 0 00-.5.5v1H5.5A2.5 2.5 0 003 8v10.5A2.5 2.5 0 005.5 21h13a2.5 2.5 0 002.5-2.5V8a2.5 2.5 0 00-2.5-2.5H17v-1a.5.5 0 00-1 0v1H8v-1a.5.5 0 00-.5-.5zM5 8a.5.5 0 01.5-.5H7v.5a.5.5 0 001 0V7.5h8v.5a.5.5 0 001 0V7.5h1.5A.5.5 0 0119 8v1.5H5V8zm0 3h14v7.5a.5.5 0 01-.5.5h-13A.5.5 0 015 18.5V11z"></path></g></svg>
              {roleLabel(profile.user.role)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-5 text-[15px]">
            <span className="text-[#536471] dark:text-[#71767b]">
              <b className="text-[#0f1419] dark:text-[#e7e9ea]">{profile.followingCount}</b> Following
            </span>
            <span className="text-[#536471] dark:text-[#71767b]">
              <b className="text-[#0f1419] dark:text-[#e7e9ea]">{followersCount}</b> Followers
            </span>
            {profile.postCount > 0 && (
              <span className="text-[#536471] dark:text-[#71767b]">
                <b className="text-[#0f1419] dark:text-[#e7e9ea]">{profile.postCount}</b> Posts
              </span>
            )}
          </div>
        </div>

        {/* Posts tab */}
        <div className="flex border-b border-[#e6ebe5] dark:border-[#2f3336]">
          <button className="flex-1 py-4 text-[15px] font-bold text-[#0f1419] dark:text-[#e7e9ea] relative hover:bg-[#e7ece5] dark:hover:bg-black transition text-center">
            Posts
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[var(--brand-primary)] rounded-full" />
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center text-[#536471] dark:text-[#71767b]">
            <p className="text-lg font-bold text-[#0f1419] dark:text-[#e7e9ea] mb-1">No posts yet</p>
            <p>When {ownProfile ? "you post" : `${profile.user.fullName} posts`}, they&apos;ll show up here.</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="border-b border-[#e6ebe5] dark:border-[#2f3336] bg-white dark:bg-black px-4 py-4 hover:bg-[#f7f9f9] dark:hover:bg-black transition sm:px-5">
              <div className="flex gap-3">
                <Link href={`/profile/${post.author.id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white hover:opacity-90">
                  {initials(post.author)}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between text-[15px]">
                    <div className="flex flex-wrap items-center gap-x-1">
                      <Link href={`/profile/${post.author.id}`} className="font-bold text-[#0f1419] dark:text-[#e7e9ea] hover:underline">{post.author.fullName}</Link>
                      <span className="text-[#536471] dark:text-[#71767b]">@{post.author.email.split("@")[0]}</span>
                      <span className="text-[#536471] dark:text-[#71767b]">· {timeAgo(post.createdAt)}</span>
                    </div>
                    {currentSession && (currentSession.user.id === post.author.id || currentSession.user.role === "ADMIN_STAFF" || currentSession.user.role === "PROJECT_STAFF") && (
                      <button onClick={() => removePost(post.id)} className="group hover:text-red-500 transition" title="Delete post">
                        <div className="rounded-full p-1.5 group-hover:bg-red-500/10">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><g><path d="M8 5.5V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v1.5h4.5v2h-1.5v13.5c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V7.5H3.5v-2H8zm2-1.5v1.5h4V4h-4zM7 7.5v13.5h10V7.5H7zM9.5 10v9h2v-9h-2zm3 0v9h2v-9h-2z"></path></g></svg>
                        </div>
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[#0f1419] dark:text-[#e7e9ea]">{post.content}</p>
                  {post.mediaUrl && post.postType === "IMAGE" && (
                    <img src={post.mediaUrl} alt="" className="mt-3 max-h-[512px] rounded-2xl border border-[#e6ebe5] dark:border-[#2f3336] object-cover w-full" />
                  )}
                  <div className="mt-3 flex items-center gap-5 text-[13px] font-semibold text-[#536471] dark:text-[#71767b]">
                    <span>{post.commentCount} replies</span>
                    <span>{post.repostCount ?? 0} reposts</span>
                    <span>{post.likeCount} likes</span>
                    <span>{(post.viewCount ?? 0).toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}
