'use client'

import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Mode = 'hash' | 'hmac' | 'bcrypt'

const HASH_ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
type HashAlgo = typeof HASH_ALGOS[number]

const ALGO_MAP: Record<HashAlgo, string> = {
    'MD5': 'MD5',
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
}

async function computeHash(algo: HashAlgo, data: string): Promise<string> {
    if (algo === 'MD5') return md5(data)
    const encoder = new TextEncoder()
    const buf = await crypto.subtle.digest(ALGO_MAP[algo], encoder.encode(data))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function computeHmac(algo: HashAlgo, data: string, secret: string): Promise<string> {
    if (algo === 'MD5') throw new Error('HMAC-MD5 is not supported by Web Crypto API. Please use SHA algorithms.')
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
        'raw', keyData,
        { name: 'HMAC', hash: ALGO_MAP[algo] },
        false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function CryptoClient() {
    const { t } = useLanguage()
    const [mode, setMode] = useState<Mode>('hash')
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)

    // Hash state
    const [hashAlgo, setHashAlgo] = useState<HashAlgo>('SHA-256')

    // HMAC state
    const [hmacAlgo, setHmacAlgo] = useState<HashAlgo>('SHA-256')
    const [hmacSecret, setHmacSecret] = useState('')

    // Bcrypt state
    const [bcryptRounds, setBcryptRounds] = useState(10)
    const [bcryptMode, setBcryptMode] = useState<'hash' | 'verify'>('hash')
    const [bcryptHash, setBcryptHash] = useState('')
    const [verifyResult, setVerifyResult] = useState<boolean | null>(null)

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleHash = async () => {
        setError(''); setOutput('')
        if (!input.trim()) { setError(t('crypto.enterText')); return }
        try {
            const result = await computeHash(hashAlgo, input)
            setOutput(result)
        } catch (e: any) {
            setError(e.message || 'Hash failed')
        }
    }

    const handleHmac = async () => {
        setError(''); setOutput('')
        if (!input.trim()) { setError(t('crypto.enterText')); return }
        if (!hmacSecret.trim()) { setError(t('crypto.enterSecret')); return }
        try {
            const result = await computeHmac(hmacAlgo, input, hmacSecret)
            setOutput(result)
        } catch (e: any) {
            setError(e.message || 'HMAC generation failed')
        }
    }

    const handleBcrypt = async () => {
        setError(''); setOutput(''); setVerifyResult(null)
        if (!input.trim()) { setError(t('crypto.enterPassword')); return }
        setLoading(true)
        try {
            if (bcryptMode === 'hash') {
                const salt = await bcrypt.genSalt(bcryptRounds)
                const hash = await bcrypt.hash(input, salt)
                setOutput(hash)
            } else {
                if (!bcryptHash.trim()) { setError(t('crypto.enterHash')); setLoading(false); return }
                const match = await bcrypt.compare(input, bcryptHash)
                setVerifyResult(match)
            }
        } catch (e: any) {
            setError(e.message || 'bcrypt operation failed')
        } finally {
            setLoading(false)
        }
    }

    const handleExecute = () => {
        if (mode === 'hash') handleHash()
        else if (mode === 'hmac') handleHmac()
        else handleBcrypt()
    }

    const modes: { key: Mode; label: string; color: string }[] = [
        { key: 'hash', label: t('crypto.hash'), color: 'blue' },
        { key: 'hmac', label: t('crypto.hmac'), color: 'purple' },
        { key: 'bcrypt', label: 'bcrypt', color: 'orange' },
    ]

    return (
        <div className="space-y-6">
            {/* Mode Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700">
                {modes.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => { setMode(m.key); setOutput(''); setError(''); setVerifyResult(null) }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            mode === m.key
                                ? m.color === 'blue'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : m.color === 'purple'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Hint */}
            <div className="text-xs text-gray-500">
                {mode === 'hash' && t('crypto.hashHint')}
                {mode === 'hmac' && t('crypto.hmacHint')}
                {mode === 'bcrypt' && t('crypto.bcryptHint')}
            </div>

            {/* Algorithm Selector (Hash / HMAC) */}
            {(mode === 'hash' || mode === 'hmac') && (
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('crypto.algorithm')}</label>
                    <div className="flex flex-wrap gap-2">
                        {HASH_ALGOS.filter(a => mode === 'hmac' ? a !== 'MD5' : true).map((algo) => {
                            const selected = mode === 'hash' ? hashAlgo === algo : hmacAlgo === algo
                            return (
                                <button
                                    key={algo}
                                    onClick={() => mode === 'hash' ? setHashAlgo(algo) : setHmacAlgo(algo)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-all ${
                                        selected
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                >
                                    {algo}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Bcrypt Mode Toggle */}
            {mode === 'bcrypt' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setBcryptMode('hash'); setOutput(''); setVerifyResult(null); setError('') }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            bcryptMode === 'hash'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        {t('crypto.hash')}
                    </button>
                    <button
                        onClick={() => { setBcryptMode('verify'); setOutput(''); setVerifyResult(null); setError('') }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            bcryptMode === 'verify'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        {t('crypto.verify')}
                    </button>
                </div>
            )}

            {/* Bcrypt Rounds */}
            {mode === 'bcrypt' && bcryptMode === 'hash' && (
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                        {t('crypto.saltRounds')} <span className="text-orange-400">{bcryptRounds}</span>
                    </label>
                    <input
                        type="range"
                        min={4}
                        max={16}
                        value={bcryptRounds}
                        onChange={(e) => setBcryptRounds(Number(e.target.value))}
                        className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{t('crypto.fast')}</span>
                        <span>{t('crypto.slowSecure')}</span>
                    </div>
                </div>
            )}

            {/* HMAC Secret */}
            {mode === 'hmac' && (
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('crypto.secretKey')}</label>
                    <input
                        type="text"
                        value={hmacSecret}
                        onChange={(e) => setHmacSecret(e.target.value)}
                        placeholder={t('crypto.secretKeyPlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    />
                </div>
            )}

            {/* Input / Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                        {mode === 'bcrypt' ? t('crypto.password') : t('tool.input')}
                    </label>
                    <textarea
                        className="w-full h-40 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                        placeholder={mode === 'bcrypt' ? 'Enter password...' : 'Enter text to hash...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <div>
                    {mode === 'bcrypt' && bcryptMode === 'verify' ? (
                        <>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                                {t('crypto.bcryptHash')}
                            </label>
                            <textarea
                                className="w-full h-40 p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
                                placeholder="$2a$10$..."
                                value={bcryptHash}
                                onChange={(e) => setBcryptHash(e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('tool.output')}</label>
                                {output && (
                                    <button onClick={() => handleCopy(output)} className="text-xs text-blue-400 hover:text-blue-300 transition">
                                        {copied ? t('tool.copied') : t('tool.copy')}
                                    </button>
                                )}
                            </div>
                            <textarea
                                className="w-full h-40 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 text-gray-300 font-mono text-sm resize-none"
                                placeholder="Result..."
                                value={output}
                                readOnly
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Verify Result */}
            {mode === 'bcrypt' && bcryptMode === 'verify' && verifyResult !== null && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
                    verifyResult
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {verifyResult ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                    {verifyResult ? t('crypto.passwordMatch') : t('crypto.passwordNoMatch')}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3">
                <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t('tool.processing')}
                        </span>
                    ) : (
                        mode === 'hash' ? t('crypto.hashBtn') :
                        mode === 'hmac' ? t('crypto.generateHmac') :
                        bcryptMode === 'hash' ? t('crypto.hashPassword') : t('crypto.verify')
                    )}
                </button>
                <button
                    onClick={() => { setInput(''); setOutput(''); setError(''); setVerifyResult(null); setBcryptHash(''); setHmacSecret('') }}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    {t('tool.clear')}
                </button>
            </div>

            {/* Reference */}
            <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">{t('crypto.reference')}</summary>
                <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">{t('crypto.algorithm')}</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">{t('crypto.outputCol')}</th>
                                <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">{t('crypto.note')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {[
                                ['MD5', '128-bit (32 hex)', 'Fast but insecure, NOT for passwords'],
                                ['SHA-1', '160-bit (40 hex)', 'Legacy, avoid for security'],
                                ['SHA-256', '256-bit (64 hex)', 'Recommended general-purpose hash'],
                                ['SHA-384', '384-bit (96 hex)', 'Truncated SHA-512'],
                                ['SHA-512', '512-bit (128 hex)', 'Strongest SHA-2 variant'],
                                ['HMAC', 'Same as algo', 'Keyed hash for message auth'],
                                ['bcrypt', '60 chars', 'Adaptive, designed for password hashing'],
                            ].map(([algo, output, note]) => (
                                <tr key={algo} className="border-b border-gray-800/50">
                                    <td className="px-4 py-1.5 text-blue-400 font-mono">{algo}</td>
                                    <td className="px-4 py-1.5 text-green-400 font-mono">{output}</td>
                                    <td className="px-4 py-1.5 text-gray-400">{note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    )
}

// --- MD5 implementation (Web Crypto doesn't support MD5) ---
function md5(string: string): string {
    function md5cycle(x: number[], k: number[]) {
        let a = x[0], b = x[1], c = x[2], d = x[3]
        a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586)
        c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330)
        a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426)
        c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983)
        a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417)
        c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162)
        a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101)
        c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329)
        a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632)
        c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302)
        a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083)
        c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848)
        a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690)
        c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501)
        a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784)
        c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734)
        a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463)
        c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556)
        a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353)
        c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640)
        a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222)
        c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189)
        a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835)
        c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651)
        a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415)
        c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055)
        a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606)
        c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799)
        a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744)
        c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649)
        a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379)
        c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551)
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1])
        x[2] = add32(c, x[2]); x[3] = add32(d, x[3])
    }

    function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
        a = add32(add32(a, q), add32(x, t))
        return add32((a << s) | (a >>> (32 - s)), b)
    }

    function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t)
    }

    function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t)
    }

    function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(b ^ c ^ d, a, b, x, s, t)
    }

    function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t)
    }

    function md51(s: string) {
        const n = s.length
        const state = [1732584193, -271733879, -1732584194, 271733878]
        let i: number
        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)))
        }
        s = s.substring(i - 64)
        const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (i = 0; i < s.length; i++) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3)
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3)
        if (i > 55) {
            md5cycle(state, tail)
            for (i = 0; i < 16; i++) tail[i] = 0
        }
        tail[14] = n * 8
        md5cycle(state, tail)
        return state
    }

    function md5blk(s: string) {
        const md5blks: number[] = []
        for (let i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) +
                (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
        }
        return md5blks
    }

    const hex_chr = '0123456789abcdef'.split('')

    function rhex(n: number) {
        let s = ''
        for (let j = 0; j < 4; j++) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f]
        }
        return s
    }

    function add32(a: number, b: number) {
        return (a + b) & 0xffffffff
    }

    return md51(string).map(rhex).join('')
}
