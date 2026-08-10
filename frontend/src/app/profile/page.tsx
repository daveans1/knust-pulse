"use client";
import AuthGuard from "../components/auth-guard";
import ProfileView from "../components/profile-view";
import { getSession } from "../lib/api";
export default function MyProfilePage() { return <AuthGuard><ProfileView userId={getSession()?.user.id} /></AuthGuard>; }
