import { useState } from "react";
import type { Student } from '../types';

export default function StudentManagePage({ students, fetchStudents }: { students: Student[]; fetchStudents:() => Promise<void> }) {
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
            await fetchStudents();

        } catch (err: unknown) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    //const [showRechargeModal, setShowRechargeModal] = useState(false);
    //const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

    //const [teachers, setTeachers] = useState<Teacher[]>([]);
    //const [selectedTeacher, setSelectedTeacher] = useState("");

    //const [amount, setAmount] = useState(0);
    //const [hour, setHour] = useState(0);

    //const handleRechargeClick = async (student: Student) => {
    //    setCurrentStudent(student);

    //    // 如果已有老师，直接选中
    //    if (student.teacher) {
    //        setSelectedTeacher(student.teacher);
    //    } else {
    //        // 没有老师 → 拉取老师列表
    //        const res = await fetch("/api/teacher/list", {
    //            headers: {
    //                Authorization: "Bearer " + localStorage.getItem("token")
    //            },
    //        });
    //        const data = await res.json();
    //        setTeachers(data);

    //        if (data.length > 0) {
    //            setSelectedTeacher(data[0].name);
    //        }
    //    }

    //    setShowRechargeModal(true);
    //};

    //const handleRechargeConfirm = async () => {
    //    if (!currentStudent) return;

    //    setLoading(true);

    //    await fetch("/api/recharge/add", {
    //        method: "POST",
    //        headers: {
    //            "Content-Type": "application/json",
    //        },
    //        body: JSON.stringify({
    //            studentId: currentStudent.student_Id,
    //            teacher: selectedTeacher,
    //            amount,
    //            hour,
    //        }),
    //    });

    //    setLoading(false);
    //    setShowRechargeModal(false);
    //};

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
                        <th>操作 </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        students.map((s) => (
                            <tr key={s.student_Id} className="text-center border-t">
                                <td>{s.name} </td>
                                <td>
                                    {/*<button className="bg-green-500 text-white px-2 py-1 rounded"*/}
                                    {/*    onClick={() => handleRechargeClick(s)}>*/}
                                    {/*    充值*/}
                                    {/*</button>*/}
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
                )
            }

            {/*{*/}
            {/*    showRechargeModal && currentStudent && (*/}
            {/*        <div*/}
            {/*            className="fixed inset-0 bg-black/30 flex items-center justify-center"*/}
            {/*            onClick={() => setShowRechargeModal(false)}*/}
            {/*        >*/}
            {/*            <div*/}
            {/*                className="bg-white p-6 rounded shadow w-80"*/}
            {/*                onClick={(e: React.MouseEvent) => e.stopPropagation()}*/}
            {/*            >*/}
            {/*                <h3 className="text-xl font-bold mb-4">*/}
            {/*                    充值 - {currentStudent.name}*/}
            {/*                </h3>*/}

            {/*                <div className="flex flex-col gap-3">*/}
            {/*                    <span className="text-sm text-gray-500 mb-1">*/}
            {/*                        请选择老师*/}
            {/*                    </span>*/}
            {/*                    */}{/* 老师选择 */}
            {/*                    <select*/}
            {/*                        className="border p-2 rounded"*/}
            {/*                        value={selectedTeacher}*/}
            {/*                        onChange={(e) => setSelectedTeacher(e.target.value)}*/}
            {/*                    >*/}
            {/*                        {currentStudent.teacher ? (*/}
            {/*                            <option value={currentStudent.teacher}>*/}
            {/*                                {currentStudent.teacher}*/}
            {/*                            </option>*/}
            {/*                        ) : (*/}
            {/*                            teachers.map((t) => (*/}
            {/*                                <option key={t.teacher_Id} value={t.name}>*/}
            {/*                                    {t.name}*/}
            {/*                                </option>*/}
            {/*                            ))*/}
            {/*                        )}*/}
            {/*                    </select>*/}


            {/*                    */}{/* 充值金额 */}
            {/*                    <div className="flex flex-col">*/}
            {/*                        <span className="text-sm text-gray-500 mb-1">*/}
            {/*                            请输入本次充值的金额（单位：元）*/}
            {/*                        </span>*/}
            {/*                        <input*/}
            {/*                            type="number"*/}
            {/*                            placeholder="充值金额"*/}
            {/*                            className="border p-2 rounded"*/}
            {/*                            value={amount}*/}
            {/*                            onChange={(e) => setAmount(Number(e.target.value))}*/}
            {/*                        />*/}
            {/*                    </div>*/}

            {/*                    */}{/* 充值课时 */}
            {/*                    <div className="flex flex-col">*/}
            {/*                        <span className="text-sm text-gray-500 mb-1">*/}
            {/*                            请输入购买的课时数*/}
            {/*                        </span>*/}
            {/*                        <input*/}
            {/*                            type="number"*/}
            {/*                            placeholder="充值课时"*/}
            {/*                            className="border p-2 rounded"*/}
            {/*                            value={hour}*/}
            {/*                            onChange={(e) => setHour(Number(e.target.value))}*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                </div>*/}

            {/*                <div className="flex justify-end gap-2 mt-4">*/}
            {/*                    <button*/}
            {/*                        onClick={() => setShowRechargeModal(false)}*/}
            {/*                        className="px-3 py-1 border rounded"*/}
            {/*                    >*/}
            {/*                        取消*/}
            {/*                    </button>*/}

            {/*                    <button*/}
            {/*                        onClick={handleRechargeConfirm}*/}
            {/*                        disabled={loading}*/}
            {/*                        className="bg-blue-500 text-white px-3 py-1 rounded"*/}
            {/*                    >*/}
            {/*                        {loading ? "提交中..." : "确认"}*/}
            {/*                    </button>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    )*/}
            {/*}*/}
        </div>
    );
}