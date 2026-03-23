'use client'

import { useState } from 'react'

export default function TimestampClient() {
    const [timestamp, setTimestamp] = useState('')
    const [date, setDate] = useState('')
    const [error, setError] = useState('')

    const convertFromTimestamp = () => {
        try {
            setError('')
            const num = Number(timestamp)
            if (Number.isNaN(num)) throw new Error()
            const d = timestamp.length === 10 ? new Date(num * 1000) : new Date(num)
            setDate(d.toLocaleString())
        } catch {
            setError('Invalid timestamp')
        }
    }

    const convertFromDate = () => {
        try {
            setError('')
            const d = parseDate(date)
            setTimestamp(String(d.getTime()))
        } catch {
            setError('Format: YYYY/MM/DD HH:mm:ss')
        }
    }

    function parseDate(str: string): Date {
        const match = str.trim().match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
        if (!match) throw new Error('Invalid format')
        const [, year, month, day, hour, minute, second = '0'] = match
        return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    }

    const setNow = () => {
        const now = new Date()
        setTimestamp(String(now.getTime()))
        setDate(now.toLocaleString())
        setError('')
    }

    return (
        <div className="space-y-6">
            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Timestamp</label>
                    <input
                        className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="e.g. 1700000000000 (ms) or 1700000000 (s)"
                        value={timestamp}
                        onChange={e => setTimestamp(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Date</label>
                    <input
                        className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        placeholder="YYYY/MM/DD HH:mm:ss"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
                <button
                    onClick={convertFromTimestamp}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    Timestamp
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Date
                </button>
                <button
                    onClick={convertFromDate}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    Date
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Timestamp
                </button>
                <button
                    onClick={setNow}
                    className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Now
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
