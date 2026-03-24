'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { calculateSaju } from '@/lib/saju/engine'
import type { SajuResult, Gender, Element } from '@/lib/saju/types'
import {
    STEMS, STEMS_KO, BRANCHES, BRANCHES_KO,
    ELEMENTS, ELEMENTS_KO, ELEMENTS_EN,
    ELEMENT_COLORS, STEM_ELEMENT, BRANCH_ELEMENT, TEN_GODS_ZH,
    TEN_GODS,
} from '@/lib/saju/types'

// ---- hour labels ----
const HOUR_OPTIONS = [
    { value: 0, label: '子时 (23:00~01:00)', ko: '자시 (23:00~01:00)' },
    { value: 1, label: '丑时 (01:00~03:00)', ko: '축시 (01:00~03:00)' },
    { value: 3, label: '寅时 (03:00~05:00)', ko: '인시 (03:00~05:00)' },
    { value: 5, label: '卯时 (05:00~07:00)', ko: '묘시 (05:00~07:00)' },
    { value: 7, label: '辰时 (07:00~09:00)', ko: '진시 (07:00~09:00)' },
    { value: 9, label: '巳时 (09:00~11:00)', ko: '사시 (09:00~11:00)' },
    { value: 11, label: '午时 (11:00~13:00)', ko: '오시 (11:00~13:00)' },
    { value: 13, label: '未时 (13:00~15:00)', ko: '미시 (13:00~15:00)' },
    { value: 15, label: '申时 (15:00~17:00)', ko: '신시 (15:00~17:00)' },
    { value: 17, label: '酉时 (17:00~19:00)', ko: '유시 (17:00~19:00)' },
    { value: 19, label: '戌时 (19:00~21:00)', ko: '술시 (19:00~21:00)' },
    { value: 21, label: '亥时 (21:00~23:00)', ko: '해시 (21:00~23:00)' },
]

export default function SajuPage() {
    const { t, lang } = useLanguage()
    const isKo = lang === 'ko'

    // form state
    const [birthYear, setBirthYear] = useState(1990)
    const [birthMonth, setBirthMonth] = useState(1)
    const [birthDay, setBirthDay] = useState(1)
    const [birthHour, setBirthHour] = useState(9)
    const [gender, setGender] = useState<Gender>('male')
    const [result, setResult] = useState<SajuResult | null>(null)

    const handleCalculate = () => {
        const r = calculateSaju(birthYear, birthMonth, birthDay, birthHour, gender)
        setResult(r)
    }

    // helper: get localized stem/branch
    const ls = (stem: string) => {
        const idx = STEMS.indexOf(stem as any)
        return isKo ? STEMS_KO[idx] : stem
    }
    const lb = (branch: string) => {
        const idx = BRANCHES.indexOf(branch as any)
        return isKo ? BRANCHES_KO[idx] : branch
    }
    const le = (el: Element) => {
        const idx = ELEMENTS.indexOf(el)
        return isKo ? ELEMENTS_KO[idx] : el
    }
    const leEn = (el: Element) => ELEMENTS_EN[ELEMENTS.indexOf(el)]
    const lGod = (god: string) => {
        const idx = TEN_GODS.indexOf(god as any)
        return isKo ? god : TEN_GODS_ZH[idx]
    }

    const ec = (el: Element) => ELEMENT_COLORS[el]

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* Header */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
                {isKo ? '사주팔자' : '四柱八字'}
            </h1>
            <p className="text-gray-400 mb-10">
                {isKo ? '생년월일시를 입력하면 사주팔자를 무료로 분석합니다.' : '输入出生年月日时，免费排出四柱八字命盘。'}
            </p>

            {/* Input Form */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {/* Year */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                            {isKo ? '생년' : '出生年'}
                        </label>
                        <input type="number" value={birthYear} onChange={e => setBirthYear(parseInt(e.target.value) || 1990)}
                            min={1900} max={2100}
                            className="w-full px-3 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                    </div>
                    {/* Month */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                            {isKo ? '월' : '月'}
                        </label>
                        <select value={birthMonth} onChange={e => setBirthMonth(parseInt(e.target.value))}
                            className="w-full px-3 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none">
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}{isKo ? '월' : '月'}</option>
                            ))}
                        </select>
                    </div>
                    {/* Day */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                            {isKo ? '일' : '日'}
                        </label>
                        <select value={birthDay} onChange={e => setBirthDay(parseInt(e.target.value))}
                            className="w-full px-3 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none">
                            {Array.from({ length: 31 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}{isKo ? '일' : '日'}</option>
                            ))}
                        </select>
                    </div>
                    {/* Hour */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                            {isKo ? '시' : '时辰'}
                        </label>
                        <select value={birthHour} onChange={e => setBirthHour(parseInt(e.target.value))}
                            className="w-full px-3 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none">
                            {HOUR_OPTIONS.map(h => (
                                <option key={h.value} value={h.value}>{isKo ? h.ko : h.label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Gender */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                            {isKo ? '성별' : '性别'}
                        </label>
                        <div className="flex gap-2 h-[42px]">
                            <button onClick={() => setGender('male')}
                                className={`flex-1 rounded-lg text-sm font-medium transition-all ${
                                    gender === 'male'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                }`}>
                                {isKo ? '남' : '男'}
                            </button>
                            <button onClick={() => setGender('female')}
                                className={`flex-1 rounded-lg text-sm font-medium transition-all ${
                                    gender === 'female'
                                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                }`}>
                                {isKo ? '여' : '女'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button onClick={handleCalculate}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition shadow-lg shadow-red-500/20">
                        {isKo ? '사주 보기' : '排盘分析'}
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="space-y-8">
                    {/* Four Pillars Card */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-amber-500 to-red-500 rounded-full" />
                            {isKo ? '사주팔자 명반' : '四柱八字命盘'}
                        </h2>

                        {/* Zodiac */}
                        <div className="text-center mb-6">
                            <span className="text-xs text-gray-500">{isKo ? '띠' : '生肖'}: </span>
                            <span className="text-amber-400 font-medium">{isKo ? result.zodiacKo : result.zodiac}</span>
                            <span className="text-gray-600 mx-2">·</span>
                            <span className="text-xs text-gray-500">{isKo ? '일주' : '日主'}: </span>
                            <span className={`font-bold ${ec(result.dayMasterElement).text}`}>
                                {ls(result.dayMaster)} ({le(result.dayMasterElement)})
                            </span>
                        </div>

                        {/* Pillars grid */}
                        <div className="grid grid-cols-4 gap-3 md:gap-4">
                            {[
                                { label: isKo ? '시주' : '时柱', labelEn: 'Hour', pillar: result.hour, god: result.tenGods.hour },
                                { label: isKo ? '일주' : '日柱', labelEn: 'Day', pillar: result.day, god: null },
                                { label: isKo ? '월주' : '月柱', labelEn: 'Month', pillar: result.month, god: result.tenGods.month },
                                { label: isKo ? '연주' : '年柱', labelEn: 'Year', pillar: result.year, god: result.tenGods.year },
                            ].map(({ label, pillar, god }) => {
                                const stemColor = ec(pillar.stemElement)
                                const branchColor = ec(pillar.branchElement)
                                return (
                                    <div key={label} className="text-center">
                                        {/* Label */}
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">{label}</div>
                                        {/* Ten God */}
                                        <div className="text-[10px] text-gray-600 mb-1 h-4">
                                            {god ? lGod(god) : (isKo ? '일주' : '日主')}
                                        </div>
                                        {/* Stem */}
                                        <div className={`rounded-t-xl border-t border-l border-r py-4 md:py-6 ${stemColor.bg} ${stemColor.border}`}>
                                            <div className={`text-2xl md:text-3xl font-bold ${stemColor.text}`}>{ls(pillar.stem)}</div>
                                            <div className="text-[10px] text-gray-500 mt-1">{le(pillar.stemElement)} · {pillar.stemYinyang === 0 ? (isKo ? '양' : '阳') : (isKo ? '음' : '阴')}</div>
                                        </div>
                                        {/* Branch */}
                                        <div className={`rounded-b-xl border-b border-l border-r py-4 md:py-6 ${branchColor.bg} ${branchColor.border}`}>
                                            <div className={`text-2xl md:text-3xl font-bold ${branchColor.text}`}>{lb(pillar.branch)}</div>
                                            <div className="text-[10px] text-gray-500 mt-1">{le(pillar.branchElement)}</div>
                                            {/* Hidden stems */}
                                            <div className="flex justify-center gap-1 mt-2">
                                                {pillar.hiddenStems.map((hs, i) => {
                                                    const hec = ec(STEM_ELEMENT[hs])
                                                    return (
                                                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${hec.bg} ${hec.text} ${hec.border} border`}>
                                                            {ls(hs)}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Five Elements */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-green-500 to-blue-500 rounded-full" />
                            {isKo ? '오행 분석' : '五行分析'}
                        </h2>

                        <div className="space-y-3">
                            {ELEMENTS.map((el, i) => {
                                const count = result.elementCounts[el]
                                const total = Object.values(result.elementCounts).reduce((a, b) => a + b, 0)
                                const pct = total > 0 ? (count / total) * 100 : 0
                                const c = ec(el)
                                const isDayMaster = el === result.dayMasterElement

                                return (
                                    <div key={el} className="flex items-center gap-3">
                                        <div className={`w-16 text-sm font-bold ${c.text} flex items-center gap-1`}>
                                            {le(el)}
                                            <span className="text-[10px] text-gray-600">({leEn(el)})</span>
                                        </div>
                                        <div className="flex-1 h-6 rounded-full bg-gray-800 overflow-hidden relative">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${
                                                    el === '木' ? 'bg-green-500' :
                                                    el === '火' ? 'bg-red-500' :
                                                    el === '土' ? 'bg-yellow-500' :
                                                    el === '金' ? 'bg-gray-400' :
                                                    'bg-blue-500'
                                                }`}
                                                style={{ width: `${Math.max(pct, 2)}%` }}
                                            />
                                            {isDayMaster && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-white/70">
                                                    ★ {isKo ? '일주' : '日主'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className={`text-sm font-mono ${c.text}`}>{count.toFixed(1)}</span>
                                            <span className="text-[10px] text-gray-600 ml-1">({pct.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Balance hint */}
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                            <BalanceHint result={result} isKo={isKo} le={le} />
                        </div>
                    </div>

                    {/* Major Fortunes */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                            {isKo ? '대운 (10년 운세)' : '大运 (十年运势)'}
                        </h2>

                        <div className="overflow-x-auto">
                            <div className="flex gap-2 min-w-max pb-2">
                                {result.majorFortunes.map((mf, i) => {
                                    const c = ec(mf.element)
                                    return (
                                        <div key={i} className={`text-center px-4 py-3 rounded-xl border ${c.bg} ${c.border} min-w-[70px]`}>
                                            <div className="text-[10px] text-gray-500 mb-1">{mf.startAge}{isKo ? '세' : '岁'}</div>
                                            <div className={`text-lg font-bold ${c.text}`}>{ls(mf.stem)}</div>
                                            <div className={`text-lg font-bold ${ec(BRANCH_ELEMENT[mf.branch] || mf.element).text}`}>{lb(mf.branch)}</div>
                                            <div className="text-[10px] text-gray-500 mt-1">{le(mf.element)}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* AI Interpretation CTA */}
                    <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-purple-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8 text-center">
                        <div className="text-3xl mb-3">🔮</div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {isKo ? 'AI 사주 해석' : 'AI 命理解读'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
                            {isKo
                                ? 'AI가 당신의 사주를 분석하여 성격, 재운, 건강, 인연 등 상세한 해석을 제공합니다.'
                                : 'AI 分析你的八字命盘，提供性格、财运、健康、姻缘等详细解读。'}
                        </p>
                        <button disabled
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-lg font-medium text-sm opacity-50 cursor-not-allowed">
                            {isKo ? '준비 중 (Phase 2)' : '即将上线 (Phase 2)'}
                        </button>
                        <p className="text-[10px] text-gray-600 mt-2">
                            {isKo ? '1 크레딧 / 1 회 해석' : '1 积分 / 1 次解读'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ---- Balance Hint Component ----

function BalanceHint({ result, isKo, le }: { result: SajuResult; isKo: boolean; le: (el: Element) => string }) {
    const counts = result.elementCounts
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]) as [Element, number][]
    const strongest = sorted[0]
    const weakest = sorted[sorted.length - 1]

    // Find missing elements
    const missing = sorted.filter(([, v]) => v === 0).map(([k]) => k)

    return (
        <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
                <span className="text-gray-500">{isKo ? '가장 강한 오행:' : '最强五行:'}</span>
                <span className={`font-bold ${ELEMENT_COLORS[strongest[0]].text}`}>
                    {le(strongest[0])} ({strongest[1].toFixed(1)})
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-gray-500">{isKo ? '가장 약한 오행:' : '最弱五行:'}</span>
                <span className={`font-bold ${ELEMENT_COLORS[weakest[0]].text}`}>
                    {le(weakest[0])} ({weakest[1].toFixed(1)})
                </span>
            </div>
            {missing.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-orange-400">⚠</span>
                    <span className="text-gray-500">{isKo ? '부족한 오행:' : '缺失五行:'}</span>
                    <span className="text-orange-400 font-bold">{missing.map(le).join(', ')}</span>
                </div>
            )}
        </div>
    )
}
