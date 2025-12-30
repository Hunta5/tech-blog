'use client'

import { useState } from 'react'

export default function HexDecimalClient() {
    const [hex, setHex] = useState('')
    const [dec, setDec] = useState('')

    function hexToDec(hex: string): string {
        const clean = hex.trim().toLowerCase().replace(/^0x/, '')

        if (!/^[0-9a-f]+$/.test(clean)) {
            throw new Error('Invalid hex')
        }

        return parseInt(clean, 16).toString(10)
    }

    function decToHex(dec: string): string {
        const clean = dec.trim()

        if (!/^\d+$/.test(clean)) {
            throw new Error('Invalid decimal')
        }

        return parseInt(clean, 10).toString(16).toUpperCase()
    }

    const handleHexToDec = () => {
        try {
            setDec(hexToDec(hex))
        } catch {
            setDec('Invalid Hex')
        }
    }

    const handleDecToHex = () => {
        try {
            setHex(decToHex(dec))
        } catch {
            setHex('Invalid Decimal')
        }
    }

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
                <input
                    className="p-3 border rounded-lg"
                    placeholder="Hex (e.g. FF or 0xFF)"
                    value={hex}
                    onChange={e => setHex(e.target.value)}
                />

                <input
                    className="p-3 border rounded-lg"
                    placeholder="Decimal (e.g. 255)"
                    value={dec}
                    onChange={e => setDec(e.target.value)}
                />
            </div>

            <div className="flex justify-center gap-4 mt-6">
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={handleHexToDec}
                >
                    Hex → Dec
                </button>

                <button
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg"
                    onClick={handleDecToHex}
                >
                    Dec → Hex
                </button>

                <button
                    className="px-6 py-2 bg-gray-300 rounded-lg"
                    onClick={() => {
                        setHex('')
                        setDec('')
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    )
}