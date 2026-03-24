'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- types ----

interface NewsItem {
    title: string
    link: string
    description: string
    source: string
    category: string
    imageUrl: string | null
    publishedAt: string | null
}

interface CategoryOption {
    code: string
    label: { zh: string; ko: string }
    icon: string
}

const CATEGORIES: CategoryOption[] = [
    { code: 'all', label: { zh: '全部', ko: '전체' }, icon: '🌍' },
    { code: 'world', label: { zh: '国际', ko: '세계' }, icon: '🗺️' },
    { code: 'tech', label: { zh: '科技', ko: '테크' }, icon: '💻' },
    { code: 'business', label: { zh: '商业', ko: '비즈니스' }, icon: '📈' },
    { code: 'science', label: { zh: '科学', ko: '과학' }, icon: '🔬' },
    { code: 'korea', label: { zh: '韩国', ko: '한국' }, icon: '🇰🇷' },
    { code: 'china', label: { zh: '中国', ko: '중국' }, icon: '🇨🇳' },
]

export default function NewsPage() {
    const { lang } = useLanguage()
    const isKo = lang === 'ko'

    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [category, setCategory] = useState('all')

    const fetchNews = useCallback(async (cat: string) => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/news?category=${cat}&limit=15`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()
            if (json.code === 0 && json.data) {
                setNews(json.data)
            } else {
                throw new Error(json.message || 'Failed to fetch news')
            }
        } catch (e: any) {
            setError(e.message || 'Failed to fetch news')
            setNews([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNews(category)
    }, [category, fetchNews])

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return ''
        try {
            const d = new Date(dateStr)
            const now = new Date()
            const diffMs = now.getTime() - d.getTime()
            const diffMin = Math.floor(diffMs / 60000)
            const diffHour = Math.floor(diffMs / 3600000)
            const diffDay = Math.floor(diffMs / 86400000)

            if (diffMin < 1) return isKo ? '방금 전' : '刚刚'
            if (diffMin < 60) return isKo ? `${diffMin}분 전` : `${diffMin}分钟前`
            if (diffHour < 24) return isKo ? `${diffHour}시간 전` : `${diffHour}小时前`
            if (diffDay < 7) return isKo ? `${diffDay}일 전` : `${diffDay}天前`

            return d.toLocaleDateString(isKo ? 'ko-KR' : 'zh-CN', { month: 'short', day: 'numeric' })
        } catch {
            return ''
        }
    }

    const getCategoryLabel = (code: string) => {
        const cat = CATEGORIES.find(c => c.code === code)
        return cat ? (isKo ? cat.label.ko : cat.label.zh) : code
    }

    const getCategoryColor = (code: string) => {
        switch (code) {
            case 'world': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'tech': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'business': return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'science': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            case 'korea': return 'bg-red-500/10 text-red-400 border-red-500/20'
            case 'china': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* Header */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {isKo ? '글로벌 뉴스' : '全球热点新闻'}
            </h1>
            <p className="text-gray-400 mb-8">
                {isKo ? '전 세계 주요 뉴스를 실시간으로 확인하세요. 30분마다 업데이트됩니다.' : '实时查看全球热点新闻。每 30 分钟自动更新。'}
            </p>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map(cat => (
                    <button key={cat.code}
                        onClick={() => setCategory(cat.code)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            category === cat.code
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                                : 'bg-gray-800/30 text-gray-400 border border-gray-700/50 hover:text-white hover:bg-gray-800/50'
                        }`}>
                        <span>{cat.icon}</span>
                        <span>{isKo ? cat.label.ko : cat.label.zh}</span>
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-8">
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                    <p className="text-xs text-gray-500">
                        {isKo
                            ? '백엔드 서버가 실행 중인지 확인하세요. (Spring Boot: port 8080)'
                            : '请确认后端服务器已启动。(Spring Boot: port 8080)'}
                    </p>
                    <button onClick={() => fetchNews(category)}
                        className="mt-3 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition">
                        {isKo ? '다시 시도' : '重试'}
                    </button>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 animate-pulse">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-700/50 rounded w-3/4" />
                                    <div className="h-3 bg-gray-700/30 rounded w-full" />
                                    <div className="h-3 bg-gray-700/30 rounded w-1/2" />
                                </div>
                                <div className="w-24 h-20 bg-gray-700/30 rounded-lg shrink-0 hidden sm:block" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* News list */}
            {!loading && news.length > 0 && (
                <div className="space-y-4">
                    {/* Featured (first item) */}
                    <a href={news[0].link} target="_blank" rel="noopener noreferrer"
                        className="block group">
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                            {news[0].imageUrl && (
                                <div className="h-48 md:h-64 bg-gray-800 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={news[0].imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getCategoryColor(news[0].category)}`}>
                                        {getCategoryLabel(news[0].category)}
                                    </span>
                                    <span className="text-xs text-gray-500">{news[0].source}</span>
                                    <span className="text-xs text-gray-600">{formatTime(news[0].publishedAt)}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                                    {news[0].title}
                                </h2>
                                {news[0].description && (
                                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{news[0].description}</p>
                                )}
                            </div>
                        </div>
                    </a>

                    {/* Rest of news */}
                    {news.slice(1).map((item, i) => (
                        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                            className="group block">
                            <div className="flex gap-4 bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 hover:bg-gray-800/40 hover:border-gray-600 transition-all">
                                {/* Number badge */}
                                <div className="w-8 h-8 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                    {i + 2}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(item.category)}`}>
                                            {getCategoryLabel(item.category)}
                                        </span>
                                        <span className="text-[11px] text-gray-500">{item.source}</span>
                                        <span className="text-[11px] text-gray-600">{formatTime(item.publishedAt)}</span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-200 group-hover:text-orange-400 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                {item.imageUrl && (
                                    <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block bg-gray-800">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && news.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📰</div>
                    <p className="text-gray-500">{isKo ? '뉴스가 없습니다.' : '暂无新闻。'}</p>
                </div>
            )}

            {/* Footer note */}
            <div className="mt-10 text-center text-[10px] text-gray-600">
                {isKo ? 'RSS 피드 기반 · 30분마다 자동 업데이트 · Reuters, BBC, CNN, TechCrunch, 百度新闻 등' : 'RSS 订阅源 · 每 30 分钟自动更新 · Reuters, BBC, CNN, TechCrunch, 百度新闻 等'}
            </div>
        </div>
    )
}
