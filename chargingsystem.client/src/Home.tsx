import React, { useEffect, useState } from 'react';
import './App.css';
import type { Student, Teacher, DashboardInfo } from './types';
import StudentManagePage from "./components/StudentManage";
import TeacherManagePage from "./components/TeacherManage";
import ConsumeManagePage from "./components/ConsumeManage";
import {
    LayoutDashboard,
    Users,
    UserSquare2,
    Clock,
    ChevronLeft,
    ChevronRight,
    LogOut,
    School
} from 'lucide-react';

interface HomeProps {
    user: { username: string };
    onLogout: () => void;
}

// --- 辅助函数 ---
function isTokenExpired() {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() < Date.now();
}

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
    // --- 1. UI 状态 ---
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");

    // --- 2. 业务数据状态 ---
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>({
        totalMoney: "0",
        totalHours: "0",
        teacherCount: "0",
        studentCount: "0"
    });

    // --- 3. API 请求逻辑 ---
    const fetchDashboard = async () => {
        try {
            const response = await fetch("/api/util/dashboard", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (response.ok) {
                const data = await response.json();
                setDashboardInfo(data);
            }
        } catch (error) {
            console.error("看板数据获取失败:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/student/list", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("学生列表获取失败:", error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await fetch("/api/teacher/list", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error("教师列表获取失败:", error);
        }
    };

    // --- 4. Token 检查逻辑 ---
    const refreshToken = async () => {
        try {
            const response = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("expiresAt", data.expiresAt);
                setShowWarning(false);
            } else {
                onLogout();
            }
        } catch {
            onLogout();
        }
    };

    const checkTokenStatus = () => {
        const expiresAt = localStorage.getItem("expiresAt");
        if (!expiresAt) {
            onLogout();
            return;
        }

        const expiryTime = new Date(expiresAt).getTime();
        const now = Date.now();
        const timeLeft = expiryTime - now;

        if (timeLeft <= 0) {
            onLogout();
            return;
        }

        const fiveMinutes = 5 * 60 * 1000;
        if (timeLeft <= fiveMinutes) {
            const minsLeft = Math.ceil(timeLeft / 60000);
            setWarningMessage(`登录将在 ${minsLeft} 分钟后过期，是否继续？`);
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }
    };

    // --- 5. 副作用 ---
    useEffect(() => {
        const load = async () => {
            await fetchStudents();
            await fetchTeachers();
            await fetchDashboard();
        };

        load();

        if (isTokenExpired()) {
            onLogout();
            return;
        }

        checkTokenStatus();

        const tokenCheckInterval = setInterval(() => {
            checkTokenStatus();
        }, 60000);

        return () => clearInterval(tokenCheckInterval);
    }, [onLogout]);

    const handleRefreshToken = async () => {
        await refreshToken();
        setShowWarning(false);
    };

    const handleContinue = () => {
        handleRefreshToken();
    };

    // --- 6. 配置项 ---
    const menuItems = [
        { key: "dashboard", label: "首页", icon: <LayoutDashboard size={22} /> },
        { key: "students", label: "学生管理", icon: <Users size={22} /> },
        { key: "teachers", label: "教师管理", icon: <UserSquare2 size={22} /> },
        { key: "consume", label: "课时管理", icon: <Clock size={22} /> },
    ];

    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white">
            {/* Token 过期警告弹窗 */}
            {showWarning && (
                <div className="modal-overlay">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-[90%] sm:w-96 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">登录即将过期</h3>
                        <p className="text-gray-600 mb-6">{warningMessage}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                退出登录
                            </button>
                            <button
                                onClick={handleContinue}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                继续使用
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex h-screen">

                {/* 移动端菜单遮罩 */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* 侧边栏 Sidebar */}
                <div className={`
                    fixed lg:relative z-30 lg:z-0
                    transition-all duration-300 ease-in-out 
                    border-r border-white/10 bg-black/20 backdrop-blur-sm
                    h-full
                    ${isCollapsed ? "w-18" : "w-64"}
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-12 bg-purple-900 rounded-full p-1 border border-white/20 hover:bg-purple-500 transition-colors z-10"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    <div className="p-4">
                        <h1 className={`font-bold mb-8 transition-all duration-300 flex items-center justify-center ${isCollapsed ? "" : "px-2"}`}>
                            {isCollapsed ? (
                                <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400">
                                    <School size={20} />
                                </div>
                            ) : (
                                <span className="text-xl lg:text-2xl font-extrabold truncate tracking-wider whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                                    开元大学堂
                                </span>
                            )}
                        </h1>

                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <div
                                    key={item.key}
                                    title={isCollapsed ? item.label : ""}
                                    className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200
                                        ${activeMenu === item.key
                                            ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                                            : "hover:bg-white/10 text-slate-300"
                                        }`}
                                    onClick={() => {
                                        setActiveMenu(item.key);
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {!isCollapsed && <span className="ml-3 font-medium truncate">{item.label}</span>}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* 主内容区域 Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 顶部 Header */}
                    <div className="flex justify-between items-center p-4 lg:p-6">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
                            >
                                <LayoutDashboard size={24} />
                            </button>
                            <h2 className="text-lg lg:text-xl">你好, {user?.username || "未知用户"}</h2>
                        </div>
                        <button
                            onClick={onLogout}
                            className="
                                flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg 
                                bg-red-500/80 text-white text-sm font-medium
                                transition-all duration-300 ease-out
                                hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]
                                active:scale-95 group
                            "
                        >
                            <LogOut size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                            <span className="hidden sm:inline">退出登录</span>
                        </button>
                    </div>

                    {/* 路由视图 */}
                    <div className="flex-1 overflow-auto p-4 lg:p-6 pt-0">
                        <div className="text-slate-900">
                            {activeMenu === "dashboard" && <Dashboard dashboardInfo={dashboardInfo} />}
                            {activeMenu === "teachers" && <TeacherManagePage teachers={teachers} fetchTeachers={fetchTeachers} />}
                            {activeMenu === "students" && <StudentManagePage students={students} fetchStudents={fetchStudents} />}
                            {activeMenu === "consume" && <ConsumeManagePage teachers={teachers} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 子组件：看板 ---
function Dashboard({ dashboardInfo }: { dashboardInfo: DashboardInfo; }) {
    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white">数据总览</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card title="总课时" value={dashboardInfo.totalHours} />
                <Card title="总收入" value={`¥${dashboardInfo.totalMoney}`} />
                <Card title="教师人数" value={dashboardInfo.teacherCount} />
                <Card title="活跃学生" value={dashboardInfo.studentCount} />
            </div>
        </div>
    );
}

// --- 子组件：卡片 ---
function Card({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white p-3 lg:p-4 rounded shadow transition-hover hover:shadow-md">
            <div className="text-gray-500 text-xs lg:text-sm">{title}</div>
            <div className="text-lg lg:text-xl font-bold text-slate-800">{value}</div>
        </div>
    );
}