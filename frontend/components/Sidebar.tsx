import Link from 'next/link'
import {sidebarConfig} from '@/lib/sidebar'

export function Sidebar() {
    return (
        <aside className="w-64 border-r min-h-screen p-4">
            <nav className="space-y-6">
                {sidebarConfig.map((section) => (
                    <div key={section.title}>
                        <h2 className="text-sm font-semibold text-gray-500 mb-2">
                            {section.title}
                        </h2>

                        <ul className="space-y-1">
                            {section.children?.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.href!}
                                        className="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100"
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    )
}