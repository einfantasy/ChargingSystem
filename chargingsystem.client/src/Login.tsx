import React, { useState, type FormEvent } from 'react';
import type { User } from './types';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
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
        <div className="login-container" style={{ textAlign: 'center', marginTop: '100px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'inline-block', border: '1px solid #ccc', padding: '20px' }}>
                <h2>系统登录</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                    <input
                        type="text"
                        placeholder="用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <br />
                <div>
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <br />
                <button type="submit">进入系统</button>
            </form>
        </div>
    );
};