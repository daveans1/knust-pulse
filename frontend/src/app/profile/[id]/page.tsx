"use client";
import { useParams } from "next/navigation";
import AuthGuard from "../../components/auth-guard";
import ProfileView from "../../components/profile-view";
export default function UserProfilePage() { const params = useParams<{ id: string }>(); return <AuthGuard><ProfileView userId={Number(params.id)} /></AuthGuard>; }
