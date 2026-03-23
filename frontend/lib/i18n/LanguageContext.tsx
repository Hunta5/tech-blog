'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import ko from './ko'
import zh from './zh'

export type Lang = 'ko' | 'zh'

const translations: Record<Lang, Record<string, string>> = { ko, zh }

type LanguageContextType = {
    lang: Lang
    setLang: (lang: Lang) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'ko',
    setLang: () => {},
    t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('ko')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('lang') as Lang | null
        if (saved === 'ko' || saved === 'zh') {
            setLangState(saved)
        }
        setMounted(true)
    }, [])

    const setLang = useCallback((newLang: Lang) => {
        setLangState(newLang)
        localStorage.setItem('lang', newLang)
    }, [])

    const t = useCallback((key: string): string => {
        return translations[lang][key] ?? key
    }, [lang])

    // Avoid hydration mismatch: render children only after mount
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
