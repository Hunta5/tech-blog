// lib/icon-generator.ts
import JSZip from "jszip"
import { saveAs } from "file-saver"

/* =========================
   iOS AppIcon sizes
========================= */

const IOS_ICON_SET = [
    { size: 20, scales: [1, 2, 3] },
    { size: 29, scales: [1, 2, 3] },
    { size: 40, scales: [1, 2, 3] },
    { size: 60, scales: [2, 3] },
    { size: 76, scales: [1, 2] },
    { size: 83.5, scales: [2] },
    { size: 1024, scales: [1] }, // App Store
]

function getIOSIconSizes() {
    return IOS_ICON_SET.flatMap(({ size, scales }) =>
        scales.map(scale => ({
            size,
            scale,
            px: Math.round(size * scale),
            filename: `icon_${size}x${size}@${scale}x.png`,
        }))
    )
}

/* =========================
   Canvas resize
========================= */

function resizeImage(
    img: HTMLImageElement,
    size: number
): Promise<Blob> {
    return new Promise(resolve => {
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext("2d")!
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, size, size)

        canvas.toBlob(blob => resolve(blob!), "image/png")
    })
}

/* =========================
   Contents.json
========================= */

function generateContentsJson() {
    const images: any[] = []

    getIOSIconSizes().forEach(({ size, scale, filename }) => {
        images.push({
            size: `${size}x${size}`,
            idiom: size === 76 || size === 83.5 ? "ipad" : "iphone",
            filename,
            scale: `${scale}x`,
        })
    })

    // App Store
    images.push({
        size: "1024x1024",
        idiom: "ios-marketing",
        filename: "icon_1024x1024@1x.png",
        scale: "1x",
    })

    return JSON.stringify(
        {
            images,
            info: {
                version: 1,
                author: "xcode",
            },
        },
        null,
        2
    )
}

/* =========================
   Main entry
========================= */

export async function generateIOSAppIconZip(file: File) {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    await new Promise<void>(res => {
        img.onload = () => res()
    })

    if (img.width < 1024 || img.height < 1024) {
        throw new Error("Image must be at least 1024×1024")
    }

    const zip = new JSZip()
    const folder = zip.folder("AppIcon.appiconset")!

    // icons
    for (const icon of getIOSIconSizes()) {
        const blob = await resizeImage(img, icon.px)
        folder.file(icon.filename, blob)
    }

    // Contents.json
    folder.file("Contents.json", generateContentsJson())

    // zip
    const zipBlob = await zip.generateAsync({ type: "blob" })
    saveAs(zipBlob, "iOS-AppIcon.appiconset.zip")
}