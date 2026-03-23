import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'posts')

// GET /api/posts — list all posts
export async function GET() {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
    const posts = files.map((fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const raw = fs.readFileSync(path.join(postsDir, fileName), 'utf8')
        const { data, content } = matter(raw)
        return {
            slug,
            title: data.title || slug,
            date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date || '',
            summary: data.summary || '',
            content,
        }
    })
    posts.sort((a, b) => (b.date > a.date ? 1 : -1))
    return NextResponse.json({ code: 0, data: posts })
}

// POST /api/posts — create or update a post
export async function POST(req: NextRequest) {
    const body = await req.json()
    const { title, slug, content, summary } = body

    if (!title || !slug || !content) {
        return NextResponse.json({ code: 1, message: '제목, slug, 내용은 필수입니다' }, { status: 400 })
    }

    // sanitize slug
    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '')
    if (!safeSlug) {
        return NextResponse.json({ code: 1, message: '유효하지 않은 slug입니다' }, { status: 400 })
    }

    const date = new Date().toISOString().split('T')[0]
    const filePath = path.join(postsDir, `${safeSlug}.md`)

    // preserve original date if editing existing post
    let existingDate = date
    if (fs.existsSync(filePath)) {
        const existing = matter(fs.readFileSync(filePath, 'utf8'))
        if (existing.data.date) {
            existingDate = existing.data.date instanceof Date
                ? existing.data.date.toISOString().split('T')[0]
                : existing.data.date
        }
    }

    const frontmatter = [
        '---',
        `title: "${title.replace(/"/g, '\\"')}"`,
        `date: "${existingDate}"`,
        summary ? `summary: "${summary.replace(/"/g, '\\"')}"` : null,
        '---',
    ].filter(Boolean).join('\n')

    const fileContent = `${frontmatter}\n\n${content}\n`
    fs.writeFileSync(filePath, fileContent, 'utf8')

    return NextResponse.json({ code: 0, message: '성공', data: { slug: safeSlug } })
}
