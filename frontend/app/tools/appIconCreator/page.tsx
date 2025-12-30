'use client'

import {generateIOSAppIconZip} from "@/lib/icon-generator"

export default function IconGeneratorPage() {
    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            await generateIOSAppIconZip(file)
        } catch (err: any) {
            alert(err.message || "Failed to generate icons")
        }
    }

    return (
        <div className="min-h-screen bg-black-50 flex items-center justify-center">
            <div className="max-w-5xl mx-auto px-6 py-16">

                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    iOS App Icon Generator
                </h1>


                <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileChange}
                    className="block w-full border p-3 rounded-lg"
                />

                <p className="text-sm text-gray-500">
                    Upload a PNG/JPG image (minimum 1024×1024).
                    A ZIP containing AppIcon.appiconset will be downloaded.
                </p>
            </div>
        </div>
    )
}