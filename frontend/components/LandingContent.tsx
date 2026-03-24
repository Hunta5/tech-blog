'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { Post } from '@/lib/posts'

const POPULAR_TOOLS = [
    { name: 'JSON → Model', href: '/tools/json2model', icon: '{ }', color: 'from-cyan-500 to-blue-500' },
    { name: 'Crash Symbolicate', href: '/tools/crashtool', icon: '🐛', color: 'from-red-500 to-orange-500' },
    { name: 'URL & Deep Link', href: '/tools/deeplink', icon: '🔗', color: 'from-violet-500 to-fuchsia-500' },
    { name: 'Image Compress', href: '/tools/imagecompress', icon: '🖼️', color: 'from-emerald-500 to-teal-500' },
    { name: 'Crypto / Hash', href: '/tools/crypto', icon: '🔒', color: 'from-yellow-500 to-orange-500' },
    { name: 'Plist Viewer', href: '/tools/plist', icon: '📋', color: 'from-amber-500 to-red-500' },
]

export default function LandingContent({ posts }: { posts: Post[] }) {
    const { t } = useLanguage()

    const recentPosts = posts.slice(0, 3)

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* Hero */}
            <div className="mb-16 md:mb-24">
                <div className="mb-6">
                    <span className="text-gray-500 text-lg">{t('landing.greeting')},</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {t('landing.name')}
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-2">{t('landing.role')}</p>
                <p className="text-gray-500 max-w-xl leading-relaxed mt-4">
                    {t('landing.subtitle')}
                </p>

                {/* Quick links */}
                <div className="flex gap-3 mt-8">
                    <Link href="/tools/json2model"
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
                        {t('landing.tools')} →
                    </Link>
                    <Link href="/articles"
                        className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition">
                        {t('landing.blog')} →
                    </Link>
                </div>
            </div>

            {/* 3 main sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
                {/* Tools card */}
                <Link href="/tools/base64" className="group">
                    <div className="relative h-full bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl mb-4">
                                🛠️
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{t('landing.tools')}</h2>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">{t('landing.toolsDesc')}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-blue-400">16</span>
                                <span className="text-xs text-gray-500">{t('landing.toolsCount')}</span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Blog card */}
                <Link href="/articles" className="group">
                    <div className="relative h-full bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-10 translate-x-10" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl mb-4">
                                📝
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{t('landing.blog')}</h2>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">{t('landing.blogDesc')}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-emerald-400">{posts.length}</span>
                                <span className="text-xs text-gray-500">{t('home.techArticles')}</span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* About card */}
                <Link href="/about" className="group">
                    <div className="relative h-full bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full -translate-y-10 translate-x-10" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl mb-4">
                                👨‍💻
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">{t('landing.about')}</h2>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">{t('landing.aboutDesc')}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400">Swift</span>
                                <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400">iOS</span>
                                <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400">12+ yrs</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Popular Tools */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                        {t('landing.popularTools')}
                    </h2>
                    <Link href="/tools/base64" className="text-xs text-gray-500 hover:text-gray-300 transition">
                        {t('landing.viewAll')} →
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {POPULAR_TOOLS.map((tool) => (
                        <Link key={tool.href} href={tool.href} className="group">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/60 transition-all">
                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-sm shrink-0`}>
                                    {tool.icon}
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition truncate">{tool.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Articles */}
            {recentPosts.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                            {t('landing.recentArticles')}
                        </h2>
                        <Link href="/articles" className="text-xs text-gray-500 hover:text-gray-300 transition">
                            {t('landing.viewAll')} →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentPosts.map((post) => (
                            <Link key={post.slug} href={`/posts/${post.slug}`} className="group block">
                                <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-emerald-500/30 hover:bg-gray-800/50 transition-all">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-200 group-hover:text-emerald-400 transition truncate">
                                            {post.title}
                                        </h3>
                                        <time className="text-xs text-gray-600 mt-1">{post.date}</time>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer tagline */}
            <div className="mt-20 pt-8 border-t border-gray-800/50 text-center">
                <p className="text-xs text-gray-600">Built with Next.js · Designed for developers</p>
            </div>
        </div>
    )
}
