'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Tab = 'regex' | 'predicate' | 'builder'

// ---- NSPredicate templates ----

interface PredicateTemplate {
    category: string
    items: {
        label: string
        description: string
        predicate: string
        swift: string
        example?: string
    }[]
}

const PREDICATE_TEMPLATES: PredicateTemplate[] = [
    {
        category: 'String Matching',
        items: [
            {
                label: 'Equals',
                description: 'Exact string match',
                predicate: 'name == "John"',
                swift: 'NSPredicate(format: "name == %@", "John")',
                example: 'name == "John"',
            },
            {
                label: 'Contains',
                description: 'String contains substring',
                predicate: 'name CONTAINS "oh"',
                swift: 'NSPredicate(format: "name CONTAINS %@", "oh")',
            },
            {
                label: 'Contains (case-insensitive)',
                description: 'Case-insensitive contains',
                predicate: 'name CONTAINS[cd] "john"',
                swift: 'NSPredicate(format: "name CONTAINS[cd] %@", "john")',
            },
            {
                label: 'Begins with',
                description: 'String starts with prefix',
                predicate: 'name BEGINSWITH "Jo"',
                swift: 'NSPredicate(format: "name BEGINSWITH %@", "Jo")',
            },
            {
                label: 'Ends with',
                description: 'String ends with suffix',
                predicate: 'name ENDSWITH "hn"',
                swift: 'NSPredicate(format: "name ENDSWITH %@", "hn")',
            },
            {
                label: 'Like (wildcard)',
                description: 'Wildcard matching (* = any chars, ? = one char)',
                predicate: 'name LIKE "J*n"',
                swift: 'NSPredicate(format: "name LIKE %@", "J*n")',
            },
            {
                label: 'Matches (regex)',
                description: 'Regex match in NSPredicate',
                predicate: 'name MATCHES "^[A-Z][a-z]+$"',
                swift: 'NSPredicate(format: "name MATCHES %@", "^[A-Z][a-z]+$")',
            },
        ],
    },
    {
        category: 'Numeric Comparison',
        items: [
            {
                label: 'Greater than',
                description: 'Number greater than value',
                predicate: 'age > 18',
                swift: 'NSPredicate(format: "age > %d", 18)',
            },
            {
                label: 'Range (BETWEEN)',
                description: 'Number within a range',
                predicate: 'age BETWEEN {18, 65}',
                swift: 'NSPredicate(format: "age BETWEEN %@", [18, 65])',
            },
            {
                label: 'IN list',
                description: 'Value is in a list',
                predicate: 'status IN {"active", "pending"}',
                swift: 'NSPredicate(format: "status IN %@", ["active", "pending"])',
            },
        ],
    },
    {
        category: 'Logical Operators',
        items: [
            {
                label: 'AND',
                description: 'Both conditions must be true',
                predicate: 'age > 18 AND name CONTAINS "J"',
                swift: 'NSPredicate(format: "age > %d AND name CONTAINS %@", 18, "J")',
            },
            {
                label: 'OR',
                description: 'Either condition is true',
                predicate: 'status == "active" OR status == "pending"',
                swift: 'NSPredicate(format: "status == %@ OR status == %@", "active", "pending")',
            },
            {
                label: 'NOT',
                description: 'Negate a condition',
                predicate: 'NOT (status == "deleted")',
                swift: 'NSPredicate(format: "NOT (status == %@)", "deleted")',
            },
            {
                label: 'Compound (NSCompoundPredicate)',
                description: 'Combine predicates programmatically',
                predicate: 'p1 AND p2',
                swift: `let p1 = NSPredicate(format: "age > %d", 18)\nlet p2 = NSPredicate(format: "name CONTAINS %@", "J")\nlet compound = NSCompoundPredicate(andPredicateWithSubpredicates: [p1, p2])`,
            },
        ],
    },
    {
        category: 'Collection & Subquery',
        items: [
            {
                label: 'ANY (to-many)',
                description: 'Any object in collection matches',
                predicate: 'ANY tags.name == "swift"',
                swift: 'NSPredicate(format: "ANY tags.name == %@", "swift")',
            },
            {
                label: 'ALL',
                description: 'All objects in collection match',
                predicate: 'ALL scores > 60',
                swift: 'NSPredicate(format: "ALL scores > %d", 60)',
            },
            {
                label: 'SUBQUERY',
                description: 'Filter within a collection',
                predicate: 'SUBQUERY(items, $item, $item.price > 100).@count > 0',
                swift: 'NSPredicate(format: "SUBQUERY(items, $item, $item.price > %d).@count > 0", 100)',
            },
            {
                label: '@count',
                description: 'Count of a collection',
                predicate: 'tags.@count > 3',
                swift: 'NSPredicate(format: "tags.@count > %d", 3)',
            },
            {
                label: '@sum / @avg',
                description: 'Aggregate on collection',
                predicate: 'items.@sum.price > 1000',
                swift: 'NSPredicate(format: "items.@sum.price > %d", 1000)',
            },
        ],
    },
    {
        category: 'CoreData Specific',
        items: [
            {
                label: 'Nil check',
                description: 'Check if property is nil',
                predicate: 'deletedAt == nil',
                swift: 'NSPredicate(format: "deletedAt == nil")',
            },
            {
                label: 'SELF',
                description: 'Reference the object itself',
                predicate: 'SELF.name == "test"',
                swift: 'NSPredicate(format: "SELF.name == %@", "test")',
            },
            {
                label: 'Fetch with sort',
                description: 'Full fetch request example',
                predicate: 'isActive == YES',
                swift: `let request: NSFetchRequest<Entity> = Entity.fetchRequest()\nrequest.predicate = NSPredicate(format: "isActive == %@", NSNumber(value: true))\nrequest.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]\nlet results = try context.fetch(request)`,
            },
        ],
    },
]

// ---- Predicate Builder types ----

type Operator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'CONTAINS' | 'CONTAINS[cd]' | 'BEGINSWITH' | 'ENDSWITH' | 'LIKE' | 'MATCHES' | 'IN' | 'BETWEEN'
type Combiner = 'AND' | 'OR'
type ValueType = 'string' | 'number' | 'boolean' | 'nil'

interface BuilderRule {
    id: number
    keyPath: string
    operator: Operator
    value: string
    valueType: ValueType
}

const OPERATORS: { key: Operator; label: string }[] = [
    { key: '==', label: '==' },
    { key: '!=', label: '!=' },
    { key: '>', label: '>' },
    { key: '<', label: '<' },
    { key: '>=', label: '>=' },
    { key: '<=', label: '<=' },
    { key: 'CONTAINS', label: 'CONTAINS' },
    { key: 'CONTAINS[cd]', label: 'CONTAINS[cd]' },
    { key: 'BEGINSWITH', label: 'BEGINSWITH' },
    { key: 'ENDSWITH', label: 'ENDSWITH' },
    { key: 'LIKE', label: 'LIKE' },
    { key: 'MATCHES', label: 'MATCHES' },
    { key: 'IN', label: 'IN' },
    { key: 'BETWEEN', label: 'BETWEEN' },
]

let _ruleId = 0

// ---- component ----

export default function RegexClient() {
    const { t } = useLanguage()
    const [tab, setTab] = useState<Tab>('regex')

    // Regex state
    const [pattern, setPattern] = useState('')
    const [flags, setFlags] = useState('g')
    const [testString, setTestString] = useState('')
    const [regexError, setRegexError] = useState('')

    // Predicate template state
    const [expandedCategory, setExpandedCategory] = useState<string | null>('String Matching')
    const [copied, setCopied] = useState('')

    // Builder state
    const [rules, setRules] = useState<BuilderRule[]>([{ id: _ruleId++, keyPath: 'name', operator: '==', value: '', valueType: 'string' }])
    const [combiner, setCombiner] = useState<Combiner>('AND')

    const handleCopy = useCallback((key: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(''), 1500)
    }, [])

    // ---- Regex matching ----
    const regexResult = useMemo(() => {
        if (!pattern || !testString) return null
        setRegexError('')
        try {
            const re = new RegExp(pattern, flags)
            const matches: { text: string; index: number; groups?: Record<string, string> }[] = []
            if (flags.includes('g')) {
                let m: RegExpExecArray | null
                while ((m = re.exec(testString)) !== null) {
                    matches.push({ text: m[0], index: m.index, groups: m.groups })
                    if (!m[0]) re.lastIndex++
                }
            } else {
                const m = re.exec(testString)
                if (m) matches.push({ text: m[0], index: m.index, groups: m.groups })
            }
            return matches
        } catch (e: any) {
            setRegexError(e.message || 'Invalid regex')
            return null
        }
    }, [pattern, flags, testString])

    // highlighted test string
    const highlightedString = useMemo(() => {
        if (!regexResult || regexResult.length === 0 || !testString) return null
        const parts: { text: string; highlight: boolean }[] = []
        let lastEnd = 0
        for (const m of regexResult) {
            if (m.index > lastEnd) parts.push({ text: testString.slice(lastEnd, m.index), highlight: false })
            parts.push({ text: m.text, highlight: true })
            lastEnd = m.index + m.text.length
        }
        if (lastEnd < testString.length) parts.push({ text: testString.slice(lastEnd), highlight: false })
        return parts
    }, [regexResult, testString])

    // Swift code generation from regex
    const swiftRegex = useMemo(() => {
        if (!pattern) return ''
        const escaped = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        const lines = [
            '// Swift (NSRegularExpression)',
            `let pattern = "${escaped}"`,
            `let regex = try NSRegularExpression(pattern: pattern, options: [${flags.includes('i') ? '.caseInsensitive' : ''}])`,
            `let range = NSRange(text.startIndex..., in: text)`,
            `let matches = regex.matches(in: text, range: range)`,
            '',
            '// NSPredicate with MATCHES',
            `let predicate = NSPredicate(format: "SELF MATCHES %@", "${escaped}")`,
            `let isMatch = predicate.evaluate(with: text)`,
        ]
        if (/^\^.*\$$/.test(pattern)) {
            // full-match pattern — also show Swift 5.7 Regex
            lines.push('')
            lines.push('// Swift 5.7+ Regex')
            lines.push(`let regex = /${pattern}/`)
            lines.push(`let isMatch = text.wholeMatch(of: regex) != nil`)
        }
        return lines.join('\n')
    }, [pattern, flags])

    // ---- Builder output ----
    const builderOutput = useMemo(() => {
        const validRules = rules.filter(r => r.keyPath.trim())
        if (validRules.length === 0) return { predicate: '', swift: '' }

        const predicateParts: string[] = []
        const swiftArgs: string[] = []
        const formatParts: string[] = []

        for (const rule of validRules) {
            const { keyPath, operator, value, valueType } = rule

            if (operator === 'IN') {
                const items = value.split(',').map(s => s.trim()).filter(Boolean)
                predicateParts.push(`${keyPath} IN {${items.map(i => valueType === 'string' ? `"${i}"` : i).join(', ')}}`)
                formatParts.push(`${keyPath} IN %@`)
                swiftArgs.push(`[${items.map(i => valueType === 'string' ? `"${i}"` : i).join(', ')}]`)
            } else if (operator === 'BETWEEN') {
                const items = value.split(',').map(s => s.trim()).filter(Boolean)
                predicateParts.push(`${keyPath} BETWEEN {${items.join(', ')}}`)
                formatParts.push(`${keyPath} BETWEEN %@`)
                swiftArgs.push(`[${items.join(', ')}]`)
            } else {
                const fmtValue = valueType === 'string'
                    ? `"${value}"`
                    : valueType === 'boolean'
                    ? (value === 'true' ? 'YES' : 'NO')
                    : valueType === 'nil'
                    ? 'nil'
                    : value
                predicateParts.push(`${keyPath} ${operator} ${fmtValue}`)

                const placeholder = valueType === 'string' ? '%@'
                    : valueType === 'number' ? (value.includes('.') ? '%f' : '%d')
                    : valueType === 'boolean' ? '%@'
                    : 'nil'

                if (valueType === 'nil') {
                    formatParts.push(`${keyPath} ${operator} nil`)
                } else {
                    formatParts.push(`${keyPath} ${operator} ${placeholder}`)
                    if (valueType === 'string') swiftArgs.push(`"${value}"`)
                    else if (valueType === 'boolean') swiftArgs.push(`NSNumber(value: ${value})`)
                    else swiftArgs.push(value)
                }
            }
        }

        const predicate = predicateParts.join(` ${combiner} `)
        const format = formatParts.join(` ${combiner} `)
        const swift = swiftArgs.length > 0
            ? `NSPredicate(format: "${format}", ${swiftArgs.join(', ')})`
            : `NSPredicate(format: "${format}")`

        return { predicate, swift }
    }, [rules, combiner])

    const addRule = () => setRules([...rules, { id: _ruleId++, keyPath: '', operator: '==', value: '', valueType: 'string' }])
    const removeRule = (id: number) => setRules(rules.filter(r => r.id !== id))
    const updateRule = (id: number, field: keyof BuilderRule, val: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: val } : r))
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'regex', label: t('regex.tester') },
        { key: 'builder', label: t('regex.builder') },
        { key: 'predicate', label: t('regex.cheatsheet') },
    ]

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {tabs.map((tb) => (
                    <button
                        key={tb.key}
                        onClick={() => setTab(tb.key)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            tab === tb.key
                                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        {tb.label}
                    </button>
                ))}
            </div>

            {/* ==================== Regex Tester ==================== */}
            {tab === 'regex' && (
                <div className="space-y-5">
                    {/* Pattern + Flags */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                            <span className="text-pink-400 font-mono text-sm px-3 select-none">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                placeholder="[a-zA-Z0-9]+@[a-zA-Z]+\.[a-z]{2,}"
                                className="flex-1 py-2.5 bg-transparent text-gray-200 font-mono text-sm focus:outline-none"
                            />
                            <span className="text-pink-400 font-mono text-sm pr-1 select-none">/</span>
                            <input
                                type="text"
                                value={flags}
                                onChange={(e) => setFlags(e.target.value)}
                                className="w-12 py-2.5 pr-3 bg-transparent text-yellow-400 font-mono text-sm focus:outline-none"
                                placeholder="g"
                            />
                        </div>
                    </div>

                    {/* Flag Toggles */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { flag: 'g', label: t('regex.global') },
                            { flag: 'i', label: t('regex.caseInsensitive') },
                            { flag: 'm', label: t('regex.multiline') },
                            { flag: 's', label: t('regex.dotAll') },
                        ].map(({ flag, label }) => (
                            <button
                                key={flag}
                                onClick={() => setFlags(f => f.includes(flag) ? f.replace(flag, '') : f + flag)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                                    flags.includes(flag)
                                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                        : 'bg-gray-800/50 text-gray-500 border border-gray-700 hover:text-gray-300'
                                }`}
                            >
                                {flag} <span className="text-gray-500 font-sans ml-1">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Test String */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('regex.testString')}</label>
                        <textarea
                            value={testString}
                            onChange={(e) => setTestString(e.target.value)}
                            placeholder={t('regex.testPlaceholder')}
                            className="w-full h-28 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                        />
                    </div>

                    {/* Regex Error */}
                    {regexError && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{regexError}</div>
                    )}

                    {/* Match Results */}
                    {regexResult !== null && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('regex.matches')}</span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-mono border ${
                                    regexResult.length > 0
                                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                        : 'bg-gray-500/10 border-gray-500/20 text-gray-500'
                                }`}>
                                    {regexResult.length}
                                </span>
                            </div>

                            {/* Highlighted preview */}
                            {highlightedString && (
                                <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 font-mono text-sm whitespace-pre-wrap break-all">
                                    {highlightedString.map((part, i) =>
                                        part.highlight ? (
                                            <mark key={i} className="bg-pink-500/30 text-pink-300 rounded px-0.5">{part.text}</mark>
                                        ) : (
                                            <span key={i} className="text-gray-400">{part.text}</span>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Match list */}
                            {regexResult.length > 0 && (
                                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-xs font-mono">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase w-8">#</th>
                                                <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase">Match</th>
                                                <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase w-16">Index</th>
                                                {regexResult.some(m => m.groups) && (
                                                    <th className="px-3 py-2 text-left text-[10px] text-gray-500 uppercase">Groups</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regexResult.map((m, i) => (
                                                <tr key={i} className="border-b border-gray-800/50">
                                                    <td className="px-3 py-1.5 text-gray-600">{i + 1}</td>
                                                    <td className="px-3 py-1.5 text-pink-400 break-all">{m.text}</td>
                                                    <td className="px-3 py-1.5 text-gray-500">{m.index}</td>
                                                    {regexResult.some(m => m.groups) && (
                                                        <td className="px-3 py-1.5 text-gray-400">
                                                            {m.groups ? Object.entries(m.groups).map(([k, v]) => `${k}: "${v}"`).join(', ') : ''}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Swift / NSPredicate output */}
                    {pattern && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('regex.swiftCode')}</label>
                                <button
                                    onClick={() => handleCopy('swift-regex', swiftRegex)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                                >
                                    {copied === 'swift-regex' ? t('tool.copied') : t('tool.copy')}
                                </button>
                            </div>
                            <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{swiftRegex}</pre>
                        </div>
                    )}

                    {/* Common patterns */}
                    <details>
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">{t('regex.commonPatterns')}</summary>
                        <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">{t('regex.pattern')}</th>
                                        <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">Regex</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono">
                                    {[
                                        ['Email', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'],
                                        ['URL', 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w.,@?^=%&:/~+#\\-]*'],
                                        ['Phone (KR)', '(010|011|016|017|018|019)-\\d{3,4}-\\d{4}'],
                                        ['Phone (CN)', '1[3-9]\\d{9}'],
                                        ['IPv4', '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b'],
                                        ['Hex Color', '#[0-9a-fA-F]{3,8}'],
                                        ['Date (YYYY-MM-DD)', '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])'],
                                        ['UUID', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'],
                                    ].map(([name, regex]) => (
                                        <tr key={name} className="border-b border-gray-800/50">
                                            <td className="px-4 py-1.5 text-gray-400 font-sans">{name}</td>
                                            <td className="px-4 py-1.5 text-pink-400 cursor-pointer hover:text-pink-300 transition break-all" onClick={() => setPattern(regex)}>
                                                {regex}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>
            )}

            {/* ==================== Predicate Builder ==================== */}
            {tab === 'builder' && (
                <div className="space-y-5">
                    <div className="text-xs text-gray-500">{t('regex.builderHint')}</div>

                    {/* Combiner */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('regex.combineWith')}</span>
                        {(['AND', 'OR'] as Combiner[]).map(c => (
                            <button
                                key={c}
                                onClick={() => setCombiner(c)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                                    combiner === c
                                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Rules */}
                    <div className="space-y-3">
                        {rules.map((rule, idx) => (
                            <div key={rule.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                {idx > 0 && (
                                    <span className="text-xs font-mono text-pink-400/60 w-full mb-1">{combiner}</span>
                                )}
                                <input
                                    type="text"
                                    value={rule.keyPath}
                                    onChange={(e) => updateRule(rule.id, 'keyPath', e.target.value)}
                                    placeholder="keyPath"
                                    className="w-28 px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                                <select
                                    value={rule.operator}
                                    onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                                    className="px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none"
                                >
                                    {OPERATORS.map(op => (
                                        <option key={op.key} value={op.key}>{op.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={rule.value}
                                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                                    placeholder="value"
                                    className="flex-1 min-w-[100px] px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                />
                                <select
                                    value={rule.valueType}
                                    onChange={(e) => updateRule(rule.id, 'valueType', e.target.value)}
                                    className="px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 text-xs focus:outline-none"
                                >
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Bool</option>
                                    <option value="nil">nil</option>
                                </select>
                                {rules.length > 1 && (
                                    <button
                                        onClick={() => removeRule(rule.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addRule}
                            className="text-sm text-pink-400 hover:text-pink-300 transition flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('tool.addRule')}
                        </button>
                    </div>

                    {/* Builder Output */}
                    {builderOutput.predicate && (
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('regex.predicateFormat')}</label>
                                    <button onClick={() => handleCopy('b-pred', builderOutput.predicate)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                        {copied === 'b-pred' ? t('tool.copied') : t('tool.copy')}
                                    </button>
                                </div>
                                <pre className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-pink-400 font-mono text-sm overflow-x-auto">{builderOutput.predicate}</pre>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('regex.swiftCode')}</label>
                                    <button onClick={() => handleCopy('b-swift', builderOutput.swift)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                        {copied === 'b-swift' ? t('tool.copied') : t('tool.copy')}
                                    </button>
                                </div>
                                <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{builderOutput.swift}</pre>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== Predicate Cheatsheet ==================== */}
            {tab === 'predicate' && (
                <div className="space-y-3">
                    <div className="text-xs text-gray-500">{t('regex.cheatsheetHint')}</div>
                    {PREDICATE_TEMPLATES.map((cat) => (
                        <div key={cat.category} className="border border-gray-700 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 transition text-left"
                            >
                                <span className="text-sm font-medium text-gray-300">{cat.category}</span>
                                <span className="text-gray-500 text-xs">{cat.items.length} {t('regex.patterns')}</span>
                            </button>
                            {expandedCategory === cat.category && (
                                <div className="divide-y divide-gray-800/50">
                                    {cat.items.map((item) => (
                                        <div key={item.label} className="p-4 hover:bg-gray-800/20 transition">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-200">{item.label}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{item.description}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(item.label, item.swift)}
                                                    className="text-xs text-blue-400 hover:text-blue-300 transition whitespace-nowrap"
                                                >
                                                    {copied === item.label ? t('tool.copied') : t('deeplink.copySwift')}
                                                </button>
                                            </div>
                                            <div className="mb-1.5">
                                                <code className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">{item.predicate}</code>
                                            </div>
                                            <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap break-all">{item.swift}</pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
