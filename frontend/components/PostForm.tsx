'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type PostData = {
    slug: string
    title: string
    date: string
    summary: string
    content: string
}

type FormData = {
    title: string
    slug: string
    content: string
    summary: string
}

type ViewMode = 'list' | 'create' | 'edit'

export default function PostForm() {
    const { t } = useLanguage()
    const [mode, setMode] = useState<ViewMode>('list')
    const [posts, setPosts] = useState<PostData[]>([])
    const [form, setForm] = useState<FormData>({ title: '', slug: '', content: '', summary: '' })
    const [editingSlug, setEditingSlug] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch('/api/posts')
            const json = await res.json()
            if (json.code === 0) setPosts(json.data)
        } catch {
            // ignore
        }
    }, [])

    useEffect(() => { fetchPosts() }, [fetchPosts])

    const resetForm = () => {
        setForm({ title: '', slug: '', content: '', summary: '' })
        setEditingSlug(null)
        setError(null)
        setSuccess(null)
    }

    const goToList = () => {
        resetForm()
        setMode('list')
        fetchPosts()
    }

    const goToCreate = () => {
        resetForm()
        setMode('create')
    }

    const goToEdit = async (slug: string) => {
        setError(null)
        setSuccess(null)
        try {
            const res = await fetch(`/api/posts/${slug}`)
            const json = await res.json()
            if (json.code === 0) {
                const p = json.data
                setForm({ title: p.title, slug: p.slug, content: p.content, summary: p.summary || '' })
                setEditingSlug(p.slug)
                setMode('edit')
            }
        } catch {
            setError(t('blog.loadFailed'))
        }
    }

    const handleDelete = async (slug: string) => {
        if (!confirm(`${t('blog.confirmDelete')}`)) return
        try {
            const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
            const json = await res.json()
            if (json.code === 0) {
                fetchPosts()
            } else {
                alert(json.message || t('blog.deleteFailed'))
            }
        } catch {
            alert(t('blog.deleteError'))
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value
        setForm((prev) => ({
            ...prev,
            title,
            ...(mode === 'create' ? { slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}),
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        if (!form.title || !form.slug || !form.content) {
            setError(t('blog.required'))
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const json = await res.json()

            if (json.code !== 0) {
                throw new Error(json.message || t('blog.deleteFailed'))
            }

            setSuccess(mode === 'edit' ? t('blog.editSuccess') : t('blog.publishSuccess'))
            setTimeout(() => goToList(), 1000)
        } catch (e: unknown) {
            setError((e as Error).message || t('blog.deleteError'))
        } finally {
            setLoading(false)
        }
    }

    // ───── List View ─────
    if (mode === 'list') {
        return (
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {t('blog.title')}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToCreate}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('blog.newPost')}
                        </button>
                        <button
                            onClick={() => { localStorage.removeItem('token'); window.dispatchEvent(new Event('storage')) }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 bg-gray-800 border border-gray-700 hover:text-white transition"
                            title={t('blog.logout')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t('blog.logout')}
                        </button>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 mb-4">{t('blog.noPosts')}</p>
                        <button onClick={goToCreate} className="text-blue-400 hover:text-blue-300 transition text-sm">
                            {t('blog.writeFirst')} &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map((post) => (
                            <div
                                key={post.slug}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/50 border border-gray-700 rounded-xl px-5 py-4 hover:border-gray-600 transition"
                            >
                                <div className="flex-1 min-w-0">
                                    <Link href={`/posts/${post.slug}`} className="text-white font-medium hover:text-blue-400 transition truncate block">
                                        {post.title}
                                    </Link>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span>{post.date}</span>
                                        <span className="text-gray-700">·</span>
                                        <span className="text-gray-600 font-mono">{post.slug}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        href={`/posts/${post.slug}`}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition"
                                    >
                                        {t('blog.view')}
                                    </Link>
                                    <button
                                        onClick={() => goToEdit(post.slug)}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
                                    >
                                        {t('blog.edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.slug)}
                                        className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                                    >
                                        {t('blog.delete')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // ───── Create / Edit View ─────
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16">
            {/* 返回按钮 */}
            <button
                onClick={goToList}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('blog.backToList')}
            </button>

            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {mode === 'edit' ? t('blog.editPost') : t('blog.createPost')}
            </h1>
            <div className="mb-10 text-center">
                <p className="text-gray-400 text-sm">
                    {mode === 'edit' ? `${t('blog.editingNote')}: ${editingSlug}` : t('blog.markdownNote')}
                </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-10 shadow-xl space-y-6">
                {/* 标题 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('blog.titleLabel')}</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleTitleChange}
                        placeholder={t('blog.titlePlaceholder')}
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Slug</label>
                    <input
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        placeholder="url-friendly-slug"
                        disabled={mode === 'edit'}
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* 摘要 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('blog.summaryLabel')}</label>
                    <textarea
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        rows={2}
                        placeholder={t('blog.summaryPlaceholder')}
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
                    />
                </div>

                {/* 内容 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('blog.contentLabel')}</label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={16}
                        placeholder={t('blog.contentPlaceholder')}
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                </div>

                {/* 错误 / 成功 提示 */}
                {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                        {success}
                    </div>
                )}

                {/* 按钮 */}
                <div className="pt-4 flex justify-end gap-3">
                    <button
                        onClick={goToList}
                        className="px-5 py-2.5 rounded-lg font-medium text-gray-400 bg-gray-700/50 hover:bg-gray-700 transition text-sm"
                    >
                        {t('blog.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {loading ? t('blog.saving') : mode === 'edit' ? t('blog.update') : t('blog.publish')}
                    </button>
                </div>
            </div>
        </div>
    )
}
