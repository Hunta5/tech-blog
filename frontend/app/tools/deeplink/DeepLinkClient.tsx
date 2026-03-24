'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- types ----

interface ParsedURL {
    raw: string
    scheme: string
    user: string
    password: string
    host: string
    port: string
    path: string
    pathComponents: string[]
    query: string
    queryParams: [string, string][]
    fragment: string
    isDeepLink: boolean
    isUniversalLink: boolean
    isValid: boolean
}

type Tab = 'parse' | 'build' | 'apple'

// ---- parser ----

function parseURL(raw: string): ParsedURL {
    const trimmed = raw.trim()
    const result: ParsedURL = {
        raw: trimmed, scheme: '', user: '', password: '', host: '', port: '',
        path: '', pathComponents: [], query: '', queryParams: [],
        fragment: '', isDeepLink: false, isUniversalLink: false, isValid: false,
    }
    if (!trimmed) return result

    try {
        // handle custom schemes — prefix with http temporarily for URL parsing
        let url: URL
        const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//)
        const isCustomScheme = schemeMatch && !['http', 'https', 'ftp', 'ftps'].includes(schemeMatch[1].toLowerCase())

        if (isCustomScheme) {
            result.scheme = schemeMatch![1]
            const rest = trimmed.slice(schemeMatch![0].length)
            url = new URL('http://' + rest)
            result.isDeepLink = true
        } else {
            url = new URL(trimmed)
            result.scheme = url.protocol.replace(':', '')
        }

        // userinfo
        result.user = url.username ? decodeURIComponent(url.username) : ''
        result.password = url.password ? decodeURIComponent(url.password) : ''
        result.host = url.hostname
        result.port = url.port
        result.path = url.pathname
        result.pathComponents = url.pathname.split('/').filter(Boolean)
        result.query = url.search.replace('?', '')
        result.fragment = url.hash.replace('#', '')

        // query params
        url.searchParams.forEach((val, key) => {
            result.queryParams.push([key, val])
        })

        // Universal Link detection
        if (['http', 'https'].includes(result.scheme) && result.host) {
            result.isUniversalLink = true
        }

        result.isValid = true
    } catch {
        // try a more lenient parse for partial deep links
        const m = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\/([^/?#]*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/)
        if (m) {
            result.scheme = m[1]
            result.host = m[2]
            result.path = m[3] || '/'
            result.pathComponents = (m[3] || '').split('/').filter(Boolean)
            result.query = m[4] || ''
            result.fragment = m[5] || ''
            result.isDeepLink = !['http', 'https'].includes(m[1].toLowerCase())
            result.isUniversalLink = ['http', 'https'].includes(m[1].toLowerCase())
            // parse query manually
            if (m[4]) {
                result.queryParams = m[4].split('&').map(p => {
                    const [k, ...rest] = p.split('=')
                    return [decodeURIComponent(k), decodeURIComponent(rest.join('=') || '')]
                })
            }
            result.isValid = true
        }
    }
    return result
}

// ---- component colors ----

const PART_COLORS: Record<string, { bg: string; text: string; border: string; labelKey: string }> = {
    scheme:   { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', labelKey: 'deeplink.scheme' },
    user:     { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', labelKey: 'deeplink.user' },
    host:     { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', labelKey: 'deeplink.host' },
    port:     { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', labelKey: 'deeplink.port' },
    path:     { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', labelKey: 'deeplink.path' },
    query:    { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', labelKey: 'deeplink.query' },
    fragment: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', labelKey: 'deeplink.fragment' },
}

function ColorBadge({ part, value }: { part: string; value: string }) {
    const { t } = useLanguage()
    if (!value) return null
    const c = PART_COLORS[part]
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border ${c.bg} ${c.text} ${c.border}`}>
            <span className="opacity-60 font-sans text-[10px]">{t(c.labelKey)}</span> {value}
        </span>
    )
}

// ---- main component ----

export default function DeepLinkClient() {
    const { t } = useLanguage()
    const [tab, setTab] = useState<Tab>('parse')
    const [urlInput, setUrlInput] = useState('')
    const [copied, setCopied] = useState('')

    // Builder state
    const [bScheme, setBScheme] = useState('myapp')
    const [bHost, setBHost] = useState('product')
    const [bPath, setBPath] = useState('/detail')
    const [bParams, setBParams] = useState<[string, string][]>([['id', '123'], ['from', 'home']])
    const [bFragment, setBFragment] = useState('')

    const parsed = useMemo(() => parseURL(urlInput), [urlInput])

    const handleCopy = useCallback((key: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(''), 1500)
    }, [])

    // ---- Builder URL ----
    const builtUrl = useMemo(() => {
        let url = `${bScheme}://${bHost}${bPath}`
        const validParams = bParams.filter(([k]) => k.trim())
        if (validParams.length > 0) {
            url += '?' + validParams.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
        }
        if (bFragment) url += '#' + bFragment
        return url
    }, [bScheme, bHost, bPath, bParams, bFragment])

    // ---- Swift code gen ----
    const swiftCode = useMemo(() => {
        const p = tab === 'build' ? parseURL(builtUrl) : parsed
        if (!p.isValid) return ''

        const lines: string[] = []

        lines.push('// MARK: - URL Parsing')
        lines.push('')

        if (p.isDeepLink) {
            // Custom scheme deep link
            lines.push(`guard let url = URL(string: "${p.raw}"),`)
            lines.push(`      let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else { return }`)
            lines.push('')
            lines.push(`let scheme = components.scheme  // "${p.scheme}"`)
            lines.push(`let host = components.host      // "${p.host}"`)
            if (p.path && p.path !== '/') {
                lines.push(`let path = components.path      // "${p.path}"`)
            }
        } else {
            // Universal link / http
            lines.push(`guard let url = URL(string: "${p.raw}"),`)
            lines.push(`      let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else { return }`)
            lines.push('')
            lines.push(`let scheme = components.scheme  // "${p.scheme}"`)
            lines.push(`let host = components.host      // "${p.host}"`)
            if (p.port) lines.push(`let port = components.port      // ${p.port}`)
            lines.push(`let path = components.path      // "${p.path}"`)
        }

        // query params
        if (p.queryParams.length > 0) {
            lines.push('')
            lines.push('// Query Parameters')
            lines.push('let queryItems = components.queryItems ?? []')
            lines.push('let params = Dictionary(uniqueKeysWithValues: queryItems.compactMap { item in')
            lines.push('    item.value.map { (item.name, $0) }')
            lines.push('})')
            lines.push('')
            lines.push('/*')
            lines.push(' params = [')
            for (const [k, v] of p.queryParams) {
                lines.push(`     "${k}": "${v}",`)
            }
            lines.push(' ]')
            lines.push('*/')
            lines.push('')

            // typed access
            lines.push('// Typed access')
            for (const [k, v] of p.queryParams) {
                const propName = toCamelCase(k)
                if (/^\d+$/.test(v)) {
                    lines.push(`let ${propName} = Int(params["${k}"] ?? "")  // ${v}`)
                } else if (v === 'true' || v === 'false') {
                    lines.push(`let ${propName} = params["${k}"] == "true"  // ${v}`)
                } else {
                    lines.push(`let ${propName} = params["${k}"]  // "${v}"`)
                }
            }
        }

        if (p.fragment) {
            lines.push('')
            lines.push(`let fragment = components.fragment  // "${p.fragment}"`)
        }

        // AppDelegate / SceneDelegate handler
        lines.push('')
        lines.push('')
        lines.push('// MARK: - Handle in AppDelegate / SceneDelegate')
        lines.push('')

        if (p.isDeepLink) {
            lines.push('// AppDelegate')
            lines.push('func application(_ app: UIApplication, open url: URL,')
            lines.push('                 options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {')
            lines.push('    guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),')
            lines.push(`          components.scheme == "${p.scheme}" else { return false }`)
            lines.push('')
            lines.push(`    switch components.host {`)
            lines.push(`    case "${p.host}":`)
            lines.push('        let params = Self.extractParams(from: components)')
            if (p.pathComponents.length > 0) {
                lines.push(`        // path: ${p.pathComponents.join('/')}`)
            }
            lines.push('        // TODO: Handle navigation')
            lines.push('        return true')
            lines.push('    default:')
            lines.push('        return false')
            lines.push('    }')
            lines.push('}')
        } else {
            lines.push('// SceneDelegate - Universal Link')
            lines.push('func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {')
            lines.push('    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,')
            lines.push('          let url = userActivity.webpageURL,')
            lines.push('          let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else { return }')
            lines.push('')
            lines.push('    let pathComponents = components.path.split(separator: "/").map(String.init)')
            lines.push('    let params = Self.extractParams(from: components)')
            lines.push('')
            lines.push('    // TODO: Route based on pathComponents and params')
            lines.push('}')
        }

        // helper
        lines.push('')
        lines.push('// MARK: - Helper')
        lines.push('')
        lines.push('private static func extractParams(from components: URLComponents) -> [String: String] {')
        lines.push('    let items = components.queryItems ?? []')
        lines.push('    return Dictionary(uniqueKeysWithValues: items.compactMap { item in')
        lines.push('        item.value.map { (item.name, $0) }')
        lines.push('    })')
        lines.push('}')

        return lines.join('\n')
    }, [parsed, tab, builtUrl])

    // ---- ObjC code gen ----
    const objcCode = useMemo(() => {
        const p = tab === 'build' ? parseURL(builtUrl) : parsed
        if (!p.isValid) return ''

        const lines: string[] = []
        lines.push('// MARK: - URL Parsing')
        lines.push('')
        lines.push(`NSURLComponents *components = [NSURLComponents componentsWithString:@"${p.raw}"];`)
        lines.push('')
        lines.push(`NSString *scheme = components.scheme;    // @"${p.scheme}"`)
        lines.push(`NSString *host = components.host;        // @"${p.host}"`)
        if (p.path && p.path !== '/') {
            lines.push(`NSString *path = components.path;        // @"${p.path}"`)
        }
        if (p.port) {
            lines.push(`NSNumber *port = components.port;        // @(${p.port})`)
        }

        if (p.queryParams.length > 0) {
            lines.push('')
            lines.push('// Query → Dictionary')
            lines.push('NSMutableDictionary *params = [NSMutableDictionary dictionary];')
            lines.push('for (NSURLQueryItem *item in components.queryItems) {')
            lines.push('    if (item.value) params[item.name] = item.value;')
            lines.push('}')
            lines.push('')
            lines.push('/*')
            lines.push(' params = @{')
            for (const [k, v] of p.queryParams) {
                lines.push(`     @"${k}": @"${v}",`)
            }
            lines.push(' };')
            lines.push('*/')
        }

        if (p.isDeepLink) {
            lines.push('')
            lines.push('// AppDelegate handler')
            lines.push('- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url')
            lines.push('            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {')
            lines.push('    NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:YES];')
            lines.push(`    if (![components.scheme isEqualToString:@"${p.scheme}"]) return NO;`)
            lines.push('')
            lines.push(`    if ([components.host isEqualToString:@"${p.host}"]) {`)
            lines.push('        // TODO: Handle navigation')
            lines.push('        return YES;')
            lines.push('    }')
            lines.push('    return NO;')
            lines.push('}')
        }

        return lines.join('\n')
    }, [parsed, tab, builtUrl])

    const tabs: { key: Tab; label: string }[] = [
        { key: 'parse', label: t('deeplink.parseTab') },
        { key: 'build', label: t('deeplink.buildTab') },
        { key: 'apple', label: 'apple-app-site-association' },
    ]

    const activeP = tab === 'build' ? parseURL(builtUrl) : parsed

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {tabs.map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            tab === tb.key
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}>
                        {tb.label}
                    </button>
                ))}
            </div>

            {/* ==================== Parse Tab ==================== */}
            {tab === 'parse' && (
                <div className="space-y-5">
                    {/* URL Input */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('deeplink.urlInput')}</label>
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="myapp://product/detail?id=123&from=home"
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                        />
                    </div>

                    {/* Quick examples */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-600">{t('deeplink.try')}</span>
                        {[
                            'myapp://product/detail?id=123&from=home',
                            'https://example.com/app/product/123?ref=share&utm_source=twitter',
                            'myapp://auth/callback?code=abc123&state=xyz#token',
                            'kakaolink://send?template_id=12345&title=Hello',
                        ].map(example => (
                            <button key={example} onClick={() => setUrlInput(example)}
                                className="text-[11px] font-mono text-violet-400/70 hover:text-violet-400 transition truncate max-w-[240px]">
                                {example}
                            </button>
                        ))}
                    </div>

                    {/* Parsed visualization */}
                    {parsed.isValid && <URLVisualization p={parsed} copied={copied} onCopy={handleCopy} />}
                </div>
            )}

            {/* ==================== Build Tab ==================== */}
            {tab === 'build' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.scheme')}</label>
                            <input type="text" value={bScheme} onChange={e => setBScheme(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                placeholder="myapp" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.host')}</label>
                            <input type="text" value={bHost} onChange={e => setBHost(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="product" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.path')}</label>
                            <input type="text" value={bPath} onChange={e => setBPath(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                placeholder="/detail" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.fragment')}</label>
                            <input type="text" value={bFragment} onChange={e => setBFragment(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                placeholder="section" />
                        </div>
                    </div>

                    {/* Query params */}
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('deeplink.queryParams')}</label>
                        <div className="space-y-2">
                            {bParams.map(([k, v], i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={k} onChange={e => { const n = [...bParams]; n[i] = [e.target.value, v]; setBParams(n) }}
                                        placeholder="key"
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50" />
                                    <span className="text-gray-600">=</span>
                                    <input type="text" value={v} onChange={e => { const n = [...bParams]; n[i] = [k, e.target.value]; setBParams(n) }}
                                        placeholder="value"
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50" />
                                    <button onClick={() => setBParams(bParams.filter((_, idx) => idx !== i))}
                                        className="p-1.5 text-gray-500 hover:text-red-400 transition">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => setBParams([...bParams, ['', '']])}
                                className="text-sm text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {t('tool.addParam')}
                            </button>
                        </div>
                    </div>

                    {/* Built URL */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('deeplink.generatedUrl')}</label>
                            <div className="flex gap-3">
                                <button onClick={() => { setUrlInput(builtUrl); setTab('parse') }}
                                    className="text-xs text-violet-400 hover:text-violet-300 transition">{t('deeplink.parseThis')}</button>
                                <button onClick={() => handleCopy('built', builtUrl)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition">
                                    {copied === 'built' ? t('tool.copied') : t('tool.copy')}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 font-mono text-sm break-all">
                            <HighlightedURL p={parseURL(builtUrl)} />
                        </div>
                    </div>

                    {/* Built URL visualization */}
                    {parseURL(builtUrl).isValid && <URLVisualization p={parseURL(builtUrl)} copied={copied} onCopy={handleCopy} />}
                </div>
            )}

            {/* ==================== AASA Tab ==================== */}
            {tab === 'apple' && <AASASection copied={copied} onCopy={handleCopy} />}

            {/* ==================== Swift / ObjC Code ==================== */}
            {activeP.isValid && (tab === 'parse' || tab === 'build') && (
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('deeplink.swiftCode')}</label>
                            <button onClick={() => handleCopy('swift', swiftCode)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                {copied === 'swift' ? t('tool.copied') : t('tool.copy')}
                            </button>
                        </div>
                        <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">{swiftCode}</pre>
                    </div>
                    <details>
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">{t('deeplink.objcCode')}</summary>
                        <div className="mt-2">
                            <div className="flex justify-end mb-1">
                                <button onClick={() => handleCopy('objc', objcCode)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                    {copied === 'objc' ? t('tool.copied') : t('tool.copy')}
                                </button>
                            </div>
                            <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap">{objcCode}</pre>
                        </div>
                    </details>
                </div>
            )}
        </div>
    )
}

// ---- Highlighted URL ----

function HighlightedURL({ p }: { p: ParsedURL }) {
    if (!p.isValid) return <span className="text-gray-500">{p.raw}</span>

    return (
        <span>
            <span className="text-violet-400">{p.scheme}</span>
            <span className="text-gray-500">://</span>
            {p.user && (
                <>
                    <span className="text-amber-400">{p.user}</span>
                    {p.password && <><span className="text-gray-500">:</span><span className="text-amber-400">{p.password}</span></>}
                    <span className="text-gray-500">@</span>
                </>
            )}
            <span className="text-blue-400">{p.host}</span>
            {p.port && <><span className="text-gray-500">:</span><span className="text-cyan-400">{p.port}</span></>}
            {p.path && p.path !== '/' && <span className="text-green-400">{p.path}</span>}
            {p.path === '/' && <span className="text-gray-600">/</span>}
            {p.query && (
                <>
                    <span className="text-gray-500">?</span>
                    {p.queryParams.map(([k, v], i) => (
                        <span key={i}>
                            {i > 0 && <span className="text-gray-500">&amp;</span>}
                            <span className="text-yellow-400">{k}</span>
                            <span className="text-gray-500">=</span>
                            <span className="text-yellow-300">{v}</span>
                        </span>
                    ))}
                </>
            )}
            {p.fragment && (
                <>
                    <span className="text-gray-500">#</span>
                    <span className="text-pink-400">{p.fragment}</span>
                </>
            )}
        </span>
    )
}

// ---- URL Visualization ----

function URLVisualization({ p, copied, onCopy }: { p: ParsedURL; copied: string; onCopy: (key: string, text: string) => void }) {
    const { t } = useLanguage()
    // Link type badge
    const linkType = p.isDeepLink ? t('deeplink.deepLink') : p.isUniversalLink ? t('deeplink.universalLink') : 'URL'
    const linkColor = p.isDeepLink
        ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'

    return (
        <div className="space-y-4">
            {/* Color-coded URL */}
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 font-mono text-sm break-all">
                <HighlightedURL p={p} />
            </div>

            {/* Type badge */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${linkColor}`}>{linkType}</span>
                {p.isUniversalLink && p.host && (
                    <span className="text-[11px] text-gray-500 font-mono">
                        AASA: https://{p.host}/.well-known/apple-app-site-association
                    </span>
                )}
            </div>

            {/* Component breakdown */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <tbody>
                        {[
                            { part: 'scheme', value: p.scheme },
                            ...(p.user ? [{ part: 'user', value: p.user }] : []),
                            { part: 'host', value: p.host },
                            ...(p.port ? [{ part: 'port', value: p.port }] : []),
                            { part: 'path', value: p.path },
                        ].filter(r => r.value).map(({ part, value }) => {
                            const c = PART_COLORS[part]
                            return (
                                <tr key={part} className="border-b border-gray-800/50">
                                    <td className={`px-4 py-2.5 w-28 ${c.text} text-xs font-semibold uppercase tracking-wider`}>{t(c.labelKey)}</td>
                                    <td className="px-4 py-2.5 font-mono text-gray-300 text-sm">{value}</td>
                                    <td className="px-4 py-2.5 w-16">
                                        <button onClick={() => onCopy(part, value)} className="text-[11px] text-blue-400 hover:text-blue-300 transition">
                                            {copied === part ? '✓' : t('tool.copy')}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Path components */}
            {p.pathComponents.length > 0 && (
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('deeplink.pathComponents')}</label>
                    <div className="flex items-center gap-1 flex-wrap font-mono text-sm">
                        {p.pathComponents.map((pc, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-gray-600">/</span>}
                                <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                                    <span className="text-gray-600 mr-1">[{i}]</span>{pc}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Query parameters */}
            {p.queryParams.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            {t('deeplink.queryParams')} ({p.queryParams.length})
                        </label>
                        <button onClick={() => {
                            const dict = Object.fromEntries(p.queryParams)
                            onCopy('params-json', JSON.stringify(dict, null, 2))
                        }} className="text-xs text-blue-400 hover:text-blue-300 transition">
                            {copied === 'params-json' ? t('tool.copied') : t('deeplink.copyJson')}
                        </button>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">Key</th>
                                    <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">Value</th>
                                    <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {p.queryParams.map(([k, v], i) => {
                                    const vType = /^\d+$/.test(v) ? 'Int' : /^\d+\.\d+$/.test(v) ? 'Double' : v === 'true' || v === 'false' ? 'Bool' : 'String'
                                    return (
                                        <tr key={i} className="border-b border-gray-800/50">
                                            <td className="px-4 py-2 text-gray-600 text-xs">{i}</td>
                                            <td className="px-4 py-2 font-mono text-yellow-400 text-xs">{k}</td>
                                            <td className="px-4 py-2 font-mono text-yellow-300 text-xs break-all">{decodeURIComponent(v)}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                                    vType === 'Int' || vType === 'Double' ? 'bg-blue-500/10 text-blue-400' :
                                                    vType === 'Bool' ? 'bg-orange-500/10 text-orange-400' :
                                                    'bg-gray-500/10 text-gray-400'
                                                }`}>{vType}</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Swift dictionary literal */}
                    <div className="mt-2 flex items-center justify-between">
                        <label className="text-[10px] text-gray-600 uppercase tracking-wider">{t('deeplink.swiftDict')}</label>
                        <button onClick={() => {
                            const lines = p.queryParams.map(([k, v]) => `    "${k}": "${v}"`)
                            onCopy('params-swift', `[\n${lines.join(',\n')}\n]`)
                        }} className="text-[11px] text-blue-400 hover:text-blue-300 transition">
                            {copied === 'params-swift' ? t('tool.copied') : t('deeplink.copySwift')}
                        </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 text-gray-400 font-mono text-xs mt-1">
                        {'[\n'}{p.queryParams.map(([k, v], i) =>
                            `    "${k}": "${v}"${i < p.queryParams.length - 1 ? ',' : ''}`
                        ).join('\n')}{'\n]'}
                    </pre>
                </div>
            )}

            {/* Fragment */}
            {p.fragment && (
                <div className="flex items-center gap-2">
                    <ColorBadge part="fragment" value={p.fragment} />
                </div>
            )}
        </div>
    )
}

// ---- AASA Section ----

function AASASection({ copied, onCopy }: { copied: string; onCopy: (k: string, v: string) => void }) {
    const { t } = useLanguage()
    const [domain, setDomain] = useState('example.com')
    const [teamId, setTeamId] = useState('ABCDE12345')
    const [bundleId, setBundleId] = useState('com.company.app')
    const [paths, setPaths] = useState<string[]>(['/app/*', '/product/*', 'NOT /admin/*'])

    const aasa = useMemo(() => {
        return JSON.stringify({
            applinks: {
                details: [
                    {
                        appIDs: [`${teamId}.${bundleId}`],
                        components: paths.filter(p => p.trim()).map(p => {
                            if (p.startsWith('NOT ')) {
                                return { '/': p.slice(4), exclude: true, comment: 'Excluded path' }
                            }
                            return { '/': p, comment: 'Matched path' }
                        }),
                    }
                ]
            },
            webcredentials: {
                apps: [`${teamId}.${bundleId}`]
            }
        }, null, 2)
    }, [teamId, bundleId, paths])

    const entitlements = useMemo(() => {
        return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:${domain}</string>
        <string>webcredentials:${domain}</string>
    </array>
</dict>
</plist>`
    }, [domain])

    const swiftRouterCode = `// MARK: - Universal Link Router

enum DeepLinkDestination {
    case product(id: String)
    case profile(username: String)
    case home
    case unknown
}

struct UniversalLinkRouter {
    static func route(from url: URL) -> DeepLinkDestination {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              components.host == "${domain}" else { return .unknown }

        let pathComponents = components.path.split(separator: "/").map(String.init)
        let params = Self.extractParams(from: components)

        switch pathComponents.first {
        case "product":
            let id = pathComponents.count > 1 ? pathComponents[1] : params["id"] ?? ""
            return .product(id: id)
        case "profile":
            let username = pathComponents.count > 1 ? pathComponents[1] : params["username"] ?? ""
            return .profile(username: username)
        default:
            return .home
        }
    }

    private static func extractParams(from components: URLComponents) -> [String: String] {
        let items = components.queryItems ?? []
        return Dictionary(uniqueKeysWithValues: items.compactMap { item in
            item.value.map { (item.name, $0) }
        })
    }
}`

    return (
        <div className="space-y-5">
            <div className="text-xs text-gray-500">
                {t('deeplink.aasaDesc')}
            </div>

            {/* Config inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.domain')}</label>
                    <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                </div>
                <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.teamId')}</label>
                    <input type="text" value={teamId} onChange={e => setTeamId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                </div>
                <div>
                    <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('deeplink.bundleId')}</label>
                    <input type="text" value={bundleId} onChange={e => setBundleId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                </div>
            </div>

            {/* Paths */}
            <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                    {t('deeplink.pathPatterns')} <span className="text-gray-600">({t('deeplink.pathPatternsHint')})</span>
                </label>
                <div className="space-y-2">
                    {paths.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="text" value={p} onChange={e => { const n = [...paths]; n[i] = e.target.value; setPaths(n) }}
                                placeholder="/path/*"
                                className={`flex-1 px-3 py-1.5 rounded-lg border font-mono text-sm focus:outline-none focus:ring-2 ${
                                    p.startsWith('NOT ')
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400 focus:ring-red-500/50'
                                        : 'bg-gray-800/50 border-gray-700 text-gray-200 focus:ring-violet-500/50'
                                }`} />
                            <button onClick={() => setPaths(paths.filter((_, idx) => idx !== i))}
                                className="p-1.5 text-gray-500 hover:text-red-400 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <button onClick={() => setPaths([...paths, ''])}
                        className="text-sm text-violet-400 hover:text-violet-300 transition flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('tool.addPath')}
                    </button>
                </div>
            </div>

            {/* AASA JSON */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        apple-app-site-association
                        <span className="text-gray-600 font-normal ml-2">→ https://{domain}/.well-known/apple-app-site-association</span>
                    </label>
                    <button onClick={() => onCopy('aasa', aasa)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                        {copied === 'aasa' ? t('tool.copied') : t('tool.copy')}
                    </button>
                </div>
                <pre className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{aasa}</pre>
            </div>

            {/* Entitlements */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('deeplink.entitlements')}</label>
                    <button onClick={() => onCopy('entitlements', entitlements)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                        {copied === 'entitlements' ? t('tool.copied') : t('tool.copy')}
                    </button>
                </div>
                <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{entitlements}</pre>
            </div>

            {/* Swift Router */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('deeplink.swiftRouter')}</label>
                    <button onClick={() => onCopy('router', swiftRouterCode)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                        {copied === 'router' ? t('tool.copied') : t('tool.copy')}
                    </button>
                </div>
                <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">{swiftRouterCode}</pre>
            </div>

            {/* Checklist */}
            <details>
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">{t('deeplink.checklist')}</summary>
                <div className="mt-3 space-y-2 text-xs text-gray-400">
                    {[
                        'Upload apple-app-site-association to /.well-known/ on your server (no .json extension)',
                        'Content-Type must be application/json',
                        'Must be served over HTTPS with a valid certificate',
                        'Add Associated Domains capability in Xcode',
                        'Add applinks:yourdomain.com to Entitlements',
                        'Implement application(_:continue:restorationHandler:) or scene(_:continue:)',
                        'Test with Apple CDN validation: https://app-site-association.cdn-apple.com/a/v1/yourdomain.com',
                        'After changes, delete & reinstall the app — iOS caches the AASA file',
                    ].map((item, i) => (
                        <label key={i} className="flex items-start gap-2 cursor-pointer select-none">
                            <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 rounded bg-gray-800 border-gray-600 accent-violet-500" />
                            <span>{item}</span>
                        </label>
                    ))}
                </div>
            </details>
        </div>
    )
}

// ---- utils ----

function toCamelCase(s: string): string {
    return s.replace(/[_\-\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toLowerCase())
}
