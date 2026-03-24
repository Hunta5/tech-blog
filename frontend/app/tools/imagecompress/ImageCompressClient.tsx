'use client'

import { useState, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- types ----

type OutputFormat = 'original' | 'jpeg' | 'png' | 'webp'

interface ImageItem {
    id: string
    file: File
    originalSize: number
    originalUrl: string
    originalWidth: number
    originalHeight: number
    compressedBlob: Blob | null
    compressedUrl: string | null
    compressedSize: number
    compressedWidth: number
    compressedHeight: number
    status: 'pending' | 'compressing' | 'done' | 'error'
    error?: string
    savings: number // percentage
}

interface CompressOptions {
    quality: number         // 0-100
    maxWidth: number        // 0 = no limit
    maxHeight: number       // 0 = no limit
    outputFormat: OutputFormat
}

// ---- compress engine ----

function getMimeType(format: OutputFormat, originalType: string): string {
    switch (format) {
        case 'jpeg': return 'image/jpeg'
        case 'png': return 'image/png'
        case 'webp': return 'image/webp'
        default: {
            if (originalType === 'image/png') return 'image/png'
            if (originalType === 'image/webp') return 'image/webp'
            return 'image/jpeg'
        }
    }
}

function getExtension(mime: string): string {
    if (mime === 'image/png') return '.png'
    if (mime === 'image/webp') return '.webp'
    return '.jpg'
}

async function compressImage(file: File, opts: CompressOptions): Promise<{ blob: Blob; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            let { width, height } = img

            // resize if needed
            if (opts.maxWidth > 0 && width > opts.maxWidth) {
                height = Math.round(height * (opts.maxWidth / width))
                width = opts.maxWidth
            }
            if (opts.maxHeight > 0 && height > opts.maxHeight) {
                width = Math.round(width * (opts.maxHeight / height))
                height = opts.maxHeight
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')!

            // for JPEG — fill white background (transparent → white)
            const mime = getMimeType(opts.outputFormat, file.type)
            if (mime === 'image/jpeg') {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, width, height)
            }

            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error('Compression failed'))
                    resolve({ blob, width, height })
                },
                mime,
                opts.quality / 100
            )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = URL.createObjectURL(file)
    })
}

// ---- helpers ----

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

let _id = 0

// ---- component ----

export default function ImageCompressClient() {
    const { t } = useLanguage()
    const [images, setImages] = useState<ImageItem[]>([])
    const [options, setOptions] = useState<CompressOptions>({
        quality: 80,
        maxWidth: 0,
        maxHeight: 0,
        outputFormat: 'original',
    })
    const [dragging, setDragging] = useState(false)
    const [compressing, setCompressing] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    // ---- add files ----
    const addFiles = useCallback((files: FileList | File[]) => {
        const newItems: ImageItem[] = []
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue
            const url = URL.createObjectURL(file)
            newItems.push({
                id: `img-${_id++}`,
                file,
                originalSize: file.size,
                originalUrl: url,
                originalWidth: 0,
                originalHeight: 0,
                compressedBlob: null,
                compressedUrl: null,
                compressedSize: 0,
                compressedWidth: 0,
                compressedHeight: 0,
                status: 'pending',
                savings: 0,
            })
        }

        // load dimensions
        for (const item of newItems) {
            const img = new Image()
            img.onload = () => {
                setImages(prev => prev.map(p =>
                    p.id === item.id ? { ...p, originalWidth: img.naturalWidth, originalHeight: img.naturalHeight } : p
                ))
            }
            img.src = item.originalUrl
        }

        setImages(prev => [...prev, ...newItems])
    }, [])

    // ---- compress all ----
    const handleCompressAll = async () => {
        setCompressing(true)
        const pending = images.filter(i => i.status === 'pending' || i.status === 'error')

        for (const item of pending) {
            setImages(prev => prev.map(p => p.id === item.id ? { ...p, status: 'compressing' } : p))
            try {
                const { blob, width, height } = await compressImage(item.file, options)
                const url = URL.createObjectURL(blob)
                const savings = item.originalSize > 0 ? Math.round((1 - blob.size / item.originalSize) * 100) : 0

                setImages(prev => prev.map(p =>
                    p.id === item.id ? {
                        ...p,
                        status: 'done',
                        compressedBlob: blob,
                        compressedUrl: url,
                        compressedSize: blob.size,
                        compressedWidth: width,
                        compressedHeight: height,
                        savings,
                    } : p
                ))
            } catch (e: any) {
                setImages(prev => prev.map(p =>
                    p.id === item.id ? { ...p, status: 'error', error: e.message } : p
                ))
            }
        }
        setCompressing(false)
    }

    // ---- download ----
    const handleDownload = (item: ImageItem) => {
        if (!item.compressedBlob || !item.compressedUrl) return
        const mime = getMimeType(options.outputFormat, item.file.type)
        const ext = getExtension(mime)
        const baseName = item.file.name.replace(/\.[^.]+$/, '')
        const a = document.createElement('a')
        a.href = item.compressedUrl
        a.download = `${baseName}_compressed${ext}`
        a.click()
    }

    const handleDownloadAll = () => {
        images.filter(i => i.status === 'done').forEach(handleDownload)
    }

    // ---- remove ----
    const handleRemove = (id: string) => {
        setImages(prev => {
            const item = prev.find(p => p.id === id)
            if (item) {
                URL.revokeObjectURL(item.originalUrl)
                if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
            }
            return prev.filter(p => p.id !== id)
        })
    }

    const handleClear = () => {
        for (const item of images) {
            URL.revokeObjectURL(item.originalUrl)
            if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
        }
        setImages([])
    }

    // ---- drag & drop ----
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files)
        }
    }

    // ---- stats ----
    const doneItems = images.filter(i => i.status === 'done')
    const totalOriginal = doneItems.reduce((s, i) => s + i.originalSize, 0)
    const totalCompressed = doneItems.reduce((s, i) => s + i.compressedSize, 0)
    const totalSavings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0

    return (
        <div className="space-y-6">
            {/* Privacy note */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t('imgc.privacyNote')}
            </div>

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    dragging
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
                }`}
            >
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} className="hidden" />
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-sm">{t('imgc.dropzone')}</p>
                <p className="text-gray-600 text-xs mt-1">{t('imgc.supported')}</p>
            </div>

            {/* Options */}
            {images.length > 0 && (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('imgc.settings')}</div>

                    {/* Quality slider */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-400">{t('imgc.quality')}</label>
                            <span className="text-sm font-mono font-bold text-emerald-400">{options.quality}%</span>
                        </div>
                        <input
                            type="range" min={1} max={100} value={options.quality}
                            onChange={(e) => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600">
                            <span>{t('imgc.smallest')}</span>
                            <span>{t('imgc.bestQuality')}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-4">
                        {/* Output format */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('imgc.outputFormat')}</label>
                            <select value={options.outputFormat}
                                onChange={(e) => setOptions(prev => ({ ...prev, outputFormat: e.target.value as OutputFormat }))}
                                className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-xs focus:outline-none">
                                <option value="original">{t('imgc.original')}</option>
                                <option value="jpeg">JPEG</option>
                                <option value="png">PNG</option>
                                <option value="webp">WebP</option>
                            </select>
                        </div>

                        {/* Max width */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('imgc.maxWidth')}</label>
                            <input type="number" value={options.maxWidth || ''} min={0}
                                onChange={(e) => setOptions(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 0 }))}
                                placeholder={t('tool.noLimit')}
                                className="w-28 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>

                        {/* Max height */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('imgc.maxHeight')}</label>
                            <input type="number" value={options.maxHeight || ''} min={0}
                                onChange={(e) => setOptions(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 0 }))}
                                placeholder={t('tool.noLimit')}
                                className="w-28 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>

                        {/* Preset buttons */}
                        <div className="flex gap-1.5">
                            {[
                                { label: t('imgc.low'), q: 40 },
                                { label: t('imgc.medium'), q: 65 },
                                { label: t('imgc.high'), q: 80 },
                                { label: t('imgc.best'), q: 95 },
                            ].map(({ label, q }) => (
                                <button key={q}
                                    onClick={() => setOptions(prev => ({ ...prev, quality: q }))}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                        options.quality === q
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-gray-800/50 text-gray-500 border border-gray-700 hover:text-gray-300'
                                    }`}>{label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleCompressAll} disabled={compressing || images.every(i => i.status === 'done')}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50">
                        {compressing ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {t('imgc.compressing')}
                            </span>
                        ) : t('imgc.compressAll')}
                    </button>
                    {doneItems.length > 1 && (
                        <button onClick={handleDownloadAll}
                            className="px-5 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition">
                            {t('imgc.downloadAll')} ({doneItems.length})
                        </button>
                    )}
                    <button onClick={handleClear}
                        className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition ml-auto">
                        {t('imgc.clearAll')}
                    </button>
                </div>
            )}

            {/* Total stats */}
            {doneItems.length > 0 && (
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="text-xs text-gray-500">
                        {t('imgc.totalLabel')} <span className="text-gray-300 font-mono">{formatSize(totalOriginal)}</span>
                        <span className="mx-2 text-gray-600">→</span>
                        <span className="text-emerald-400 font-mono">{formatSize(totalCompressed)}</span>
                    </div>
                    <SavingsBadge savings={totalSavings} />
                    <div className="text-xs text-gray-500 ml-auto">
                        {doneItems.length} {t('imgc.imagesCompressed')}
                    </div>
                </div>
            )}

            {/* Image list */}
            {images.length > 0 && (
                <div className="space-y-3">
                    {images.map(item => (
                        <ImageRow key={item.id} item={item} onDownload={handleDownload} onRemove={handleRemove} outputFormat={options.outputFormat} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ---- Image Row ----

function ImageRow({ item, onDownload, onRemove, outputFormat }: {
    item: ImageItem
    onDownload: (item: ImageItem) => void
    onRemove: (id: string) => void
    outputFormat: OutputFormat
}) {
    const { t } = useLanguage()
    const [preview, setPreview] = useState<'original' | 'compressed'>('original')

    return (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Thumbnail + comparison */}
                <div className="relative w-full md:w-48 h-40 bg-checkered shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.status === 'done' && preview === 'compressed' && item.compressedUrl ? item.compressedUrl : item.originalUrl}
                        alt={item.file.name}
                        className="w-full h-full object-contain"
                    />
                    {item.status === 'done' && item.compressedUrl && (
                        <div className="absolute bottom-1.5 left-1.5 flex rounded-md overflow-hidden border border-gray-600 text-[10px]">
                            <button onClick={() => setPreview('original')}
                                className={`px-2 py-0.5 ${preview === 'original' ? 'bg-gray-700 text-white' : 'bg-gray-800/80 text-gray-400'}`}>
                                {t('imgc.before')}
                            </button>
                            <button onClick={() => setPreview('compressed')}
                                className={`px-2 py-0.5 ${preview === 'compressed' ? 'bg-emerald-600 text-white' : 'bg-gray-800/80 text-gray-400'}`}>
                                {t('imgc.after')}
                            </button>
                        </div>
                    )}
                    {item.status === 'done' && (
                        <div className="absolute top-1.5 right-1.5">
                            <SavingsBadge savings={item.savings} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-200 font-medium truncate">{item.file.name}</span>
                            <StatusBadge status={item.status} />
                        </div>

                        {/* Size comparison */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                            <div className="text-gray-500">
                                {t('imgc.originalLabel')} <span className="text-gray-300 font-mono">{formatSize(item.originalSize)}</span>
                                {item.originalWidth > 0 && (
                                    <span className="text-gray-600 ml-1.5">{item.originalWidth} x {item.originalHeight}</span>
                                )}
                            </div>
                            {item.status === 'done' && (
                                <div className="text-gray-500">
                                    {t('imgc.compressedLabel')} <span className="text-emerald-400 font-mono">{formatSize(item.compressedSize)}</span>
                                    {item.compressedWidth > 0 && item.compressedWidth !== item.originalWidth && (
                                        <span className="text-gray-600 ml-1.5">{item.compressedWidth} x {item.compressedHeight}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Compression bar */}
                        {item.status === 'done' && (
                            <div className="mt-2.5 flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            item.savings > 0 ? 'bg-emerald-500' : 'bg-orange-500'
                                        }`}
                                        style={{ width: `${Math.max(2, 100 - Math.abs(item.savings))}%` }}
                                    />
                                </div>
                                <span className={`text-xs font-mono ${item.savings > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {item.savings > 0 ? `-${item.savings}%` : `+${Math.abs(item.savings)}%`}
                                </span>
                            </div>
                        )}

                        {item.status === 'compressing' && (
                            <div className="mt-2.5">
                                <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                    <div className="h-full rounded-full bg-emerald-500 animate-progress" />
                                </div>
                            </div>
                        )}

                        {item.status === 'error' && (
                            <div className="text-xs text-red-400 mt-1">{item.error}</div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                        {item.status === 'done' && (
                            <button onClick={() => onDownload(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t('tool.download')}
                            </button>
                        )}
                        <button onClick={() => onRemove(item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition ml-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ---- Status Badge ----

function StatusBadge({ status }: { status: ImageItem['status'] }) {
    const { t } = useLanguage()
    switch (status) {
        case 'pending':
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500 border border-gray-500/20">{t('imgc.pending')}</span>
        case 'compressing':
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">{t('imgc.compressing')}</span>
        case 'done':
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('imgc.done')}</span>
        case 'error':
            return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{t('tool.error')}</span>
    }
}

// ---- Savings Badge ----

function SavingsBadge({ savings }: { savings: number }) {
    if (savings <= 0) return (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
            +{Math.abs(savings)}%
        </span>
    )
    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono border ${
            savings >= 50 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            savings >= 20 ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
            'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
        }`}>
            -{savings}%
        </span>
    )
}
