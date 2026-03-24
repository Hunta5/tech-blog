'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- language config ----

interface LangOption {
    code: string
    label: string
    flag: string
}

const LANGUAGES: LangOption[] = [
    { code: 'auto', label: 'Auto Detect', flag: '🌐' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

// quick switch presets (without auto)
const QUICK_LANGS = ['zh-CN', 'en', 'ko', 'ja']

type Tab = 'text' | 'json'

// ---- MyMemory API ----

async function translateText(text: string, from: string, to: string): Promise<{ translated: string; detectedLang?: string }> {
    const langPair = `${from === 'auto' ? '' : from}|${to}`
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`API error: ${res.status}`)

    const data = await res.json()

    if (data.responseStatus !== 200 && data.responseStatus !== undefined) {
        throw new Error(data.responseDetails || 'Translation failed')
    }

    const translated = data.responseData?.translatedText || ''
    const detectedLang = data.responseData?.detectedLanguage || undefined

    return { translated, detectedLang }
}

// translate JSON string values recursively
async function translateJsonValues(
    obj: unknown,
    from: string,
    to: string,
    onProgress: (done: number, total: number) => void
): Promise<unknown> {
    const strings: { path: string[]; value: string }[] = []
    collectStrings(obj, [], strings)

    const total = strings.length
    let done = 0

    // batch translate in chunks to avoid rate limiting
    const BATCH_SIZE = 5
    const results: Map<string, string> = new Map()

    for (let i = 0; i < strings.length; i += BATCH_SIZE) {
        const batch = strings.slice(i, i + BATCH_SIZE)
        const promises = batch.map(async ({ path, value }) => {
            if (!value.trim()) return
            try {
                const { translated } = await translateText(value, from, to)
                results.set(path.join('.'), translated)
            } catch {
                results.set(path.join('.'), value) // keep original on error
            }
            done++
            onProgress(done, total)
        })
        await Promise.all(promises)
        // small delay between batches to respect rate limits
        if (i + BATCH_SIZE < strings.length) {
            await new Promise(r => setTimeout(r, 300))
        }
    }

    return replaceStrings(obj, [], results)
}

function collectStrings(obj: unknown, path: string[], out: { path: string[]; value: string }[]) {
    if (typeof obj === 'string') {
        out.push({ path: [...path], value: obj })
    } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => collectStrings(item, [...path, String(i)], out))
    } else if (obj && typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
            collectStrings(v, [...path, k], out)
        }
    }
}

function replaceStrings(obj: unknown, path: string[], results: Map<string, string>): unknown {
    if (typeof obj === 'string') {
        return results.get(path.join('.')) ?? obj
    }
    if (Array.isArray(obj)) {
        return obj.map((item, i) => replaceStrings(item, [...path, String(i)], results))
    }
    if (obj && typeof obj === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(obj)) {
            out[k] = replaceStrings(v, [...path, k], results)
        }
        return out
    }
    return obj
}

// ---- component ----

export default function TranslateClient() {
    const { t } = useLanguage()
    const [tab, setTab] = useState<Tab>('text')
    const [sourceLang, setSourceLang] = useState('auto')
    const [targetLang, setTargetLang] = useState('ko')
    const [sourceText, setSourceText] = useState('')
    const [targetText, setTargetText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [detectedLang, setDetectedLang] = useState('')
    const [charCount, setCharCount] = useState(0)

    // JSON tab
    const [jsonInput, setJsonInput] = useState('')
    const [jsonOutput, setJsonOutput] = useState('')
    const [jsonProgress, setJsonProgress] = useState({ done: 0, total: 0 })

    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // update char count
    useEffect(() => {
        setCharCount(tab === 'text' ? sourceText.length : jsonInput.length)
    }, [sourceText, jsonInput, tab])

    // auto-translate with debounce
    useEffect(() => {
        if (tab !== 'text' || !sourceText.trim() || loading) return
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            handleTranslate()
        }, 800)
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceText, sourceLang, targetLang])

    const handleTranslate = async () => {
        if (!sourceText.trim()) return
        setError(''); setLoading(true)
        try {
            const { translated, detectedLang: detected } = await translateText(sourceText, sourceLang, targetLang)
            setTargetText(translated)
            if (detected) setDetectedLang(detected)
        } catch (e: any) {
            setError(e.message || 'Translation failed')
        } finally {
            setLoading(false)
        }
    }

    const handleJsonTranslate = async () => {
        if (!jsonInput.trim()) { setError(t('translate.pasteJson')); return }
        setError(''); setJsonOutput(''); setLoading(true); setJsonProgress({ done: 0, total: 0 })
        try {
            const parsed = JSON.parse(jsonInput)
            const result = await translateJsonValues(
                parsed,
                sourceLang === 'auto' ? 'en' : sourceLang,
                targetLang,
                (done, total) => setJsonProgress({ done, total })
            )
            setJsonOutput(JSON.stringify(result, null, 2))
        } catch (e: any) {
            setError(e.message === 'Unexpected token' || e.message?.includes('JSON')
                ? t('translate.invalidJson')
                : e.message || 'Translation failed'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSwap = () => {
        if (sourceLang === 'auto') return
        const tmpLang = sourceLang
        setSourceLang(targetLang)
        setTargetLang(tmpLang)
        const tmpText = sourceText
        setSourceText(targetText)
        setTargetText(tmpText)
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleClear = () => {
        setSourceText(''); setTargetText(''); setJsonInput(''); setJsonOutput('')
        setError(''); setDetectedLang('')
    }

    const handleGoogleOpen = () => {
        const text = tab === 'text' ? sourceText : jsonInput
        if (!text.trim()) return
        const sl = sourceLang === 'auto' ? 'auto' : sourceLang.replace('-CN', '')
        const tl = targetLang.replace('-CN', '')
        window.open(`https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(text.slice(0, 5000))}&op=translate`, '_blank')
    }

    const getLangLabel = (code: string) => LANGUAGES.find(l => l.code === code)?.label || code
    const getLangFlag = (code: string) => LANGUAGES.find(l => l.code === code)?.flag || '🌐'

    const tabs: { key: Tab; label: string }[] = [
        { key: 'text', label: t('translate.textTab') },
        { key: 'json', label: t('translate.jsonTab') },
    ]

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {tabs.map(tb => (
                    <button key={tb.key} onClick={() => { setTab(tb.key); setError('') }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            tab === tb.key
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}>
                        {tb.label}
                    </button>
                ))}
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-3">
                {/* Source language */}
                <div className="flex-1">
                    <LangSelector
                        value={sourceLang}
                        onChange={setSourceLang}
                        showAuto
                        label={t('translate.sourceLang')}
                    />
                </div>

                {/* Swap button */}
                <button
                    onClick={handleSwap}
                    disabled={sourceLang === 'auto'}
                    className="mt-5 p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700/50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('translate.swap')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </button>

                {/* Target language */}
                <div className="flex-1">
                    <LangSelector
                        value={targetLang}
                        onChange={setTargetLang}
                        label={t('translate.targetLang')}
                    />
                </div>
            </div>

            {/* Quick language switches */}
            <div className="flex flex-wrap gap-2">
                {QUICK_LANGS.map(code => {
                    const lang = LANGUAGES.find(l => l.code === code)!
                    const isTarget = targetLang === code
                    return (
                        <button key={code} onClick={() => setTargetLang(code)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isTarget
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50'
                            }`}>
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* ==================== Text Tab ==================== */}
            {tab === 'text' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                {getLangFlag(sourceLang)} {getLangLabel(sourceLang)}
                                {detectedLang && sourceLang === 'auto' && (
                                    <span className="text-sky-400 ml-1 normal-case">
                                        → {getLangLabel(detectedLang)}
                                    </span>
                                )}
                            </label>
                            <span className="text-[10px] text-gray-600 font-mono">{charCount} / 5000</span>
                        </div>
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value.slice(0, 5000))}
                            placeholder={t('translate.inputPlaceholder')}
                            className="w-full h-52 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 resize-none"
                        />
                    </div>

                    {/* Target */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                {getLangFlag(targetLang)} {getLangLabel(targetLang)}
                            </label>
                            <div className="flex items-center gap-2">
                                {loading && (
                                    <svg className="w-4 h-4 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                )}
                                {targetText && (
                                    <button onClick={() => handleCopy(targetText)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition">
                                        {copied ? t('tool.copied') : t('tool.copy')}
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={targetText}
                            readOnly
                            placeholder={t('translate.resultPlaceholder')}
                            className="w-full h-52 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 text-sm resize-none"
                        />
                    </div>
                </div>
            )}

            {/* ==================== JSON Tab ==================== */}
            {tab === 'json' && (
                <div className="space-y-4">
                    <div className="text-xs text-gray-500">{t('translate.jsonHint')}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">JSON {t('tool.input')}</label>
                                {jsonInput.trim() && (
                                    <button onClick={() => { try { setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2)) } catch {} }}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition">{t('tool.format')}</button>
                                )}
                            </div>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder={'{\n  "title": "Hello World",\n  "description": "This is a test",\n  "items": [\n    {"name": "Item 1"},\n    {"name": "Item 2"}\n  ]\n}'}
                                className="w-full h-64 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">JSON {t('tool.output')}</label>
                                {jsonOutput && (
                                    <button onClick={() => handleCopy(jsonOutput)}
                                        className="text-xs text-blue-400 hover:text-blue-300 transition">
                                        {copied ? t('tool.copied') : t('tool.copy')}
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={jsonOutput}
                                readOnly
                                placeholder={t('translate.resultPlaceholder')}
                                className="w-full h-64 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* JSON progress */}
                    {loading && jsonProgress.total > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{t('translate.translating')}</span>
                                <span className="font-mono">{jsonProgress.done} / {jsonProgress.total}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                <div className="h-full rounded-full bg-sky-500 transition-all duration-300"
                                    style={{ width: `${(jsonProgress.done / jsonProgress.total) * 100}%` }} />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button onClick={handleJsonTranslate} disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50">
                            {loading ? t('translate.translating') : t('translate.translateJson')}
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button onClick={handleClear}
                    className="px-5 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition">
                    {t('tool.clear')}
                </button>
                <button onClick={handleGoogleOpen}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition ml-auto"
                    title={t('translate.openGoogle')}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('translate.openGoogle')}
                </button>
            </div>

            {/* API note */}
            <div className="text-[10px] text-gray-600 text-center">
                Powered by MyMemory Translation API · {t('translate.charLimit')}
            </div>
        </div>
    )
}

// ---- Language Selector ----

function LangSelector({ value, onChange, showAuto, label }: {
    value: string
    onChange: (v: string) => void
    showAuto?: boolean
    label: string
}) {
    const langs = showAuto ? LANGUAGES : LANGUAGES.filter(l => l.code !== 'auto')

    return (
        <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
                {langs.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
            </select>
        </div>
    )
}
