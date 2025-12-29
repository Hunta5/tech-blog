'use client'

import {useState} from 'react'

export default function Base64Client() {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode')
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    const handleConvert = () => {
        try {
            if (mode === 'encode') {
                setOutput(btoa(unescape(encodeURIComponent(input))))
            } else {
                setOutput(decodeURIComponent(escape(atob(input))))
            }
        } catch {
            setOutput('Invalid Base64 string')
        }
    }

    const clear = () => {
        setInput('')
        setOutput('')
    }

    return (
        <>
            {/* Tabs */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setMode('encode')}
                    className={`px-6 py-2 rounded-l-lg ${
                        mode === 'encode'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Encode
                </button>

                <button
                    onClick={() => setMode('decode')}
                    className={`px-6 py-2 rounded-r-lg ${
                        mode === 'decode'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    Decode
                </button>
            </div>

            {/* Textareas */}
            <div className="grid grid-cols-2 gap-6">
        <textarea
            className="h-64 p-4 border rounded-lg focus:ring focus:ring-blue-200"
            placeholder="Input text..."
            value={input}
            onChange={e => setInput(e.target.value)}
        />

                <textarea
                    className="h-64 p-4 border rounded-lg bg-black-50"
                    placeholder="Result..."
                    value={output}
                    readOnly
                />
            </div>

            {/* Buttons */}
            <div className="flex justify-center mt-6 gap-4">
                <button
                    onClick={handleConvert}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                    {mode === 'encode' ? 'Encode →' : 'Decode →'}
                </button>

                <button
                    onClick={clear}
                    className="px-6 py-2 bg-gray-300 rounded-lg"
                >
                    Clear
                </button>
            </div>
        </>
    )
}