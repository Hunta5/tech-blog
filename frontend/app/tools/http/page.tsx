import HttpClient from './HttpClient'

export default function HttpPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                HTTP Client
            </h1>
            <p className="text-gray-400 mb-10">Lightweight HTTP / API debugging tool. Send requests, edit headers & body, generate curl.</p>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                <HttpClient />
            </div>
        </div>
    )
}
