export type SidebarItem = {
    titleKey: string;
    href?: string;
    children?: SidebarItem[];
}

export const sidebarConfig: SidebarItem[] = [
    {
        titleKey: 'sidebar.blog',
        children: [
            { titleKey: 'sidebar.allArticles', href: '/' },
            { titleKey: 'sidebar.blogMaker', href: '/blog' },
        ]
    },
    {
        titleKey: 'sidebar.tool',
        children: [
            { titleKey: 'Base64', href: '/tools/base64' },
            { titleKey: 'URL', href: '/tools/url' },
            { titleKey: 'Timestamp', href: '/tools/timestamp' },
            { titleKey: 'HexDecimal', href: '/tools/hex' },
            { titleKey: 'JSON Escape', href: '/tools/json' },
            { titleKey: 'App Icon Creator', href: '/tools/appIconCreator' },
            { titleKey: 'Tool Info', href: '/tools/crashtool' },
        ]
    },
    {
        titleKey: 'sidebar.about',
        children: [
            { titleKey: 'sidebar.aboutMe', href: '/about' },
        ]
    },
]
