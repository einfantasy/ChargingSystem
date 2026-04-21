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
            <div className="overflow-x-auto rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">姓名</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((s) => (
                                <tr key={s.studentId} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                                    <td className="px-4 py-3 text-center text-white">{s.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex space-x-2 justify-center">
                                            <button className="bg-green-500/80 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                                                onClick={() => {
                                                    setCurrentStudent(s);
                                                    setShowRechargeModal(true);
                                                    setHour(0); setPrice(0); setCost(0);
                                                }}>充值</button>
                                            <button className="bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                                                onClick={() => openRecordModal(s)}>记录</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="py-6 text-slate-400 text-center">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- 弹窗集合 --- */}

            {/* 1. 新增学生弹窗 */}
            {showModal && (
                <div className={"modal-overlay"}>
                    <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[90%] sm:w-96 border border-white/20">
                        <h3 className="text-xl font-bold mb-5 text-gray-900">新增学生</h3>
                        <input
                            placeholder="请输入姓名"
                            className="w-full bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 placeholder:text-gray-400 mb-4"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors">取消</button>
                            <button onClick={handleAddConfirm} disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all">
                                {loading ? "提交中..." : "确认"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. 充值弹窗 */}
            {showRechargeModal && currentStudent && (
                <div className={"modal-overlay"}>
                    <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[90%] sm:w-96 border border-white/20">
                        <h3 className="text-xl font-bold mb-5 text-gray-900">充值 - {currentStudent.name}</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { label: "充值课时", val: hour, setVal: setHour, tip: "请输入购买的课时数" },
                                { label: "课时单价", val: price, setVal: setPrice, tip: "请输入课时单价" },
                                { label: "成本价", val: cost, setVal: setCost, tip: "请输入成本价" }
                            ].map((field, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700 mb-2">{field.label}</span>
                                    <span className="text-xs text-gray-500 mb-1">{field.tip}</span>
                                    <input type="number" className="bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                        value={field.val === 0 ? '' : field.val}
                                        placeholder="0"
                                        onBlur={(e) => {
                                            const v = e.target.value.trim();
                                            if (v === '' || isNaN(Number(v))) field.setVal(0);
                                        }}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            field.setVal(v === '' ? 0 : Number(v));
                                        }} />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button onClick={() => setShowRechargeModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors">取消</button>
                            <button onClick={handleRechargeConfirm} disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all">
                                {loading ? "提交中..." : "确认"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. 充值记录弹窗 */}
            {showRecordModal && (
                <div className={"modal-overlay"}>
                    <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[95%] sm:w-3/4 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{currentStudent?.name} 的充值记录</h3>
                            <button onClick={() => setShowRecordModal(false)} className="text-gray-500 hover:text-gray-700 p-1">✕</button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <div className="overflow-x-auto rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/10">
                                            <th className="p-3 text-left text-purple-300 font-medium text-sm">日期</th>
                                            <th className="p-3 text-left text-purple-300 font-medium text-sm">金额</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rechargeRecords.length > 0 ? (
                                            rechargeRecords.map(record => (
                                                <tr key={record.id} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                                                    <td className="p-3 text-left text-gray-400">{record.date.substring(0, 10)}</td>
                                                    <td className="p-3 text-left font-medium text-green-400">￥{record.rechargeHour * record.rechargePrice}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={2} className="p-8 text-center text-slate-400">暂无充值记录</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowRecordModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors">关闭</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}