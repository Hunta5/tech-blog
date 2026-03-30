'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'

export default function Phase2Page() {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [iframeHeight, setIframeHeight] = useState(3000)

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
            <nav className="mb-6">
                <Link href="/learning" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    학습 목표로 돌아가기
                </Link>
            </nav>
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                <iframe
                    ref={iframeRef}
                    src="/phase2-data-processing-guide.html"
                    className="w-full border-0"
                    style={{ height: `${iframeHeight}px` }}
                    scrolling="no"
                    onLoad={handleLoad}
                    title="Phase 2 - Data Processing"
                />
            </div>
        </div>
    )
}
