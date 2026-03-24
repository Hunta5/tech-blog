'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- conversion helpers ----

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }

function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex: string): [number, number, number] | null {
    const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    if (!m) {
        const s = hex.replace('#', '').match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i)
        if (!s) return null
        return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)]
    }
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) return [0, 0, Math.round(l * 100)]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360; s /= 100; l /= 100
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    return [
        Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        Math.round(hue2rgb(p, q, h) * 255),
        Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    ]
}

function luminance(r: number, g: number, b: number) {
    const [rs, gs, bs] = [r, g, b].map(v => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(l1: number, l2: number) {
    const lighter = Math.max(l1, l2), darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

// ---- component ----

export default function ColorClient() {
    const { t } = useLanguage()
    const [r, setR] = useState(59)
    const [g, setG] = useState(130)
    const [b, setB] = useState(246)

    const [hexInput, setHexInput] = useState('#3b82f6')
    const [rgbInput, setRgbInput] = useState('59, 130, 246')
    const [hslInput, setHslInput] = useState('217, 91%, 60%')

    const [copied, setCopied] = useState('')
    const [history, setHistory] = useState<string[]>([])

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const spectrumRef = useRef<HTMLCanvasElement>(null)
    const [dragging, setDragging] = useState(false)
    const [spectrumDragging, setSpectrumDragging] = useState(false)

    const [hue, setHue] = useState(217)

    // sync all text inputs from r,g,b
    const syncFromRgb = useCallback((r: number, g: number, b: number) => {
        setR(r); setG(g); setB(b)
        setHexInput(rgbToHex(r, g, b))
        setRgbInput(`${r}, ${g}, ${b}`)
        const [h, s, l] = rgbToHsl(r, g, b)
        setHslInput(`${h}, ${s}%, ${l}%`)
        setHue(h)
    }, [])

    // draw gradient canvas
    const drawPicker = useCallback((hue: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const w = canvas.width, h = canvas.height

        // white-to-hue horizontal gradient
        const hGrad = ctx.createLinearGradient(0, 0, w, 0)
        hGrad.addColorStop(0, '#ffffff')
        const [hr, hg, hb] = hslToRgb(hue, 100, 50)
        hGrad.addColorStop(1, `rgb(${hr},${hg},${hb})`)
        ctx.fillStyle = hGrad
        ctx.fillRect(0, 0, w, h)

        // black overlay vertical gradient
        const vGrad = ctx.createLinearGradient(0, 0, 0, h)
        vGrad.addColorStop(0, 'rgba(0,0,0,0)')
        vGrad.addColorStop(1, '#000000')
        ctx.fillStyle = vGrad
        ctx.fillRect(0, 0, w, h)
    }, [])

    // draw hue spectrum bar
    const drawSpectrum = useCallback(() => {
        const canvas = spectrumRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const w = canvas.width, h = canvas.height
        const grad = ctx.createLinearGradient(0, 0, w, 0)
        for (let i = 0; i <= 360; i += 30) {
            const [sr, sg, sb] = hslToRgb(i, 100, 50)
            grad.addColorStop(i / 360, `rgb(${sr},${sg},${sb})`)
        }
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
    }, [])

    useEffect(() => { drawPicker(hue) }, [hue, drawPicker])
    useEffect(() => { drawSpectrum() }, [drawSpectrum])

    const pickColorFromCanvas = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = clamp(e.clientX - rect.left, 0, rect.width)
        const y = clamp(e.clientY - rect.top, 0, rect.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const px = ctx.getImageData(x * (canvas.width / rect.width), y * (canvas.height / rect.height), 1, 1).data
        syncFromRgb(px[0], px[1], px[2])
    }, [syncFromRgb])

    const pickHueFromSpectrum = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = spectrumRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = clamp(e.clientX - rect.left, 0, rect.width)
        const newHue = Math.round((x / rect.width) * 360)
        setHue(newHue)
        const [nr, ng, nb] = hslToRgb(newHue, 100, 50)
        syncFromRgb(nr, ng, nb)
    }, [syncFromRgb])

    const handleHexChange = (val: string) => {
        setHexInput(val)
        const rgb = hexToRgb(val)
        if (rgb) syncFromRgb(...rgb)
    }

    const handleRgbChange = (val: string) => {
        setRgbInput(val)
        const parts = val.split(',').map(s => parseInt(s.trim()))
        if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
            syncFromRgb(parts[0], parts[1], parts[2])
        }
    }

    const handleHslChange = (val: string) => {
        setHslInput(val)
        const m = val.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/)
        if (m) {
            const [h, s, l] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])]
            if (h <= 360 && s <= 100 && l <= 100) {
                const [nr, ng, nb] = hslToRgb(h, s, l)
                syncFromRgb(nr, ng, nb)
            }
        }
    }

    const handleSlider = (channel: 'r' | 'g' | 'b', val: number) => {
        const nr = channel === 'r' ? val : r
        const ng = channel === 'g' ? val : g
        const nb = channel === 'b' ? val : b
        syncFromRgb(nr, ng, nb)
    }

    const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rgb = hexToRgb(e.target.value)
        if (rgb) syncFromRgb(...rgb)
    }

    const handleCopy = (label: string, text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(''), 1500)
    }

    const addToHistory = () => {
        const hex = rgbToHex(r, g, b)
        setHistory(prev => {
            const next = [hex, ...prev.filter(h => h !== hex)]
            return next.slice(0, 18)
        })
    }

    const hex = rgbToHex(r, g, b)
    const [h, s, l] = rgbToHsl(r, g, b)
    const lum = luminance(r, g, b)
    const contrastWhite = contrastRatio(lum, 1).toFixed(2)
    const contrastBlack = contrastRatio(lum, 0).toFixed(2)
    const textColor = lum > 0.179 ? '#000000' : '#ffffff'

    const formats = [
        { label: 'HEX', value: hex },
        { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
        { label: 'HSL', value: `hsl(${h}, ${s}%, ${l}%)` },
        { label: 'CSS Custom', value: `--color: ${hex};` },
        { label: 'Swift', value: `UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: 1.0)` },
        { label: 'SwiftUI', value: `Color(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)})` },
    ]

    return (
        <div className="space-y-8">
            {/* Color Picker Area */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                {/* Canvas Picker */}
                <div className="space-y-3">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={260}
                        className="w-full rounded-xl cursor-crosshair border border-gray-700"
                        onMouseDown={(e) => { setDragging(true); pickColorFromCanvas(e) }}
                        onMouseMove={(e) => dragging && pickColorFromCanvas(e)}
                        onMouseUp={() => { setDragging(false); addToHistory() }}
                        onMouseLeave={() => setDragging(false)}
                    />
                    {/* Hue Spectrum Bar */}
                    <canvas
                        ref={spectrumRef}
                        width={400}
                        height={20}
                        className="w-full h-6 rounded-lg cursor-pointer border border-gray-700"
                        onMouseDown={(e) => { setSpectrumDragging(true); pickHueFromSpectrum(e) }}
                        onMouseMove={(e) => spectrumDragging && pickHueFromSpectrum(e)}
                        onMouseUp={() => setSpectrumDragging(false)}
                        onMouseLeave={() => setSpectrumDragging(false)}
                    />
                </div>

                {/* Preview + Native Picker */}
                <div className="flex flex-col items-center gap-4 min-w-[160px]">
                    <div
                        className="w-36 h-36 rounded-2xl border-2 border-gray-600 shadow-lg flex items-center justify-center text-xs font-mono font-bold"
                        style={{ backgroundColor: hex, color: textColor }}
                    >
                        {hex}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 text-sm cursor-pointer hover:text-white hover:bg-gray-700/50 transition">
                        <input type="color" value={hex} onChange={handleNativePickerChange} className="w-0 h-0 opacity-0 absolute" />
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        {t('color.systemPicker')}
                    </label>
                    {/* Contrast Info */}
                    <div className="text-xs text-gray-500 space-y-1 text-center">
                        <div>vs White: <span className={parseFloat(contrastWhite) >= 4.5 ? 'text-green-400' : 'text-orange-400'}>{contrastWhite}:1</span></div>
                        <div>vs Black: <span className={parseFloat(contrastBlack) >= 4.5 ? 'text-green-400' : 'text-orange-400'}>{contrastBlack}:1</span></div>
                        <div className="text-gray-600">WCAG AA ≥ 4.5</div>
                    </div>
                </div>
            </div>

            {/* RGB Sliders */}
            <div className="space-y-3">
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('color.rgbSliders')}</label>
                {[
                    { label: 'R', val: r, ch: 'r' as const, color: 'red' },
                    { label: 'G', val: g, ch: 'g' as const, color: 'green' },
                    { label: 'B', val: b, ch: 'b' as const, color: 'blue' },
                ].map(({ label, val, ch, color }) => (
                    <div key={ch} className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold w-4 text-${color}-400`}>{label}</span>
                        <input
                            type="range" min={0} max={255} value={val}
                            onChange={(e) => handleSlider(ch, parseInt(e.target.value))}
                            className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-${color}-500`}
                            style={{
                                background: `linear-gradient(to right, ${
                                    color === 'red' ? `rgb(0,${g},${b}), rgb(255,${g},${b})`
                                    : color === 'green' ? `rgb(${r},0,${b}), rgb(${r},255,${b})`
                                    : `rgb(${r},${g},0), rgb(${r},${g},255)`
                                })`,
                            }}
                        />
                        <span className="text-xs font-mono text-gray-400 w-8 text-right">{val}</span>
                    </div>
                ))}
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">HEX</label>
                    <input
                        type="text"
                        value={hexInput}
                        onChange={(e) => handleHexChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="#3b82f6"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">RGB</label>
                    <input
                        type="text"
                        value={rgbInput}
                        onChange={(e) => handleRgbChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="59, 130, 246"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">HSL</label>
                    <input
                        type="text"
                        value={hslInput}
                        onChange={(e) => handleHslChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="217, 91%, 60%"
                    />
                </div>
            </div>

            {/* Copy Formats */}
            <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">{t('color.copyAs')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formats.map(({ label, value }) => (
                        <button
                            key={label}
                            onClick={() => handleCopy(label, value)}
                            className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition group text-left"
                        >
                            <div className="min-w-0">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
                                <div className="text-xs font-mono text-gray-300 truncate">{value}</div>
                            </div>
                            <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition ml-3 whitespace-nowrap">
                                {copied === label ? t('tool.copied') : t('tool.copy')}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Harmony */}
            <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">{t('color.harmony')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: t('color.complementary'), offset: [180] },
                        { label: t('color.triadic'), offset: [120, 240] },
                        { label: t('color.analogous'), offset: [30, 330] },
                        { label: t('color.splitComp'), offset: [150, 210] },
                    ].map(({ label, offset }) => (
                        <div key={label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{label}</div>
                            <div className="flex gap-1.5">
                                <div
                                    className="w-8 h-8 rounded-lg border border-gray-600 cursor-pointer"
                                    style={{ backgroundColor: hex }}
                                    title={hex}
                                    onClick={() => handleCopy(label + '-base', hex)}
                                />
                                {offset.map((off) => {
                                    const nh = (h + off) % 360
                                    const [cr, cg, cb] = hslToRgb(nh, s, l)
                                    const chex = rgbToHex(cr, cg, cb)
                                    return (
                                        <div
                                            key={off}
                                            className="w-8 h-8 rounded-lg border border-gray-600 cursor-pointer"
                                            style={{ backgroundColor: chex }}
                                            title={chex}
                                            onClick={() => { handleCopy(label + off, chex); syncFromRgb(cr, cg, cb) }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('color.history')}</label>
                        <button
                            onClick={() => setHistory([])}
                            className="text-xs text-gray-600 hover:text-gray-400 transition"
                        >
                            {t('tool.clear')}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {history.map((c) => (
                            <button
                                key={c}
                                onClick={() => { const rgb = hexToRgb(c); if (rgb) syncFromRgb(...rgb) }}
                                className="w-9 h-9 rounded-lg border border-gray-600 hover:border-gray-400 transition hover:scale-110"
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
