import React, { useEffect, useState } from 'react';
import './App.css';
import type { Student } from './types';
import StudentManagePage from "./components/StudentManage";

interface HomeProps {
    user: { username: string };
    onLogout: () => void;
}
interface RecordItem {
    id: number;
    student: string;
    course: string;
    hours: number;
    price: number;
    date: string;
}

function isTokenExpired() {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) return true;

    return new Date(expiresAt).getTime() < Date.now();
}

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
    //const [forecasts, setForecasts] = useState<Forecast[]>();

    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

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

    useEffect(() => {
        const load = async () => {
            await fetchStudents();
        };

        load();

        if (isTokenExpired()) {
            onLogout();
        }
    }, [onLogout]);

    return (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-36 shadow-md p-4 ">
                    <h1 className="text-lg font-bold mb-8">开元大学堂</h1>
                    {[
                        { key: "dashboard", label: "首页" },
                        { key: "students", label: "学生管理" },
                        { key: "teachers", label: "教师管理" },
                        { key: "courses", label: "课时管理" },
                    ].map((item) => (
                        <div
                            key={item.key}
                            className={`p-2 cursor-pointer rounded ${activeMenu === item.key ? "bg-blue-500 text-white" : ""
                                }`}
                            onClick={() => setActiveMenu(item.key)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>你好, {user?.username || "未知用户"}</h2>
                        {/* 使用 ?. 确保 user 不为 null，使用 || 提供保底显示 */}
                        <button onClick={onLogout} className="m-4 w-24 py-2 rounded-lg btn-gradient">退出登录</button>
                    </div>

                    {activeMenu === "dashboard" && <Dashboard records={records} />}
                    {activeMenu === "students" && <StudentManagePage students={students} fetchStudents={fetchStudents} />}
                </div>
            </div>
        </div >
    );
};

// Dashboard Page
function Dashboard({ records }: { records: RecordItem[] }) {
    const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
    const totalMoney = records.reduce((sum, r) => sum + r.hours * r.price, 0);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">数据总览</h2>
            <div className="grid grid-cols-3 gap-4">
                <Card title="总课时" value={totalHours} />
                <Card title="总收入" value={`¥${totalMoney}`} />
                <Card title="记录数" value={records.length} />
            </div>
        </div>
    );
}

function Card({ title, value }: any) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="text-gray-500">{title}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}


