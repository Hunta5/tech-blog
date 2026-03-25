'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// Dynamically import react-pdf (no SSR)
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false })
const PageComponent = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false })

export default function PdfClient() {
    const { t } = useLanguage()

    const [file, setFile] = useState<File | null>(null)
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [numPages, setNumPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [scale, setScale] = useState(1.2)
    const [error, setError] = useState('')
    const [dragging, setDragging] = useState(false)
    const [showThumbnails, setShowThumbnails] = useState(false)
    const [pageInput, setPageInput] = useState('')
    const [ready, setReady] = useState(false)

    const fileRef = useRef<HTMLInputElement>(null)

    // Setup pdf.js worker on client
    useEffect(() => {
        import('react-pdf').then(mod => {
            mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`
            setReady(true)
        })
    }, [])

    const handleFile = useCallback((f: File) => {
        if (f.type !== 'application/pdf') {
            setError(t('pdf.invalidFile'))
            return
        }
        setError('')
        setFile(f)
        setFileUrl(URL.createObjectURL(f))
        setCurrentPage(1)
        setNumPages(0)
        setShowThumbnails(false)
    }, [t])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) handleFile(f)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
        setNumPages(n)
    }

    const goToPage = useCallback((page: number) => {
        setCurrentPage(p => Math.max(1, Math.min(numPages || 999, page)))
    }, [numPages])

    const handlePageJump = () => {
        const p = parseInt(pageInput)
        if (!isNaN(p)) goToPage(p)
        setPageInput('')
    }

    // Keyboard navigation
    useEffect(() => {
        if (!fileUrl) return
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if (e.key === 'ArrowLeft') goToPage(currentPage - 1)
            else if (e.key === 'ArrowRight') goToPage(currentPage + 1)
            else if (e.key === '=' || e.key === '+') setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))
            else if (e.key === '-') setScale(s => Math.max(0.4, +(s - 0.2).toFixed(1)))
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [fileUrl, currentPage, goToPage])

    const zoomIn = () => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))
    const zoomOut = () => setScale(s => Math.max(0.4, +(s - 0.2).toFixed(1)))
    const zoomReset = () => setScale(1.2)

    const handleClear = () => {
        if (fileUrl) URL.revokeObjectURL(fileUrl)
        setFile(null)
        setFileUrl(null)
        setNumPages(0)
        setCurrentPage(1)
        setError('')
        setShowThumbnails(false)
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    if (!ready) return <div className="text-gray-500 text-center py-20">{t('pdf.loading')}</div>

    return (
        <div className="space-y-4">
            {/* Privacy note */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t('pdf.privacy')}
            </div>

            {/* Drop zone */}
            {!fileUrl && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                        dragging
                            ? 'border-rose-500 bg-rose-500/10'
                            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
                    }`}
                >
                    <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">{t('pdf.dropzone')}</p>
                    <p className="text-gray-600 text-xs mt-1">{t('pdf.supported')}</p>
                </div>
            )}

            {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
            )}

            {/* PDF Viewer */}
            {fileUrl && (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-gray-300 truncate max-w-[150px]">{file?.name}</span>
                            <span className="text-[10px] text-gray-600">{file ? formatSize(file.size) : ''}</span>
                        </div>

                        <div className="w-px h-6 bg-gray-700 hidden sm:block" />

                        {/* Page nav */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => goToPage(1)} disabled={currentPage <= 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <input type="text" value={pageInput || currentPage}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePageJump()}
                                    onBlur={handlePageJump}
                                    className="w-10 text-center px-1 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200 text-xs focus:outline-none focus:border-rose-500" />
                                <span>/ {numPages}</span>
                            </div>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= numPages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <button onClick={() => goToPage(numPages)} disabled={currentPage >= numPages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-700 hidden sm:block" />

                        {/* Zoom */}
                        <div className="flex items-center gap-1">
                            <button onClick={zoomOut} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <button onClick={zoomReset} className="px-2 py-1 text-xs text-gray-400 hover:text-white transition font-mono">{Math.round(scale * 100)}%</button>
                            <button onClick={zoomIn} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-700 hidden sm:block" />

                        <button onClick={() => setShowThumbnails(!showThumbnails)}
                            className={`p-1.5 rounded-lg transition ${showThumbnails ? 'text-rose-400 bg-rose-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            title={t('pdf.thumbnails')}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>

                        <div className="ml-auto flex items-center gap-1">
                            <button onClick={() => fileRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-gray-800 border border-gray-700 transition">
                                {t('pdf.changeFile')}
                            </button>
                            <button onClick={handleClear} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-700 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
                    </div>

                    {/* Main area */}
                    <div className="flex gap-4">
                        {/* Thumbnails */}
                        {showThumbnails && numPages > 0 && (
                            <div className="w-28 shrink-0 bg-gray-800/30 border border-gray-700/50 rounded-xl p-2 overflow-y-auto space-y-2" style={{ maxHeight: '700px' }}>
                                {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
                                    <button key={pageNum} onClick={() => goToPage(pageNum)}
                                        className={`w-full rounded-lg overflow-hidden border-2 transition ${pageNum === currentPage ? 'border-rose-500' : 'border-transparent hover:border-gray-600'}`}>
                                        <Document file={fileUrl} loading="">
                                            <PageComponent pageNumber={pageNum} width={88} renderTextLayer={false} renderAnnotationLayer={false} />
                                        </Document>
                                        <div className={`text-[10px] text-center py-0.5 ${pageNum === currentPage ? 'text-rose-400' : 'text-gray-500'}`}>{pageNum}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Page */}
                        <div className="flex-1 bg-gray-800/20 border border-gray-700/50 rounded-xl overflow-auto flex justify-center p-4" style={{ maxHeight: '700px' }}>
                            <Document
                                file={fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={() => setError(t('pdf.loadError'))}
                                loading={
                                    <div className="flex items-center gap-2 text-gray-500 py-20">
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {t('pdf.loading')}
                                    </div>
                                }
                            >
                                <PageComponent pageNumber={currentPage} scale={scale} renderTextLayer={true} renderAnnotationLayer={true} className="shadow-2xl" />
                            </Document>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-gray-600">{t('pdf.shortcuts')}</div>
                </>
            )}
        </div>
    )
}
