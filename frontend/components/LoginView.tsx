'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LoginPage() {
    const { t } = useLanguage()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) return
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const json = await res.json()

            if (json.code !== 0) {
                setError(json.message || t('login.failed'))
                return
            }

            localStorage.setItem('token', json.data)
            window.dispatchEvent(new Event('storage'))
        } catch {
            setError(t('login.failed'))
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
            <div className="max-w-sm mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{t('login.title')}</h1>
                    <p className="text-sm text-gray-500">{t('login.adminOnly')}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">{t('login.username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            placeholder={t('login.username')}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">{t('login.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            placeholder={t('login.password')}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading || !username.trim() || !password.trim()}
                        className="w-full py-2.5 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? t('login.loggingIn') : t('login.loginBtn')}
                    </button>
                </div>
            </div>
        </div>
    )
}
