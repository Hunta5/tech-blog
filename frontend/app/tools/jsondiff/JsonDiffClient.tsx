'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- diff types ----

type DiffType = 'added' | 'removed' | 'changed' | 'unchanged' | 'type_changed'

interface DiffNode {
    path: string
    key: string
    depth: number
    type: DiffType
    leftValue?: string
    rightValue?: string
    leftType?: string
    rightType?: string
    isContainer?: boolean   // object or array header
    bracket?: string        // opening/closing bracket
}

// ---- deep diff ----

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

function typeLabel(v: JsonValue): string {
    if (v === null) return 'null'
    if (Array.isArray(v)) return 'array'
    return typeof v
}

function formatPrimitive(v: JsonValue): string {
    if (typeof v === 'string') return `"${v}"`
    return String(v)
}

function computeDiff(left: JsonValue, right: JsonValue, path: string, key: string, depth: number): DiffNode[] {
    const leftType = typeLabel(left)
    const rightType = typeLabel(right)

    // different types
    if (leftType !== rightType) {
        return [{
            path, key, depth,
            type: 'type_changed',
            leftValue: JSON.stringify(left, null, 2),
            rightValue: JSON.stringify(right, null, 2),
            leftType, rightType,
        }]
    }

    // both objects
    if (leftType === 'object' && left !== null && right !== null) {
        const lo = left as Record<string, JsonValue>
        const ro = right as Record<string, JsonValue>
        const allKeys = Array.from(new Set([...Object.keys(lo), ...Object.keys(ro)])).sort()
        const nodes: DiffNode[] = []

        for (const k of allKeys) {
            const childPath = path ? `${path}.${k}` : k
            const inLeft = k in lo
            const inRight = k in ro

            if (inLeft && !inRight) {
                nodes.push(...flattenRemoved(lo[k], childPath, k, depth))
            } else if (!inLeft && inRight) {
                nodes.push(...flattenAdded(ro[k], childPath, k, depth))
            } else {
                nodes.push(...computeDiff(lo[k], ro[k], childPath, k, depth))
            }
        }
        return nodes
    }

    // both arrays
    if (leftType === 'array') {
        const la = left as JsonValue[]
        const ra = right as JsonValue[]
        const maxLen = Math.max(la.length, ra.length)
        const nodes: DiffNode[] = []

        for (let i = 0; i < maxLen; i++) {
            const childPath = `${path}[${i}]`
            const k = `[${i}]`
            if (i >= la.length) {
                nodes.push(...flattenAdded(ra[i], childPath, k, depth))
            } else if (i >= ra.length) {
                nodes.push(...flattenRemoved(la[i], childPath, k, depth))
            } else {
                nodes.push(...computeDiff(la[i], ra[i], childPath, k, depth))
            }
        }
        return nodes
    }

    // primitives
    if (left === right) {
        return [{ path, key, depth, type: 'unchanged', leftValue: formatPrimitive(left), rightValue: formatPrimitive(right) }]
    }
    return [{ path, key, depth, type: 'changed', leftValue: formatPrimitive(left), rightValue: formatPrimitive(right) }]
}

function flattenAdded(val: JsonValue, path: string, key: string, depth: number): DiffNode[] {
    if (val !== null && typeof val === 'object') {
        return [{ path, key, depth, type: 'added', rightValue: JSON.stringify(val, null, 2), rightType: typeLabel(val) }]
    }
    return [{ path, key, depth, type: 'added', rightValue: formatPrimitive(val) }]
}

function flattenRemoved(val: JsonValue, path: string, key: string, depth: number): DiffNode[] {
    if (val !== null && typeof val === 'object') {
        return [{ path, key, depth, type: 'removed', leftValue: JSON.stringify(val, null, 2), leftType: typeLabel(val) }]
    }
    return [{ path, key, depth, type: 'removed', leftValue: formatPrimitive(val) }]
}

// ---- component ----

type ViewMode = 'all' | 'diff'

export default function JsonDiffClient() {
    const { t } = useLanguage()
    const [leftInput, setLeftInput] = useState('')
    const [rightInput, setRightInput] = useState('')
    const [error, setError] = useState('')
    const [diffNodes, setDiffNodes] = useState<DiffNode[]>([])
    const [hasCompared, setHasCompared] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('all')
    const [copied, setCopied] = useState(false)

    const handleCompare = () => {
        setError(''); setDiffNodes([]); setHasCompared(false)
        if (!leftInput.trim() || !rightInput.trim()) {
            setError(t('jdiff.pasteJson'))
            return
        }
        try {
            const left = JSON.parse(leftInput)
            const right = JSON.parse(rightInput)
            const nodes = computeDiff(left, right, '', '$', 0)
            setDiffNodes(nodes)
            setHasCompared(true)
        } catch (e: any) {
            setError(e.message || 'Invalid JSON')
        }
    }

    const handleFormat = (side: 'left' | 'right') => {
        try {
            if (side === 'left') setLeftInput(JSON.stringify(JSON.parse(leftInput), null, 2))
            else setRightInput(JSON.stringify(JSON.parse(rightInput), null, 2))
        } catch { /* ignore */ }
    }

    const handleSwap = () => {
        const tmp = leftInput
        setLeftInput(rightInput)
        setRightInput(tmp)
        setDiffNodes([]); setHasCompared(false)
    }

    const handleCopyDiff = () => {
        const report = filteredNodes
            .map(n => {
                const icon = n.type === 'added' ? '+' : n.type === 'removed' ? '-' : n.type === 'changed' || n.type === 'type_changed' ? '~' : ' '
                const left = n.leftValue ?? ''
                const right = n.rightValue ?? ''
                if (n.type === 'changed' || n.type === 'type_changed') {
                    return `${icon} ${n.path}: ${left} → ${right}`
                }
                return `${icon} ${n.path}: ${left || right}`
            })
            .join('\n')
        navigator.clipboard.writeText(report)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const filteredNodes = useMemo(() => {
        if (viewMode === 'all') return diffNodes
        return diffNodes.filter(n => n.type !== 'unchanged')
    }, [diffNodes, viewMode])

    const stats = useMemo(() => {
        let added = 0, removed = 0, changed = 0, unchanged = 0
        for (const n of diffNodes) {
            if (n.type === 'added') added++
            else if (n.type === 'removed') removed++
            else if (n.type === 'changed' || n.type === 'type_changed') changed++
            else unchanged++
        }
        return { added, removed, changed, unchanged, total: diffNodes.length }
    }, [diffNodes])

    const isIdentical = hasCompared && stats.added === 0 && stats.removed === 0 && stats.changed === 0

    return (
        <div className="space-y-6">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('jdiff.left')}</label>
                        {leftInput.trim() && (
                            <button onClick={() => handleFormat('left')} className="text-xs text-blue-400 hover:text-blue-300 transition">{t('tool.format')}</button>
                        )}
                    </div>
                    <textarea
                        className="w-full h-64 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder='{"name": "old", "version": 1}'
                        value={leftInput}
                        onChange={(e) => setLeftInput(e.target.value)}
                    />
                </div>

                {/* Swap Button */}
                <button
                    onClick={handleSwap}
                    className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-gray-700 border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-600 transition"
                    title={t('jdiff.swap')}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </button>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('jdiff.right')}</label>
                        {rightInput.trim() && (
                            <button onClick={() => handleFormat('right')} className="text-xs text-blue-400 hover:text-blue-300 transition">{t('tool.format')}</button>
                        )}
                    </div>
                    <textarea
                        className="w-full h-64 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder='{"name": "new", "version": 2}'
                        value={rightInput}
                        onChange={(e) => setRightInput(e.target.value)}
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
                    onClick={handleCompare}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition"
                >
                    {t('jdiff.compare')}
                </button>
                <button
                    onClick={() => { setLeftInput(''); setRightInput(''); setDiffNodes([]); setError(''); setHasCompared(false) }}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    {t('tool.clear')}
                </button>
            </div>

            {/* Results */}
            {hasCompared && (
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('tool.result')}</span>
                        {isIdentical ? (
                            <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-500/10 border border-green-500/20 text-green-400">
                                {t('jdiff.identical')}
                            </span>
                        ) : (
                            <>
                                {stats.added > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-green-500/10 border border-green-500/20 text-green-400">
                                        +{stats.added} {t('jdiff.added')}
                                    </span>
                                )}
                                {stats.removed > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400">
                                        −{stats.removed} {t('jdiff.removed')}
                                    </span>
                                )}
                                {stats.changed > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                                        ~{stats.changed} {t('jdiff.changed')}
                                    </span>
                                )}
                                {stats.unchanged > 0 && (
                                    <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-gray-500/10 border border-gray-500/20 text-gray-500">
                                        {stats.unchanged} {t('jdiff.same')}
                                    </span>
                                )}
                            </>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            {!isIdentical && (
                                <button
                                    onClick={handleCopyDiff}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                                >
                                    {copied ? t('tool.copied') : t('jdiff.copyDiff')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    {!isIdentical && (
                        <div className="flex gap-2">
                            {(['all', 'diff'] as ViewMode[]).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        viewMode === m
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                >
                                    {m === 'all' ? t('jdiff.showAll') : t('jdiff.diffOnly')}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Diff Table */}
                    {!isIdentical && filteredNodes.length > 0 && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                <table className="w-full text-xs font-mono">
                                    <thead className="sticky top-0 bg-gray-800 z-10">
                                        <tr className="border-b border-gray-700">
                                            <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase w-8"></th>
                                            <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase">{t('jdiff.path')}</th>
                                            <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase">{t('jdiff.left')}</th>
                                            <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase">{t('jdiff.right')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredNodes.map((node, i) => (
                                            <tr key={i} className={`border-b border-gray-800/50 ${rowBg(node.type)}`}>
                                                <td className="px-3 py-1.5 text-center">
                                                    {node.type === 'added' && <span className="text-green-400">+</span>}
                                                    {node.type === 'removed' && <span className="text-red-400">−</span>}
                                                    {(node.type === 'changed' || node.type === 'type_changed') && <span className="text-yellow-400">~</span>}
                                                    {node.type === 'unchanged' && <span className="text-gray-600">=</span>}
                                                </td>
                                                <td className="px-3 py-1.5 text-gray-400 whitespace-nowrap">
                                                    {node.path}
                                                    {node.type === 'type_changed' && (
                                                        <span className="ml-1 text-[10px] text-yellow-500">({node.leftType} → {node.rightType})</span>
                                                    )}
                                                </td>
                                                <td className={`px-3 py-1.5 whitespace-pre-wrap break-all max-w-[300px] ${leftColor(node.type)}`}>
                                                    {node.leftValue ?? ''}
                                                </td>
                                                <td className={`px-3 py-1.5 whitespace-pre-wrap break-all max-w-[300px] ${rightColor(node.type)}`}>
                                                    {node.rightValue ?? ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ---- style helpers ----

function rowBg(type: DiffType): string {
    switch (type) {
        case 'added': return 'bg-green-500/5'
        case 'removed': return 'bg-red-500/5'
        case 'changed': case 'type_changed': return 'bg-yellow-500/5'
        default: return ''
    }
}

function leftColor(type: DiffType): string {
    switch (type) {
        case 'removed': return 'text-red-400'
        case 'changed': case 'type_changed': return 'text-red-400 line-through decoration-red-500/40'
        default: return 'text-gray-500'
    }
}

function rightColor(type: DiffType): string {
    switch (type) {
        case 'added': return 'text-green-400'
        case 'changed': case 'type_changed': return 'text-green-400'
        default: return 'text-gray-500'
    }
}
