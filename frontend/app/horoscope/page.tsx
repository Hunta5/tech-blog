'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ZODIAC_SIGNS, getZodiacSign, type ZodiacSign } from '@/lib/horoscope/types'
import { getDailyFortune } from '@/lib/horoscope/engine'

// ---- Gradient per element ----
const ELEMENT_GRADIENT: Record<string, string> = {
    Fire: 'from-red-500/20 to-orange-500/20',
    Earth: 'from-yellow-600/20 to-amber-500/20',
    Air: 'from-sky-500/20 to-cyan-500/20',
    Water: 'from-blue-500/20 to-indigo-500/20',
}

const ELEMENT_BORDER: Record<string, string> = {
    Fire: 'border-red-500/30',
    Earth: 'border-yellow-500/30',
    Air: 'border-sky-500/30',
    Water: 'border-blue-500/30',
}

const ELEMENT_TEXT: Record<string, string> = {
    Fire: 'text-red-400',
    Earth: 'text-yellow-400',
    Air: 'text-sky-400',
    Water: 'text-blue-400',
}

export default function HoroscopePage() {
    const { lang } = useLanguage()
    const isKo = lang === 'ko'

    const today = useMemo(() => new Date(), [])
    const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null)
    const [dateOffset, setDateOffset] = useState(0) // 0=today, -1=yesterday, 1=tomorrow

    const viewDate = useMemo(() => {
        const d = new Date(today)
        d.setDate(d.getDate() + dateOffset)
        return d
    }, [today, dateOffset])

    const fortune = useMemo(() => {
        if (!selectedSign) return null
        return getDailyFortune(selectedSign, viewDate)
    }, [selectedSign, viewDate])

    const formatDate = (d: Date) => {
        const y = d.getFullYear()
        const m = d.getMonth() + 1
        const day = d.getDate()
        const weekdays = isKo
            ? ['일', '월', '화', '수', '목', '금', '토']
            : ['日', '一', '二', '三', '四', '五', '六']
        const wd = weekdays[d.getDay()]
        return isKo ? `${y}년 ${m}월 ${day}일 (${wd})` : `${y}年${m}月${day}日 (${isKo ? wd : '周' + wd})`
    }

    const starDisplay = (count: number) => {
        return '★'.repeat(count) + '☆'.repeat(5 - count)
    }

    const starColor = (count: number) => {
        if (count >= 4) return 'text-yellow-400'
        if (count >= 3) return 'text-amber-400'
        if (count >= 2) return 'text-orange-400'
        return 'text-gray-500'
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* Header */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {isKo ? '오늘의 별자리 운세' : '今日星座运势'}
            </h1>
            <p className="text-gray-400 mb-10">
                {isKo ? '당신의 별자리를 선택하면 오늘의 운세를 확인할 수 있습니다.' : '选择你的星座，查看今日运势。'}
            </p>

            {/* Zodiac Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
                {ZODIAC_SIGNS.map(sign => {
                    const isSelected = selectedSign?.id === sign.id
                    const elGrad = ELEMENT_GRADIENT[sign.element.en]
                    const elBorder = ELEMENT_BORDER[sign.element.en]
                    const elText = ELEMENT_TEXT[sign.element.en]

                    return (
                        <button
                            key={sign.id}
                            onClick={() => setSelectedSign(sign)}
                            className={`relative flex flex-col items-center gap-1 px-3 py-4 rounded-xl border transition-all duration-200 ${
                                isSelected
                                    ? `bg-gradient-to-b ${elGrad} ${elBorder} shadow-lg scale-105`
                                    : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600'
                            }`}
                        >
                            <span className="text-2xl">{sign.symbol}</span>
                            <span className={`text-sm font-medium ${isSelected ? elText : 'text-gray-300'}`}>
                                {isKo ? sign.name.ko : sign.name.zh}
                            </span>
                            <span className="text-[10px] text-gray-500">{isKo ? sign.dateRange.ko : sign.dateRange.zh}</span>
                        </button>
                    )
                })}
            </div>

            {/* Selected Sign Detail */}
            {selectedSign && fortune && (
                <div className="space-y-6">
                    {/* Sign Header + Date Nav */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-5xl">{selectedSign.symbol}</span>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {isKo ? selectedSign.name.ko : selectedSign.name.zh}
                                    </h2>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span>{isKo ? selectedSign.element.ko : selectedSign.element.zh}</span>
                                        <span>·</span>
                                        <span>{isKo ? selectedSign.ruling.ko : selectedSign.ruling.zh}</span>
                                        <span>·</span>
                                        <span>{isKo ? selectedSign.dateRange.ko : selectedSign.dateRange.zh}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Date navigation */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => setDateOffset(d => d - 1)}
                                    className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button onClick={() => setDateOffset(0)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                        dateOffset === 0
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                    }`}>
                                    {isKo ? '오늘' : '今天'}
                                </button>
                                <button onClick={() => setDateOffset(d => d + 1)}
                                    className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <span className="text-xs text-gray-500 ml-2">{formatDate(viewDate)}</span>
                            </div>
                        </div>

                        {/* Overall stars */}
                        <div className="text-center mb-6 py-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                            <div className="text-xs text-gray-500 mb-1">{isKo ? '종합 운세' : '综合运势'}</div>
                            <div className={`text-3xl tracking-wider ${starColor(fortune.overall)}`}>
                                {starDisplay(fortune.overall)}
                            </div>
                            <p className="text-sm text-gray-300 mt-3 max-w-md mx-auto">
                                {isKo ? fortune.overallText.ko : fortune.overallText.zh}
                            </p>
                        </div>

                        {/* Category ratings */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: isKo ? '연애운' : '爱情运', stars: fortune.love, text: isKo ? fortune.loveText.ko : fortune.loveText.zh, icon: '💕' },
                                { label: isKo ? '사업운' : '事业运', stars: fortune.career, text: isKo ? fortune.careerText.ko : fortune.careerText.zh, icon: '💼' },
                                { label: isKo ? '재물운' : '财运', stars: fortune.wealth, text: isKo ? fortune.wealthText.ko : fortune.wealthText.zh, icon: '💰' },
                                { label: isKo ? '건강운' : '健康运', stars: fortune.health, text: '', icon: '❤️' },
                            ].map(({ label, stars, text, icon }) => (
                                <div key={label} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{icon}</span>
                                        <span className="text-sm font-medium text-gray-300">{label}</span>
                                    </div>
                                    <div className={`text-lg tracking-wider mb-2 ${starColor(stars)}`}>
                                        {starDisplay(stars)}
                                    </div>
                                    {text && <p className="text-xs text-gray-500 leading-relaxed">{text}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lucky Items */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full" />
                            {isKo ? '오늘의 행운' : '今日幸运'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
                                <div className="text-xs text-gray-500 mb-1">{isKo ? '행운의 숫자' : '幸运数字'}</div>
                                <div className="text-2xl font-bold text-amber-400">{fortune.luckyNumber}</div>
                            </div>
                            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
                                <div className="text-xs text-gray-500 mb-1">{isKo ? '행운의 색' : '幸运色'}</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full border border-gray-600" style={{ backgroundColor: fortune.luckyColor.hex }} />
                                    <span className="text-lg font-bold text-amber-400">
                                        {isKo ? fortune.luckyColor.ko : fortune.luckyColor.zh}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
                                <div className="text-xs text-gray-500 mb-1">{isKo ? '행운의 시간' : '幸运时段'}</div>
                                <div className="text-lg font-bold text-amber-400">
                                    {isKo ? fortune.luckyTime.ko : fortune.luckyTime.zh}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advice */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 md:p-8">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="text-sm font-bold text-purple-400 mb-2">
                                    {isKo ? '오늘의 조언' : '今日建议'}
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {isKo ? fortune.advice.ko : fortune.advice.zh}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* All signs overview */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                            {isKo ? '전체 별자리 운세' : '全部星座运势'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {ZODIAC_SIGNS.map(sign => {
                                const f = getDailyFortune(sign, viewDate)
                                const isCurrent = sign.id === selectedSign.id
                                return (
                                    <button key={sign.id}
                                        onClick={() => setSelectedSign(sign)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                                            isCurrent
                                                ? 'bg-purple-500/10 border border-purple-500/20'
                                                : 'bg-gray-800/20 border border-transparent hover:bg-gray-800/40'
                                        }`}>
                                        <span className="text-lg">{sign.symbol}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-300 truncate">{isKo ? sign.name.ko : sign.name.zh}</div>
                                            <div className={`text-xs tracking-wider ${starColor(f.overall)}`}>{starDisplay(f.overall)}</div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* No selection prompt */}
            {!selectedSign && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">⭐</div>
                    <p className="text-gray-500">
                        {isKo ? '위에서 당신의 별자리를 선택하세요' : '请在上方选择你的星座'}
                    </p>
                </div>
            )}
        </div>
    )
}
