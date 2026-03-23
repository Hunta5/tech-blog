export type CrashReportSource = 'apple' | 'kscrash'

export interface CrashFrame {
    frameIndex: number
    binaryName: string
    address: string
    loadAddress: string
    offset: string | null
    symbolicated: string | null
}

export interface CrashThread {
    threadIndex: number
    name: string | null
    crashed: boolean
    frames: CrashFrame[]
}

export interface BinaryImage {
    name: string
    loadAddress: string
    endAddress: string | null
    uuid: string | null
    path: string | null
    arch: string | null
}

export interface CrashReport {
    source: CrashReportSource
    processName: string
    bundleIdentifier: string | null
    osVersion: string | null
    deviceModel: string | null
    exceptionType: string | null
    exceptionCode: string | null
    threads: CrashThread[]
    binaryImages: BinaryImage[]
}
