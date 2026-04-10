import { useState } from "react";
import type { Student } from '../types';

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

    const handleRechargeClick = async (student: Student) => {
        setCurrentStudent(student);
        setShowRechargeModal(true);
    };

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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" > 学生管理 </h2>

            {/* 打开弹窗按钮 */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setShowModal(true);
                        setName("")
                    }                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4 btn-gradient"
                >
                    新增学生
                </button>
            </div>

            {/* 学生表格 */}
            <table className="w-full bg-white shadow rounded" >
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        students.map((s) => (
                            <tr key={s.studentId} className="text-center border-t">
                                <td>{s.name} </td>
                                <td>
                                    <div className="flex space-x-4 justify-center">
                                        <button className="bg-green-500 text-white px-2 py-1 rounded"
                                            onClick={() => {
                                                handleRechargeClick(s);
                                                setHour(0);
                                                setPrice(0);
                                                setCost(0);
                                            }}>
                                            充值
                                        </button>
                                        {/*< button className="bg-blue-500 text-white px-2 py-1 rounded" >*/}
                                        {/*    扣课*/}
                                        {/*</button>*/}
                                        < button className="bg-red-500 text-white px-2 py-1 rounded" >
                                            删除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            {/* 弹窗 */}
            {
                showModal && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center"
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
                        className="fixed inset-0 bg-black/30 flex items-center justify-center"
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
        </div>
    );
}