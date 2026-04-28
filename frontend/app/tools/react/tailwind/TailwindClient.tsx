'use client'

import { useState, ReactNode } from 'react'

type CheatItem = { css: string; tw: string; desc: string }
type Category = { name: string; icon: string; items: CheatItem[] }

const categories: Category[] = [
    {
        name: '布局 Layout',
        icon: '🧱',
        items: [
            { css: 'display: flex', tw: 'flex', desc: '弹性布局' },
            { css: 'flex-direction: column', tw: 'flex-col', desc: '纵向排列' },
            { css: 'justify-content: center', tw: 'justify-center', desc: '主轴居中' },
            { css: 'justify-content: space-between', tw: 'justify-between', desc: '两端对齐' },
            { css: 'align-items: center', tw: 'items-center', desc: '交叉轴居中' },
            { css: 'gap: 1rem', tw: 'gap-4', desc: '子元素间距' },
            { css: 'display: grid', tw: 'grid', desc: '网格布局' },
            { css: 'grid-template-columns: repeat(3, 1fr)', tw: 'grid-cols-3', desc: '三列网格' },
        ],
    },
    {
        name: '间距 Spacing',
        icon: '📏',
        items: [
            { css: 'padding: 1rem', tw: 'p-4', desc: '四周内边距' },
            { css: 'padding: 0 1rem', tw: 'px-4', desc: '左右内边距' },
            { css: 'padding-top: 2rem', tw: 'pt-8', desc: '上内边距' },
            { css: 'margin: 1rem', tw: 'm-4', desc: '四周外边距' },
            { css: 'margin: 0 auto', tw: 'mx-auto', desc: '水平居中' },
            { css: 'margin-bottom: 1.5rem', tw: 'mb-6', desc: '下外边距' },
        ],
    },
    {
        name: '尺寸 Sizing',
        icon: '📐',
        items: [
            { css: 'width: 100%', tw: 'w-full', desc: '全宽' },
            { css: 'width: 50%', tw: 'w-1/2', desc: '半宽' },
            { css: 'height: 100vh', tw: 'h-screen', desc: '全屏高' },
            { css: 'max-width: 1280px', tw: 'max-w-7xl', desc: '最大宽度' },
            { css: 'min-height: 100vh', tw: 'min-h-screen', desc: '最小全屏' },
        ],
    },
    {
        name: '文字 Typography',
        icon: '✏️',
        items: [
            { css: 'font-size: 0.875rem', tw: 'text-sm', desc: '小字' },
            { css: 'font-size: 1.25rem', tw: 'text-xl', desc: '大字' },
            { css: 'font-size: 2.25rem', tw: 'text-4xl', desc: '超大字' },
            { css: 'font-weight: 700', tw: 'font-bold', desc: '粗体' },
            { css: 'font-weight: 600', tw: 'font-semibold', desc: '半粗' },
            { css: 'text-align: center', tw: 'text-center', desc: '居中' },
            { css: 'line-height: 1.75', tw: 'leading-relaxed', desc: '宽行距' },
            { css: 'color: #6b7280', tw: 'text-gray-500', desc: '灰色文字' },
        ],
    },
    {
        name: '装饰 Decoration',
        icon: '🎨',
        items: [
            { css: 'background-color: #3b82f6', tw: 'bg-blue-500', desc: '蓝色背景' },
            { css: 'border-radius: 0.5rem', tw: 'rounded-lg', desc: '圆角' },
            { css: 'border-radius: 9999px', tw: 'rounded-full', desc: '全圆' },
            { css: 'box-shadow: 0 10px 15px ...', tw: 'shadow-lg', desc: '大阴影' },
            { css: 'border: 1px solid #e5e7eb', tw: 'border border-gray-200', desc: '边框' },
            { css: 'opacity: 0.5', tw: 'opacity-50', desc: '半透明' },
        ],
    },
    {
        name: '响应式 Responsive',
        icon: '📱',
        items: [
            { css: '@media (min-width: 640px)', tw: 'sm:', desc: '≥640px 手机横屏' },
            { css: '@media (min-width: 768px)', tw: 'md:', desc: '≥768px 平板' },
            { css: '@media (min-width: 1024px)', tw: 'lg:', desc: '≥1024px 笔记本' },
            { css: '@media (min-width: 1280px)', tw: 'xl:', desc: '≥1280px 桌面' },
        ],
    },
]

type LiveExample = { name: string; step: string; code: string; render: ReactNode }

const liveExamples: LiveExample[] = [
    {
        name: '卡片组件',
        step: '骨架 → 内容 → 装饰',
        code: `<div className="max-w-sm rounded-2xl shadow-lg overflow-hidden bg-white">
  <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500" />
  <div className="p-6">
    <h3 className="text-xl font-bold mb-2">标题</h3>
    <p className="text-gray-600 text-sm leading-relaxed">
      描述文字放在这里，用 text-gray-600 给次要信息降低视觉层级。
    </p>
    <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full
      hover:bg-blue-600 transition-colors">
      按钮
    </button>
  </div>
</div>`,
        render: (
            <div className="max-w-sm rounded-2xl overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)', background: 'white' }}>
                <div className="h-48" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }} />
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#1f2937' }}>旅行日记</h3>
                    <p className="text-sm" style={{ color: '#6b7280', lineHeight: 1.7 }}>
                        用 Tailwind 搭建 UI 就像搭积木：先定骨架(flex)，再填内容(text)，最后装饰(bg/rounded/shadow)。
                    </p>
                    <button className="mt-4 px-6 py-2 text-white text-sm" style={{ background: '#3b82f6', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>
                        了解更多
                    </button>
                </div>
            </div>
        ),
    },
    {
        name: '导航栏',
        step: 'flex justify-between 搞定',
        code: `<nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
  <span className="text-xl font-bold">Logo</span>
  <div className="flex gap-6 text-gray-600">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">关于</a>
  </div>
  <button className="px-4 py-2 bg-black text-white rounded-lg">
    登录
  </button>
</nav>`,
        render: (
            <nav className="flex items-center px-8 py-4" style={{ justifyContent: 'space-between', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderRadius: '12px' }}>
                <span className="text-xl font-bold" style={{ color: '#111' }}>Logo</span>
                <div className="flex" style={{ gap: '1.5rem', color: '#6b7280' }}>
                    <span style={{ cursor: 'pointer' }}>首页</span>
                    <span style={{ cursor: 'pointer' }}>产品</span>
                    <span style={{ cursor: 'pointer' }}>关于</span>
                </div>
                <button className="px-4 py-2 text-white text-sm" style={{ background: '#111', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>登录</button>
            </nav>
        ),
    },
    {
        name: '完全居中',
        step: '三件套：flex + justify-center + items-center',
        code: `<div className="flex justify-center items-center h-screen bg-gray-100">
  <div className="text-center">
    <h1 className="text-5xl font-bold mb-4">Hello</h1>
    <p className="text-gray-500">完全居中就这三个类</p>
  </div>
</div>`,
        render: (
            <div className="flex items-center" style={{ justifyContent: 'center', height: '160px', background: '#f3f4f6', borderRadius: '12px' }}>
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#111' }}>Hello</h1>
                    <p className="text-sm" style={{ color: '#9ca3af' }}>flex + justify-center + items-center</p>
                </div>
            </div>
        ),
    },
]

const spacingScale = [
    { num: '0', px: '0px', rem: '0rem' },
    { num: '0.5', px: '2px', rem: '0.125rem' },
    { num: '1', px: '4px', rem: '0.25rem' },
    { num: '2', px: '8px', rem: '0.5rem' },
    { num: '3', px: '12px', rem: '0.75rem' },
    { num: '4', px: '16px', rem: '1rem' },
    { num: '5', px: '20px', rem: '1.25rem' },
    { num: '6', px: '24px', rem: '1.5rem' },
    { num: '8', px: '32px', rem: '2rem' },
    { num: '10', px: '40px', rem: '2.5rem' },
    { num: '12', px: '48px', rem: '3rem' },
    { num: '16', px: '64px', rem: '4rem' },
    { num: '20', px: '80px', rem: '5rem' },
    { num: '24', px: '96px', rem: '6rem' },
]

type TabId = 'cheatsheet' | 'examples' | 'spacing' | 'formula'

export default function TailwindClient() {
    const [activeTab, setActiveTab] = useState<TabId>('cheatsheet')
    const [activeCategory, setActiveCategory] = useState(0)
    const [hoveredItem, setHoveredItem] = useState<number | null>(null)
    const [activeExample, setActiveExample] = useState(0)

    const tabs: { id: TabId; label: string; icon: string }[] = [
        { id: 'cheatsheet', label: '速查表', icon: '📋' },
        { id: 'examples', label: '实战示例', icon: '🔨' },
        { id: 'spacing', label: '间距系统', icon: '📏' },
        { id: 'formula', label: '记忆公式', icon: '🧠' },
    ]

    return (
        <div style={{ fontFamily: "'Noto Sans SC', 'Helvetica Neue', sans-serif", background: '#fafafa', borderRadius: '16px', padding: '24px' }}>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6" style={{ justifyContent: 'center' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="px-4 py-2 text-sm"
                        style={{
                            background: activeTab === tab.id ? '#0f172a' : 'white',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            border: activeTab === tab.id ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Cheatsheet Tab */}
            {activeTab === 'cheatsheet' && (
                <div>
                    <div className="flex flex-wrap gap-2 mb-4" style={{ justifyContent: 'center' }}>
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveCategory(i)}
                                className="px-3 py-1.5 text-sm"
                                style={{
                                    background: activeCategory === i ? '#dbeafe' : 'white',
                                    color: activeCategory === i ? '#1d4ed8' : '#64748b',
                                    border: `1px solid ${activeCategory === i ? '#93c5fd' : '#e2e8f0'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>

                    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                        {categories[activeCategory].items.map((item, i) => (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredItem(i)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="flex items-center mb-2 p-3"
                                style={{
                                    background: hoveredItem === i ? '#f0f9ff' : 'white',
                                    borderRadius: '10px',
                                    border: `1px solid ${hoveredItem === i ? '#bae6fd' : '#f1f5f9'}`,
                                    transition: 'all 0.15s',
                                    gap: '12px',
                                }}
                            >
                                <span className="text-xs" style={{ color: '#94a3b8', width: '40px', flexShrink: 0, textAlign: 'center' }}>{item.desc}</span>
                                <code style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '13px',
                                    color: '#1e40af',
                                    background: '#eff6ff',
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    fontWeight: 500,
                                    minWidth: '160px',
                                }}>
                                    {item.tw}
                                </code>
                                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>→</span>
                                <code style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '12px',
                                    color: '#64748b',
                                    flex: 1,
                                }}>
                                    {item.css}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Live Examples Tab */}
            {activeTab === 'examples' && (
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                    <div className="flex gap-2 mb-6" style={{ justifyContent: 'center' }}>
                        {liveExamples.map((ex, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveExample(i)}
                                className="px-4 py-2 text-sm"
                                style={{
                                    background: activeExample === i ? '#0f172a' : 'white',
                                    color: activeExample === i ? 'white' : '#64748b',
                                    border: activeExample === i ? 'none' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                {ex.name}
                            </button>
                        ))}
                    </div>

                    <div className="mb-4 p-2" style={{ background: '#e2e8f0', borderRadius: '16px' }}>
                        <div className="p-4" style={{ background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                            {liveExamples[activeExample].render}
                        </div>
                    </div>

                    <div className="mb-2 px-2">
                        <span className="text-xs font-bold" style={{ color: '#f59e0b', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px' }}>
                            💡 {liveExamples[activeExample].step}
                        </span>
                    </div>

                    <pre style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                        lineHeight: 1.7,
                        background: '#1e293b',
                        color: '#e2e8f0',
                        padding: '20px',
                        borderRadius: '12px',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                    }}>
                        {liveExamples[activeExample].code}
                    </pre>
                </div>
            )}

            {/* Spacing Tab */}
            {activeTab === 'spacing' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="p-4 mb-4" style={{ background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                        <p className="text-sm" style={{ color: '#92400e', fontWeight: 500 }}>
                            🔑 核心公式：<code style={{ fontFamily: "'JetBrains Mono'", background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>数字 × 4 = px值</code>
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#b45309' }}>
                            例：p-4 = 16px，m-8 = 32px，gap-6 = 24px
                        </p>
                    </div>

                    {spacingScale.map((s, i) => (
                        <div key={i} className="flex items-center mb-1 px-3 py-2" style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderRadius: '6px', gap: '16px' }}>
                            <code style={{ fontFamily: "'JetBrains Mono'", fontSize: '13px', color: '#1e40af', width: '36px', fontWeight: 600 }}>{s.num}</code>
                            <div style={{ width: `${Math.min(parseInt(s.px), 200)}px`, height: '12px', background: `hsl(${220 - i * 8}, 80%, ${60 + i}%)`, borderRadius: '3px', transition: 'width 0.3s' }} />
                            <code style={{ fontFamily: "'JetBrains Mono'", fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>{s.px}</code>
                        </div>
                    ))}
                </div>
            )}

            {/* Memory Formula Tab */}
            {activeTab === 'formula' && (
                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                    {[
                        {
                            title: '🧱 第一步：搭骨架',
                            color: '#dbeafe',
                            border: '#93c5fd',
                            text: '#1d4ed8',
                            content: 'flex / flex-col / grid → 决定方向\njustify-* / items-* → 对齐方式\ngap-* → 子元素间距\nw-* / h-* → 容器尺寸',
                        },
                        {
                            title: '✏️ 第二步：填内容',
                            color: '#dcfce7',
                            border: '#86efac',
                            text: '#166534',
                            content: 'text-sm/lg/xl/2xl → 字号\nfont-bold/semibold → 字重\ntext-gray-500 → 文字颜色\nleading-relaxed → 行距',
                        },
                        {
                            title: '🎨 第三步：加装饰',
                            color: '#fef3c7',
                            border: '#fcd34d',
                            text: '#92400e',
                            content: 'bg-blue-500 → 背景色\nrounded-lg/full → 圆角\nshadow-lg → 阴影\nborder border-gray-200 → 边框\nhover:bg-blue-600 → 悬浮效果\ntransition-colors → 过渡动画',
                        },
                        {
                            title: '📱 第四步：响应式',
                            color: '#f3e8ff',
                            border: '#c084fc',
                            text: '#6b21a8',
                            content: 'sm:flex → 手机横屏生效\nmd:grid-cols-2 → 平板两列\nlg:text-xl → 笔记本放大\n\n口诀：移动端优先写，大屏加前缀',
                        },
                    ].map((step, i) => (
                        <div
                            key={i}
                            className="mb-4 p-5"
                            style={{
                                background: step.color,
                                borderRadius: '14px',
                                border: `1px solid ${step.border}`,
                            }}
                        >
                            <h3 className="font-bold mb-3" style={{ color: step.text, fontSize: '16px' }}>{step.title}</h3>
                            <pre style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '13px',
                                lineHeight: 1.8,
                                color: step.text,
                                whiteSpace: 'pre-wrap',
                                margin: 0,
                            }}>
                                {step.content}
                            </pre>
                        </div>
                    ))}

                    <div className="p-5 mt-4" style={{ background: '#f1f5f9', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <h3 className="font-bold mb-2" style={{ color: '#334155', fontSize: '16px' }}>⚡ 最终口诀</h3>
                        <p className="text-sm" style={{ color: '#475569', lineHeight: 1.8 }}>
                            <strong>方向</strong>用 flex/grid，<strong>对齐</strong>用 justify/items<br />
                            <strong>间距</strong>记 ×4 法则，<strong>颜色</strong>写 名字-深浅<br />
                            <strong>圆角</strong>rounded，<strong>阴影</strong>shadow<br />
                            <strong>响应式</strong>加前缀，<strong>悬浮</strong>hover: 搞定<br />
                            <br />
                            <em style={{ color: '#94a3b8' }}>不会的？→ 打开 tailwindcss.com/docs 搜 CSS 属性名</em>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
