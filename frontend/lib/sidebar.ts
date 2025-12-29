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
                title: 'Atos Crash Transfer',
                href: '/tools/atos',
            }
        ]
    },
    {
        title: 'About',
        children: [
            {
                title: "About US",
                href: '/about',
            }
        ]
    }
]