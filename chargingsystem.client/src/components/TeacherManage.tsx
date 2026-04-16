import { useState } from "react";
import type { Teacher } from "../types";

export default function StudentManagePage({ teachers, fetchTeachers }: { teachers: Teacher[]; fetchTeachers: () => Promise<void> }) {
    const [showModal, setShowModal] = useState(false);

    // 新增教师
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const handleConfirm = async (): Promise<void> => {
        if (!name.trim() || !subject.trim()) {
            alert("请输入姓名");
            return;
        }

        if (loading) return;

        setLoading(true);

        try {
            const res = await fetch("/api/teacher/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    teacherId: crypto.randomUUID(),
                    name,
                    subject,
                } as Teacher),
            });

            if (!res.ok) {
                throw new Error("请求失败");
            }

            // ✅ 关闭弹窗
            setShowModal(false);

            // ✅ 清空输入
            setName("");

            // ✅ 可选：刷新列表
            await fetchTeachers();

        } catch (err: unknown) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" > 教师管理 </h2>

            {/* 打开弹窗按钮 */}
            <div className="flex justify-end" >
                <button
                    onClick={() => {
                        setShowModal(true);
                        setName("");
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4 btn-gradient"
                >
                    新增教师
                </button>
            </div>

            {/* 教师表格 */}
            <table className="w-full bg-white shadow rounded" >
                <thead>
                    <tr>
                        <th>姓名</th>
                        <th>学科</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        teachers.map((t) => (
                            <tr key={t.teacherId} className="text-center border-t" >
                                <td>{t.name} </td>
                                <td>{t.subject} </td>
                                < td >
                                    <div className="flex space-x-4 justify-center" >
                                        <button className="bg-red-500 hover:bg-red-800 text-white px-2 py-1 rounded">
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
                        className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay"
                    >
                        <div
                            className="bg-white p-6 rounded shadow w-80"
                        >
                            <h3 className="text-xl font-bold mb-4" >新增教师</h3>
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
                            <h3 className="text-xl font-bold mb-4" >学科</h3>
                            < div className="flex flex-col gap-3" >
                                <input
                                    placeholder="学科"
                                    className="border p-2 rounded"
                                    value={subject}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setSubject(e.target.value)
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
        </div>
    );
}