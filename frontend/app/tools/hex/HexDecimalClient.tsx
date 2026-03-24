'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function HexDecimalClient() {
    const { t } = useLanguage()
    const [hex, setHex] = useState('')
    const [dec, setDec] = useState('')
    const [error, setError] = useState('')

    const handleHexToDec = () => {
        try {
            setError('')
            const clean = hex.trim().toLowerCase().replace(/^0x/, '')
            if (!/^[0-9a-f]+$/.test(clean)) throw new Error()
            setDec(parseInt(clean, 16).toString(10))
        } catch {
            setError('Invalid Hex value')
        }
    }

    const handleDecToHex = () => {
        try {
            setError('')
            const clean = dec.trim()
            if (!/^\d+$/.test(clean)) throw new Error()
            setHex('0x' + parseInt(clean, 10).toString(16).toUpperCase())
        } catch {
            setError('Invalid Decimal value')
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('hex.hexLabel')}</label>
                    <input
                        className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="e.g. FF or 0xFF"
                        value={hex}
                        onChange={e => { setHex(e.target.value); setError('') }}
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('hex.decLabel')}</label>
                    <input
                        className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        placeholder="e.g. 255"
                        value={dec}
                        onChange={e => { setDec(e.target.value); setError('') }}
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                <button
                    onClick={handleHexToDec}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    {t('hex.toDecimal')}
                </button>
                <button
                    onClick={handleDecToHex}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    {t('hex.toHex')}
                </button>
                <button
                    onClick={() => { setHex(''); setDec(''); setError('') }}
                    className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition"
                >
                    {t('tool.clear')}
                </button>
            </div>

            {error && (
                <div className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                    {error}
                </div>
            )}
        </div>
    )
}
