'use client'

import { useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LearningPage() {
    const { lang } = useLanguage()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [iframeHeight, setIframeHeight] = useState(2000)

    const src = lang === 'ko' ? '/ai-learning-roadmap-ko.html' : '/ai-learning-roadmap.html'

    const handleLoad = useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document
            if (doc) {
                const height = doc.documentElement.scrollHeight || doc.body.scrollHeight
                setIframeHeight(height)
            }
        } catch {}
    }, [])

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                <iframe
                    ref={iframeRef}
                    key={lang}
                    src={src}
                    className="w-full border-0"
                    style={{ height: `${iframeHeight}px` }}
                    scrolling="no"
                    onLoad={handleLoad}
                    title="AI Learning Roadmap"
                />
            </div>
        </div>
    )
}
