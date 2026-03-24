import JsonDiffClient from './JsonDiffClient'

export default function JsonDiffPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                JSON Diff
            </h1>
            <p className="text-gray-400 mb-10">Compare two JSON objects and visualize their differences side by side.</p>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                <JsonDiffClient />
            </div>
        </div>
    )
}
