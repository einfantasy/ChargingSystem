import { useEffect, useState } from "react";
import type { StudentBalanceDto, Teacher } from '../types';

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
        };

        load();
    }, []);

    const handleCostClick = async (record: StudentBalanceDto) => {
        setCurrentBalance(record);
        setShowModal(true);
    };

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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" > 课时管理 </h2>

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
                    {
                        balance.map((b) => (
                            <tr key={b.rechargeId} className="text-center border-t" >
                                <td>{b.studentName} </td>
                                <td>{b.remainingHours} </td>
                                <td>{b.cost} </td>
                                < td >
                                    <div className="flex space-x-4 justify-center" >
                                        <button className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleCostClick(b)}>
                                            扣课
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            {
                showModal && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center"
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
                                <span className="text-sm text-gray-500 mb-1">
                                    选择扣课日期
                                </span>
                                <input
                                    type="date"
                                    className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
    );
}

export default ConsumeManagePage