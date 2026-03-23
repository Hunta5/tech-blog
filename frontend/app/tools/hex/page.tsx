import HexDecimalClient from "@/app/tools/hex/HexDecimalClient"

export default function HexDecimalPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Hex / Decimal Converter
            </h1>
            <p className="text-gray-400 mb-10">Convert between hexadecimal and decimal number systems.</p>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                <HexDecimalClient />
            </div>
        </div>
    )
}
