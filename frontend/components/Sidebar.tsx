'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sidebarConfig } from '@/lib/sidebar'

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-gray-800 bg-gray-900/50 backdrop-blur-sm min-h-screen p-6 sticky top-0">
            <nav className="space-y-8">
                {sidebarConfig.map((section) => (
                    <div key={section.title}>
                        {/* 分类标题 */}
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                            {section.title}
                        </h2>

                        {/* 链接列表 */}
                        <ul className="space-y-1">
                            {section.children?.map((item) => {
                                const isActive = pathname === item.href

                                return (
                                    <li key={item.title}>
                                        <Link
                                            href={item.href!}
                                            className={`
                        group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                        ${isActive
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                                            }
                      `}
                                        >
                                            {/* 图标指示器 */}
                                            <span className={`
                        w-1.5 h-1.5 rounded-full transition-all duration-200
                        ${isActive
                                                ? 'bg-blue-400 shadow-lg shadow-blue-400/50'
                                                : 'bg-gray-600 group-hover:bg-gray-400'
                                            }
                      `} />

                                            {/* 文字 */}
                                            <span className="flex-1">{item.title}</span>

                                            {/* 选中箭头 */}
                                            {isActive && (
                                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    )
}

// import Link from 'next/link'
// import {sidebarConfig} from '@/lib/sidebar'
//
// export function Sidebar() {
//     return (
//         <aside className="w-64 border-r min-h-screen p-4">
//             <nav className="space-y-6">
//                 {sidebarConfig.map((section) => (
//                     <div key={section.title}>
//                         <h2 className="text-sm font-semibold text-gray-500 mb-2">
//                             {section.title}
//                         </h2>
//
//                         <ul className="space-y-1">
//                             {section.children?.map((item) => (
//                                 <li key={item.title}>
//                                     <Link
//                                         href={item.href!}
//                                         className="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100"
//                                     >
//                                         {item.title}
//                                     </Link>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 ))}
//             </nav>
//         </aside>
//     )
// }