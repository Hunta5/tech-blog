"use client";

import PostForm from "@/components/PostForm";
import LoginPage from "@/components/LoginView";
import { useSyncExternalStore } from "react";

function getSnapshot() {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("token"));
}

function subscribe(listener: () => void) {
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
}

export default function AuthGate() {
    const hasToken = useSyncExternalStore(subscribe, getSnapshot, () => false);

    return hasToken ? <PostForm /> : <LoginPage />;
}