import Link from 'next/link'
import ResumeViewer from '@/components/ResumeViewer'

export default function AboutPage() {
    const career = [
        { company: '어니컴 (ONYCOM)', role: 'Senior iOS SDK Engineer', period: '2024.10 ~ 재직중', product: 'IMQA APM SDK (iOS / Flutter / React Native)', color: 'blue' },
        { company: 'APUS', role: 'iOS App Developer', period: '2021.03 ~ 2024.05', product: 'Vieka — Music Video Editor', color: 'purple' },
        { company: 'B612 (SNOW Corp.)', role: 'iOS App Developer', period: '2020.09 ~ 2021.02', product: '轻图 — Photo/Video Editor (DAU 5만+)', color: 'green' },
        { company: '玖富数科 (NASDAQ)', role: 'iOS App Developer', period: '2018.04 ~ 2020.08', product: '玖富万卡 — FinTech (DAU 80만+, DL 1,000만+)', color: 'red' },
        { company: '新奥集团 (ENN Group)', role: 'iOS App Developer', period: '2016.03 ~ 2018.04', product: '质采智购 — B2B 구매 플랫폼 (직원 4만+)', color: 'pink' },
        { company: 'Oasis Games', role: 'iOS Developer / Team Lead', period: '2014.03 ~ 2016.02', product: '芦花, iTools, Mizah Istasyonu (3개국 출시)', color: 'yellow' },
        { company: '참 (CHARM) — BOE', role: '산업용 SW 개발자', period: '2013.07 ~ 2014.02', product: 'BOE 디스플레이 생산라인 산업용 소프트웨어', color: 'cyan' },
    ]

    const coreSkills = [
        { label: 'iOS Native', items: ['Swift', 'Objective-C', 'SwiftUI', 'C/C++'] },
        { label: 'Cross-Platform', items: ['Flutter', 'React Native'] },
        { label: 'Architecture', items: ['MVVM', 'Clean Architecture (RIBs)', 'TCA'] },
        { label: 'Core Libraries', items: ['RxSwift', 'Combine', 'Alamofire', 'OpenTelemetry', 'Metal', 'AVFoundation'] },
        { label: 'DevOps', items: ['Jenkins', 'GitHub Actions', 'Fastlane', 'Tuist', 'CocoaPods', 'SPM'] },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
                {/* 面包屑导航 */}
                <nav className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        홈페이지로 돌아가기
                    </Link>
                </nav>

                {/* 头部区域 */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold text-white">
                                    박용
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                박 용
                            </h1>
                            <p className="text-xl text-gray-400 mb-4">
                                Senior iOS Developer · 12+ Years Experience
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    한국 · 서울
                                </span>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    12년+ 경력
                                </span>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    중국어 · 한국어 · 영어
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <a
                            href="https://github.com/Hunta5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span>GitHub</span>
                        </a>
                        <a
                            href="mailto:piaoyong.com@hotmail.com"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email</span>
                        </a>
                    </div>
                </div>

                {/* Highlight Stats */}
                <section className="mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                            <div className="text-3xl font-bold text-blue-400 mb-1">12+</div>
                            <div className="text-sm text-gray-400">Years iOS 개발 경력</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                            <div className="text-3xl font-bold text-purple-400 mb-1">1,000만+</div>
                            <div className="text-sm text-gray-400">Downloads (玖富万卡, 轻图)</div>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6">
                            <div className="text-3xl font-bold text-pink-400 mb-1">80만+</div>
                            <div className="text-sm text-gray-400">DAU (玖富万卡, 轻图)</div>
                        </div>
                    </div>
                </section>

                {/* Core Skills - 精简版 */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        Core Skills
                    </h2>
                    <div className="space-y-4">
                        {coreSkills.map((group) => (
                            <div key={group.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider w-36 shrink-0">{group.label}</span>
                                <div className="flex flex-wrap gap-2">
                                    {group.items.map((item) => (
                                        <span key={item} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Career Timeline - 精简时间线 */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        Career Timeline
                    </h2>
                    <div className="relative">
                        {/* 竖线 */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-700 hidden sm:block"></div>

                        <div className="space-y-4">
                            {career.map((job, index) => (
                                <div key={index} className="relative flex gap-4 sm:gap-6 items-start">
                                    {/* 圆点 */}
                                    <div className="hidden sm:flex shrink-0 w-[15px] h-[15px] mt-1.5 rounded-full bg-blue-500 border-2 border-gray-900 ring-2 ring-blue-500/30 z-10"></div>

                                    {/* 内容 */}
                                    <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-5 py-4 hover:border-blue-500/30 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                            <h3 className="text-white font-semibold text-sm">{job.company}</h3>
                                            <span className="text-xs text-gray-500">{job.period}</span>
                                        </div>
                                        <p className="text-blue-400 text-xs mb-1">{job.role}</p>
                                        <p className="text-gray-400 text-xs">{job.product}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 简历详情 */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        이력서 / Resume
                    </h2>
                    <ResumeViewer />
                </section>

                {/* 联系方式 */}
                <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Let&apos;s Connect!</h2>
                    <p className="text-gray-400 mb-6">
                        제 글에 관심이 있으시거나 기술적인 문제에 대해 논의하고 싶으시다면 아래 방법으로 언제든지 연락 주시기 바랍니다.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:piaoyong.com@hotmail.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            이메일 보내기
                        </a>
                        <a
                            href="https://github.com/Hunta5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-all font-medium"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub를 팔로우하세요
                        </a>
                    </div>
                </section>
            </div>
        </div>
    )
}
