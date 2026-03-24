import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import PostContent from '@/components/PostContent'

type Props = {
    params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params
    const fullPath = path.join(process.cwd(), 'posts', `${slug}.md`)

    if (!fs.existsSync(fullPath)) {
        return (
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
                    <p className="text-gray-400 mb-8">The post you are looking for does not exist.</p>
                    <Link href="/articles" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Home
                    </Link>
                </div>
            </div>
        )
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { content, data } = matter(fileContents)
    const date = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date

    return <PostContent title={data.title} date={date} content={content} />
}
