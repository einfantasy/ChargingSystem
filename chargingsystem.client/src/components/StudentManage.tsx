import { useState } from "react";
import type { RechargeRecord, Student } from '../types';

export default function StudentManagePage({ students, fetchStudents }: { students: Student[]; fetchStudents: () => Promise<void> }) {
    const [showModal, setShowModal] = useState(false);

    // 新增学生
    const [name, setName] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const handleConfirm = async (): Promise<void> => {
        if (!name.trim()) {
            alert("请输入姓名");
            return;
        }

        if (loading) return;

        setLoading(true);

        try {
            const res = await fetch("/api/student/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    studentId: crypto.randomUUID(),
                    name,
                } as Student),
            });

            if (!res.ok) {
                throw new Error("请求失败");
            }

            // ✅ 关闭弹窗
            setShowModal(false);

            // ✅ 清空输入
            setName("");

            // ✅ 可选：刷新列表
            await fetchStudents();

        } catch (err: unknown) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

    const [price, setPrice] = useState(0);
    const [hour, setHour] = useState(0);
    const [cost, setCost] = useState(0);

    const handleRechargeConfirm = async () => {
        if (!currentStudent) return;

        setLoading(true);

        await fetch("/api/recharge/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                studentId: currentStudent.studentId,
                rechargePrice: price,
                rechargeHour: hour,
                date: new Date().toLocaleDateString('sv-SE'),
                cost: cost
            }),
        });

        setLoading(false);
        setShowRechargeModal(false);
    };

    const [searchTerm, setSearchTerm] = useState('');
    // 关键步骤：在渲染前过滤数据
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [showRecordModal, setShowRecordModal] = useState(false);
    const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
    const fetchRechargeRecords = async (studentId: string) => {
        setLoading(true);
        try {
            // 替换为你的真实 API 地址
            const response = await fetch(`/api/recharge/query?studentId=${encodeURIComponent(studentId)}`, {
                method: 'GET',
                headers: {
                    // 1. 指定内容类型
                    'Content-Type': 'application/json',
                    // 2. 注入身份验证 Token
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });
            const data = await response.json();
            setRechargeRecords(data);
        } catch (error) {
            console.error("获取记录失败:", error);
            alert("网络错误，无法加载记录");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" > 学生管理 </h2>

            <div className="flex justify-between items-center mb-4">
                {/* 筛选输入框 */}
                <div className="flex justify-start">
                    <input
                        type="text"
                        placeholder="搜索姓名..."
                        className="border p-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 打开弹窗按钮 */}
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            setShowModal(true);
                            setName("")
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 btn-gradient"
                    >
                        新增学生
                    </button>
                </div>
            </div>

            {/* 学生表格 */}
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                            <tr key={s.studentId} className="text-center border-t hover:bg-gray-50 transition-colors">
                                <td>{s.name}</td>
                                <td>
                                    <div className="flex space-x-4 justify-center">
                                        <button
                                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                                            onClick={() => {
                                                setCurrentStudent(s);
                                                setShowRechargeModal(true);
                                                setHour(0);
                                                setPrice(0);
                                                setCost(0);
                                            }}
                                        >
                                            充值
                                        </button>
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                            onClick={() => {
                                                setCurrentStudent(s);
                                                setShowRecordModal(true);
                                                fetchRechargeRecords(s.studentId);
                                            }}
                                        >
                                            充值记录
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={2} className="py-4 text-gray-500 text-center">未找到相关学生</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 弹窗 */}
            {
                showModal && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay"
                    >
                        <div
                            className="bg-white p-6 rounded shadow w-80"
                        >
                            <h3 className="text-xl font-bold mb-4" > 新增学生 </h3>

                            < div className="flex flex-col gap-3" >
                                <input
                                    placeholder="姓名"
                                    className="border p-2 rounded"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setName(e.target.value)
                                    }
                                />
                            </div>

                            < div className="flex justify-end gap-2 mt-4" >
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-3 py-1 border rounded"
                                >
                                    取消
                                </button>

                                < button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    {loading ? "提交中..." : "确认"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showRechargeModal && currentStudent && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay"
                    >
                        <div
                            className="bg-white p-6 rounded shadow w-80"
                        >
                            <h3 className="text-xl font-bold mb-4">
                                充值 - {currentStudent.name}
                            </h3>

                            <div className="flex flex-col gap-3">
                                充值课时
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">
                                        请输入购买的课时数
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="充值课时"
                                        className="border p-2 rounded"
                                        value={hour}
                                        onChange={(e) => setHour(Number(e.target.value))}
                                    />
                                </div>

                                课时单价
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">
                                        请输入课时单价
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="课时单价"
                                        className="border p-2 rounded"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                    />
                                </div>

                                成本价
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">
                                        请输入成本价
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="成本价"
                                        className="border p-2 rounded"
                                        value={cost}
                                        onChange={(e) => setCost(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setShowRechargeModal(false)}
                                    className="px-3 py-1 border rounded"
                                >
                                    取消
                                </button>

                                <button
                                    onClick={handleRechargeConfirm}
                                    disabled={loading}
                                    className="bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    {loading ? "提交中..." : "确认"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showRecordModal && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-w-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">
                                    {currentStudent?.name} 的充值记录
                                </h3>
                                <button
                                    onClick={() => setShowRecordModal(false)}
                                    className="text-gray-500 hover:text-black"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 border">日期</th>
                                            <th className="p-2 border">金额</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rechargeRecords
                                            .filter(r => r.studentId === currentStudent?.studentId)
                                            .map(record => (
                                                <tr key={record.id} className="border-t">
                                                    <td className="p-2 border">{record.date.substring(0, 10)}</td>
                                                    <td className="p-2 border">￥{record.rechargeHour * record.rechargePrice}</td>
                                                </tr>
                                            ))
                                        }
                                        {/* 如果没有记录 */}
                                        {rechargeRecords.filter(r => r.studentId === currentStudent?.studentId).length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="p-4 text-center text-gray-400">暂无充值记录</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowRecordModal(false)}
                                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}