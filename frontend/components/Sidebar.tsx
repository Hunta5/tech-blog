'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { sidebarConfig, SidebarItem } from '@/lib/sidebar'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { lang, setLang, t } = useLanguage()

    useEffect(() => { setIsOpen(false) }, [pathname])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const label = (key: string) => t(key) !== key ? t(key) : key

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="Open menu"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 border-r border-gray-800 bg-gray-900/95 backdrop-blur-sm p-6 overflow-y-auto
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:sticky md:top-0 md:translate-x-0 md:min-h-screen md:bg-gray-900/50
            `}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 md:hidden p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    aria-label="Close menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Language toggle */}
                <button
                    onClick={() => setLang(lang === 'ko' ? 'zh' : 'ko')}
                    className="mt-8 md:mt-0 mb-6 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {t('lang.switch')}
                </button>

                <nav className="space-y-6">
                    {sidebarConfig.map((section) => (
                        <SidebarSection
                            key={section.titleKey}
                            section={section}
                            pathname={pathname}
                            label={label}
                        />
                    ))}
                </nav>
            </aside>
        </>
    )
}

// ---- Section (top level) ----

function SidebarSection({ section, pathname, label }: {
    section: SidebarItem
    pathname: string
    label: (key: string) => string
}) {
    // check if any child (or grandchild) is active
    const hasActiveChild = isActiveInTree(section, pathname)

    return (
        <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                {label(section.titleKey)}
            </h2>

            {section.children?.map((item) => {
                // item has children → it's a subcategory group
                if (item.children && item.children.length > 0) {
                    return (
                        <SubGroup
                            key={item.titleKey}
                            group={item}
                            pathname={pathname}
                            label={label}
                        />
                    )
                }

                // item has href → it's a leaf link
                if (item.href) {
                    return (
                        <SidebarLink
                            key={item.titleKey}
                            item={item}
                            pathname={pathname}
                            label={label}
                        />
                    )
                }

                return null
            })}
        </div>
    )
}

// ---- SubGroup (collapsible category) ----

function SubGroup({ group, pathname, label }: {
    group: SidebarItem
    pathname: string
    label: (key: string) => string
}) {
    const hasActive = isActiveInTree(group, pathname)
    const [open, setOpen] = useState(hasActive)

    // auto-expand when navigating into this group
    useEffect(() => {
        if (hasActive) setOpen(true)
    }, [hasActive])

    const count = group.children?.length ?? 0

    return (
        <div className="mb-1">
            <button
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    hasActive
                        ? 'text-blue-400'
                        : 'text-gray-500 hover:text-gray-300'
                }`}
            >
                <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>{label(group.titleKey)}</span>
                <span className="text-gray-600 text-[10px] ml-auto">{count}</span>
            </button>

            {open && (
                <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-gray-800 pl-1">
                    {group.children?.map((child) => (
                        <li key={child.titleKey}>
                            <SidebarLink item={child} pathname={pathname} label={label} compact />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// ---- Leaf link ----

function SidebarLink({ item, pathname, label, compact }: {
    item: SidebarItem
    pathname: string
    label: (key: string) => string
    compact?: boolean
}) {
    const isActive = pathname === item.href

    return (
        <Link
            href={item.href!}
            className={`
                group flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-200
                ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'}
                ${isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                }
            `}
        >
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 shrink-0 ${
                isActive ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : 'bg-gray-600 group-hover:bg-gray-400'
            }`} />
            <span className="flex-1 truncate">{label(item.titleKey)}</span>
            {isActive && (
                <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </Link>
    )
}

// ---- helpers ----

function isActiveInTree(item: SidebarItem, pathname: string): boolean {
    if (item.href === pathname) return true
    return item.children?.some(c => isActiveInTree(c, pathname)) ?? false
}
