'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { parseAuto, formatCrashReport } from '@/lib/crash/parser'
import type { CrashReport, CrashThread } from '@/lib/crash/types'

interface SymbolInfo {
    id: string
    device: string
    iosVersion: string
    downloadDate: string
    directoryPath: string
}

export default function CrashToolPage() {
    const [input, setInput] = useState('')
    const [report, setReport] = useState<CrashReport | null>(null)
    const [formatted, setFormatted] = useState('')
    const [error, setError] = useState('')
    const [dsymFile, setDsymFile] = useState<File | null>(null)
    const [symbolicating, setSymbolicating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('input')
    const fileRef = useRef<HTMLInputElement>(null)

    // System symbols
    const [symbolSets, setSymbolSets] = useState<SymbolInfo[]>([])
    const [selectedSymbolId, setSelectedSymbolId] = useState<string>('')
    const [downloading, setDownloading] = useState(false)
    const [downloadDevice, setDownloadDevice] = useState('iPhone15,2')
    const [downloadVersion, setDownloadVersion] = useState('')
    const [showDownload, setShowDownload] = useState(false)

    const fetchSymbols = useCallback(async () => {
        try {
            const res = await fetch('/api/symbols')
            const json = await res.json()
            if (json.code === 0) setSymbolSets(json.data || [])
        } catch { /* ignore */ }
    }, [])

    useEffect(() => { fetchSymbols() }, [fetchSymbols])

    const handleParse = () => {
        setError('')
        setFormatted('')
        setReport(null)
        if (!input.trim()) { setError('Please paste a crash log'); return }
        try {
            const r = parseAuto(input)
            setReport(r)
            setFormatted(formatCrashReport(r))
            setActiveTab('output')
        } catch (e: any) {
            setError(e.message || 'Failed to parse crash log')
        }
    }

    const handleSymbolicate = async () => {
        if (!report) return
        if (!dsymFile && !selectedSymbolId) { setError('Please upload a dSYM or select system symbols'); return }
        setSymbolicating(true)
        setError('')

        try {
            // Symbolicate ALL threads, not just crashed one
            for (const thread of report.threads) {
                await symbolicateThread(thread)
            }
            setFormatted(formatCrashReport(report))
        } catch (e: any) {
            setError(e.message || 'Symbolication failed')
        } finally {
            setSymbolicating(false)
        }
    }

    const symbolicateThread = async (thread: CrashThread) => {
        // Group unsymbolicated frames by binary
        const groups: Record<string, { indices: number[]; addresses: string[]; loadAddress: string }> = {}
        for (const frame of thread.frames) {
            if (frame.symbolicated) continue
            if (!groups[frame.binaryName]) {
                groups[frame.binaryName] = { indices: [], addresses: [], loadAddress: frame.loadAddress }
            }
            groups[frame.binaryName].indices.push(frame.frameIndex)
            groups[frame.binaryName].addresses.push(frame.address)
        }

        for (const [binaryName, group] of Object.entries(groups)) {
            const form = new FormData()
            if (dsymFile) form.append('dsym', dsymFile)
            form.append('binaryName', binaryName)
            form.append('loadAddress', group.loadAddress)
            form.append('arch', 'arm64')
            form.append('addresses', JSON.stringify(group.addresses))
            if (selectedSymbolId) form.append('symbolSetId', selectedSymbolId)

            try {
                const res = await fetch('/api/symbolicate', { method: 'POST', body: form })
                const json = await res.json()
                if (json.code === 0 && json.data) {
                    const symbols: string[] = json.data
                    for (let i = 0; i < symbols.length; i++) {
                        const frameIdx = group.indices[i]
                        const frame = thread.frames.find(f => f.frameIndex === frameIdx)
                        if (frame && symbols[i] && !symbols[i].startsWith('0x')) {
                            frame.symbolicated = symbols[i]
                        }
                    }
                }
            } catch { /* skip binary if fails */ }
        }
    }

    const handleDownloadSymbols = async () => {
        if (!downloadDevice || !downloadVersion) return
        setDownloading(true)
        setError('')
        try {
            const res = await fetch('/api/symbols', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device: downloadDevice, version: downloadVersion }),
            })
            const json = await res.json()
            if (json.code !== 0) throw new Error(json.message)
            await fetchSymbols()
            setShowDownload(false)
        } catch (e: any) {
            setError(e.message || 'Download failed')
        } finally {
            setDownloading(false)
        }
    }

    const handleDeleteSymbol = async (id: string) => {
        if (!confirm('Delete this symbol set?')) return
        await fetch('/api/symbols', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        fetchSymbols()
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(formatted)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (/\.(crash|ips|txt|json)$/i.test(file.name)) {
            const reader = new FileReader()
            reader.onload = () => setInput(reader.result as string)
            reader.readAsText(file)
        } else {
            setDsymFile(file)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Crash Symbolication
            </h1>
            <p className="text-gray-400 mb-8">
                Paste an Apple crash log or KSCrash JSON. Upload dSYM for your app, select system symbols for system libraries.
            </p>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                    <button onClick={() => setActiveTab('input')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'input' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}>Input</button>
                    <button onClick={() => setActiveTab('output')} disabled={!formatted} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'output' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'} disabled:opacity-30`}>Output</button>
                </div>

                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    {dsymFile ? `dSYM: ${dsymFile.name}` : 'Upload dSYM / Crash'}
                </button>
                <input ref={fileRef} type="file" accept=".zip,.dSYM,.crash,.ips,.txt,.json" onChange={handleFileUpload} className="hidden" />

                <div className="flex-1" />

                {activeTab === 'input' && (
                    <button onClick={handleParse} className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition">Parse</button>
                )}
                {activeTab === 'output' && report && (
                    <button onClick={handleSymbolicate} disabled={symbolicating || (!dsymFile && !selectedSymbolId)} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-40">
                        {symbolicating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {symbolicating ? 'Symbolicating...' : 'Symbolicate'}
                    </button>
                )}
                {activeTab === 'output' && formatted && (
                    <button onClick={handleCopy} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>

            {/* System symbols selector */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">System Symbols:</label>
                <select
                    value={selectedSymbolId}
                    onChange={(e) => setSelectedSymbolId(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                    <option value="">None</option>
                    {symbolSets.map((s) => (
                        <option key={s.id} value={s.id}>{s.device} — iOS {s.iosVersion}</option>
                    ))}
                </select>
                <button onClick={() => setShowDownload(!showDownload)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                    {showDownload ? 'Cancel' : '+ Download'}
                </button>
                {symbolSets.length > 0 && selectedSymbolId && (
                    <button onClick={() => handleDeleteSymbol(selectedSymbolId)} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>
                )}
            </div>

            {/* Download panel */}
            {showDownload && (
                <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Download iOS System Symbols</h3>
                    <p className="text-xs text-gray-500">Downloads shared cache symbols from Apple via ipsw. This may take a few minutes.</p>
                    <div className="flex flex-wrap gap-3">
                        <input value={downloadDevice} onChange={e => setDownloadDevice(e.target.value)} placeholder="Device (e.g. iPhone15,2)" className="flex-1 min-w-[180px] bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                        <input value={downloadVersion} onChange={e => setDownloadVersion(e.target.value)} placeholder="iOS Version (e.g. 17.1)" className="flex-1 min-w-[150px] bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                        <button onClick={handleDownloadSymbols} disabled={downloading || !downloadVersion} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                            {downloading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {downloading ? 'Downloading...' : 'Download'}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Content */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden">
                {activeTab === 'input' ? (
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={"Paste your crash log here...\n\nSupported formats:\n  - Apple crash log (.crash, .ips)\n  - KSCrash JSON format\n\nOr click 'Upload dSYM / Crash' to load from file."}
                        className="w-full h-[550px] p-6 bg-transparent text-gray-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                    />
                ) : formatted ? (
                    <div className="p-6 overflow-auto h-[550px]">
                        {report && (
                            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {report.processName && (
                                    <div className="bg-gray-800/60 rounded-lg px-4 py-3">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Process</div>
                                        <div className="text-sm text-white font-medium truncate">{report.processName}</div>
                                    </div>
                                )}
                                {report.bundleIdentifier && (
                                    <div className="bg-gray-800/60 rounded-lg px-4 py-3">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bundle ID</div>
                                        <div className="text-sm text-white font-mono truncate">{report.bundleIdentifier}</div>
                                    </div>
                                )}
                                {report.osVersion && (
                                    <div className="bg-gray-800/60 rounded-lg px-4 py-3">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">OS</div>
                                        <div className="text-sm text-white">{report.osVersion}</div>
                                    </div>
                                )}
                                {report.exceptionType && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 col-span-2 sm:col-span-3">
                                        <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Exception</div>
                                        <div className="text-sm text-red-300 font-mono">{report.exceptionType}</div>
                                        {report.exceptionCode && <div className="text-xs text-red-400/70 mt-1">{report.exceptionCode}</div>}
                                    </div>
                                )}
                            </div>
                        )}

                        {report?.threads.map((thread) => (
                            <div key={thread.threadIndex} className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-semibold text-gray-300">Thread {thread.threadIndex}</span>
                                    {thread.name && <span className="text-xs text-gray-500">{thread.name}</span>}
                                    {thread.crashed && <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">CRASHED</span>}
                                </div>
                                <div className="bg-gray-900/60 rounded-lg overflow-x-auto">
                                    <table className="w-full text-xs font-mono">
                                        <tbody>
                                            {thread.frames.map((frame) => (
                                                <tr key={frame.frameIndex} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                                    <td className="px-3 py-1.5 text-gray-500 w-8 text-right">{frame.frameIndex}</td>
                                                    <td className="px-3 py-1.5 text-blue-400 w-40 truncate">{frame.binaryName}</td>
                                                    <td className="px-3 py-1.5">
                                                        {frame.symbolicated ? (
                                                            <span className="text-green-400">{frame.symbolicated}</span>
                                                        ) : (
                                                            <span className="text-gray-400">{frame.address} <span className="text-gray-600">({frame.loadAddress} + {frame.offset ?? '?'})</span></span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}

                        {report && report.binaryImages.length > 0 && (
                            <details className="mt-6">
                                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">Binary Images ({report.binaryImages.length})</summary>
                                <div className="mt-2 bg-gray-900/60 rounded-lg p-4 overflow-x-auto">
                                    <table className="w-full text-xs font-mono">
                                        <tbody>
                                            {report.binaryImages.map((img, i) => (
                                                <tr key={i} className="border-b border-gray-800/30">
                                                    <td className="px-2 py-1 text-blue-400">{img.name}</td>
                                                    <td className="px-2 py-1 text-gray-500">{img.loadAddress}</td>
                                                    <td className="px-2 py-1 text-gray-600">{img.arch}</td>
                                                    <td className="px-2 py-1 text-gray-600 truncate max-w-xs">{img.uuid}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[550px] text-gray-600">Parse a crash log to see the output</div>
                )}
            </div>

            {/* Help section */}
            <div className="mt-10 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">How to use</h3>
                <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">1.</span><span>Paste a crash log or upload a <code className="text-gray-300">.crash</code> / <code className="text-gray-300">.ips</code> / <code className="text-gray-300">.json</code> file, then click <strong className="text-white">Parse</strong></span></div>
                    <div className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">2.</span><span>For <strong className="text-white">your app code</strong>: upload the <code className="text-gray-300">.dSYM.zip</code> from your Xcode archive</span></div>
                    <div className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">3.</span><span>For <strong className="text-white">system libraries</strong> (UIKit, Foundation...): click "+ Download", enter device model and iOS version to fetch Apple system symbols via <code className="text-gray-300">ipsw</code></span></div>
                    <div className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">4.</span><span>Select the symbol set from the dropdown, then click <strong className="text-white">Symbolicate</strong></span></div>
                </div>
            </div>

            {/* CLI reference */}
            <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">CLI Reference</h3>
                <div className="space-y-3">
                    <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                        <span className="text-gray-500">$</span> atos -arch arm64 -o MyApp.dSYM/Contents/Resources/DWARF/MyApp -l 0x100000000 0x100abc123
                    </div>
                    <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                        <span className="text-gray-500">$</span> symbolicatecrash MyApp.crash MyApp.dSYM &gt; symbolicated.crash
                    </div>
                </div>
            </div>
        </div>
    )
}
