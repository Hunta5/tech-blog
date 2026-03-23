import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'

const execFileAsync = promisify(execFile)
const SYMBOLS_DIR = path.join(os.homedir(), 'Library', 'Application Support', 'SymbolicApplication', 'Symbols')
const MANIFEST_PATH = path.join(SYMBOLS_DIR, 'manifest.json')

// POST /api/symbolicate — symbolicate addresses with dSYM or system symbols
export async function POST(req: NextRequest) {
    const formData = await req.formData()
    const dsymFile = formData.get('dsym') as File | null
    const binaryName = formData.get('binaryName') as string
    const loadAddress = formData.get('loadAddress') as string
    const arch = (formData.get('arch') as string) || 'arm64'
    const addressesJson = formData.get('addresses') as string
    const symbolSetId = formData.get('symbolSetId') as string | null

    if (!binaryName || !loadAddress || !addressesJson) {
        return NextResponse.json({ code: 1, message: 'Missing required fields' }, { status: 400 })
    }

    const addresses: string[] = JSON.parse(addressesJson)
    if (addresses.length === 0) {
        return NextResponse.json({ code: 0, data: [] })
    }

    // Strategy 1: Use uploaded dSYM
    if (dsymFile) {
        const tmpDir = path.join(os.tmpdir(), `dsym-${Date.now()}`)
        fs.mkdirSync(tmpDir, { recursive: true })

        try {
            const buffer = Buffer.from(await dsymFile.arrayBuffer())
            const dsymPath = path.join(tmpDir, dsymFile.name)
            fs.writeFileSync(dsymPath, buffer)

            if (dsymFile.name.endsWith('.zip')) {
                await execFileAsync('unzip', ['-o', dsymPath, '-d', tmpDir])
            }

            const dwarfPath = findDWARFBinary(tmpDir, binaryName)
            if (dwarfPath) {
                const results = await runAtos(dwarfPath, loadAddress, arch, addresses)
                return NextResponse.json({ code: 0, data: results })
            }
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true })
        }
    }

    // Strategy 2: Use downloaded system symbols
    if (symbolSetId) {
        const binaryPath = findSystemBinary(symbolSetId, binaryName)
        if (binaryPath) {
            try {
                const results = await runAtos(binaryPath, loadAddress, arch, addresses)
                return NextResponse.json({ code: 0, data: results })
            } catch {
                // Fall through
            }
        }
    }

    return NextResponse.json({ code: 1, message: `No symbols found for ${binaryName}` }, { status: 404 })
}

async function runAtos(binaryPath: string, loadAddress: string, arch: string, addresses: string[]): Promise<string[]> {
    const { stdout } = await execFileAsync('/usr/bin/atos', [
        '-o', binaryPath,
        '-l', loadAddress,
        '-arch', arch,
        ...addresses,
    ])
    return stdout.trim().split('\n')
}

function findDWARFBinary(dir: string, binaryName: string): string | null {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory() && entry.name.endsWith('.dSYM')) {
            const name = entry.name.replace('.dSYM', '')
            const dwarfPath = path.join(fullPath, 'Contents', 'Resources', 'DWARF', name)
            if (fs.existsSync(dwarfPath)) return dwarfPath
        }
        if (entry.isDirectory()) {
            const found = findDWARFBinary(fullPath, binaryName)
            if (found) return found
        }
    }
    return null
}

function findSystemBinary(symbolSetId: string, binaryName: string): string | null {
    if (!fs.existsSync(MANIFEST_PATH)) return null

    let manifest: any[]
    try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
    } catch {
        return null
    }

    const symbolSet = manifest.find((s: any) => s.id === symbolSetId)
    if (!symbolSet || !fs.existsSync(symbolSet.directoryPath)) return null

    // Walk directory looking for framework binary
    return walkForBinary(symbolSet.directoryPath, binaryName)
}

function walkForBinary(dir: string, binaryName: string): string | null {
    const frameworkName = binaryName.endsWith('.framework') ? binaryName : `${binaryName}.framework`
    const cleanName = binaryName.replace('.framework', '')

    let entries: fs.Dirent[]
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
        return null
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        // Match: UIKit.framework/UIKit
        if (entry.isDirectory() && entry.name === frameworkName) {
            const binaryPath = path.join(fullPath, cleanName)
            if (fs.existsSync(binaryPath)) return binaryPath
        }

        // Match: standalone dylib
        if (!entry.isDirectory() && entry.name === cleanName) {
            return fullPath
        }

        if (entry.isDirectory()) {
            const found = walkForBinary(fullPath, binaryName)
            if (found) return found
        }
    }

    return null
}
