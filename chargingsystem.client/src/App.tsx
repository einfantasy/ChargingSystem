import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { Home } from './Home';
import type { User } from './types';

function App() {
    //const [user, setUser] = useState<User | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [user, setUser] = useState(() => {
        // 渲染前就读好数据，一步到位
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const verifyUser = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    // 模拟异步请求
                    // await api.verifyToken(JSON.parse(savedUser).token);
                    setUser(JSON.parse(savedUser));
                } catch {
                    localStorage.removeItem('user');
                }
            }
            // 异步操作结束后修改状态，这不会触发警告
            setIsChecking(false);
        };

        verifyUser();
    }, []);

    const handleLogin = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (isChecking) return <div>正在加载应用...</div>;

    return (
        <BrowserRouter>
            <Routes>
                {/* 登录页：如果已登录，重定向到首页 */}
                <Route path="/login" element={
                    !user ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/" />
                } />

                {/* 首页：如果未登录，重定向到登录页 */}
                <Route path="/" element={
                    user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />

                {/* 捕获所有其他路径 */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;