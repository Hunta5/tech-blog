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

            const d =
                timestamp.length === 10
                    ? new Date(num * 1000)
                    : new Date(num)

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
            setError('Format: YYYY-MM-DD HH:mm:ss')
        }
    }

    function parseDate(str: string): Date {
        const s = str.trim()

        const match = s.match(
            /^(\d{4})\/(\d{2})\/(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
        )

        if (!match) throw new Error('Invalid format')

        const [
            ,
            year,
            month,
            day,
            hour,
            minute,
            second = '0',
        ] = match

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        )
    }

    const setNow = () => {
        const now = new Date()
        setTimestamp(String(now.getTime()))
        setDate(now.toLocaleString())
    }

    return (
        <div className="space-y-6">

            {/* Timestamp → Date */}
            <div className="grid grid-cols-2 gap-4">
                <input
                    className="p-3 border rounded-lg"
                    placeholder="Timestamp (ms)"
                    value={timestamp}
                    onChange={e => setTimestamp(e.target.value)}
                />

                <input
                    className="p-3 border rounded-lg"
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            <div className="flex gap-4 justify-center">
                <button
                    onClick={convertFromTimestamp}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Timestamp → Date
                </button>

                <button
                    onClick={convertFromDate}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                    Date → Timestamp
                </button>

                <button
                    onClick={setNow}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                    Now
                </button>
            </div>

            {error && (
                <p className="text-center text-red-500">{error}</p>
            )}
        </div>
    )
}