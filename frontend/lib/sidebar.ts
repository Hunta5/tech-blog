export type SidebarItem = {
    titleKey: string;
    href?: string;
    children?: SidebarItem[];
}

export const sidebarConfig: SidebarItem[] = [
    {
        titleKey: 'sidebar.tool',
        children: [
            {
                titleKey: 'sidebar.tool.encode',
                children: [
                    { titleKey: 'Base64', href: '/tools/base64' },
                    { titleKey: 'URL', href: '/tools/url' },
                    { titleKey: 'HexDecimal', href: '/tools/hex' },
                    { titleKey: 'Crypto / Hash', href: '/tools/crypto' },
                ],
            },
            {
                titleKey: 'sidebar.tool.json',
                children: [
                    { titleKey: 'JSON Escape', href: '/tools/json' },
                    { titleKey: 'JSON → Model', href: '/tools/json2model' },
                    { titleKey: 'JSON Diff', href: '/tools/jsondiff' },
                ],
            },
            {
                titleKey: 'sidebar.tool.ios',
                children: [
                    { titleKey: 'Crash Symbolicate', href: '/tools/crashtool' },
                    { titleKey: 'URL & Deep Link', href: '/tools/deeplink' },
                    { titleKey: 'Plist Viewer', href: '/tools/plist' },
                    { titleKey: 'Regex & NSPredicate', href: '/tools/regex' },
                    { titleKey: 'App Icon Creator', href: '/tools/appIconCreator' },
                ],
            },
            {
                titleKey: 'sidebar.tool.dev',
                children: [
                    { titleKey: 'HTTP Client', href: '/tools/http' },
                    { titleKey: 'Timestamp', href: '/tools/timestamp' },
                    { titleKey: 'Color', href: '/tools/color' },
                    { titleKey: 'Image Compress', href: '/tools/imagecompress' },
                ],
            },
        ],
    },
    {
        titleKey: 'sidebar.blog',
        children: [
            { titleKey: 'sidebar.allArticles', href: '/articles' },
            { titleKey: 'sidebar.blogMaker', href: '/blog' },
        ]
    },
    {
        titleKey: 'sidebar.about',
        children: [
            { titleKey: 'sidebar.aboutMe', href: '/about' },
        ]
    },
]
