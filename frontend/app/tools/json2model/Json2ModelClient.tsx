'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Lang = 'swift-codable' | 'swift-objc' | 'typescript' | 'kotlin'

type AccessLevel = 'public' | 'internal' | 'private'
type SwiftMutability = 'let' | 'var'

interface Options {
    rootName: string
    optionalAll: boolean
    accessLevel: AccessLevel
    mutability: SwiftMutability
    addInit: boolean
    addEquatable: boolean
    addDescription: boolean
    useClass: boolean           // struct vs class (Swift)
    objcPrefix: string          // Objective-C class prefix
    objcUseNullable: boolean    // nullable annotations
    objcMutableCopy: boolean    // NSCopying
}

const LANGS: { key: Lang; label: string; sub?: string }[] = [
    { key: 'swift-codable', label: 'Swift', sub: 'Codable' },
    { key: 'swift-objc', label: 'Objective-C', sub: 'Model' },
    { key: 'typescript', label: 'TypeScript', sub: 'Interface' },
    { key: 'kotlin', label: 'Kotlin', sub: 'Data Class' },
]

export default function Json2ModelClient() {
    const { t } = useLanguage()
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [lang, setLang] = useState<Lang>('swift-codable')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const [options, setOptions] = useState<Options>({
        rootName: 'Root',
        optionalAll: false,
        accessLevel: 'internal',
        mutability: 'let',
        addInit: false,
        addEquatable: false,
        addDescription: false,
        useClass: false,
        objcPrefix: '',
        objcUseNullable: true,
        objcMutableCopy: false,
    })

    const setOpt = <K extends keyof Options>(key: K, val: Options[K]) => setOptions(prev => ({ ...prev, [key]: val }))

    const handleConvert = () => {
        setError(''); setOutput('')
        if (!input.trim()) { setError('Please paste JSON'); return }
        try {
            const json = JSON.parse(input)
            const name = options.rootName.trim() || 'Root'
            let result = ''
            switch (lang) {
                case 'swift-codable': result = toSwiftCodable(json, name, options); break
                case 'swift-objc': result = toObjC(json, name, options); break
                case 'typescript': result = toTypeScript(json, name, options); break
                case 'kotlin': result = toKotlin(json, name, options); break
            }
            setOutput(result)
        } catch (e: any) {
            setError(e.message || 'Invalid JSON')
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(output)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleFormat = () => {
        try { setInput(JSON.stringify(JSON.parse(input), null, 2)) } catch { /* ignore */ }
    }

    const isSwift = lang === 'swift-codable'
    const isObjC = lang === 'swift-objc'
    const isIOS = isSwift || isObjC

    const langLabel = lang === 'swift-codable' ? 'Swift Codable'
        : lang === 'swift-objc' ? 'Objective-C'
        : lang === 'typescript' ? 'TypeScript'
        : 'Kotlin'

    return (
        <div className="space-y-6">
            {/* Language Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {LANGS.map((l) => (
                    <button
                        key={l.key}
                        onClick={() => { setLang(l.key); setOutput(''); setError('') }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex flex-col items-center leading-tight ${
                            lang === l.key
                                ? l.key.startsWith('swift') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : l.key === 'typescript' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        <span>{l.label}</span>
                        {l.sub && <span className="text-[10px] opacity-60">{l.sub}</span>}
                    </button>
                ))}
            </div>

            {/* Options */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{t('tool.options')}</div>

                {/* Row 1: Root name + general */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">{t('j2m.rootName')}</label>
                        <input
                            type="text"
                            value={options.rootName}
                            onChange={(e) => setOpt('rootName', e.target.value)}
                            className="w-32 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="Root"
                        />
                    </div>
                    <Checkbox label={t('j2m.allOptional')} checked={options.optionalAll} onChange={(v) => setOpt('optionalAll', v)} />
                </div>

                {/* Swift-specific options */}
                {isSwift && (
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">{t('j2m.access')}</label>
                            <select value={options.accessLevel} onChange={(e) => setOpt('accessLevel', e.target.value as AccessLevel)}
                                className="px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-xs focus:outline-none">
                                <option value="public">public</option>
                                <option value="internal">internal</option>
                                <option value="private">private</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">{t('j2m.properties')}</label>
                            <select value={options.mutability} onChange={(e) => setOpt('mutability', e.target.value as SwiftMutability)}
                                className="px-2 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-xs focus:outline-none">
                                <option value="let">{t('j2m.immutable')}</option>
                                <option value="var">{t('j2m.mutable')}</option>
                            </select>
                        </div>
                        <Checkbox label="class" checked={options.useClass} onChange={(v) => setOpt('useClass', v)} />
                        <Checkbox label="init()" checked={options.addInit} onChange={(v) => setOpt('addInit', v)} />
                        <Checkbox label="Equatable" checked={options.addEquatable} onChange={(v) => setOpt('addEquatable', v)} />
                        <Checkbox label="CustomStringConvertible" checked={options.addDescription} onChange={(v) => setOpt('addDescription', v)} />
                    </div>
                )}

                {/* ObjC-specific options */}
                {isObjC && (
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">{t('j2m.classPrefix')}</label>
                            <input
                                type="text"
                                value={options.objcPrefix}
                                onChange={(e) => setOpt('objcPrefix', e.target.value)}
                                className="w-20 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="XX"
                            />
                        </div>
                        <Checkbox label="nullable / nonnull" checked={options.objcUseNullable} onChange={(v) => setOpt('objcUseNullable', v)} />
                        <Checkbox label="NSCopying" checked={options.objcMutableCopy} onChange={(v) => setOpt('objcMutableCopy', v)} />
                    </div>
                )}
            </div>

            {/* Input / Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('j2m.jsonInput')}</label>
                        {input.trim() && (
                            <button onClick={handleFormat} className="text-xs text-blue-400 hover:text-blue-300 transition">{t('tool.format')}</button>
                        )}
                    </div>
                    <textarea
                        className="w-full h-[500px] p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder={'{\n  "user_id": 1,\n  "user_name": "John",\n  "email_address": "john@example.com",\n  "is_active": true,\n  "profile_image_url": null,\n  "address_info": {\n    "city_name": "Seoul",\n    "zip_code": "12345"\n  },\n  "tag_list": ["dev", "ios"],\n  "order_items": [\n    {\n      "item_id": 101,\n      "item_name": "MacBook",\n      "unit_price": 2999.99\n    }\n  ]\n}'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{langLabel} Output</label>
                        {output && (
                            <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                {copied ? t('tool.copied') : t('tool.copy')}
                            </button>
                        )}
                    </div>
                    <textarea
                        className="w-full h-[500px] p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-sm resize-none"
                        placeholder="Generated model..."
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
                    {t('tool.generate')}
                </button>
                <button
                    onClick={() => { setInput(''); setOutput(''); setError('') }}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    {t('tool.clear')}
                </button>
            </div>

            {/* Key Mapping Reference */}
            <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">{t('j2m.keyMapping')}</summary>
                <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">{t('j2m.jsonKey')}</th>
                                <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">{t('j2m.property')}</th>
                                <th className="px-4 py-2 text-left text-[10px] text-gray-500 uppercase">{t('j2m.autoCodingKey')}</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {[
                                ['user_id', 'userId', 'Yes'],
                                ['user_name', 'userName', 'Yes'],
                                ['email_address', 'emailAddress', 'Yes'],
                                ['is_active', 'isActive', 'Yes'],
                                ['profile_image_url', 'profileImageUrl', 'Yes'],
                                ['name', 'name', 'No (same)'],
                            ].map(([json, prop, auto]) => (
                                <tr key={json} className="border-b border-gray-800/50">
                                    <td className="px-4 py-1.5 text-yellow-400">{json}</td>
                                    <td className="px-4 py-1.5 text-green-400">{prop}</td>
                                    <td className="px-4 py-1.5 text-gray-400 font-sans">{auto}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    )
}

// ---- Checkbox helper ----

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-gray-800 border-gray-600 accent-blue-500" />
            {label}
        </label>
    )
}

// ===================== Shared =====================

function toPascalCase(s: string): string {
    return s.replace(/[_\-\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase())
}

function toCamelCase(s: string): string {
    const p = toPascalCase(s)
    return p.charAt(0).toLowerCase() + p.slice(1)
}

function isSnakeCase(s: string): boolean {
    return s.includes('_') || s.includes('-')
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

interface ModelField {
    key: string           // original JSON key
    propName: string      // camelCase property name
    type: string
    isOptional: boolean
    isArray: boolean
    needsMapping: boolean // key !== propName
    nestedModel?: string
}

function unwrapJson(json: JsonValue): Record<string, JsonValue> {
    if (typeof json !== 'object' || json === null) throw new Error('Please provide a JSON object or an array of objects')
    if (Array.isArray(json)) {
        if (json.length > 0 && typeof json[0] === 'object' && json[0] !== null && !Array.isArray(json[0])) {
            return json[0] as Record<string, JsonValue>
        }
        throw new Error('Please provide a JSON object or an array of objects')
    }
    return json as Record<string, JsonValue>
}

function inferFields(obj: Record<string, JsonValue>, parentName: string, models: Map<string, ModelField[]>): ModelField[] {
    return Object.entries(obj).map(([key, value]) => inferField(key, value, parentName, models))
}

function inferField(key: string, value: JsonValue, parentName: string, models: Map<string, ModelField[]>): ModelField {
    const propName = toCamelCase(key)
    const needsMapping = propName !== key

    if (value === null) return { key, propName, type: 'any', isOptional: true, isArray: false, needsMapping }
    if (typeof value === 'string') {
        // detect ISO date strings
        if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value)) {
            return { key, propName, type: 'date', isOptional: false, isArray: false, needsMapping }
        }
        // detect URL strings
        if (/^https?:\/\//.test(value)) {
            return { key, propName, type: 'url', isOptional: false, isArray: false, needsMapping }
        }
        return { key, propName, type: 'string', isOptional: false, isArray: false, needsMapping }
    }
    if (typeof value === 'number') {
        return { key, propName, type: Number.isInteger(value) ? 'int' : 'double', isOptional: false, isArray: false, needsMapping }
    }
    if (typeof value === 'boolean') return { key, propName, type: 'boolean', isOptional: false, isArray: false, needsMapping }
    if (Array.isArray(value)) {
        if (value.length === 0) return { key, propName, type: 'any', isOptional: false, isArray: true, needsMapping }
        const first = value[0]
        if (first !== null && typeof first === 'object' && !Array.isArray(first)) {
            // merge all array objects for more accurate type inference
            const merged = mergeArrayObjects(value as Record<string, JsonValue>[])
            const nestedName = toPascalCase(key.endsWith('s') ? key.slice(0, -1) : key)
            const nestedFields = inferFields(merged, nestedName, models)
            models.set(nestedName, nestedFields)
            return { key, propName, type: nestedName, isOptional: false, isArray: true, needsMapping, nestedModel: nestedName }
        }
        const itemField = inferField('_item', first, parentName, models)
        return { key, propName, type: itemField.type, isOptional: false, isArray: true, needsMapping }
    }
    if (typeof value === 'object') {
        const nestedName = toPascalCase(key)
        const nestedFields = inferFields(value as Record<string, JsonValue>, nestedName, models)
        models.set(nestedName, nestedFields)
        return { key, propName, type: nestedName, isOptional: false, isArray: false, needsMapping, nestedModel: nestedName }
    }
    return { key, propName, type: 'any', isOptional: false, isArray: false, needsMapping }
}

// merge all objects in an array to get a superset of keys (missing keys become optional)
function mergeArrayObjects(arr: Record<string, JsonValue>[]): Record<string, JsonValue> {
    const merged: Record<string, JsonValue> = {}
    for (const obj of arr) {
        for (const [k, v] of Object.entries(obj)) {
            if (!(k in merged) || merged[k] === null) merged[k] = v
        }
    }
    return merged
}

function collectModels(json: JsonValue, rootName: string): Map<string, ModelField[]> {
    const obj = unwrapJson(json)
    const models = new Map<string, ModelField[]>()
    const rootFields = inferFields(obj, rootName, models)
    models.set(rootName, rootFields)
    return models
}

// ===================== Swift Codable =====================

function swiftTypeStr(field: ModelField): string {
    const base = (() => {
        switch (field.type) {
            case 'string': return 'String'
            case 'int': return 'Int'
            case 'double': return 'Double'
            case 'boolean': return 'Bool'
            case 'date': return 'Date'
            case 'url': return 'URL'
            case 'any': return 'Any'
            default: return field.type
        }
    })()
    return field.isArray ? `[${base}]` : base
}

function toSwiftCodable(json: JsonValue, rootName: string, opts: Options): string {
    const models = collectModels(json, rootName)
    const lines: string[] = []
    const acc = opts.accessLevel === 'internal' ? '' : `${opts.accessLevel} `
    const keyword = opts.useClass ? 'class' : 'struct'

    // check if Date or URL types are used for a decoder snippet
    let usesDate = false
    let usesUrl = false
    for (const fields of models.values()) {
        for (const f of fields) {
            if (f.type === 'date') usesDate = true
            if (f.type === 'url') usesUrl = true
        }
    }

    // MARK: comment
    lines.push(`// MARK: - ${rootName}`)
    lines.push('')

    for (const [name, fields] of models) {
        // protocols
        const protocols: string[] = ['Codable']
        if (opts.addEquatable) protocols.push('Equatable')
        if (opts.addDescription) protocols.push('CustomStringConvertible')
        const protoStr = protocols.join(', ')

        lines.push(`${acc}${keyword} ${name}: ${protoStr} {`)

        // properties
        for (const f of fields) {
            const opt = opts.optionalAll || f.isOptional
            const typeStr = swiftTypeStr(f) + (opt ? '?' : '')
            lines.push(`    ${acc}${opts.mutability} ${f.propName}: ${typeStr}`)
        }

        // CodingKeys
        const needsCodingKeys = fields.some(f => f.needsMapping)
        if (needsCodingKeys) {
            lines.push('')
            lines.push(`    ${acc === '' ? '' : acc}enum CodingKeys: String, CodingKey {`)
            for (const f of fields) {
                if (f.needsMapping) {
                    lines.push(`        case ${f.propName} = "${f.key}"`)
                } else {
                    lines.push(`        case ${f.propName}`)
                }
            }
            lines.push('    }')
        }

        // init
        if (opts.addInit) {
            lines.push('')
            const params = fields.map(f => {
                const opt = opts.optionalAll || f.isOptional
                const typeStr = swiftTypeStr(f) + (opt ? '?' : '')
                const defaultVal = opt ? ' = nil' : ''
                return `        ${f.propName}: ${typeStr}${defaultVal}`
            }).join(',\n')
            lines.push(`    ${acc}init(`)
            lines.push(params)
            lines.push('    ) {')
            for (const f of fields) {
                lines.push(`        self.${f.propName} = ${f.propName}`)
            }
            lines.push('    }')
        }

        // CustomStringConvertible
        if (opts.addDescription) {
            lines.push('')
            const parts = fields.map(f => `${f.propName}: \\(${f.propName})`).join(', ')
            lines.push(`    ${acc}var description: String {`)
            lines.push(`        "${name}(${parts})"`)
            lines.push('    }')
        }

        lines.push('}')
        lines.push('')
    }

    // Decoder usage example
    if (usesDate) {
        lines.push('// MARK: - Decoder Configuration')
        lines.push('')
        lines.push('/*')
        lines.push(' let decoder = JSONDecoder()')
        lines.push(' decoder.dateDecodingStrategy = .iso8601')
        if (needsKeyStrategy(models)) {
            lines.push(' // Alternative: Use keyDecodingStrategy instead of CodingKeys')
            lines.push(' // decoder.keyDecodingStrategy = .convertFromSnakeCase')
        }
        lines.push(` let model = try decoder.decode(${rootName}.self, from: data)`)
        lines.push('*/')
        lines.push('')
    } else if (needsKeyStrategy(models)) {
        lines.push('// MARK: - Decoder Configuration')
        lines.push('')
        lines.push('/*')
        lines.push(' // Alternative: Use keyDecodingStrategy instead of CodingKeys')
        lines.push(' let decoder = JSONDecoder()')
        lines.push(' decoder.keyDecodingStrategy = .convertFromSnakeCase')
        lines.push(` let model = try decoder.decode(${rootName}.self, from: data)`)
        lines.push('*/')
        lines.push('')
    }

    return lines.join('\n').trim()
}

function needsKeyStrategy(models: Map<string, ModelField[]>): boolean {
    for (const fields of models.values()) {
        if (fields.some(f => f.needsMapping)) return true
    }
    return false
}

// ===================== Objective-C =====================

function objcPropertyType(field: ModelField, prefix: string, nullable: boolean): { type: string; attrs: string } {
    const isOpt = field.isOptional

    switch (field.type) {
        case 'string': return { type: 'NSString *', attrs: `nonatomic, copy${nullable ? (isOpt ? ', nullable' : ', nonnull') : ''}` }
        case 'int': return { type: 'NSInteger', attrs: 'nonatomic, assign' }
        case 'double': return { type: 'double', attrs: 'nonatomic, assign' }
        case 'boolean': return { type: 'BOOL', attrs: 'nonatomic, assign' }
        case 'date': return { type: 'NSDate *', attrs: `nonatomic, strong${nullable ? (isOpt ? ', nullable' : ', nonnull') : ''}` }
        case 'url': return { type: 'NSURL *', attrs: `nonatomic, strong${nullable ? (isOpt ? ', nullable' : ', nonnull') : ''}` }
        case 'any': return { type: 'id', attrs: `nonatomic, strong${nullable ? ', nullable' : ''}` }
        default: {
            const typeName = `${prefix}${field.type}`
            if (field.isArray) {
                return { type: `NSArray<${typeName} *> *`, attrs: `nonatomic, copy${nullable ? (isOpt ? ', nullable' : ', nonnull') : ''}` }
            }
            return { type: `${typeName} *`, attrs: `nonatomic, strong${nullable ? (isOpt ? ', nullable' : ', nonnull') : ''}` }
        }
    }
}

function objcValueType(type: string): boolean {
    return ['int', 'double', 'boolean'].includes(type)
}

function toObjC(json: JsonValue, rootName: string, opts: Options): string {
    const models = collectModels(json, rootName)
    const prefix = opts.objcPrefix
    const nullable = opts.objcUseNullable
    const lines: string[] = []

    // ---- .h ----
    lines.push('// ============================================')
    lines.push(`// ${prefix}${rootName}.h`)
    lines.push('// ============================================')
    lines.push('')
    lines.push('#import <Foundation/Foundation.h>')
    lines.push('')

    if (nullable) lines.push('NS_ASSUME_NONNULL_BEGIN')
    if (nullable) lines.push('')

    // forward declarations
    const modelNames = Array.from(models.keys())
    for (const name of modelNames) {
        lines.push(`@class ${prefix}${name};`)
    }
    lines.push('')

    for (const [name, fields] of models) {
        const className = `${prefix}${name}`
        const protocols = opts.objcMutableCopy ? '<NSCopying>' : ''
        lines.push(`@interface ${className} : NSObject${protocols}`)
        lines.push('')

        for (const f of fields) {
            const { type, attrs } = objcPropertyType(f, prefix, nullable)
            if (f.isArray && !f.nestedModel) {
                // primitive array
                const innerType = f.type === 'string' ? 'NSString *' : f.type === 'int' ? 'NSNumber *' : 'id'
                lines.push(`@property (${attrs.replace('assign', 'copy')}) NSArray<${innerType}> *${f.propName};`)
            } else if (f.isArray && f.nestedModel) {
                lines.push(`@property (${attrs}) ${type}${f.propName};`)
            } else if (objcValueType(f.type)) {
                lines.push(`@property (${attrs}) ${type}${f.propName};`)
            } else {
                lines.push(`@property (${attrs}) ${type}${f.propName};`)
            }
        }

        lines.push('')
        lines.push(`- (instancetype)initWithDictionary:(NSDictionary *)dictionary;`)
        lines.push(`+ (instancetype)modelWithDictionary:(NSDictionary *)dictionary;`)
        if (fields.some(f => f.isArray && f.nestedModel)) {
            lines.push(`+ (NSArray<${className} *> *)modelsWithArray:(NSArray<NSDictionary *> *)array;`)
        }
        lines.push('')
        lines.push('@end')
        lines.push('')
    }

    if (nullable) lines.push('NS_ASSUME_NONNULL_END')
    lines.push('')

    // ---- .m ----
    lines.push('// ============================================')
    lines.push(`// ${prefix}${rootName}.m`)
    lines.push('// ============================================')
    lines.push('')
    lines.push(`#import "${prefix}${rootName}.h"`)
    lines.push('')

    for (const [name, fields] of models) {
        const className = `${prefix}${name}`
        lines.push(`@implementation ${className}`)
        lines.push('')

        // initWithDictionary
        lines.push('- (instancetype)initWithDictionary:(NSDictionary *)dictionary {')
        lines.push('    self = [super init];')
        lines.push('    if (self) {')

        for (const f of fields) {
            const dictKey = f.key
            if (f.isArray && f.nestedModel) {
                const nestedClass = `${prefix}${f.nestedModel}`
                lines.push(`        self.${f.propName} = [${nestedClass} modelsWithArray:dictionary[@"${dictKey}"]];`)
            } else if (f.nestedModel && !f.isArray) {
                const nestedClass = `${prefix}${f.nestedModel}`
                lines.push(`        if (dictionary[@"${dictKey}"] && dictionary[@"${dictKey}"] != [NSNull null]) {`)
                lines.push(`            self.${f.propName} = [[${nestedClass} alloc] initWithDictionary:dictionary[@"${dictKey}"]];`)
                lines.push('        }')
            } else if (f.type === 'int') {
                lines.push(`        self.${f.propName} = [dictionary[@"${dictKey}"] integerValue];`)
            } else if (f.type === 'double') {
                lines.push(`        self.${f.propName} = [dictionary[@"${dictKey}"] doubleValue];`)
            } else if (f.type === 'boolean') {
                lines.push(`        self.${f.propName} = [dictionary[@"${dictKey}"] boolValue];`)
            } else if (f.type === 'url') {
                lines.push(`        if (dictionary[@"${dictKey}"] && dictionary[@"${dictKey}"] != [NSNull null]) {`)
                lines.push(`            self.${f.propName} = [NSURL URLWithString:dictionary[@"${dictKey}"]];`)
                lines.push('        }')
            } else if (f.type === 'date') {
                lines.push(`        if (dictionary[@"${dictKey}"] && dictionary[@"${dictKey}"] != [NSNull null]) {`)
                lines.push(`            NSDateFormatter *fmt = [[NSDateFormatter alloc] init];`)
                lines.push(`            fmt.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss";`)
                lines.push(`            self.${f.propName} = [fmt dateFromString:dictionary[@"${dictKey}"]];`)
                lines.push('        }')
            } else {
                // string, any, primitive arrays
                if (f.isOptional || f.type === 'any') {
                    lines.push(`        self.${f.propName} = dictionary[@"${dictKey}"] == [NSNull null] ? nil : dictionary[@"${dictKey}"];`)
                } else {
                    lines.push(`        self.${f.propName} = dictionary[@"${dictKey}"];`)
                }
            }
        }

        lines.push('    }')
        lines.push('    return self;')
        lines.push('}')
        lines.push('')

        // convenience constructor
        lines.push(`+ (instancetype)modelWithDictionary:(NSDictionary *)dictionary {`)
        lines.push(`    return [[self alloc] initWithDictionary:dictionary];`)
        lines.push('}')
        lines.push('')

        // array constructor for nested models
        if (fields.some(f => f.isArray && f.nestedModel)) {
            lines.push(`+ (NSArray<${className} *> *)modelsWithArray:(NSArray<NSDictionary *> *)array {`)
            lines.push('    NSMutableArray *models = [NSMutableArray array];')
            lines.push('    for (NSDictionary *dict in array) {')
            lines.push(`        [models addObject:[[${className} alloc] initWithDictionary:dict]];`)
            lines.push('    }')
            lines.push('    return [models copy];')
            lines.push('}')
            lines.push('')
        }

        // NSCopying
        if (opts.objcMutableCopy) {
            lines.push('- (id)copyWithZone:(NSZone *)zone {')
            lines.push(`    ${className} *copy = [[${className} allocWithZone:zone] init];`)
            for (const f of fields) {
                if (objcValueType(f.type)) {
                    lines.push(`    copy.${f.propName} = self.${f.propName};`)
                } else {
                    lines.push(`    copy.${f.propName} = [self.${f.propName} copyWithZone:zone];`)
                }
            }
            lines.push('    return copy;')
            lines.push('}')
            lines.push('')
        }

        // description
        lines.push('- (NSString *)description {')
        const descParts = fields.map(f => {
            if (objcValueType(f.type)) {
                const fmt = f.type === 'double' ? '%f' : f.type === 'boolean' ? '%d' : '%ld'
                return `@"${f.propName}=${fmt}"`
            }
            return `@"${f.propName}=%@"`
        })
        const fmtStr = fields.map(f => {
            if (f.type === 'double') return `${f.propName}=%f`
            if (f.type === 'boolean') return `${f.propName}=%d`
            if (f.type === 'int') return `${f.propName}=%ld`
            return `${f.propName}=%@`
        }).join(', ')
        const args = fields.map(f => `self.${f.propName}`).join(', ')
        lines.push(`    return [NSString stringWithFormat:@"${className} { ${fmtStr} }", ${args}];`)
        lines.push('}')
        lines.push('')

        lines.push('@end')
        lines.push('')
    }

    return lines.join('\n').trim()
}

// ===================== TypeScript =====================

function tsTypeStr(field: ModelField): string {
    const base = (() => {
        switch (field.type) {
            case 'string': case 'date': case 'url': return 'string'
            case 'int': case 'double': return 'number'
            case 'boolean': return 'boolean'
            case 'any': return 'any'
            default: return field.type
        }
    })()
    return field.isArray ? `${base}[]` : base
}

function toTypeScript(json: JsonValue, rootName: string, opts: Options): string {
    const models = collectModels(json, rootName)
    const lines: string[] = []
    for (const [name, fields] of models) {
        lines.push(`export interface ${name} {`)
        for (const f of fields) {
            const opt = opts.optionalAll || f.isOptional ? '?' : ''
            lines.push(`  ${f.propName}${opt}: ${tsTypeStr(f)};`)
        }
        lines.push('}')
        lines.push('')
    }
    return lines.join('\n').trim()
}

// ===================== Kotlin =====================

function kotlinTypeStr(field: ModelField): string {
    const base = (() => {
        switch (field.type) {
            case 'string': case 'date': case 'url': return 'String'
            case 'int': return 'Int'
            case 'double': return 'Double'
            case 'boolean': return 'Boolean'
            case 'any': return 'Any'
            default: return field.type
        }
    })()
    return field.isArray ? `List<${base}>` : base
}

function toKotlin(json: JsonValue, rootName: string, opts: Options): string {
    const models = collectModels(json, rootName)
    const lines: string[] = []
    const hasMapping = Array.from(models.values()).some(fields => fields.some(f => f.needsMapping))
    if (hasMapping) {
        lines.push('import kotlinx.serialization.SerialName')
        lines.push('import kotlinx.serialization.Serializable')
        lines.push('')
    }
    for (const [name, fields] of models) {
        lines.push('@Serializable')
        lines.push(`data class ${name}(`)
        fields.forEach((f, i) => {
            const opt = opts.optionalAll || f.isOptional
            const type = kotlinTypeStr(f) + (opt ? '?' : '')
            const defaultVal = opt ? ' = null' : ''
            const comma = i < fields.length - 1 ? ',' : ''
            if (f.needsMapping) lines.push(`    @SerialName("${f.key}")`)
            lines.push(`    val ${f.propName}: ${type}${defaultVal}${comma}`)
        })
        lines.push(')')
        lines.push('')
    }
    return lines.join('\n').trim()
}
