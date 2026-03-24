'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// ---- Page tips ----

interface PageTip {
    pattern: string | RegExp
    tips: { zh: string; ko: string }[]
}

const PAGE_TIPS: PageTip[] = [
    {
        pattern: '/',
        tips: [
            { zh: '欢迎！这里是首页，可以快速进入工具、博客或关于我。', ko: '환영합니다! 여기는 홈페이지입니다. 도구, 블로그, 소개 페이지로 이동할 수 있어요.' },
            { zh: '试试下面的热门工具卡片，点击即可使用。', ko: '아래 인기 도구 카드를 클릭해 보세요.' },
        ],
    },
    {
        pattern: '/tools/base64',
        tips: [
            { zh: '输入文本后选择 编码 或 解码，结果可一键复制。', ko: '텍스트를 입력하고 인코딩 또는 디코딩을 선택하세요. 결과를 복사할 수 있어요.' },
        ],
    },
    {
        pattern: '/tools/json',
        tips: [
            { zh: '支持 4 种模式：转义、反转义、格式化、压缩。', ko: '4가지 모드를 지원합니다: 이스케이프, 언이스케이프, 포맷, 압축.' },
        ],
    },
    {
        pattern: '/tools/json2model',
        tips: [
            { zh: '粘贴 JSON 后选择语言，自动生成模型代码。支持嵌套对象和 snake_case 自动转换！', ko: 'JSON을 붙여넣고 언어를 선택하면 모델 코드가 자동 생성됩니다. 중첩 객체와 snake_case 자동 변환을 지원해요!' },
        ],
    },
    {
        pattern: '/tools/jsondiff',
        tips: [
            { zh: '左右两栏粘贴 JSON，点击比较即可看到差异高亮。', ko: '좌우에 JSON을 붙여넣고 비교 버튼을 누르면 차이점이 하이라이트됩니다.' },
        ],
    },
    {
        pattern: '/tools/http',
        tips: [
            { zh: '输入 URL，选择请求方式，还能自动生成 curl 命令哦。', ko: 'URL을 입력하고 요청 방식을 선택하세요. curl 명령도 자동 생성됩니다.' },
        ],
    },
    {
        pattern: '/tools/crypto',
        tips: [
            { zh: '支持 MD5、SHA-256 哈希和 bcrypt 密码加密。HMAC 需要填写密钥。', ko: 'MD5, SHA-256 해시와 bcrypt 비밀번호 암호화를 지원합니다. HMAC은 키가 필요해요.' },
        ],
    },
    {
        pattern: '/tools/color',
        tips: [
            { zh: '在色盘上拖动选色，下方可以复制 HEX、RGB、Swift 等各种格式。', ko: '색상판에서 드래그하여 색상을 선택하고, 아래에서 다양한 형식으로 복사할 수 있어요.' },
        ],
    },
    {
        pattern: '/tools/regex',
        tips: [
            { zh: 'iOS 开发者福音！Predicate Builder 可以可视化构建 NSPredicate。', ko: 'iOS 개발자를 위한 기능! Predicate Builder로 NSPredicate를 시각적으로 만들 수 있어요.' },
        ],
    },
    {
        pattern: '/tools/deeplink',
        tips: [
            { zh: '粘贴任何 URL 或深度链接，自动解析各组件并生成 Swift 代码。', ko: 'URL이나 딥링크를 붙여넣으면 각 구성 요소를 자동 분석하고 Swift 코드를 생성합니다.' },
        ],
    },
    {
        pattern: '/tools/plist',
        tips: [
            { zh: '上传 .plist 文件或直接粘贴 XML，自动识别 70+ 种 iOS 配置项。', ko: '.plist 파일을 업로드하거나 XML을 붙여넣으면 70가지 이상의 iOS 설정 항목을 자동 인식합니다.' },
        ],
    },
    {
        pattern: '/tools/imagecompress',
        tips: [
            { zh: '图片不会上传到服务器，100% 在浏览器本地压缩！可以放心使用。', ko: '이미지는 서버로 전송되지 않습니다. 100% 브라우저 로컬에서 압축돼요! 안심하세요.' },
        ],
    },
    {
        pattern: '/tools/translate',
        tips: [
            { zh: '支持文本翻译和 JSON 值批量翻译，开发者的好帮手。', ko: '텍스트 번역과 JSON 값 일괄 번역을 지원합니다. 개발자에게 유용해요.' },
        ],
    },
    {
        pattern: '/tools/crashtool',
        tips: [
            { zh: '粘贴崩溃日志，上传 dSYM，点击符号化即可还原堆栈。', ko: '크래시 로그를 붙여넣고 dSYM을 업로드한 후 심볼리케이트 버튼을 누르세요.' },
        ],
    },
    {
        pattern: '/saju',
        tips: [
            { zh: '输入阳历生日和时辰，点击排盘即可看到四柱八字命盘。', ko: '양력 생년월일과 시간을 입력하고 사주 보기를 누르면 사주팔자 명반을 볼 수 있어요.' },
            { zh: 'AI 解读功能即将上线，敬请期待！', ko: 'AI 해석 기능이 곧 출시됩니다. 기대해 주세요!' },
        ],
    },
    {
        pattern: '/horoscope',
        tips: [
            { zh: '选择你的星座查看今日运势，还可以左右切换日期。', ko: '별자리를 선택하면 오늘의 운세를 볼 수 있어요. 날짜도 변경할 수 있습니다.' },
        ],
    },
    {
        pattern: '/english',
        tips: [
            { zh: '每天学 5 个单词，点击卡片翻转查看释义，然后做测验检验效果！', ko: '매일 5개 단어를 학습하세요. 카드를 클릭하면 뜻이 보이고, 퀴즈로 테스트할 수 있어요!' },
            { zh: '坚持打卡，保持连续天数🔥', ko: '매일 출석하면 연속 일수🔥가 올라가요!' },
        ],
    },
    {
        pattern: '/food',
        tips: [
            { zh: '允许位置权限后，可以搜索周边美食。支持按分类筛选。', ko: '위치 권한을 허용하면 주변 맛집을 검색할 수 있어요. 카테고리별 필터링도 가능합니다.' },
        ],
    },
    {
        pattern: '/news',
        tips: [
            { zh: '新闻每 30 分钟自动更新，点击分类标签切换不同板块。', ko: '뉴스는 30분마다 자동 업데이트됩니다. 카테고리 탭을 클릭하여 섹션을 전환하세요.' },
        ],
    },
    {
        pattern: '/articles',
        tips: [
            { zh: '这里是所有技术文章，点击标题阅读全文。', ko: '모든 기술 기사가 여기 있어요. 제목을 클릭하면 전체 내용을 볼 수 있습니다.' },
        ],
    },
    {
        pattern: '/about',
        tips: [
            { zh: '可以查看简历、下载 PDF，也可以通过 Email 或 GitHub 联系我。', ko: '이력서를 확인하고 PDF를 다운로드할 수 있어요. 이메일이나 GitHub으로 연락하세요.' },
        ],
    },
    {
        pattern: '/blog',
        tips: [
            { zh: '管理员专用页面，登录后可以创建和管理文章。', ko: '관리자 전용 페이지입니다. 로그인 후 글을 작성하고 관리할 수 있어요.' },
        ],
    },
]

// Default tips for unmatched pages
const DEFAULT_TIPS = [
    { zh: '需要帮助吗？点击侧边栏导航到其他页面。', ko: '도움이 필요하세요? 사이드바에서 다른 페이지로 이동하세요.' },
    { zh: '试试左上角切换语言 🌐', ko: '좌측 상단에서 언어를 전환해 보세요 🌐' },
]

// ---- Cute hamster character using the uploaded image ----

function GuideHamster({ active }: { active: boolean }) {
    return (
        <div className={`relative w-full h-full ${active ? 'animate-wiggle' : 'animate-bounce-slow'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/guide-character.jpeg"
                alt="Guide"
                className="w-full h-full object-cover rounded-full border-2 border-amber-400/50 shadow-lg shadow-amber-500/20"
            />
            {/* Overlay glow when active */}
            {active && (
                <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-pulse" />
            )}
        </div>
    )
}

export default function GuideCharacter() {
    const pathname = usePathname()
    const { lang } = useLanguage()
    const isKo = lang === 'ko'

    const [visible, setVisible] = useState(false)
    const [minimized, setMinimized] = useState(true)
    const [tipIndex, setTipIndex] = useState(0)
    const [dismissed, setDismissed] = useState(false)

    // Get tips for current page
    const currentTips = useMemo(() => {
        // exact match first
        const exact = PAGE_TIPS.find(t => typeof t.pattern === 'string' && t.pattern === pathname)
        if (exact) return exact.tips

        // starts-with match for sub-paths
        const partial = PAGE_TIPS.find(t => {
            if (typeof t.pattern === 'string') return pathname.startsWith(t.pattern) && t.pattern !== '/'
            return (t.pattern as RegExp).test(pathname)
        })
        if (partial) return partial.tips

        // home page
        if (pathname === '/') {
            const home = PAGE_TIPS.find(t => t.pattern === '/')
            if (home) return home.tips
        }

        return DEFAULT_TIPS
    }, [pathname])

    // Reset tip index on page change
    useEffect(() => {
        setTipIndex(0)
        setDismissed(false)
        // Show guide after small delay on page change
        const timer = setTimeout(() => setVisible(true), 1500)
        return () => clearTimeout(timer)
    }, [pathname])

    // Auto-cycle tips
    useEffect(() => {
        if (minimized || dismissed) return
        if (currentTips.length <= 1) return
        const timer = setInterval(() => {
            setTipIndex(i => (i + 1) % currentTips.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [minimized, dismissed, currentTips.length])

    // Check if user dismissed before
    useEffect(() => {
        const hidden = localStorage.getItem('guide_hidden')
        if (hidden === 'true') setMinimized(true)
    }, [])

    const handleDismiss = () => {
        setDismissed(true)
        setMinimized(true)
    }

    const handleToggle = () => {
        setMinimized(!minimized)
        setDismissed(false)
        localStorage.setItem('guide_hidden', String(!minimized))
    }

    if (!visible) return null

    const tip = currentTips[tipIndex]

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Speech bubble */}
            {!minimized && !dismissed && (
                <div className="relative max-w-[280px] animate-fadeIn">
                    <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-2xl rounded-br-sm p-4 shadow-xl shadow-black/20">
                        {/* Close */}
                        <button onClick={handleDismiss}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 transition">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <p className="text-sm text-gray-300 leading-relaxed pr-4">
                            {isKo ? tip.ko : tip.zh}
                        </p>

                        {/* Tip dots */}
                        {currentTips.length > 1 && (
                            <div className="flex items-center gap-1 mt-3">
                                {currentTips.map((_, i) => (
                                    <button key={i} onClick={() => setTipIndex(i)}
                                        className={`w-1.5 h-1.5 rounded-full transition ${i === tipIndex ? 'bg-blue-400' : 'bg-gray-600'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Character button */}
            <button onClick={handleToggle}
                className={`group relative w-16 h-16 transition-all duration-300 ${
                    minimized ? 'hover:scale-110' : 'scale-105'
                }`}
            >
                <div className="w-full h-full select-none">
                    <GuideHamster active={!minimized && !dismissed} />
                </div>

                {/* Notification dot */}
                {minimized && !dismissed && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse" />
                )}
            </button>
        </div>
    )
}
