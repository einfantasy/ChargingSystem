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
    LogOut
} from 'lucide-react';


interface HomeProps {
    user: { username: string };
    onLogout: () => void;
}

function isTokenExpired() {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) return true;

    return new Date(expiresAt).getTime() < Date.now();
}

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
    //const [forecasts, setForecasts] = useState<Forecast[]>();

    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const initialDashboard: DashboardInfo = {
        totalMoney: "0",
        totalHours: "0",
        teacherCount: "0",
        studentCount: "0"
    };
    const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>(initialDashboard);

    const fetchDashboard = async () => {
        try {
            const response = await fetch("/api/util/dashboard", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDashboardInfo(data);
            } else {
                console.error("请求失败:", response.status);
            }
        } catch (error) {
            console.error("网络错误:", error);
        }
    }

    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/student/list", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                console.error("请求失败:", response.status);
            }
        } catch (error) {
            console.error("网络错误:", error);
        }
    }

    const fetchTeachers = async () => {
        try {
            const response = await fetch("/api/teacher/list", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            } else {
                console.error("请求失败:", response.status);
            }
        } catch (error) {
            console.error("网络错误:", error);
        }
    }

    useEffect(() => {
        const load = async () => {
            await fetchStudents();
            await fetchTeachers();
            await fetchDashboard();
        };

        load();

        if (isTokenExpired()) {
            onLogout();
        }
    }, [onLogout]);

    const [isCollapsed, setIsCollapsed] = useState(false); // 控制折叠状态

    const menuItems = [
        { key: "dashboard", label: "首页", icon: <LayoutDashboard size={20} /> },
        { key: "students", label: "学生管理", icon: <Users size={20} /> },
        { key: "teachers", label: "教师管理", icon: <UserSquare2 size={20} /> },
        { key: "consume", label: "课时管理", icon: <Clock size={20} /> },
    ];

    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div
                    className={`relative transition-all duration-300 ease-in-out border-r border-white/10 bg-black/20 backdrop-blur-sm
            ${isCollapsed ? "w-18" : "w-64"}`}
                >
                    {/* 折叠切换按钮 */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-12 bg-purple-900 rounded-full p-1 border border-white/20 hover:bg-purple-500 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    <div className="p-4">
                        <h1 className={`font-bold mb-8 transition-all duration-300 truncate ${isCollapsed ? "text-center text-sm" : "text-lg px-2"}`}>
                            {isCollapsed ? "开元" : "开元大学堂"}
                        </h1>

                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <div
                                    key={item.key}
                                    title={isCollapsed ? item.label : ""} // 折叠时显示悬浮文字
                                    className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200
                    ${activeMenu === item.key
                                            ? "bg-blue-600 shadow-lg shadow-blue-500/30 text-white"
                                            : "hover:bg-white/10 text-slate-300"
                                        }`}
                                    onClick={() => setActiveMenu(item.key)}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>你好, {user?.username || "未知用户"}</h2>
                        <button
                            onClick={onLogout}
                            className="
                                flex items-center gap-2 px-4 py-2 rounded-lg 
                                bg-red-500/80 text-white text-sm font-medium
                                transition-all duration-300 ease-out
                                /* 悬浮效果：变色 + 放大 + 阴影 */
                                hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]
                                /* 点击效果：缩小 */
                                active:scale-95 
                                group
                            "
                        >
                            <LogOut
                                size={16}
                                className="transition-transform duration-300 group-hover:-translate-x-1"
                            />
                            <span>退出登录</span>
                        </button>
                    </div>

                    {activeMenu === "dashboard" && <Dashboard dashboardInfo={dashboardInfo} />}
                    {activeMenu === "teachers" && <TeacherManagePage teachers={teachers} fetchTeachers={fetchTeachers} />}
                    {activeMenu === "students" && <StudentManagePage students={students} fetchStudents={fetchStudents} />}
                    {activeMenu === "consume" && <ConsumeManagePage teachers={teachers} />}
                </div>
            </div>
        </div >
    );
};

// Dashboard Page
function Dashboard({ dashboardInfo }: { dashboardInfo: DashboardInfo; }) {

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">数据总览</h2>
            <div className="grid grid-cols-2 gap-4 ">
                <Card title="总课时" value={dashboardInfo.totalHours} />
                <Card title="总收入" value={`¥${dashboardInfo.totalMoney}`} />
                <Card title="教师人数" value={dashboardInfo.teacherCount} />
                <Card title="活跃学生" value={dashboardInfo.studentCount} />
            </div>
        </div>
    );
}

function Card({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500">{title}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}


