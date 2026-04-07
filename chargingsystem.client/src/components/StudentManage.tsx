import { useState } from "react";
import type { Student, StudentBalance } from '../types';

export default function StudentManagePage({ students }: { students: StudentBalance[] }) {
    const [showModal, setShowModal] = useState(false);

    // 表单数据
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
                    student_Id: crypto.randomUUID(),
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
            // await fetchStudents();

        } catch (err: unknown) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" > 学生管理 </h2>

            {/* 打开弹窗按钮 */}
            <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 btn-gradient"
            >
                新增学生
            </button>

            {/* 学生表格 */}
            <table className="w-full bg-white shadow rounded" >
                <thead>
                    <tr>
                        <th>姓名 </th>
                        < th > 余额 </th>
                        < th > 培训教师 </th>
                        < th > 学科 </th>
                        < th > 操作 </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        students.map((s) => (
                            <tr key={s.student_Id} className="text-center border-t" >
                                <td>{s.name} </td>
                                < td > {s.balance} </td>
                                < td > {s.teacher} </td>
                                < td > {s.subject} </td>
                                < td >
                                    <button className="bg-green-500 text-white px-2 py-1 rounded" >
                                        充值
                                    </button>
                                    < button className="bg-red-500 text-white px-2 py-1 rounded" >
                                        删除
                                    </button>
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
                        onClick={() => setShowModal(false)
                        }
                    >
                        <div
                            className="bg-white p-6 rounded shadow w-80"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()
                            }
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
                )}
        </div>
    );
}