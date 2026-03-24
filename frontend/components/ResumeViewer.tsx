'use client'

import { useState, useCallback, useRef } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const resumeLanguages = [
    { key: 'ko', label: '한국어', file: '/resume/resume_ko.html' },
    { key: 'zh', label: '中文', file: '/resume/resume_zh.html' },
] as const

export default function ResumeViewer() {
    const { t } = useLanguage()
    const [lang, setLang] = useState<string>('ko')
    const [iframeHeight, setIframeHeight] = useState(1200)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const current = resumeLanguages.find((l) => l.key === lang)!

    const handleLoad = useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document
            if (doc) {
                const height = doc.documentElement.scrollHeight || doc.body.scrollHeight
                setIframeHeight(height)
            }
        } catch {
            // cross-origin fallback
        }
    }, [])

    const handleDownloadPdf = useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const iframeWindow = iframe.contentWindow
            if (iframeWindow) {
                iframeWindow.print()
            }
        } catch {
            // fallback: open in new tab for manual print
            window.open(current.file, '_blank')
        }
    }, [current.file])

    return (
        <div>
            {/* 语言切换 */}
            <div className="flex items-center gap-3 mb-6">
                {resumeLanguages.map((l) => (
                    <button
                        key={l.key}
                        onClick={() => setLang(l.key)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${lang === l.key
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50'
                            }
                        `}
                    >
                        {l.label}
                    </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('resume.downloadPdf')}
                    </button>
                    <a
                        href={current.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {t('resume.openNewTab')}
                    </a>
                </div>
            </div>

            {/* iframe 嵌入简历 */}
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-white">
                <iframe
                    ref={iframeRef}
                    key={lang}
                    src={current.file}
                    className="w-full border-0"
                    style={{ height: `${iframeHeight}px` }}
                    scrolling="no"
                    onLoad={handleLoad}
                    title={`Resume - ${current.label}`}
                />
            </div>
        </div>
    )
}
