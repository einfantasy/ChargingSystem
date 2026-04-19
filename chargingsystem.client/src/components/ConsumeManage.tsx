import { useEffect, useState } from "react";
import type { StudentBalanceDto, Teacher, ConsumeRecord } from '../types';
import { CalendarDays } from "lucide-react";

export default function ConsumeManagePage({ teachers }: { teachers: Teacher[] }) {
    // --- 1. 基础状态与常量 ---
    const today = new Date().toISOString().split('T')[0];
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [loading, setLoading] = useState<boolean>(false);
    const [balance, setBalance] = useState<StudentBalanceDto[]>([]);
    const [currentBalance, setCurrentBalance] = useState<StudentBalanceDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- 2. 扣课弹窗相关状态 ---
    const [showModal, setShowModal] = useState(false);
    const [hour, setHour] = useState(1);
    const [date, setDate] = useState<string>(today);
    const [selectedTeacher, setSelectedTeacher] = useState<string>();

    // --- 3. 课时记录弹窗相关状态 ---
    const [showConsumeModal, setShowConsumeModal] = useState(false);
    const [consumeRecords, setConsumeRecords] = useState<ConsumeRecord[]>([]);
    const [queryDate, setQueryDate] = useState(getCurrentMonth());

    // --- 4. 数据获取逻辑 ---

    // 获取余额列表
    const fetchBalance = async () => {
        try {
            const response = await fetch("/api/consume/balance", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBalance(data.result);
            } else {
                console.error("请求失败:", response.status);
            }
        } catch (error) {
            console.error("网络错误:", error);
        }
    };

    // 获取消费记录
    const fetchConsumeRecords = async (rechargeId: string, queryDate: string) => {
        setLoading(true);
        const params = { rechargeId, queryDate };
        const queryString = new URLSearchParams(params).toString();

        try {
            const response = await fetch(`/api/consume/query?${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });
            const data = await response.json();
            setConsumeRecords(data);
        } catch (error) {
            console.error("获取记录失败:", error);
            alert("网络错误，无法加载记录");
        } finally {
            setLoading(false);
        }
    };

    // --- 5. 副作用与交互处理 ---

    useEffect(() => {
        const load = async () => {
            await fetchBalance();
            if (teachers.length > 0) {
                setSelectedTeacher(teachers[0].teacherId);
            }
        };
        load();
    }, []);

    // 提交扣课
    const handleConfirm = async () => {
        setLoading(true);
        await fetch("/api/consume/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                rechargeId: currentBalance?.rechargeId,
                teacherId: selectedTeacher,
                hour: hour,
                date: date,
                cost: currentBalance?.cost,
            }),
        });

        setLoading(false);
        setShowModal(false);
        fetchBalance();
    };

    // 过滤后的数据
    const filteredBalances = balance.filter(b =>
        b.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- 6. 渲染界面 ---
    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4">课时管理</h2>

            <div className="flex justify-between items-center mb-4">
                <div className="flex justify-start w-full">
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
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
                <table className="w-full bg-white shadow rounded">
                    <thead>
                        <tr>
                            <th className="px-3 py-2">姓名</th>
                            <th className="px-3 py-2">剩余学时</th>
                            <th className="px-3 py-2">成本价</th>
                            <th className="px-3 py-2">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBalances.length > 0 ? (
                            filteredBalances.map((b) => (
                                <tr key={b.rechargeId} className="text-center border-t hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2">{b.studentName}</td>
                                    <td className="px-3 py-2">{b.remainingHours}</td>
                                    <td className="px-3 py-2">{b.cost}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex space-x-2 justify-center">
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                                                onClick={() => {
                                                    setCurrentBalance(b);
                                                    setShowModal(true);
                                                }}
                                            >
                                                扣课
                                            </button>
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                                                onClick={() => {
                                                    const currentMonth = getCurrentMonth();
                                                    setQueryDate(currentMonth);
                                                    setCurrentBalance(b);
                                                    setShowConsumeModal(true);
                                                    fetchConsumeRecords(b.rechargeId, currentMonth);
                                                }}
                                            >
                                                记录
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-4 text-gray-500 text-center">
                                    未找到相关学生
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 扣课弹窗 */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="bg-white p-4 sm:p-6 rounded shadow w-[90%] sm:w-80 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold mb-4">扣课 - {currentBalance?.studentName}</h3>

                        <div className="flex flex-col mb-3">
                            <span className="text-sm text-gray-500 mb-1">请选择老师</span>
                            <select
                                className="border p-2 rounded"
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                            >
                                {teachers.map((t) => (
                                    <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col mb-3">
                            <span className="text-sm text-gray-500 mb-1">请输入要扣除的课时数</span>
                            <input
                                type="number"
                                className="border p-2 rounded"
                                value={hour}
                                onChange={(e) => setHour(Number(e.target.value))}
                            />
                        </div>

                        <div className="flex flex-col mb-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5 cursor-pointer">
                                <CalendarDays size={16} className="text-blue-500" />
                                <span>选择扣课日期</span>
                            </label>
                            <input
                                type="date"
                                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-gray-700"
                                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">取消</button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                {loading ? "提交中..." : "确认"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 课时记录弹窗 */}
            {showConsumeModal && (
                <div className="modal-overlay">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-[95%] sm:w-3/4 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">课时记录 - {currentBalance?.studentName}</h3>
                            <button onClick={() => setShowConsumeModal(false)} className="text-gray-500 hover:text-black">✕</button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <div className="flex flex-col mt-3 mb-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5 cursor-pointer">
                                    <CalendarDays size={16} className="text-blue-500" />
                                    <span>选择查询月份</span>
                                </label>
                                <input
                                    type="month"
                                    className="w-full md:w-64 border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-gray-700 bg-white"
                                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                    value={queryDate}
                                    onChange={(e) => {
                                        setQueryDate(e.target.value);
                                        fetchConsumeRecords(currentBalance!.rechargeId, e.target.value);
                                    }}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 border">日期</th>
                                            <th className="p-2 border">教师</th>
                                            <th className="p-2 border">科目</th>
                                            <th className="p-2 border">课时</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consumeRecords
                                            .filter(r => r.rechargeId === currentBalance?.rechargeId && (queryDate ? r.date.startsWith(queryDate) : true))
                                            .map(record => (
                                                <tr key={record.id} className="border-t">
                                                    <td className="p-2 border">{record.date.substring(0, 10)}</td>
                                                    <td className="p-2 border">{record.teacherName}</td>
                                                    <td className="p-2 border">{record.subject}</td>
                                                    <td className="p-2 border">{record.hour}</td>
                                                </tr>
                                            ))
                                        }
                                        {consumeRecords.filter(r => r.rechargeId === currentBalance?.rechargeId && (queryDate ? r.date.startsWith(queryDate) : true)).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-400">该月份暂无课时记录</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowConsumeModal(false)} className="px-3 py-1 border rounded">关闭</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}