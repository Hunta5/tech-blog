import ColorClient from './ColorClient'

export default function ColorPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 bg-clip-text text-transparent">
                Color Tool
            </h1>
            <p className="text-gray-400 mb-10">Pick colors, convert between HEX / RGB / HSL, and copy values for your code.</p>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                <ColorClient />
            </div>
        </div>
    )
}
