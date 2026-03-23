import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const SYMBOLS_DIR = path.join(os.homedir(), 'Library', 'Application Support', 'SymbolicApplication', 'Symbols')
const MANIFEST_PATH = path.join(SYMBOLS_DIR, 'manifest.json')
const IPSW_PATH = '/opt/homebrew/bin/ipsw'

interface SymbolInfo {
    id: string
    device: string
    iosVersion: string
    downloadDate: string
    directoryPath: string
}

function loadManifest(): SymbolInfo[] {
    if (!fs.existsSync(MANIFEST_PATH)) return []
    try {
        return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
    } catch {
        return []
    }
}

function saveManifest(symbols: SymbolInfo[]) {
    fs.mkdirSync(SYMBOLS_DIR, { recursive: true })
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(symbols, null, 2))
}

// GET /api/symbols — list downloaded symbol sets
export async function GET() {
    const symbols = loadManifest()
    return NextResponse.json({ code: 0, data: symbols })
}

// POST /api/symbols — download system symbols via ipsw
export async function POST(req: NextRequest) {
    const { device, version } = await req.json()
    if (!device || !version) {
        return NextResponse.json({ code: 1, message: 'device and version are required' }, { status: 400 })
    }

    // Check if ipsw is installed
    if (!fs.existsSync(IPSW_PATH)) {
        return NextResponse.json({ code: 1, message: 'ipsw CLI not found. Install: brew install ipsw' }, { status: 500 })
    }

    const outputDir = path.join(SYMBOLS_DIR, `${device}_${version}`)
    fs.mkdirSync(outputDir, { recursive: true })

    try {
        await execFileAsync(IPSW_PATH, [
            'download', 'ipsw',
            '--device', device,
            '--version', version,
            '--dyld',
            '--kernel',
            '--output', outputDir,
        ], { timeout: 600000 }) // 10 min timeout

        // Save to manifest
        const symbols = loadManifest()
        const existing = symbols.findIndex(s => s.device === device && s.iosVersion === version)
        const info: SymbolInfo = {
            id: `${device}_${version}_${Date.now()}`,
            device,
            iosVersion: version,
            downloadDate: new Date().toISOString(),
            directoryPath: outputDir,
        }
        if (existing >= 0) {
            symbols[existing] = info
        } else {
            symbols.push(info)
        }
        saveManifest(symbols)

        return NextResponse.json({ code: 0, data: info })
    } catch (err: any) {
        return NextResponse.json({ code: 1, message: err.message || 'Download failed' }, { status: 500 })
    }
}

// DELETE /api/symbols — delete a symbol set
export async function DELETE(req: NextRequest) {
    const { id } = await req.json()
    const symbols = loadManifest()
    const target = symbols.find(s => s.id === id)
    if (target && fs.existsSync(target.directoryPath)) {
        fs.rmSync(target.directoryPath, { recursive: true, force: true })
    }
    saveManifest(symbols.filter(s => s.id !== id))
    return NextResponse.json({ code: 0 })
}
