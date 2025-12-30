import Link from 'next/link'

export default function AboutPage() {
    const techStacks = {
        launguage:['중국어', '한국어', '영어'],
        frontend: ['Swift', 'Object-C', 'Flutter', 'React Native', 'Next.js', 'TypeScript', 'C++', 'C'],
        backend: ['Node.js', 'Express', 'JAVA', 'Spring boot'],
        devops: ['Docker', 'Nginx'],//, 'Kubernetes', 'CI/CD', 'AWS'],
        tools: ['Git', 'VS Code', 'Postman', 'Figma', 'Xcode', 'Charles', 'Cocoapods', 'Fastlane', 'SPM', 'Tuist', 'Jenkins', 'Appium', 'Confluence / Notion', 'Jira']
    }

    const workExperience = [
        {
            title: 'iOS SDK 개발엔지니어',
            company: '어니컴 (ONYCOM)',
            period: '2024.10 - 현재',
            color: 'blue',
            responsibilities: [
                'SDK: IMQASDK (성능관찰형 SDK)',
                '기능: App-lifecycle, Render-lifecycle, Tap-event, XHR, Memory, CPU, Battery, AppInfo, Network, Carrier, Crash 등을 모니터링',
                '개발내용: Opentelemetry 기반으로한 성능관찰형 APM iOS sdk',
                '개발내용: Opentelemetry 기반으로한 성능관찰형 APM Flutter sdk',
                '개발내용: Opentelemetry 기반으로한 성능관찰형 APM React native sdk',
            ]
        },
        {
            title: 'iOS App 개발엔지니어',
            company: 'Apus (麒麟合盛网络科技股份有限公司)',
            period: '2021.04 - 2024.03',
            color: 'purple',
            responsibilities: [
                '앱: Vieka (Video 편집앱)',
                '기능: Video 편집, Image 편집',
                '개발내용: 포토샵기능 metal에서 opengl로 바꾸기, 성능 최적화(렌더링 최적화, 시작 최적화, 패키지 크기 최적화, 메모리 누수 최적화). Base component 개발(Request, Storage, update system), 화면그리기',
                '업무SDK 적용: Applovin, AdMob, TiktopOpenSDK, Facebook (login/share), Firebase, Google Login',
                '프로젝트 적용 SDK: Alarmfire, Kingfisher, SwiftyJSON, Snapkit, IQKeyboardManagerSwift, fmdb, ffmpeg, Metal'
            ]
        },
        {
            title: 'iOS App 개발엔지니어',
            company: 'Snow (Snow지사: 北京视诺咨询有限责任公司)',
            period: '2020.09 - 2021.03',
            color: 'green',
            responsibilities: [
                '앱: B612, 轻图(카메라앱)',
                '기능: Image 편집',
                '개발내용: 본사개발한 포토샵기능 적용, 성능 최적화(렌더링 최적화, 시작 최적화, 패키지 크기 최적화, 메모리 누수 최적화). Base component 개발(Request, Storage, update system), 화면그리기',
                '업무SDK 적용: Firebase, Google Login',
                '프로젝트 적용 SDK: Alarmfire, Kingfisher, SwiftyJSON, Snapkit, IQKeyboardManagerSwift, fmdb'
            ]
        },
        {
            title: 'iOS App 개발엔지니어',
            company: '玖富数科科技集团有限责任公司',
            period: '2018.04 - 2020.08',
            color: 'red',
            responsibilities: [
                '앱: 제2금융권 앱(玖富万卡，小鱼富卡，伊贝卡)',
                '기능: 대출',
                '개발내용: 금융권에 적용되는 업무, 성능 최적화(렌더링 최적화, 시작 최적화, 패키지 크기 최적화, 메모리 누수 최적화). Base component 개발(Request, Storage, update system), 화면그리기',
                '업무SDK 적용: Firebase, Google Login등',
                '프로젝트 적용 SDK: Alarmfire, Kingfisher, SwiftyJSON, Snapkit, IQKeyboardManagerSwift, fmdb등'
            ]
        },
        {
            title: 'iOS App 개발엔지니어',
            company: '新奥集团',
            period: '2016.03 - 2018.04',
            color: 'pink',
            responsibilities: [
                '앱: ecommerce',
                '기능: 회사내부용 판매',
                '개발내용: 전자상거래업무, 성능 최적화(렌더링 최적화, 시작 최적화, 패키지 크기 최적화, 메모리 누수 최적화). Base component 개발(Request, Storage, update system), 화면그리기',
                '업무SDK 적용: 友盟, 科大讯飞등',
                '프로젝트 적용 SDK: AFNnetworking, SDWebImage, Masonry, IQKeyboardManagerSwift, ffmdb등'
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
            <div className="max-w-4xl mx-auto px-6 py-16">
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
                        {/* 头像 */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-5xl font-bold text-white">
                                    INTJ
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* 基本信息 */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                HUNTA
                            </h1>
                            <p className="text-xl text-gray-400 mb-4">
                                iOS 개발자
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
                                    12년 경력
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 社交链接 */}
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
                            href="mailto:hunta1005@naver.com"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email</span>
                        </a>

                        {/*<a*/}
                        {/*    href="https://twitter.com/yourusername"*/}
                        {/*    target="_blank"*/}
                        {/*    rel="noopener noreferrer"*/}
                        {/*    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-all"*/}
                        {/*>*/}
                        {/*    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">*/}
                        {/*        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />*/}
                        {/*    </svg>*/}
                        {/*    <span>Twitter</span>*/}
                        {/*</a>*/}
                    </div>
                </div>

                {/* 个人简介 */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        나에 대해
                    </h2>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4 text-gray-300 leading-relaxed">
                        <p>
                            👋 안녕하세요! 저는 모바일, 프론트엔드, 백엔드 개발에 열정을 가진 iOS개발 엔지니어입니다.
                        </p>
                        <p>
                            💻 저는 일상 업무에서 주로 iOS, Flutter, React Native와 같은 기술을 사용하며, Java API 개발과 React 프런트엔드 기술에 대한 깊이 있는 지식도 보유하고 있습니다.
                        </p>
                        <p>
                            📝 저는 학습 과정을 기록하고 블로그를 통해 기술적 통찰력을 공유하며, 더 많은 개발자들에게 도움을 주고자 합니다.
                        </p>
                        <p>
                            🎯 제 목표는 끊임없이 배우고 발전하여 뛰어난 기술 전문가가 되는 것입니다.
                        </p>
                    </div>
                </section>

                {/* 技术栈 */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        언어
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 언어 */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                            {/*<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">*/}
                            {/*    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                            {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />*/}
                            {/*    </svg>*/}
                            {/*    언어*/}
                            {/*</h3>*/}
                            <div className="flex flex-wrap gap-2">
                                {techStacks.launguage.map((launguage) => (
                                    <span key={launguage} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm">
                                        {launguage}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        기술 스택
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 前端 */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                프론트엔드 개발
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {techStacks.frontend.map((tech) => (
                                    <span key={tech} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 后端 */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                                백엔드 개발
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {techStacks.backend.map((tech) => (
                                    <span key={tech} className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* DevOps */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                DevOps
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {techStacks.devops.map((tech) => (
                                    <span key={tech} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 工具 */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                개발 도구
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {techStacks.tools.map((tech) => (
                                    <span key={tech} className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 工作经历 */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                        업무 경험
                    </h2>
                    <div className="space-y-6">
                        {workExperience.map((job, index) => (
                            <div key={index} className="relative bg-gray-800/50 border border-gray-700 rounded-xl p-6 pl-12">
                                <div className={`absolute left-6 top-6 w-3 h-3 bg-${job.color}-500 rounded-full ring-4 ring-${job.color}-500/20`}></div>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                    <span className="text-sm text-gray-400">{job.period}</span>
                                </div>
                                <p className={`text-${job.color}-400 mb-3`}>{job.company}</p>
                                <ul className="text-gray-300 space-y-2 text-sm">
                                    {job.responsibilities.map((resp, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className={`text-${job.color}-400 mt-1`}>•</span>
                                            <span>{resp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 联系方式 */}
                <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Let&apos;s Connect!</h2>
                    <p className="text-gray-400 mb-6">
                        제 글에 관심이 있으시거나 기술적인 문제에 대해 논의하고 싶으시다면 아래 방법으로 언제든지 연락 주시기 바랍니다.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:hunta1005@naver.com"
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