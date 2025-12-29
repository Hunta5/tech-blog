import {getAllPosts} from '@/lib/posts';
import Link from 'next/link';

export default function HomePage() {
    const posts = getAllPosts();

    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            {/* Hero Section */}
            <div className="mb-20 text-center">
                <div className="inline-block mb-4">
          <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            持续更新中
          </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    欢迎来到我的技术博客
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    记录学习与成长的点点滴滴，分享技术心得与开发经验
                </p>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div
                    className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{posts.length}</div>
                    <div className="text-gray-400">技术文章</div>
                </div>
                <div
                    className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                    <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
                    <div className="text-gray-400">技术分类</div>
                </div>
                <div
                    className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6">
                    <div className="text-3xl font-bold text-pink-400 mb-2">1k+</div>
                    <div className="text-gray-400">总阅读量</div>
                </div>
            </div>

            {/* 文章列表 */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    最新文章
                </h2>

                <div className="space-y-6">
                    {posts.map((post, index) => (
                        <Link
                            key={post.slug}
                            href={`/posts/${post.slug}`}
                            className="block group"
                        >
                            <article
                                className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                                {/* 序号装饰 */}
                                <div
                                    className="absolute -left-3 top-6 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                                            {post.title}
                                        </h3>

                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <time className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                {post.date}
                                            </time>

                                            <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                        5 分钟阅读
                      </span>
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center text-blue-400 group-hover:translate-x-2 transition-transform">
                                        <span className="text-sm font-medium">阅读全文</span>
                                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 空状态 */}
            {posts.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">暂无文章</h3>
                    <p className="text-gray-500">第一篇文章即将发布，敬请期待！</p>
                </div>
            )}
        </div>
    );
}