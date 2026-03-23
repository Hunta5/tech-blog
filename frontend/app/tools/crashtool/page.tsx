export default function CrashPage() {
    const tools = [
        {
            name: 'SYM',
            url: 'https://github.com/zqqf16/SYM',
            desc: 'A crash log symbolicate Mac app with GUI. Supports .crash, .ips files and dSYM based symbolication.',
            stars: '600+',
        },
        {
            name: 'MacSymbolicator',
            url: 'https://github.com/inket/MacSymbolicator',
            desc: 'A simple Mac app for symbolicating macOS/iOS crash reports. Drag & drop crash file + dSYM.',
            stars: '300+',
        },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Crash Symbolication
            </h1>
            <p className="text-gray-400 mb-10">
                macOS tools for symbolicating iOS/macOS crash reports with dSYM files.
            </p>

            <div className="space-y-4">
                {tools.map((tool) => (
                    <a
                        key={tool.name}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{tool.name}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">{tool.stars} stars</span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{tool.desc}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </a>
                ))}
            </div>

            {/* CLI reference */}
            <div className="mt-10 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Command Line Reference</h3>
                <div className="space-y-3">
                    <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                        <span className="text-gray-500">$</span> atos -arch arm64 -o MyApp.app.dSYM/Contents/Resources/DWARF/MyApp -l 0x100000000 0x100abc123
                    </div>
                    <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                        <span className="text-gray-500">$</span> symbolicatecrash MyApp.crash MyApp.app.dSYM &gt; symbolicated.crash
                    </div>
                </div>
            </div>
        </div>
    )
}
