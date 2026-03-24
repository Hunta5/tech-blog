'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function URLClient() {
    const { t } = useLanguage()
    const [mode, setMode] = useState<'encode' | 'decode'>('encode')
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [copied, setCopied] = useState(false)

    const handleConvert = () => {
        try {
            if (mode === 'encode') {
                setOutput(encodeURIComponent(input))
            } else {
                setOutput(decodeURIComponent(input))
            }
        } catch {
            setOutput('Invalid input')
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {(['encode', 'decode'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); setOutput('') }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            mode === m
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        {m === 'encode' ? t('urlTool.encode') : t('urlTool.decode')}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('tool.input')}</label>
                    <textarea
                        className="w-full h-56 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                        placeholder={mode === 'encode' ? t('urlTool.encodePlaceholder') : t('urlTool.decodePlaceholder')}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('tool.output')}</label>
                        {output && (
                            <button onClick={handleCopy} className="text-xs text-purple-400 hover:text-purple-300 transition">
                                {copied ? t('tool.copied') : t('tool.copy')}
                            </button>
                        )}
                    </div>
                    <textarea
                        className="w-full h-56 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-sm resize-none"
                        placeholder={t('base64.resultPlaceholder')}
                        value={output}
                        readOnly
                    />
                </div>
            </div>

            <div className="flex justify-center gap-3">
                <button
                    onClick={handleConvert}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition"
                >
                    {mode === 'encode' ? t('urlTool.encode') + ' →' : '← ' + t('urlTool.decode')}
                </button>
                <button
                    onClick={() => { setInput(''); setOutput('') }}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    {t('tool.clear')}
                </button>
            </div>
        </div>
    )
}
