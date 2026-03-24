'use client'

import { useState, useRef, useCallback, useMemo } from 'react'

// ---- Plist value types ----

type PlistValue =
    | { type: 'string'; value: string }
    | { type: 'integer'; value: number }
    | { type: 'real'; value: number }
    | { type: 'boolean'; value: boolean }
    | { type: 'date'; value: string }
    | { type: 'data'; value: string }
    | { type: 'array'; value: PlistValue[] }
    | { type: 'dict'; value: [string, PlistValue][] }

// ---- Known entitlements / Info.plist keys ----

interface KeyInfo {
    description: string
    category: string
    apple_doc?: string
}

const KNOWN_KEYS: Record<string, KeyInfo> = {
    // Entitlements
    'com.apple.developer.associated-domains': { description: 'Universal Links & Handoff domains', category: 'App Links' },
    'com.apple.developer.applesignin': { description: 'Sign in with Apple', category: 'Authentication' },
    'com.apple.developer.authentication-services.autofill-credential-provider': { description: 'Password AutoFill', category: 'Authentication' },
    'com.apple.security.application-groups': { description: 'App Groups for shared containers', category: 'Data Sharing' },
    'com.apple.developer.icloud-container-identifiers': { description: 'iCloud container identifiers', category: 'iCloud' },
    'com.apple.developer.icloud-services': { description: 'iCloud services (CloudKit, KVS)', category: 'iCloud' },
    'com.apple.developer.ubiquity-kvstore-identifier': { description: 'iCloud Key-Value Store identifier', category: 'iCloud' },
    'keychain-access-groups': { description: 'Keychain sharing groups', category: 'Security' },
    'com.apple.developer.default-data-protection': { description: 'Data protection level', category: 'Security' },
    'aps-environment': { description: 'Push notification environment (development/production)', category: 'Push Notifications' },
    'com.apple.developer.aps-environment': { description: 'Push notification environment', category: 'Push Notifications' },
    'com.apple.developer.in-app-payments': { description: 'Apple Pay merchant identifiers', category: 'Payments' },
    'com.apple.developer.networking.wifi-info': { description: 'Access Wi-Fi information', category: 'Networking' },
    'com.apple.developer.networking.HotspotConfiguration': { description: 'Hotspot configuration', category: 'Networking' },
    'com.apple.developer.networking.vpn.api': { description: 'Personal VPN', category: 'Networking' },
    'com.apple.developer.networking.multipath': { description: 'Multipath TCP', category: 'Networking' },
    'com.apple.developer.healthkit': { description: 'HealthKit access', category: 'Health' },
    'com.apple.developer.healthkit.access': { description: 'HealthKit clinical records', category: 'Health' },
    'com.apple.developer.homekit': { description: 'HomeKit access', category: 'HomeKit' },
    'com.apple.developer.maps': { description: 'Maps routing capability', category: 'Maps' },
    'com.apple.developer.nfc.readersession.formats': { description: 'NFC tag reading', category: 'NFC' },
    'com.apple.developer.siri': { description: 'SiriKit support', category: 'Siri' },
    'com.apple.developer.game-center': { description: 'Game Center', category: 'Game Center' },
    'com.apple.developer.user-fonts': { description: 'Font installation capability', category: 'Fonts' },
    'com.apple.developer.usernotifications.time-sensitive': { description: 'Time Sensitive Notifications', category: 'Notifications' },
    'com.apple.developer.usernotifications.communication': { description: 'Communication Notifications', category: 'Notifications' },
    'inter-app-audio': { description: 'Inter-App Audio', category: 'Audio' },
    'com.apple.developer.system-extension.install': { description: 'System Extension install', category: 'System' },
    'com.apple.developer.carplay-audio': { description: 'CarPlay audio app', category: 'CarPlay' },
    'com.apple.developer.carplay-messaging': { description: 'CarPlay messaging app', category: 'CarPlay' },
    'com.apple.developer.ClassKit-environment': { description: 'ClassKit environment', category: 'Education' },
    'com.apple.developer.exposure-notification': { description: 'Exposure Notification API', category: 'Health' },
    'com.apple.developer.group-session': { description: 'Group Activities (SharePlay)', category: 'SharePlay' },
    'com.apple.developer.weatherkit': { description: 'WeatherKit API', category: 'Weather' },
    'com.apple.developer.push-to-talk': { description: 'Push to Talk', category: 'Communication' },

    // Info.plist common keys
    'CFBundleDisplayName': { description: 'App display name shown under icon', category: 'App Identity' },
    'CFBundleName': { description: 'Bundle name (short)', category: 'App Identity' },
    'CFBundleIdentifier': { description: 'Bundle identifier (com.company.app)', category: 'App Identity' },
    'CFBundleShortVersionString': { description: 'Version number (e.g., 1.0.0)', category: 'Versioning' },
    'CFBundleVersion': { description: 'Build number', category: 'Versioning' },
    'CFBundleExecutable': { description: 'Executable file name', category: 'Build' },
    'CFBundlePackageType': { description: 'Bundle package type (APPL, FMWK, BNDL)', category: 'Build' },
    'CFBundleDevelopmentRegion': { description: 'Development region/language', category: 'Localization' },
    'CFBundleLocalizations': { description: 'Supported localizations', category: 'Localization' },
    'CFBundleURLTypes': { description: 'URL scheme registration', category: 'URL Schemes' },
    'CFBundleDocumentTypes': { description: 'Supported document types', category: 'Documents' },
    'LSApplicationQueriesSchemes': { description: 'URL schemes the app can query (canOpenURL)', category: 'URL Schemes' },
    'LSRequiresIPhoneOS': { description: 'Requires iOS', category: 'Requirements' },
    'MinimumOSVersion': { description: 'Minimum OS version required', category: 'Requirements' },
    'UIRequiredDeviceCapabilities': { description: 'Required device capabilities', category: 'Requirements' },
    'UILaunchStoryboardName': { description: 'Launch storyboard file name', category: 'UI' },
    'UIMainStoryboardFile': { description: 'Main storyboard file name', category: 'UI' },
    'UIApplicationSceneManifest': { description: 'Scene configuration manifest', category: 'UI' },
    'UISupportedInterfaceOrientations': { description: 'Supported orientations', category: 'UI' },
    'UISupportedInterfaceOrientations~ipad': { description: 'Supported orientations (iPad)', category: 'UI' },
    'UIStatusBarStyle': { description: 'Status bar style', category: 'UI' },
    'UIViewControllerBasedStatusBarAppearance': { description: 'Per-VC status bar appearance', category: 'UI' },
    'UIApplicationSupportsIndirectInputEvents': { description: 'Indirect input events support', category: 'UI' },
    'UIBackgroundModes': { description: 'Background execution modes', category: 'Background' },
    'BGTaskSchedulerPermittedIdentifiers': { description: 'Background task identifiers', category: 'Background' },
    'NSAppTransportSecurity': { description: 'App Transport Security settings', category: 'Networking' },
    'ITSAppUsesNonExemptEncryption': { description: 'Uses non-exempt encryption (export compliance)', category: 'Compliance' },
    'NSCameraUsageDescription': { description: 'Camera access permission prompt', category: 'Privacy' },
    'NSPhotoLibraryUsageDescription': { description: 'Photo library access permission prompt', category: 'Privacy' },
    'NSPhotoLibraryAddUsageDescription': { description: 'Photo library add-only permission prompt', category: 'Privacy' },
    'NSMicrophoneUsageDescription': { description: 'Microphone access permission prompt', category: 'Privacy' },
    'NSLocationWhenInUseUsageDescription': { description: 'Location (when in use) permission prompt', category: 'Privacy' },
    'NSLocationAlwaysAndWhenInUseUsageDescription': { description: 'Location (always) permission prompt', category: 'Privacy' },
    'NSLocationAlwaysUsageDescription': { description: 'Location (always, legacy) permission prompt', category: 'Privacy' },
    'NSContactsUsageDescription': { description: 'Contacts access permission prompt', category: 'Privacy' },
    'NSCalendarsUsageDescription': { description: 'Calendar access permission prompt', category: 'Privacy' },
    'NSRemindersUsageDescription': { description: 'Reminders access permission prompt', category: 'Privacy' },
    'NSBluetoothAlwaysUsageDescription': { description: 'Bluetooth access permission prompt', category: 'Privacy' },
    'NSBluetoothPeripheralUsageDescription': { description: 'Bluetooth peripheral permission prompt', category: 'Privacy' },
    'NSMotionUsageDescription': { description: 'Motion data permission prompt', category: 'Privacy' },
    'NSSpeechRecognitionUsageDescription': { description: 'Speech recognition permission prompt', category: 'Privacy' },
    'NSFaceIDUsageDescription': { description: 'Face ID permission prompt', category: 'Privacy' },
    'NSLocalNetworkUsageDescription': { description: 'Local network access permission prompt', category: 'Privacy' },
    'NSUserTrackingUsageDescription': { description: 'App Tracking Transparency prompt', category: 'Privacy' },
    'NSHealthShareUsageDescription': { description: 'HealthKit share permission prompt', category: 'Privacy' },
    'NSHealthUpdateUsageDescription': { description: 'HealthKit update permission prompt', category: 'Privacy' },
    'NSAppleMusicUsageDescription': { description: 'Media library access permission prompt', category: 'Privacy' },
    'NSSiriUsageDescription': { description: 'Siri usage permission prompt', category: 'Privacy' },
    'NSHomeKitUsageDescription': { description: 'HomeKit permission prompt', category: 'Privacy' },
    'NSNearbyInteractionUsageDescription': { description: 'Nearby Interaction permission prompt', category: 'Privacy' },
    'NSNearbyInteractionAllowOnceUsageDescription': { description: 'Nearby Interaction one-time prompt', category: 'Privacy' },
    'NSSensorKitUsageDescription': { description: 'SensorKit permission prompt', category: 'Privacy' },
    'UIFileSharingEnabled': { description: 'iTunes file sharing enabled', category: 'Files' },
    'LSSupportsOpeningDocumentsInPlace': { description: 'Open documents in place', category: 'Files' },
    'FirebaseAppDelegateProxyEnabled': { description: 'Firebase swizzling proxy', category: 'Firebase' },
}

const CATEGORY_ICONS: Record<string, string> = {
    'Privacy': '🔒',
    'Security': '🛡️',
    'Push Notifications': '🔔',
    'Notifications': '🔔',
    'Networking': '🌐',
    'iCloud': '☁️',
    'Authentication': '🔑',
    'App Links': '🔗',
    'Payments': '💳',
    'Health': '❤️',
    'Background': '⏱️',
    'UI': '🎨',
    'App Identity': '📱',
    'Versioning': '🏷️',
    'URL Schemes': '🔗',
    'Requirements': '⚙️',
    'Data Sharing': '📤',
    'Localization': '🌍',
    'CarPlay': '🚗',
    'HomeKit': '🏠',
    'Maps': '🗺️',
    'NFC': '📡',
    'Siri': '🎤',
    'SharePlay': '👥',
    'Communication': '📞',
}

// ---- XML Plist Parser ----

function parsePlistXml(xml: string): PlistValue {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')

    const err = doc.querySelector('parsererror')
    if (err) throw new Error('Invalid XML: ' + err.textContent?.slice(0, 100))

    const plist = doc.querySelector('plist')
    if (!plist) throw new Error('Not a valid plist file — missing <plist> root element')

    const rootChild = getFirstElement(plist)
    if (!rootChild) throw new Error('Empty plist')

    return parseNode(rootChild)
}

function getFirstElement(parent: Element): Element | null {
    for (let i = 0; i < parent.childNodes.length; i++) {
        const n = parent.childNodes[i]
        if (n.nodeType === Node.ELEMENT_NODE) return n as Element
    }
    return null
}

function getChildElements(parent: Element): Element[] {
    const result: Element[] = []
    for (let i = 0; i < parent.childNodes.length; i++) {
        const n = parent.childNodes[i]
        if (n.nodeType === Node.ELEMENT_NODE) result.push(n as Element)
    }
    return result
}

function parseNode(el: Element): PlistValue {
    const tag = el.tagName.toLowerCase()
    switch (tag) {
        case 'string': return { type: 'string', value: el.textContent || '' }
        case 'integer': return { type: 'integer', value: parseInt(el.textContent || '0', 10) }
        case 'real': return { type: 'real', value: parseFloat(el.textContent || '0') }
        case 'true': return { type: 'boolean', value: true }
        case 'false': return { type: 'boolean', value: false }
        case 'date': return { type: 'date', value: el.textContent || '' }
        case 'data': return { type: 'data', value: (el.textContent || '').trim() }
        case 'array': {
            const items = getChildElements(el).map(parseNode)
            return { type: 'array', value: items }
        }
        case 'dict': {
            const children = getChildElements(el)
            const entries: [string, PlistValue][] = []
            for (let i = 0; i < children.length; i += 2) {
                const key = children[i].textContent || ''
                const val = children[i + 1] ? parseNode(children[i + 1]) : { type: 'string' as const, value: '' }
                entries.push([key, val])
            }
            return { type: 'dict', value: entries }
        }
        default: return { type: 'string', value: el.textContent || '' }
    }
}

// ---- Plist to JSON converter ----

function plistToJson(pv: PlistValue): unknown {
    switch (pv.type) {
        case 'string': case 'date': case 'data': return pv.value
        case 'integer': case 'real': return pv.value
        case 'boolean': return pv.value
        case 'array': return pv.value.map(plistToJson)
        case 'dict': {
            const obj: Record<string, unknown> = {}
            for (const [k, v] of pv.value) obj[k] = plistToJson(v)
            return obj
        }
    }
}

// ---- Component ----

type ViewMode = 'tree' | 'grouped' | 'json'

export default function PlistClient() {
    const [rawXml, setRawXml] = useState('')
    const [parsed, setParsed] = useState<PlistValue | null>(null)
    const [error, setError] = useState('')
    const [fileName, setFileName] = useState('')
    const [viewMode, setViewMode] = useState<ViewMode>('grouped')
    const [search, setSearch] = useState('')
    const [copied, setCopied] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)

    const handleCopy = useCallback((key: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(''), 1500)
    }, [])

    const handleParse = useCallback((xml: string) => {
        setError(''); setParsed(null)
        if (!xml.trim()) return
        try {
            const result = parsePlistXml(xml)
            setParsed(result)
        } catch (e: any) {
            setError(e.message || 'Parse failed')
        }
    }, [])

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFileName(file.name)
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target?.result as string
            setRawXml(text)
            handleParse(text)
        }
        reader.readAsText(file)
    }

    const handlePaste = () => {
        handleParse(rawXml)
    }

    const handleSample = (type: 'info' | 'entitlements') => {
        const xml = type === 'info' ? SAMPLE_INFO_PLIST : SAMPLE_ENTITLEMENTS
        setRawXml(xml)
        setFileName(type === 'info' ? 'Info.plist' : 'App.entitlements')
        handleParse(xml)
    }

    // JSON output
    const jsonOutput = useMemo(() => {
        if (!parsed) return ''
        return JSON.stringify(plistToJson(parsed), null, 2)
    }, [parsed])

    // Grouped entries (for entitlements / Info.plist)
    const groupedEntries = useMemo(() => {
        if (!parsed || parsed.type !== 'dict') return null
        const groups: Record<string, { key: string; value: PlistValue; info?: KeyInfo }[]> = {}

        for (const [key, val] of parsed.value) {
            const info = KNOWN_KEYS[key]
            const cat = info?.category || 'Other'
            if (!groups[cat]) groups[cat] = []
            groups[cat].push({ key, value: val, info })
        }

        // sort: known categories first, then "Other"
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Other') return 1
            if (b === 'Other') return -1
            return a.localeCompare(b)
        })

        return sortedKeys.map(cat => ({ category: cat, entries: groups[cat] }))
    }, [parsed])

    // Search filter
    const filteredGroups = useMemo(() => {
        if (!groupedEntries || !search.trim()) return groupedEntries
        const q = search.toLowerCase()
        return groupedEntries
            .map(g => ({
                ...g,
                entries: g.entries.filter(e =>
                    e.key.toLowerCase().includes(q) ||
                    e.info?.description.toLowerCase().includes(q) ||
                    e.info?.category.toLowerCase().includes(q) ||
                    valueToString(e.value).toLowerCase().includes(q)
                ),
            }))
            .filter(g => g.entries.length > 0)
    }, [groupedEntries, search])

    // Stats
    const stats = useMemo(() => {
        if (!parsed || parsed.type !== 'dict') return null
        let privacyKeys = 0, entitlementKeys = 0, total = parsed.value.length
        for (const [key] of parsed.value) {
            if (KNOWN_KEYS[key]?.category === 'Privacy') privacyKeys++
            if (key.startsWith('com.apple.developer.') || key === 'aps-environment' || key === 'keychain-access-groups') entitlementKeys++
        }
        return { total, privacyKeys, entitlementKeys }
    }, [parsed])

    const isEntitlements = fileName.includes('entitlements')

    return (
        <div className="space-y-6">
            {/* Input area */}
            <div className="space-y-3">
                {/* File upload */}
                <div className="flex flex-wrap items-center gap-3">
                    <input ref={fileRef} type="file" accept=".plist,.entitlements,.xml" onChange={handleFile} className="hidden" />
                    <button onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload .plist / .entitlements
                    </button>
                    {fileName && (
                        <span className="text-xs font-mono text-gray-400 bg-gray-800/50 px-2 py-1 rounded">{fileName}</span>
                    )}
                    <div className="ml-auto flex gap-2">
                        <button onClick={() => handleSample('info')}
                            className="text-xs text-orange-400/70 hover:text-orange-400 transition">Sample Info.plist</button>
                        <button onClick={() => handleSample('entitlements')}
                            className="text-xs text-orange-400/70 hover:text-orange-400 transition">Sample .entitlements</button>
                    </div>
                </div>

                {/* Paste area */}
                <textarea
                    value={rawXml}
                    onChange={(e) => setRawXml(e.target.value)}
                    placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"\n "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n    <key>CFBundleDisplayName</key>\n    <string>MyApp</string>\n    ...\n</dict>\n</plist>'}
                    className="w-full h-36 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                />
                <div className="flex gap-3">
                    <button onClick={handlePaste}
                        className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition">
                        Parse
                    </button>
                    <button onClick={() => { setRawXml(''); setParsed(null); setError(''); setFileName(''); setSearch('') }}
                        className="px-5 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition">
                        Clear
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Results */}
            {parsed && (
                <div className="space-y-4">
                    {/* Stats bar */}
                    {stats && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                {stats.total} keys
                            </span>
                            {stats.privacyKeys > 0 && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                                    {stats.privacyKeys} privacy permissions
                                </span>
                            )}
                            {stats.entitlementKeys > 0 && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    {stats.entitlementKeys} entitlements
                                </span>
                            )}
                        </div>
                    )}

                    {/* View mode + search */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-gray-800/50 rounded-lg p-0.5 border border-gray-700">
                            {(['grouped', 'tree', 'json'] as ViewMode[]).map(m => (
                                <button key={m} onClick={() => setViewMode(m)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                        viewMode === m
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'text-gray-400 hover:text-white border border-transparent'
                                    }`}>
                                    {m === 'grouped' ? 'Grouped' : m === 'tree' ? 'Tree' : 'JSON'}
                                </button>
                            ))}
                        </div>
                        {viewMode !== 'json' && (
                            <input
                                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search keys..."
                                className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                        )}
                        {viewMode === 'json' && (
                            <button onClick={() => handleCopy('json', jsonOutput)}
                                className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition">
                                {copied === 'json' ? 'Copied!' : 'Copy JSON'}
                            </button>
                        )}
                    </div>

                    {/* Grouped View */}
                    {viewMode === 'grouped' && filteredGroups && (
                        <div className="space-y-3">
                            {filteredGroups.map(group => (
                                <div key={group.category} className="border border-gray-700 rounded-xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50">
                                        <span className="text-sm">{CATEGORY_ICONS[group.category] || '📋'}</span>
                                        <span className="text-sm font-medium text-gray-300">{group.category}</span>
                                        <span className="text-xs text-gray-600">({group.entries.length})</span>
                                    </div>
                                    <div className="divide-y divide-gray-800/50">
                                        {group.entries.map(({ key, value, info }) => (
                                            <div key={key} className="px-4 py-3 hover:bg-gray-800/20 transition">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <code className="text-xs font-mono text-orange-400 break-all">{key}</code>
                                                            <TypeBadge type={value.type} />
                                                        </div>
                                                        {info && (
                                                            <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => handleCopy(key, valueToString(value))}
                                                        className="text-[11px] text-blue-400 hover:text-blue-300 transition whitespace-nowrap shrink-0">
                                                        {copied === key ? '✓' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="mt-2">
                                                    <ValueDisplay value={value} depth={0} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tree View */}
                    {viewMode === 'tree' && (
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 overflow-x-auto">
                            <TreeNode value={parsed} label={isEntitlements ? 'Entitlements' : 'Root'} depth={0} search={search} copied={copied} onCopy={handleCopy} />
                        </div>
                    )}

                    {/* JSON View */}
                    {viewMode === 'json' && (
                        <pre className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                            {jsonOutput}
                        </pre>
                    )}
                </div>
            )}
        </div>
    )
}

// ---- Value Display ----

function ValueDisplay({ value, depth }: { value: PlistValue; depth: number }) {
    if (value.type === 'string') return <span className="text-xs font-mono text-green-400 break-all">{value.value}</span>
    if (value.type === 'integer' || value.type === 'real') return <span className="text-xs font-mono text-blue-400">{value.value}</span>
    if (value.type === 'boolean') return <span className={`text-xs font-mono ${value.value ? 'text-green-400' : 'text-red-400'}`}>{value.value ? 'YES' : 'NO'}</span>
    if (value.type === 'date') return <span className="text-xs font-mono text-cyan-400">{value.value}</span>
    if (value.type === 'data') return <span className="text-xs font-mono text-gray-500 italic">[Base64 data]</span>
    if (value.type === 'array') {
        if (value.value.length === 0) return <span className="text-xs text-gray-600">[] (empty)</span>
        // short string arrays inline
        if (value.value.every(v => v.type === 'string') && value.value.length <= 8) {
            return (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {value.value.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">
                            {(v as { type: 'string'; value: string }).value}
                        </span>
                    ))}
                </div>
            )
        }
        return (
            <div className="mt-1 space-y-1 ml-3 border-l border-gray-700/50 pl-3">
                {value.value.map((v, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <span className="text-[10px] text-gray-600 font-mono shrink-0">[{i}]</span>
                        <ValueDisplay value={v} depth={depth + 1} />
                    </div>
                ))}
            </div>
        )
    }
    if (value.type === 'dict') {
        if (value.value.length === 0) return <span className="text-xs text-gray-600">{'{}'} (empty)</span>
        return (
            <div className="mt-1 space-y-2 ml-3 border-l border-gray-700/50 pl-3">
                {value.value.map(([k, v]) => (
                    <div key={k}>
                        <code className="text-xs font-mono text-orange-400/80">{k}</code>
                        <span className="text-gray-600 mx-1">:</span>
                        <ValueDisplay value={v} depth={depth + 1} />
                    </div>
                ))}
            </div>
        )
    }
    return null
}

// ---- Tree Node ----

function TreeNode({ value, label, depth, search, copied, onCopy }: {
    value: PlistValue; label: string; depth: number; search: string; copied: string; onCopy: (k: string, v: string) => void
}) {
    const [collapsed, setCollapsed] = useState(depth > 2)
    const isContainer = value.type === 'dict' || value.type === 'array'
    const matchesSearch = search && label.toLowerCase().includes(search.toLowerCase())

    return (
        <div className="text-xs font-mono">
            <div className={`flex items-center gap-1 py-0.5 hover:bg-gray-800/30 rounded px-1 -mx-1 ${matchesSearch ? 'bg-yellow-500/10' : ''}`}>
                {isContainer ? (
                    <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-300 w-4 shrink-0">
                        {collapsed ? '▸' : '▾'}
                    </button>
                ) : <span className="w-4" />}
                <span className="text-orange-400">{label}</span>
                <TypeBadge type={value.type} />
                {!isContainer && (
                    <>
                        <span className="text-gray-600 mx-0.5">:</span>
                        <span className={
                            value.type === 'string' || value.type === 'date' ? 'text-green-400' :
                            value.type === 'integer' || value.type === 'real' ? 'text-blue-400' :
                            value.type === 'boolean' ? (value.value ? 'text-green-400' : 'text-red-400') : 'text-gray-400'
                        }>
                            {value.type === 'boolean' ? (value.value ? 'YES' : 'NO') : String(value.value)}
                        </span>
                    </>
                )}
                {isContainer && (
                    <span className="text-gray-600">
                        ({value.type === 'dict' ? (value as { type: 'dict'; value: [string, PlistValue][] }).value.length + ' keys' :
                           (value as { type: 'array'; value: PlistValue[] }).value.length + ' items'})
                    </span>
                )}
            </div>
            {isContainer && !collapsed && (
                <div className="ml-4 border-l border-gray-700/30 pl-1">
                    {value.type === 'dict' && (value as { type: 'dict'; value: [string, PlistValue][] }).value.map(([k, v]) => (
                        <TreeNode key={k} value={v} label={k} depth={depth + 1} search={search} copied={copied} onCopy={onCopy} />
                    ))}
                    {value.type === 'array' && (value as { type: 'array'; value: PlistValue[] }).value.map((v, i) => (
                        <TreeNode key={i} value={v} label={`[${i}]`} depth={depth + 1} search={search} copied={copied} onCopy={onCopy} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ---- Type Badge ----

function TypeBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        string: 'text-green-500 bg-green-500/10',
        integer: 'text-blue-500 bg-blue-500/10',
        real: 'text-blue-500 bg-blue-500/10',
        boolean: 'text-orange-500 bg-orange-500/10',
        date: 'text-cyan-500 bg-cyan-500/10',
        data: 'text-gray-500 bg-gray-500/10',
        array: 'text-purple-500 bg-purple-500/10',
        dict: 'text-yellow-500 bg-yellow-500/10',
    }
    return (
        <span className={`text-[9px] px-1 py-0.5 rounded font-sans ${colors[type] || 'text-gray-500 bg-gray-500/10'}`}>
            {type}
        </span>
    )
}

// ---- Helpers ----

function valueToString(pv: PlistValue): string {
    switch (pv.type) {
        case 'string': case 'date': case 'data': return pv.value
        case 'integer': case 'real': return String(pv.value)
        case 'boolean': return pv.value ? 'YES' : 'NO'
        case 'array': return JSON.stringify(pv.value.map(plistToJson), null, 2)
        case 'dict': {
            const obj: Record<string, unknown> = {}
            for (const [k, v] of pv.value) obj[k] = plistToJson(v)
            return JSON.stringify(obj, null, 2)
        }
    }
}

// ---- Sample data ----

const SAMPLE_INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>MyApp</string>
    <key>CFBundleIdentifier</key>
    <string>com.company.myapp</string>
    <key>CFBundleShortVersionString</key>
    <string>2.1.0</string>
    <key>CFBundleVersion</key>
    <string>145</string>
    <key>CFBundleExecutable</key>
    <string>MyApp</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleLocalizations</key>
    <array>
        <string>en</string>
        <string>ko</string>
        <string>zh-Hans</string>
        <string>ja</string>
    </array>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>MinimumOSVersion</key>
    <string>16.0</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
        <string>nfc</string>
    </array>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
        <string>audio</string>
        <string>location</string>
    </array>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>myapp</string>
                <string>fb1234567890</string>
            </array>
            <key>CFBundleURLName</key>
            <string>com.company.myapp</string>
        </dict>
    </array>
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <string>kakaolink</string>
        <string>line</string>
        <string>instagram</string>
        <string>twitter</string>
    </array>
    <key>NSCameraUsageDescription</key>
    <string>We need camera access to scan QR codes and take photos.</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>We need photo library access to select profile images.</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>We need your location to show nearby stores.</string>
    <key>NSFaceIDUsageDescription</key>
    <string>We use Face ID for secure authentication.</string>
    <key>NSUserTrackingUsageDescription</key>
    <string>We use this to provide personalized ads.</string>
    <key>NSLocalNetworkUsageDescription</key>
    <string>We need local network access for device discovery.</string>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>legacy-api.example.com</key>
            <dict>
                <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
                <true/>
                <key>NSTemporaryExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
            </dict>
        </dict>
    </dict>
    <key>ITSAppUsesNonExemptEncryption</key>
    <false/>
    <key>FirebaseAppDelegateProxyEnabled</key>
    <false/>
</dict>
</plist>`

const SAMPLE_ENTITLEMENTS = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:example.com</string>
        <string>webcredentials:example.com</string>
        <string>activitycontinuation:example.com</string>
    </array>
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>
    <key>aps-environment</key>
    <string>production</string>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.company.myapp</string>
    </array>
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.company.myapp</string>
        <string>$(AppIdentifierPrefix)com.company.shared</string>
    </array>
    <key>com.apple.developer.in-app-payments</key>
    <array>
        <string>merchant.com.company.myapp</string>
    </array>
    <key>com.apple.developer.networking.wifi-info</key>
    <true/>
    <key>com.apple.developer.nfc.readersession.formats</key>
    <array>
        <string>TAG</string>
        <string>NDEF</string>
    </array>
    <key>com.apple.developer.default-data-protection</key>
    <string>NSFileProtectionComplete</string>
    <key>com.apple.developer.usernotifications.time-sensitive</key>
    <true/>
    <key>com.apple.developer.healthkit</key>
    <true/>
    <key>com.apple.developer.healthkit.access</key>
    <array>
        <string>health-records</string>
    </array>
    <key>com.apple.developer.siri</key>
    <true/>
</dict>
</plist>`
