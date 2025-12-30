export type SidebarItem = {
    title: string;
    href?: string;
    children?: SidebarItem[];
}

export const sidebarConfig: SidebarItem[] = [
    {
        title: 'Blog',
        children: [
            {
                title: ' All Articles',
                href: '/',
            }
        ]
    },
    {
        title: 'Tool',
        children: [
            {
              title: 'Base64',
              href: '/tools/base64',
            },
            {
                title: 'URL',
                href: '/tools/url',
            },
            {
                title: 'Timestamp',
                href: '/tools/timestamp',
            },
            {
              title: 'HexDecimal',
              href: '/tools/hex',
            },
            {
              title: 'App Icon Creator',
              href: '/tools/appIconCreator',
            },
            {
                title: 'Atos Crash Transfer',
                href: '/tools/atos',
            },
        ]
    },
    {
        title: 'About',
        children: [
            {
                title: "About Me",
                href: '/about',
            }
        ]
    }
]