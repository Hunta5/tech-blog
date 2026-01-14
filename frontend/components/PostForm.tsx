'use client';

import { useState } from 'react';

type PostFormData = {
    title: string;
    slug: string;
    content: string;
    summary?: string;
};

export default function PostForm() {
    const [form, setForm] = useState<PostFormData>({
        title: '',
        slug: '',
        content: '',
        summary: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        if (!token) {
            setError('请先登录');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
                body: JSON.stringify(form),
            });

            // 检查是否成功获取响应
            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = '请求失败';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorText || `HTTP ${res.status}`;
                } catch {
                    errorMessage = errorText || `HTTP ${res.status}`;
                }
                throw new Error(errorMessage);
            }

            const json = await res.json();

            if (json.code !== 0) {
                throw new Error(json.message || '创建失败');
            }

            alert('创建成功 🎉');
            setForm({ title: '', slug: '', content: '', summary: '' });

        } catch (e: unknown) {
            const error = e as Error;
            setError(error.message || '发生未知错误');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="max-w-6xl min-w-5xl mx-auto px-6 py-16">
            {/* 页面标题 */}
            <h1 className="text-center text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                新建博客文章
            </h1>

            <div className="mb-12 text-center">
                <p className="text-gray-400">
                    记录你的技术思考与成长 ✍️
                </p>
            </div>

            {/* 表单卡片 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-10 shadow-xl space-y-6">
                {/* 标题 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">标题</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="请输入文章标题"
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                </div>

                {/* slug */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Slug</label>
                    <input
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        placeholder="spring-boot-postgres"
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    />
                </div>

                {/* 摘要 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">摘要</label>
                    <textarea
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        rows={3}
                        placeholder="简要描述文章内容"
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
                    />
                </div>

                {/* 正文 */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">正文内容</label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={10}
                        placeholder="在这里开始写你的文章..."
                        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                        {error}
                    </div>
                )}

                {/* 提交按钮 */}
                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="
              inllinear items-center gap-2 px-6 py-3 rounded-xl font-medium text-white
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
              hover:opacity-90 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {loading && (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {loading ? '提交中...' : '发布文章'}
                    </button>
                </div>
            </div>
        </div>
    );
}