'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import PdfClient from './PdfClient'

export default function PdfPage() {
    const { t } = useLanguage()
    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                {t('pdf.title')}
            </h1>
            <p className="text-gray-400 mb-10">{t('pdf.desc')}</p>
            <PdfClient />
        </div>
    )
}
