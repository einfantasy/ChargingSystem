import { useEffect, useState } from "react";
import type { StudentBalanceDto, Teacher, ConsumeRecord } from '../types';
import { CalendarDays } from "lucide-react";

function ConsumeManagePage({ teachers }: { teachers: Teacher[] }) {
    const [balance, setBalance] = useState<StudentBalanceDto[]>([]);
    const [currentBalance, setCurrentBalance] = useState<StudentBalanceDto | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [hour, setHour] = useState(1);
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState<string>(today);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedTeacher, setSelectedTeacher] = useState<string>();

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
    }

    useEffect(() => {
        const load = async () => {
            await fetchBalance();
            setSelectedTeacher(teachers[0].teacherId);
        };

        load();
    }, []);

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

    const [searchTerm, setSearchTerm] = useState('');
    // 关键步骤：在渲染前过滤数据
    const filteredBalances = balance.filter(b =>
        b.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [showConsumeModal, setShowConsumeModal] = useState(false);
    const [consumeRecords, setConsumeRecords] = useState<ConsumeRecord[]>([]);
    const fetchConsumeRecords = async (rechargeId: string) => {
        setLoading(true);
        try {
            // 替换为你的真实 API 地址
            const response = await fetch(`/api/consume/query?rechargeId=${encodeURIComponent(rechargeId)}`, {
                method: 'GET',
                headers: {
                    // 1. 指定内容类型
                    'Content-Type': 'application/json',
                    // 2. 注入身份验证 Token
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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" > 课时管理 </h2>

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
            </div>

            {/* 教师表格 */}
            <table className="w-full bg-white shadow rounded" >
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>剩余学时</th>
                        <th>成本价</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBalances.length > 0 ? (
                        filteredBalances.map((b) => (
                            <tr
                                key={b.rechargeId}
                                className="text-center border-t hover:bg-gray-50 transition-colors"
                            >
                                <td className="py-2">{b.studentName}</td>
                                <td>{b.remainingHours}</td>
                                <td>{b.cost}</td>
                                <td>
                                    <div className="flex space-x-4 justify-center">
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                            onClick={() => {
                                                setCurrentBalance(b);
                                                setShowModal(true);
                                            }}
                                        >
                                            扣课
                                        </button>
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                            onClick={() => {
                                                setCurrentBalance(b);
                                                setShowConsumeModal(true);
                                                fetchConsumeRecords(b.rechargeId);
                                            }}
                                        >
                                            扣课记录
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            {/* 注意：你有4列（姓名、余课、课消、操作），colSpan 应设为 4 */}
                            <td colSpan={4} className="py-4 text-gray-500 text-center">
                                未找到相关学生
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {
                showModal && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay"
                    >
                        <div
                            className="bg-white p-6 rounded shadow w-80"
                        >
                            <h3 className="text-xl font-bold mb-4">
                                扣课 - {currentBalance?.studentName}
                            </h3>

                            <span className="text-sm text-gray-500 mb-1">
                                请选择老师
                            </span>
                            老师选择
                            <select
                                className="border p-2 rounded"
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                            >
                                {teachers.map((t) => (
                                    <option key={t.teacherId} value={t.teacherId}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 mb-1">
                                    请输入要扣除的课时数
                                </span>
                                <input
                                    type="number"
                                    placeholder="扣除课时"
                                    className="border p-2 rounded"
                                    value={hour}
                                    onChange={(e) => setHour(Number(e.target.value))}
                                />
                            </div>
                            {/* 新增：日期选择工具 */}
                            <div className="flex flex-col mt-3">
                                {/* 改进后的 Label 部分 */}
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1.5 cursor-pointer">
                                    <CalendarDays size={16} className="text-blue-500" />
                                    <span>选择扣课日期</span>
                                </label>

                                {/* Input 部分 */}
                                <input
                                    type="date"
                                    className="
                                        border border-gray-300 p-2 rounded-lg outline-none 
                                        transition-all duration-200
                                        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                                        hover:border-gray-400
                                        cursor-pointer
                                        text-gray-700
                                    "
                                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                    value={date}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
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
                showConsumeModal && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-w-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">
                                    充值记录 - {currentBalance?.studentName} 
                                </h3>
                                <button
                                    onClick={() => setShowConsumeModal(false)}
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
                                            <th className="p-2 border">教师</th>
                                            <th className="p-2 border">科目</th>
                                            <th className="p-2 border">课时</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consumeRecords
                                            .filter(r => r.rechargeId === currentBalance?.rechargeId)
                                            .map(record => (
                                                <tr key={record.id} className="border-t">
                                                    <td className="p-2 border">{record.date.substring(0, 10)}</td>
                                                    <td className="p-2 border">{record.teacherName}</td>
                                                    <td className="p-2 border">{record.subject}</td>
                                                    <td className="p-2 border">{record.hour}</td>
                                                </tr>
                                            ))
                                        }
                                        {/* 如果没有记录 */}
                                        {consumeRecords.filter(r => r.rechargeId === currentBalance?.rechargeId).length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="p-4 text-center text-gray-400">暂无课时记录</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowConsumeModal(false)}
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

export default ConsumeManagePage