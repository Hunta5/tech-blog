'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Mode = 'escape' | 'unescape' | 'format' | 'minify'

export default function JsonClient() {
    const { t } = useLanguage()
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [mode, setMode] = useState<Mode>('escape')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const handleConvert = () => {
        setError('')
        if (!input.trim()) { setError(t('json.enterText')); return }

        try {
            switch (mode) {
                case 'escape':
                    setOutput(jsonEscape(input))
                    break
                case 'unescape':
                    setOutput(jsonUnescape(input))
                    break
                case 'format':
                    setOutput(JSON.stringify(JSON.parse(input), null, 2))
                    break
                case 'minify':
                    setOutput(JSON.stringify(JSON.parse(input)))
                    break
            }
        } catch (e: any) {
            setError(e.message || 'Invalid input')
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const modes: { key: Mode; label: string; color: string }[] = [
        { key: 'escape', label: t('json.escape'), color: 'blue' },
        { key: 'unescape', label: t('json.unescape'), color: 'purple' },
        { key: 'format', label: t('json.formatBtn'), color: 'green' },
        { key: 'minify', label: t('json.minify'), color: 'pink' },
    ]

    return (
        <div className="space-y-6">
            {/* Mode Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {modes.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => { setMode(m.key); setOutput(''); setError('') }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            mode === m.key
                                ? `bg-${m.color}-500/20 text-${m.color}-400 border border-${m.color}-500/30`
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Hint */}
            <div className="text-xs text-gray-500">
                {mode === 'escape' && t('json.escapeHint')}
                {mode === 'unescape' && t('json.unescapeHint')}
                {mode === 'format' && t('json.formatHint')}
                {mode === 'minify' && t('json.minifyHint')}
            </div>

            {/* Input / Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('tool.input')}</label>
                    <textarea
                        className="w-full h-72 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder={mode === 'escape' || mode === 'unescape'
                            ? t('json.inputPlaceholder')
                            : t('json.jsonPlaceholder')}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('tool.output')}</label>
                        {output && (
                            <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                {copied ? t('tool.copied') : t('tool.copy')}
                            </button>
                        )}
                    </div>
                    <textarea
                        className="w-full h-72 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-sm resize-none"
                        placeholder="Result..."
                        value={output}
                        readOnly
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3">
                <button
                    onClick={handleConvert}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition"
                >
                    {mode === 'escape' ? t('json.escape') + ' →' : mode === 'unescape' ? '← ' + t('json.unescape') : mode === 'format' ? t('json.formatBtn') + ' →' : t('json.minify') + ' →'}
                </button>
                <button
                    onClick={() => { setInput(''); setOutput(''); setError('') }}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    {t('tool.clear')}
                </button>
            </div>

            {/* Reference table */}
            <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">{t('json.reference')}</summary>
                <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">{t('json.character')}</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">{t('json.escaped')}</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">{t('json.description')}</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {[
                                ['"', '\\"', 'Double quote'],
                                ['\\', '\\\\', 'Backslash'],
                                ['/', '\\/', 'Forward slash'],
                                ['\\b', '\\b', 'Backspace'],
                                ['\\f', '\\f', 'Form feed'],
                                ['\\n', '\\n', 'New line'],
                                ['\\r', '\\r', 'Carriage return'],
                                ['\\t', '\\t', 'Tab'],
                            ].map(([char, escaped, desc]) => (
                                <tr key={desc} className="border-b border-gray-800/50">
                                    <td className="px-4 py-1.5 text-blue-400">{char}</td>
                                    <td className="px-4 py-1.5 text-green-400">{escaped}</td>
                                    <td className="px-4 py-1.5 text-gray-400 font-sans">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    )
}

// --- JSON Escape/Unescape logic ---

function jsonEscape(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\f/g, '\\f')
        .replace(/\b/g, '\\b')
}

function jsonUnescape(str: string): string {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\f/g, '\f')
        .replace(/\\b/g, '\b')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
}
