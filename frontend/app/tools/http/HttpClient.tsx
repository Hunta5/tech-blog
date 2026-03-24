'use client'

import { useState, useCallback } from 'react'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type Header = { key: string; value: string; enabled: boolean }
type Tab = 'headers' | 'body' | 'curl'

const METHOD_COLORS: Record<Method, string> = {
    GET: 'text-green-400',
    POST: 'text-blue-400',
    PUT: 'text-yellow-400',
    PATCH: 'text-orange-400',
    DELETE: 'text-red-400',
}

const defaultHeaders: Header[] = [
    { key: 'Content-Type', value: 'application/json', enabled: true },
]

export default function HttpClient() {
    const [method, setMethod] = useState<Method>('GET')
    const [url, setUrl] = useState('')
    const [headers, setHeaders] = useState<Header[]>(defaultHeaders)
    const [body, setBody] = useState('')
    const [activeTab, setActiveTab] = useState<Tab>('headers')
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<{
        status: number
        statusText: string
        headers: Record<string, string>
        body: string
        time: number
        size: number
    } | null>(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [showMethodDropdown, setShowMethodDropdown] = useState(false)

    const enabledHeaders = headers.filter((h) => h.enabled && h.key.trim())

    const generateCurl = useCallback(() => {
        if (!url.trim()) return 'curl <URL>'
        const parts: string[] = ['curl']
        if (method !== 'GET') parts.push(`-X ${method}`)
        parts.push(`'${url}'`)
        for (const h of enabledHeaders) {
            parts.push(`-H '${h.key}: ${h.value}'`)
        }
        if (body.trim() && method !== 'GET') {
            parts.push(`-d '${body.replace(/'/g, "'\\''")}'`)
        }
        return parts.join(' \\\n  ')
    }, [url, method, enabledHeaders, body])

    const handleSend = async () => {
        setError('')
        setResponse(null)
        if (!url.trim()) {
            setError('Please enter a URL')
            return
        }

        setLoading(true)
        const start = performance.now()

        try {
            const fetchHeaders: Record<string, string> = {}
            for (const h of enabledHeaders) {
                fetchHeaders[h.key] = h.value
            }

            const options: RequestInit = {
                method,
                headers: fetchHeaders,
            }
            if (body.trim() && method !== 'GET') {
                options.body = body
            }

            const res = await fetch(url, options)
            const elapsed = Math.round(performance.now() - start)
            const text = await res.text()

            const resHeaders: Record<string, string> = {}
            res.headers.forEach((v, k) => {
                resHeaders[k] = v
            })

            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: resHeaders,
                body: text,
                time: elapsed,
                size: new Blob([text]).size,
            })
        } catch (e: any) {
            setError(e.message || 'Request failed')
        } finally {
            setLoading(false)
        }
    }

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '', enabled: true }])
    }

    const updateHeader = (i: number, field: keyof Header, val: string | boolean) => {
        const next = [...headers]
        next[i] = { ...next[i], [field]: val }
        setHeaders(next)
    }

    const removeHeader = (i: number) => {
        setHeaders(headers.filter((_, idx) => idx !== i))
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const formatBody = (text: string) => {
        try {
            return JSON.stringify(JSON.parse(text), null, 2)
        } catch {
            return text
        }
    }

    const statusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'text-green-400 bg-green-500/10 border-green-500/20'
        if (status >= 300 && status < 400) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
        if (status >= 400 && status < 500) return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
        return 'text-red-400 bg-red-500/10 border-red-500/20'
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        return `${(bytes / 1024).toFixed(1)} KB`
    }

    const methods: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    const tabs: { key: Tab; label: string }[] = [
        { key: 'headers', label: 'Headers' },
        { key: 'body', label: 'Body' },
        { key: 'curl', label: 'cURL' },
    ]

    return (
        <div className="space-y-6">
            {/* URL Bar */}
            <div className="flex gap-2">
                <div className="relative">
                    <button
                        onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                        className={`h-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 font-mono text-sm font-bold transition hover:bg-gray-700/50 ${METHOD_COLORS[method]} min-w-[90px]`}
                    >
                        {method} <span className="text-gray-600 ml-1">&#9662;</span>
                    </button>
                    {showMethodDropdown && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                            {methods.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => { setMethod(m); setShowMethodDropdown(false) }}
                                    className={`block w-full px-4 py-2 text-left text-sm font-mono font-bold hover:bg-gray-700/50 transition ${METHOD_COLORS[m]} ${m === method ? 'bg-gray-700/30' : ''}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending
                        </span>
                    ) : 'Send'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        {tab.label}
                        {tab.key === 'headers' && enabledHeaders.length > 0 && (
                            <span className="ml-1.5 text-xs text-gray-500">({enabledHeaders.length})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {/* Headers Tab */}
                {activeTab === 'headers' && (
                    <div className="space-y-2">
                        {headers.map((h, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={h.enabled}
                                    onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 accent-blue-500"
                                />
                                <input
                                    type="text"
                                    value={h.key}
                                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                                    placeholder="Header name"
                                    className="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <input
                                    type="text"
                                    value={h.value}
                                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <button
                                    onClick={() => removeHeader(i)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition"
                                    title="Remove"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addHeader}
                            className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1 mt-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Header
                        </button>
                    </div>
                )}

                {/* Body Tab */}
                {activeTab === 'body' && (
                    <div>
                        {method === 'GET' && (
                            <div className="text-sm text-gray-500 bg-gray-800/30 border border-gray-700/50 rounded-lg px-4 py-3 mb-3">
                                GET requests typically don&apos;t include a body.
                            </div>
                        )}
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={'{\n  "key": "value"\n}'}
                            className="w-full h-48 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        />
                        {body.trim() && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setBody(formatBody(body))}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                                >
                                    Format JSON
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* cURL Tab */}
                {activeTab === 'curl' && (
                    <div>
                        <div className="relative">
                            <pre className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
                                {generateCurl()}
                            </pre>
                            <button
                                onClick={() => handleCopy(generateCurl())}
                                className="absolute top-3 right-3 text-xs text-blue-400 hover:text-blue-300 transition bg-gray-800/80 px-2 py-1 rounded"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Response */}
            {response && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Response</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-sm font-mono font-bold border ${statusColor(response.status)}`}>
                            {response.status} {response.statusText}
                        </span>
                        <span className="text-xs text-gray-500">{response.time}ms</span>
                        <span className="text-xs text-gray-500">{formatSize(response.size)}</span>
                        <button
                            onClick={() => handleCopy(response.body)}
                            className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition"
                        >
                            {copied ? 'Copied!' : 'Copy Body'}
                        </button>
                    </div>

                    {/* Response Headers */}
                    {Object.keys(response.headers).length > 0 && (
                        <details>
                            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">
                                Response Headers ({Object.keys(response.headers).length})
                            </summary>
                            <div className="mt-2 bg-gray-800/50 border border-gray-700 rounded-xl p-4 overflow-x-auto">
                                <table className="w-full text-xs font-mono">
                                    <tbody>
                                        {Object.entries(response.headers).map(([k, v]) => (
                                            <tr key={k} className="border-b border-gray-800/50 last:border-0">
                                                <td className="pr-4 py-1 text-blue-400 whitespace-nowrap">{k}</td>
                                                <td className="py-1 text-gray-400 break-all">{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    )}

                    {/* Response Body */}
                    <pre className="w-full p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap break-all">
                        {formatBody(response.body)}
                    </pre>
                </div>
            )}
        </div>
    )
}
