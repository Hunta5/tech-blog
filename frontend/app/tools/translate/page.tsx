'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import TranslateClient from './TranslateClient'

export default function TranslatePage() {
    const { t } = useLanguage()
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {t('translate.title')}
            </h1>
            <p className="text-gray-400 mb-10">{t('translate.desc')}</p>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8">
                <TranslateClient />
            </div>
        </div>
    )
}
