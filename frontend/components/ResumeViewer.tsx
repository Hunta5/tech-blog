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

                <a
                    href={current.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('resume.openNewTab')}
                </a>
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
