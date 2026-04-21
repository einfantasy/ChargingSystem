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

            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">姓名</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">剩余学时</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">成本价</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBalances.length > 0 ? (
                            filteredBalances.map((b) => (
                                <tr key={b.rechargeId} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                                    <td className="px-4 py-3 text-center text-white">{b.studentName}</td>
                                    <td className="px-4 py-3 text-center text-slate-300">{b.remainingHours}</td>
                                    <td className="px-4 py-3 text-center text-slate-300">{b.cost}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex space-x-2 justify-center">
                                            <button
                                                className="bg-green-500/80 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                                                onClick={() => {
                                                    setCurrentBalance(b);
                                                    setShowModal(true);
                                                }}
                                            >
                                                扣课
                                            </button>
                                            <button
                                                className="bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
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
                                <td colSpan={4} className="py-6 text-slate-400 text-center">
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
                    <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[90%] sm:w-96 border border-white/20">
                        <h3 className="text-xl font-bold mb-5 text-gray-900">扣课 - {currentBalance?.studentName}</h3>

                        <div className="flex flex-col mb-4">
                            <span className="text-sm text-gray-600 mb-2">请选择老师</span>
                            <select
                                className="bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                            >
                                {teachers.map((t) => (
                                    <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col mb-4">
                            <span className="text-sm text-gray-600 mb-2">请输入要扣除的课时数</span>
                            <input
                                type="number"
                                className="bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                value={hour === 1 ? '' : hour}
                                placeholder="1"
                                onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val === '' || isNaN(Number(val))) {
                                        setHour(0);
                                    }
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setHour(1);
                                    } else {
                                        setHour(Number(val));
                                    }
                                }}
                            />
                        </div>

                        <div className="flex flex-col mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2 cursor-pointer">
                                <CalendarDays size={16} className="text-purple-500" />
                                <span>选择扣课日期</span>
                            </label>
                            <input
                                type="date"
                                className="bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 cursor-pointer"
                                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors">取消</button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all"
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
                    <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[95%] sm:w-3/4 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="flex justify-between items-center mb-4 min-w-0">
                            <h3 className="text-xl font-bold truncate text-gray-900">课时记录 - {currentBalance?.studentName}</h3>
                            <button onClick={() => setShowConsumeModal(false)} className="text-gray-500 hover:text-gray-700 flex-shrink-0 p-1">✕</button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <div className="overflow-x-auto max-w-full">
                                <div className="flex flex-col mt-3 mb-3 w-fit">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2 cursor-pointer">
                                        <CalendarDays size={16} className="text-purple-500" />
                                        <span>选择查询月份</span>
                                    </label>
                                    <input
                                        type="month"
                                        className="w-full md:w-64 bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 cursor-pointer"
                                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                        value={queryDate}
                                        onChange={(e) => {
                                            setQueryDate(e.target.value);
                                            fetchConsumeRecords(currentBalance!.rechargeId, e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto overflow-y-auto max-h-[40vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/10">
                                            <th className="p-3 text-left text-purple-300 font-medium text-sm">日期</th>
                                            <th className="p-3 text-left text-purple-300 font-medium text-sm">教师</th>
                                            <th className="p-3 text-left text-purple-300 font-medium text-sm">科目</th>
                                            <th className="p-3 text-left text-purple-300 font-medium text-sm">课时</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consumeRecords
                                            .filter(r => r.rechargeId === currentBalance?.rechargeId && (queryDate ? r.date.startsWith(queryDate) : true))
                                            .map(record => (
                                                <tr key={record.id} className="border-t border-white/10">
                                                    <td className="p-3 text-left text-gray-400">{record.date.substring(0, 10)}</td>
                                                    <td className="p-3 text-left text-gray-400">{record.teacherName}</td>
                                                    <td className="p-3 text-left text-gray-400">{record.subject}</td>
                                                    <td className="p-3 text-left text-gray-400">{record.hour}</td>
                                                </tr>
                                            ))
                                        }
                                        {consumeRecords.filter(r => r.rechargeId === currentBalance?.rechargeId && (queryDate ? r.date.startsWith(queryDate) : true)).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center text-slate-400">该月份暂无课时记录</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowConsumeModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors">关闭</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}