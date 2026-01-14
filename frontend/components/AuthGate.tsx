"use client";

import PostForm from "@/components/PostForm";
import LoginPage from "@/components/LoginView";
import { useEffect, useState } from "react";

export default function AuthGate() {
    const [hasToken] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return Boolean(localStorage.getItem("token"));
    });

    return hasToken ? <PostForm /> : <LoginPage />;
}