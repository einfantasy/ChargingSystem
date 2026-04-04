import React, { useState, type SyntheticEvent } from 'react';
import type { User } from './types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data: User = await response.json();
                console.log("后端返回的原始数据:", data)
                onLoginSuccess(data);
            } else {
                const msg = await response.text();
                setError(msg || '登录失败');
            }
        } catch {
            setError('无法连接到服务器');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm p-8 rounded-2xl bg-white/20 backdrop-blur-lg shadow-xl border border-white/30"
            >
                <h2 className="text-2xl font-bold text-center text-white mb-6">
                    系统登录
                </h2>

                {error && (
                    <p className="text-red-200 text-sm mb-4 text-center">{error}</p>
                )}

                {/* 用户名 */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg bg-white/80 focus:bg-white outline-none border border-transparent focus:border-indigo-400 transition"
                    />
                </div>

                {/* 密码 */}
                <div className="mb-6">
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg bg-white/80 focus:bg-white outline-none border border-transparent focus:border-indigo-400 transition"
                    />
                </div>

                {/* 按钮 */}
                <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold
                     hover:bg-indigo-700 active:scale-95 transition transform"
                >
                    进入系统
                </button>
            </form>
        </div>
    );
};