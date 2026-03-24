'use client'

import Link from 'next/link'
import MarkdownView from '@/components/MarkdownView'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type Props = {
    title: string
    date: string
    content: string
}

export default function PostContent({ title, date, content }: Props) {
    const { t } = useLanguage()

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <nav className="mb-8">
                <Link href="/articles" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    {t('post.backHome')}
                </Link>
            </nav>

            <header className="mb-12">
                <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                        {t('post.techArticle')}
                    </span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-gray-400">
                    <time className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {date}
                    </time>
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {t('post.minuteRead')}
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {t('post.reads')}
                    </span>
                </div>
            </header>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-12"></div>

            <MarkdownView markdown={content} />

            <div className="mt-16 pt-8 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Link href="/articles" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        {t('post.backToList')}
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">{t('post.shareTo')}</span>
                        <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
