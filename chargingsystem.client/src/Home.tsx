import React, { useEffect, useState } from 'react';
import './App.css';
import type { Forecast } from './types';

interface HomeProps {
    user: { username: string };
    onLogout: () => void;
}

interface Student {
    student_Id: string;
    name: string;
    balance: number;
}

interface RecordItem {
    id: number;
    student: string;
    course: string;
    hours: number;
    price: number;
    date: string;
}

// mock data
//const students: Student[] = [
//    { id: "1", name: "Alice", balance: 500 },
//    { id: "2", name: "Bob", balance: 500 },
//];

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
    const [forecasts, setForecasts] = useState<Forecast[]>();

    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [records, setRecords] = useState<RecordItem[]>([]);

    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        populateWeatherData();
        fetchStudentBalance();
    }, []);

    const contents = forecasts === undefined
        ? <p><em>Loading...</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Temp. (C)</th>
                    <th>Temp. (F)</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody>
                {forecasts.map(forecast =>
                    <tr key={forecast.date}>
                        <td>{forecast.date}</td>
                        <td>{forecast.temperatureC}</td>
                        <td>{forecast.temperatureF}</td>
                        <td>{forecast.summary}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        //<div>
        //    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        //        <h1>你好, {user?.username || "未知用户"}</h1>
        //        {/* 使用 ?. 确保 user 不为 null，使用 || 提供保底显示 */}
        //        <button onClick={onLogout}>退出登录</button>
        //    </div>
        //    <p>这是从 ASP.NET 后端获取的受保护数据：</p>
        //    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        //        {contents}
        //    </div>
        //</div>
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>你好, {user?.username || "未知用户"}</h1>
                {/* 使用 ?. 确保 user 不为 null，使用 || 提供保底显示 */}
                <button onClick={onLogout} className="m-4 w-24 py-2 rounded-lg btn-gradient">退出登录</button>
            </div>
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-60 shadow-md p-4">
                    <h1 className="text-xl font-bold mb-6">课时管理系统</h1>
                    {[
                        { key: "dashboard", label: "首页" },
                        { key: "record", label: "课时录入" },
                        { key: "billing", label: "收费管理" },
                        { key: "students", label: "学生管理" },
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
                    {activeMenu === "dashboard" && <Dashboard records={records} />}
                    {activeMenu === "record" && (
                        <RecordPage records={records} setRecords={setRecords} />
                    )}
                    {activeMenu === "billing" && <BillingPage records={records} />}
                    {activeMenu === "students" && <StudentManagePage students={students} />}
                </div>
            </div>
        </div >
    );

    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        if (response.ok) {
            const data = await response.json();
            setForecasts(data);
        }
    }

    async function fetchStudentBalance() {
        try {
            const response = await fetch("/api/studentbalance/balance");

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

// Record Page
function RecordPage({ records, setRecords }: any) {
    const [student, setStudent] = useState("Alice");
    const [course, setCourse] = useState("Math");
    const [hours, setHours] = useState(1);
    const [price, setPrice] = useState(100);

    const addRecord = () => {
        const newRecord = {
            id: Date.now(),
            student,
            course,
            hours,
            price,
            date: new Date().toLocaleDateString(),
        };
        setRecords([...records, newRecord]);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">课时录入</h2>

            <div className="bg-white p-4 rounded shadow mb-4">
                <div className="grid grid-cols-4 gap-4">
                    <select
                        value={student}
                        onChange={(e) => setStudent(e.target.value)}
                    >
                        {students.map((s) => (
                            <option key={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <input
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="课程"
                    />
                    <input
                        type="number"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                    />
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </div>
                <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={addRecord}
                >
                    添加
                </button>
            </div>

            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th>学生</th>
                        <th>课程</th>
                        <th>课时</th>
                        <th>单价</th>
                        <th>金额</th>
                        <th>日期</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r: RecordItem) => (
                        <tr key={r.id} className="text-center">
                            <td>{r.student}</td>
                            <td>{r.course}</td>
                            <td>{r.hours}</td>
                            <td>{r.price}</td>
                            <td>{r.hours * r.price}</td>
                            <td>{r.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Billing Page
function BillingPage({ records }: { records: RecordItem[] }) {
    const studentMap: Record<string, { hours: number; money: number }> = {};

    records.forEach((r) => {
        if (!studentMap[r.student]) {
            studentMap[r.student] = { hours: 0, money: 0 };
        }
        studentMap[r.student].hours += r.hours;
        studentMap[r.student].money += r.hours * r.price;
    });

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">收费统计</h2>
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th>学生</th>
                        <th>总课时</th>
                        <th>总金额</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(studentMap).map(([name, data]) => (
                        <tr key={name} className="text-center">
                            <td>{name}</td>
                            <td>{data.hours}</td>
                            <td>{data.money}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StudentManagePage({ students }: { students: Student[] }) {
    //const [students, setStudents] = useState<Student[]>([]);
    const [showModal, setShowModal] = useState(false);

    // 表单数据
    const [name, setName] = useState("");
    const [balance, setBalance] = useState<number | "">("");

    //// 新增学生
    //const addStudent = () => {
    //    if (!name || !balance) return;

    //    const newStudent: Student = {
    //        id: Date.now().toString(),
    //        name,
    //        balance: Number(balance),
    //    };

    //    setStudents([...students, newStudent]);

    //    // 清空表单 + 关闭弹窗
    //    setName("");
    //    setBalance("");
    //    setShowModal(false);
    //};

    //// 删除学生
    //const deleteStudent = (id: string) => {
    //    setStudents(students.filter((s) => s.id !== id));
    //};

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">学生管理</h2>

            {/* 打开弹窗按钮 */}
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 btn-gradient"
            >
                新增学生
            </button>

            {/* 学生表格 */}
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>余额</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s) => (
                        <tr key={s.student_Id} className="text-center border-t">
                            <td>{s.name}</td>
                            <td>{s.balance}</td>
                            <td>
                                <button className="bg-green-500 text-white px-2 py-1 rounded">
                                    充值
                                </button>
                                <button className="bg-red-500 text-white px-2 py-1 rounded">
                                    删除
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 弹窗 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow w-80">
                        <h3 className="text-xl font-bold mb-4">新增学生</h3>

                        <div className="flex flex-col gap-3">
                            <input
                                placeholder="姓名"
                                className="border p-2 rounded"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="充值金额"
                                className="border p-2 rounded"
                                value={balance}
                                onChange={(e) =>
                                    setBalance(e.target.value ? Number(e.target.value) : "")
                                }
                            />
                        </div>

                        {/* 按钮 */}
                        {/*<div className="flex justify-end gap-2 mt-4">*/}
                        {/*    <button*/}
                        {/*        onClick={() => setShowModal(false)}*/}
                        {/*        className="px-3 py-1 border rounded"*/}
                        {/*    >*/}
                        {/*        取消*/}
                        {/*    </button>*/}
                        {/*    <button*/}
                        {/*        onClick={addStudent}*/}
                        {/*        className="bg-blue-500 text-white px-3 py-1 rounded"*/}
                        {/*    >*/}
                        {/*        确认*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                    </div>
                </div>
            )}
        </div>
    );
}