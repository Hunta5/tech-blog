'use client'

import { useState } from 'react'

type Mode = 'escape' | 'unescape' | 'format' | 'minify'

export default function JsonClient() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [mode, setMode] = useState<Mode>('escape')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const handleConvert = () => {
        setError('')
        if (!input.trim()) { setError('Please enter some text'); return }

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
        { key: 'escape', label: 'Escape', color: 'blue' },
        { key: 'unescape', label: 'Unescape', color: 'purple' },
        { key: 'format', label: 'Format', color: 'green' },
        { key: 'minify', label: 'Minify', color: 'pink' },
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
                {mode === 'escape' && 'Escapes special characters in a string for use inside JSON values (\\n, \\t, \\", etc.)'}
                {mode === 'unescape' && 'Unescapes a JSON-escaped string back to its original form'}
                {mode === 'format' && 'Parses and pretty-prints JSON with 2-space indentation'}
                {mode === 'minify' && 'Removes all whitespace from JSON to minimize its size'}
            </div>

            {/* Input / Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Input</label>
                    <textarea
                        className="w-full h-72 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder={mode === 'escape' || mode === 'unescape'
                            ? 'Enter text to escape/unescape...'
                            : 'Paste JSON here...'}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Output</label>
                        {output && (
                            <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                {copied ? 'Copied!' : 'Copy'}
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
                    {mode === 'escape' ? 'Escape →' : mode === 'unescape' ? '← Unescape' : mode === 'format' ? 'Format →' : 'Minify →'}
                </button>
                <button
                    onClick={() => { setInput(''); setOutput(''); setError('') }}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    Clear
                </button>
            </div>

            {/* Reference table */}
            <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">Escape Reference</summary>
                <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Character</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Escaped</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Description</th>
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
