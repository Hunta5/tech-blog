import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'posts')

type Context = { params: Promise<{ slug: string }> }

// GET /api/posts/[slug] — get single post
export async function GET(_req: NextRequest, context: Context) {
    const { slug } = await context.params
    const filePath = path.join(postsDir, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ code: 1, message: '게시글을 찾을 수 없습니다' }, { status: 404 })
    }

    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)

    return NextResponse.json({
        code: 0,
        data: {
            slug,
            title: data.title || slug,
            date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date || '',
            summary: data.summary || '',
            content,
        },
    })
}

// DELETE /api/posts/[slug] — delete a post
export async function DELETE(_req: NextRequest, context: Context) {
    const { slug } = await context.params
    const filePath = path.join(postsDir, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ code: 1, message: '게시글을 찾을 수 없습니다' }, { status: 404 })
    }

    fs.unlinkSync(filePath)
    return NextResponse.json({ code: 0, message: '삭제 성공' })
}
