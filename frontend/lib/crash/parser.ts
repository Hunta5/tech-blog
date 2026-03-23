import type { CrashReport, CrashThread, CrashFrame, BinaryImage } from './types'

type ParseState = 'header' | 'exceptionInfo' | 'threadBacktrace' | 'binaryImages'

export function parseCrashLog(text: string): CrashReport {
    const lines = text.split('\n')
    let state: ParseState = 'header'

    let processName = 'Unknown'
    let bundleIdentifier: string | null = null
    let osVersion: string | null = null
    let deviceModel: string | null = null
    let exceptionType: string | null = null
    let exceptionCode: string | null = null
    const threads: CrashThread[] = []
    const binaryImages: BinaryImage[] = []
    let currentFrames: CrashFrame[] = []
    let currentThreadIndex = 0
    let currentThreadName: string | null = null
    let currentThreadCrashed = false

    const saveThread = () => {
        if (currentFrames.length > 0) {
            threads.push({
                threadIndex: currentThreadIndex,
                name: currentThreadName,
                crashed: currentThreadCrashed,
                frames: [...currentFrames],
            })
            currentFrames = []
        }
    }

    for (const line of lines) {
        const trimmed = line.trim()

        switch (state) {
            case 'header':
                if (trimmed.startsWith('Process:')) {
                    processName = extractValue(trimmed, 'Process:')
                } else if (trimmed.startsWith('Identifier:')) {
                    bundleIdentifier = extractValue(trimmed, 'Identifier:')
                } else if (trimmed.startsWith('OS Version:')) {
                    osVersion = extractValue(trimmed, 'OS Version:')
                } else if (trimmed.startsWith('Code Type:') || trimmed.startsWith('Hardware Model:')) {
                    deviceModel = extractValue(trimmed, trimmed.startsWith('Code Type:') ? 'Code Type:' : 'Hardware Model:')
                } else if (trimmed.startsWith('Exception Type:')) {
                    exceptionType = extractValue(trimmed, 'Exception Type:')
                    state = 'exceptionInfo'
                } else if (/^Thread \d+/.test(trimmed) && trimmed.endsWith(':')) {
                    const info = parseThreadHeader(trimmed)
                    currentThreadIndex = info.index
                    currentThreadName = info.name
                    currentThreadCrashed = info.crashed
                    currentFrames = []
                    state = 'threadBacktrace'
                }
                break

            case 'exceptionInfo':
                if (trimmed.startsWith('Exception Codes:') || trimmed.startsWith('Exception Subtype:')) {
                    const key = trimmed.split(':')[0] + ':'
                    exceptionCode = extractValue(trimmed, key)
                } else if (/^Thread \d+/.test(trimmed) && trimmed.endsWith(':')) {
                    const info = parseThreadHeader(trimmed)
                    currentThreadIndex = info.index
                    currentThreadName = info.name
                    currentThreadCrashed = info.crashed
                    currentFrames = []
                    state = 'threadBacktrace'
                }
                break

            case 'threadBacktrace':
                if (trimmed === '') {
                    saveThread()
                    state = 'header'
                } else if (/^Thread \d+/.test(trimmed) && trimmed.endsWith(':')) {
                    saveThread()
                    const info = parseThreadHeader(trimmed)
                    currentThreadIndex = info.index
                    currentThreadName = info.name
                    currentThreadCrashed = info.crashed
                    currentFrames = []
                } else if (trimmed.startsWith('Binary Images:')) {
                    saveThread()
                    state = 'binaryImages'
                } else {
                    const frame = parseFrame(trimmed)
                    if (frame) currentFrames.push(frame)
                }
                break

            case 'binaryImages': {
                const img = parseBinaryImage(trimmed)
                if (img) binaryImages.push(img)
                break
            }

            default:
                break
        }
    }

    saveThread()

    return {
        source: 'apple',
        processName,
        bundleIdentifier,
        osVersion,
        deviceModel,
        exceptionType,
        exceptionCode,
        threads,
        binaryImages,
    }
}

// KSCrash JSON parser
export function parseKSCrashJSON(text: string): CrashReport {
    const json = JSON.parse(text)
    const crash = json.crash || {}
    const system = json.system || {}
    const report = json.report || {}
    const error = crash.error || {}
    const rawThreads = crash.threads || []
    const rawImages = json.binary_images || []

    const threads: CrashThread[] = rawThreads.map((t: any) => {
        const contents = t.backtrace?.contents || []
        return {
            threadIndex: t.index ?? 0,
            name: t.name || t.dispatch_queue || null,
            crashed: t.crashed || t.current_thread || false,
            frames: contents.map((f: any, i: number) => {
                const instrAddr = f.instruction_addr
                const objAddr = f.object_addr
                // Extract just the file name from full path
                const rawName = f.object_name || 'unknown'
                const binaryName = rawName.split('/').pop() || rawName

                return {
                    frameIndex: i,
                    binaryName,
                    address: toHex64(instrAddr),
                    loadAddress: toHex64(objAddr),
                    offset: instrAddr != null && objAddr != null ? String(Number(BigInt(instrAddr) - BigInt(objAddr))) : null,
                    symbolicated: f.symbol_name || null,
                }
            }),
        }
    })

    const binaryImages: BinaryImage[] = rawImages.map((img: any) => ({
        name: img.name?.split('/').pop() || 'unknown',
        loadAddress: toHex64(img.image_addr),
        endAddress: img.image_size ? toHex64(img.image_addr + img.image_size) : null,
        uuid: img.uuid || null,
        path: img.name || null,
        arch: system.cpu_arch || null,
    }))

    let exceptionType: string | null = null
    if (error.mach) {
        exceptionType = `${error.mach.exception_name || 'EXC_UNKNOWN'} (${error.mach.code_name || ''})`
    } else if (error.signal) {
        exceptionType = error.signal.name || 'SIGNAL'
    } else if (error.nsexception) {
        exceptionType = error.nsexception.name || 'NSException'
    }

    return {
        source: 'kscrash',
        processName: system.process_name || report.process_name || 'Unknown',
        bundleIdentifier: system.CFBundleIdentifier || null,
        osVersion: system.system_version ? `${system.system_name || 'iOS'} ${system.system_version}` : null,
        deviceModel: system.machine || null,
        exceptionType,
        exceptionCode: error.reason || null,
        threads,
        binaryImages,
    }
}

// Auto-detect format and parse
export function parseAuto(text: string): CrashReport {
    const trimmed = text.trim()
    if (trimmed.startsWith('{')) {
        return parseKSCrashJSON(trimmed)
    }
    return parseCrashLog(trimmed)
}

// Format crash report to readable text
export function formatCrashReport(report: CrashReport): string {
    const lines: string[] = []
    lines.push(`Process:    ${report.processName}`)
    if (report.bundleIdentifier) lines.push(`Bundle ID:  ${report.bundleIdentifier}`)
    if (report.osVersion) lines.push(`OS Version: ${report.osVersion}`)
    if (report.deviceModel) lines.push(`Device:     ${report.deviceModel}`)
    if (report.exceptionType) lines.push(`Exception:  ${report.exceptionType}`)
    if (report.exceptionCode) lines.push(`Code:       ${report.exceptionCode}`)
    lines.push('')

    for (const thread of report.threads) {
        const crashed = thread.crashed ? ' (Crashed)' : ''
        const name = thread.name ? ` - ${thread.name}` : ''
        lines.push(`Thread ${thread.threadIndex}${name}${crashed}:`)
        for (const frame of thread.frames) {
            if (frame.symbolicated) {
                lines.push(`  ${frame.frameIndex}\t${frame.binaryName}\t${frame.symbolicated}`)
            } else {
                lines.push(`  ${frame.frameIndex}\t${frame.binaryName}\t${frame.address} (${frame.loadAddress} + ${frame.offset ?? '?'})`)
            }
        }
        lines.push('')
    }

    return lines.join('\n')
}

// --- helpers ---

function extractValue(line: string, key: string): string {
    return line.replace(key, '').trim()
}

function parseThreadHeader(line: string): { index: number; name: string | null; crashed: boolean } {
    const crashed = line.includes('Crashed')
    const idxMatch = line.match(/Thread (\d+)/)
    const index = idxMatch ? parseInt(idxMatch[1], 10) : 0
    const nameMatch = line.match(/name:\s*(.+?)(?:\s*Crashed)?:?$/)
    const name = nameMatch ? nameMatch[1] : null
    return { index, name, crashed }
}

function parseFrame(line: string): CrashFrame | null {
    // Unsymbolicated: "4  UIKitCore  0x1a2b3c4d5 0x1a2000000 + 11780309"
    const m = line.match(/^(\d+)\s+(\S+)\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)\s+\+\s+(\d+)/)
    if (m) {
        return {
            frameIndex: parseInt(m[1], 10),
            binaryName: m[2],
            address: m[3],
            loadAddress: m[4],
            offset: m[5],
            symbolicated: null,
        }
    }

    // Already symbolicated: "4  UIKitCore  0x1234 -[UIViewController viewDidLoad] + 42"
    const sm = line.match(/^(\d+)\s+(\S+)\s+(0x[0-9a-fA-F]+)\s+(.+)/)
    if (sm) {
        return {
            frameIndex: parseInt(sm[1], 10),
            binaryName: sm[2],
            address: sm[3],
            loadAddress: '0x0',
            offset: null,
            symbolicated: sm[4],
        }
    }

    return null
}

function parseBinaryImage(line: string): BinaryImage | null {
    const m = line.match(/(0x[0-9a-fA-F]+)\s+-\s+(0x[0-9a-fA-F]+)\s+(\S+)\s+(\S+)\s+<([^>]+)>\s+(.*)/)
    if (!m) return null
    return {
        name: m[3],
        loadAddress: m[1],
        endAddress: m[2],
        uuid: m[5],
        path: m[6],
        arch: m[4],
    }
}

/** Convert a number (possibly > 32-bit) to 0x hex string */
function toHex64(val: number | string | null | undefined): string {
    if (val == null) return '0x0'
    if (typeof val === 'string') {
        if (val.startsWith('0x')) return val
        const n = Number(val)
        if (Number.isNaN(n)) return '0x0'
        return '0x' + BigInt(val).toString(16)
    }
    // For numbers that fit in safe integer range, use BigInt for safety
    return '0x' + BigInt(val).toString(16)
}
