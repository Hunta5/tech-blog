'use client';

import { useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const json = await res.json();

        if (json.code !== 0) {
            alert(json.message);
            return;
        }

        localStorage.setItem('token', json.data);
        alert('登录成功');
    };

    const handleRegister = async () => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const json = await res.json();

        if (!res.ok || json.code !== 0) {
            alert(json.message || '注册失败');
            return;
        }

        alert('注册成功，请登录');
    };

    return (
        <div className="min-h-screen bg-black-50 flex items-center justify-center">
            <div className="max-w-5xl w-full mx-auto px-6 py-16">

                <h1 className="text-4xl md:text-5xl font-bold mb-10
      bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500
      bg-clip-text text-transparent">
                    登录
                </h1>

                <div className="max-w-md space-y-6">
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                   focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="用户名"
                        onChange={e => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3
                   focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="密码"
                        onChange={e => setPassword(e.target.value)}
                    />

                    <button
                        onClick={handleLogin}
                        className="w-full py-3 rounded-lg font-semibold text-white
                   bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                   hover:opacity-90 transition">
                        登录
                    </button>

                    <button
                        onClick={handleRegister}
                        className="w-full py-3 rounded-lg font-semibold text-white
                   bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                   hover:opacity-90 transition">
                        注册
                    </button>

                </div>

            </div>
        </div>
    );
}