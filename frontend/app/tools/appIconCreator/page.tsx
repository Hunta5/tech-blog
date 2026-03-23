'use client'

import { useState } from 'react'
import { generateIOSAppIconZip } from "@/lib/icon-generator"

export default function IconGeneratorPage() {
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState('')

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)
        try {
            await generateIOSAppIconZip(file)
        } catch (err: any) {
            alert(err.message || "Failed to generate icons")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                iOS App Icon Generator
            </h1>
            <p className="text-gray-400 mb-10">
                Upload a PNG/JPG image (min 1024x1024). Downloads a ZIP containing AppIcon.appiconset.
            </p>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 md:p-10">
                {/* Drop zone */}
                <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500/50 bg-gray-900/50 cursor-pointer transition-colors">
                    <div className="flex flex-col items-center gap-3">
                        {loading ? (
                            <span className="w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                {fileName ? fileName : 'Click to select an image'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">PNG or JPG, 1024x1024 minimum</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {/* Size reference */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['180x180', '120x120', '87x87', '60x60', '40x40', '29x29', '20x20', '1024x1024'].map((size) => (
                        <div key={size} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 rounded-lg px-3 py-2">
                            <div className="w-2 h-2 rounded-sm bg-blue-500/40"></div>
                            {size}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
