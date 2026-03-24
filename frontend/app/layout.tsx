import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Sidebar} from "@/components/Sidebar";
import {Providers} from "@/components/Providers";
import GuideCharacter from "@/components/GuideCharacter";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "HUNTA's Tech Blog",
    description: "iOS Senior Developer - 기술 블로그",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <Providers>
        <div className="flex min-h-screen">
            <Sidebar/>
            <main className="flex-1 overflow-auto bg-gray-900 text-white pt-14 md:pt-0">
                {children}
            </main>
            <GuideCharacter />
        </div>
        </Providers>
        </body>
        </html>
    );
}
