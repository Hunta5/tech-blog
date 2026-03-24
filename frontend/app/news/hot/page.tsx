'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface HotItem {
    rank: number
    word: string
    url: string
    isTop: boolean
    hotTag: string
}

interface TabOption {
    code: string
    label: { zh: string; ko: string }
    icon: string
}

const TABS: TabOption[] = [
    { code: 'realtime', label: { zh: '热搜榜', ko: '실시간 인기' }, icon: '🔥' },
    { code: 'livelihood', label: { zh: '民生榜', ko: '민생' }, icon: '🏠' },
    { code: 'finance', label: { zh: '财经榜', ko: '재경' }, icon: '💹' },
]

const HOT_TAG_MAP: Record<string, { label: string; color: string }> = {
    '': { label: '置顶', color: 'bg-red-600 text-white' },
    '0': { label: '', color: '' },
    '1': { label: '新', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    '2': { label: '暖', color: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    '3': { label: '热', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    '4': { label: '沸', color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
}

export default function BaiduHotPage() {
    const { lang } = useLanguage()
    const isKo = lang === 'ko'

    const [tab, setTab] = useState('realtime')
    const [items, setItems] = useState<HotItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

    const fetchHot = useCallback(async (tabCode: string) => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/baidu-hot?tab=${tabCode}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()
            if (json.code === 0 && json.data) {
                setItems(json.data)
                setLastUpdate(new Date())
            } else {
                throw new Error(json.message || 'Failed')
            }
        } catch (e: any) {
            setError(e.message)
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchHot(tab)
    }, [tab, fetchHot])

    // Auto refresh every 5 minutes
    useEffect(() => {
        const timer = setInterval(() => fetchHot(tab), 300000)
        return () => clearInterval(timer)
    }, [tab, fetchHot])

    const getRankStyle = (rank: number, isTop: boolean) => {
        if (isTop) return 'bg-red-600 text-white'
        if (rank <= 3) return 'bg-orange-500 text-white'
        return 'bg-gray-700 text-gray-300'
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* Header */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                {isKo ? '바이두 실시간 인기' : '百度热搜榜'}
            </h1>
            <p className="text-gray-400 mb-8">
                {isKo ? '중국에서 가장 핫한 뉴스와 화제를 실시간으로 확인하세요. 10분마다 업데이트.' : '实时查看中国最热门的新闻和话题。每 10 分钟自动更新。'}
            </p>

            {/* Tab buttons */}
            <div className="flex gap-3 mb-8">
                {TABS.map(t => (
                    <button key={t.code}
                        onClick={() => setTab(t.code)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            tab === t.code
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10'
                                : 'bg-gray-800/30 text-gray-400 border border-gray-700/50 hover:text-white hover:bg-gray-800/50'
                        }`}>
                        <span>{t.icon}</span>
                        <span>{isKo ? t.label.ko : t.label.zh}</span>
                    </button>
                ))}

                {/* Last update + refresh */}
                <div className="ml-auto flex items-center gap-2">
                    {lastUpdate && (
                        <span className="text-[10px] text-gray-600">
                            {lastUpdate.toLocaleTimeString(isKo ? 'ko-KR' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button onClick={() => fetchHot(tab)}
                        className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white transition"
                        title={isKo ? '새로고침' : '刷新'}>
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-8">
                    <p className="text-red-400 text-sm mb-2">{error}</p>
                    <p className="text-xs text-gray-500">
                        {isKo ? '백엔드 서버 확인 필요 (Spring Boot: 8080)' : '请确认后端服务已启动 (Spring Boot: 8080)'}
                    </p>
                </div>
            )}

            {/* Loading */}
            {loading && items.length === 0 && (
                <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/20 animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-gray-700/50" />
                            <div className="h-4 bg-gray-700/30 rounded flex-1 max-w-xs" />
                        </div>
                    ))}
                </div>
            )}

            {/* Hot list */}
            {items.length > 0 && (
                <div className="bg-gray-800/20 border border-gray-700/50 rounded-2xl overflow-hidden">
                    {items.map((item, i) => {
                        const tagInfo = HOT_TAG_MAP[item.hotTag] || HOT_TAG_MAP['0']
                        const isEven = i % 2 === 0

                        return (
                            <a key={item.rank}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 px-4 py-3 transition-colors group ${
                                    isEven ? 'bg-transparent' : 'bg-gray-800/10'
                                } hover:bg-red-500/5`}
                            >
                                {/* Rank badge */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${getRankStyle(item.rank, item.isTop)}`}>
                                    {item.isTop ? 'TOP' : item.rank}
                                </div>

                                {/* Title */}
                                <span className="flex-1 text-sm text-gray-200 group-hover:text-red-400 transition truncate">
                                    {item.word}
                                </span>

                                {/* Hot tag */}
                                {tagInfo.label && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${tagInfo.color}`}>
                                        {tagInfo.label}
                                    </span>
                                )}

                                {/* Arrow */}
                                <svg className="w-4 h-4 text-gray-600 group-hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )
                    })}
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-[10px] text-gray-600">
                {isKo ? '데이터 출처: 바이두 인기 검색 · 10분마다 자동 업데이트' : '数据来源: 百度热搜 · 每 10 分钟自动更新'}
            </div>
        </div>
    )
}
