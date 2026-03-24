'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import PlistClient from './PlistClient'

export default function PlistPage() {
    const { t } = useLanguage()
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {t('plist.title')}
            </h1>
            <p className="text-gray-400 mb-10">{t('plist.desc')}</p>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                <PlistClient />
            </div>
        </div>
    )
}
