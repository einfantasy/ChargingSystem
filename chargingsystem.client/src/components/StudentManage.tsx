import { useState } from "react";
import type { RechargeRecord, Student } from '../types';

export default function StudentManagePage({ students, fetchStudents }: { students: Student[]; fetchStudents: () => Promise<void> }) {
    // --- 1. 状态管理 ---
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 弹窗控制
    const [showModal, setShowModal] = useState(false);         // 新增学生
    const [showRechargeModal, setShowRechargeModal] = useState(false); // 充值
    const [showRecordModal, setShowRecordModal] = useState(false);     // 记录

    // 数据暂存
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);

    // 表单数据
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [hour, setHour] = useState(0);
    const [cost, setCost] = useState(0);

    // --- 2. 通用辅助函数 ---
    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token")
    });

    // --- 3. 业务逻辑 ---

    // 新增学生
    const handleAddConfirm = async () => {
        if (!name.trim()) return alert("请输入姓名");
        if (loading) return;

        setLoading(true);
        try {
            const res = await fetch("/api/student/add", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ studentId: crypto.randomUUID(), name }),
            });
            if (!res.ok) throw new Error();
            setShowModal(false);
            setName("");
            await fetchStudents();
        } catch (err) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    // 充值操作
    const handleRechargeConfirm = async () => {
        if (!currentStudent || loading) return;

        setLoading(true);
        try {
            await fetch("/api/recharge/add", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    studentId: currentStudent.studentId,
                    rechargePrice: price,
                    rechargeHour: hour,
                    date: new Date().toLocaleDateString('sv-SE'),
                    cost: cost
                }),
            });
            setShowRechargeModal(false);
            await fetchStudents();
        } catch (err) {
            console.error(err);
            alert("充值失败");
        } finally {
            setLoading(false);
        }
    };

    // 查询记录
    const openRecordModal = async (student: Student) => {
        setCurrentStudent(student);
        setShowRecordModal(true);
        setLoading(true);
        try {
            const res = await fetch(`/api/recharge/query?studentId=${encodeURIComponent(student.studentId)}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await res.json();
            setRechargeRecords(data);
        } catch (err) {
            console.error(err);
            alert("无法加载记录");
        } finally {
            setLoading(false);
        }
    };

    // 过滤后的数据
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4">学生管理</h2>

            {/* 工具栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <input
                    type="text"
                    placeholder="搜索姓名..."
                    className="
                            bg-slate-800/50 text-white 
                            border border-white/20 rounded 
                            p-2 w-full sm:w-48 md:w-64 
                            placeholder:text-slate-400 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            hover:border-white/40 transition-colors
                        "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    onClick={() => { setShowModal(true); setName(""); }}
                    className="bg-blue-500 text-white px-4 py-2 rounded btn-gradient w-full sm:w-auto"
                >
                    + 新增学生
                </button>
            </div>

            {/* 学生列表 */}
            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
                <table className="w-full bg-white shadow rounded min-w-[500px]">
                    <thead>
                        <tr>
                            <th className="px-3 py-2">姓名</th>
                            <th className="px-3 py-2">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((s) => (
                                <tr key={s.studentId} className="text-center border-t hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2">{s.name}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex space-x-2 justify-center">
                                            <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                                                onClick={() => {
                                                    setCurrentStudent(s);
                                                    setShowRechargeModal(true);
                                                    setHour(0); setPrice(0); setCost(0);
                                                }}>充值</button>
                                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                                                onClick={() => openRecordModal(s)}>记录</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="py-4 text-gray-500 text-center">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- 弹窗集合 --- */}

            {/* 1. 新增学生弹窗 */}
            {showModal && (
                <div className={"modal-overlay"}>
                    <div className="bg-white p-4 sm:p-6 rounded shadow w-[90%] sm:w-80 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold mb-4">新增学生</h3>
                        <input
                            placeholder="请输入姓名"
                            className="border p-2 rounded w-full mb-4"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">取消</button>
                            <button onClick={handleAddConfirm} disabled={loading} className="bg-blue-500 text-white px-3 py-1 rounded">
                                {loading ? "提交中..." : "确认"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. 充值弹窗 */}
            {showRechargeModal && currentStudent && (
                <div className={"modal-overlay"}>
                    <div className="bg-white p-4 sm:p-6 rounded shadow w-[90%] sm:w-80 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold mb-4">充值 - {currentStudent.name}</h3>
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {[
                                { label: "充值课时", value: hour, setter: setHour, tip: "请输入购买的课时数" },
                                { label: "课时单价", value: price, setter: setPrice, tip: "请输入课时单价" },
                                { label: "成本价", value: cost, setter: setCost, tip: "请输入成本价" }
                            ].map((field, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="text-sm font-medium mb-1">{field.label}</span>
                                    <span className="text-xs text-gray-400 mb-1">{field.tip}</span>
                                    <input type="number" className="border p-2 rounded text-sm" value={field.value}
                                        onChange={(e) => field.setter(Number(e.target.value))} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                            <button onClick={() => setShowRechargeModal(false)} className="px-3 py-1 border rounded">取消</button>
                            <button onClick={handleRechargeConfirm} disabled={loading} className="bg-blue-500 text-white px-3 py-1 rounded">
                                {loading ? "提交中..." : "确认"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. 充值记录弹窗 */}
            {showRecordModal && (
                <div className={"modal-overlay"}>
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-[95%] sm:w-3/4 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{currentStudent?.name} 的充值记录</h3>
                            <button onClick={() => setShowRecordModal(false)} className="text-gray-500 hover:text-black">✕</button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-100">
                                    <tr>
                                        <th className="p-2 border">日期</th>
                                        <th className="p-2 border">金额</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rechargeRecords.length > 0 ? (
                                        rechargeRecords.map(record => (
                                            <tr key={record.id} className="border-t hover:bg-gray-50">
                                                <td className="p-2 border">{record.date.substring(0, 10)}</td>
                                                <td className="p-2 border font-medium text-green-600">￥{record.rechargeHour * record.rechargePrice}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={2} className="p-8 text-center text-gray-400">暂无充值记录</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowRecordModal(false)} className="px-4 py-1 border rounded hover:bg-gray-50">关闭</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}