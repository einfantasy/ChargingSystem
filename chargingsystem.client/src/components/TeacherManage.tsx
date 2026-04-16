import { useState } from "react";
import type { Teacher } from "../types";
import ConfirmModal from "./ConfirmModal";

export default function TeacherManagePage({
    teachers,
    fetchTeachers
}: {
    teachers: Teacher[];
    fetchTeachers: () => Promise<void>
}) {
    // ----------------------------------------------------------------
    // 1. 状态管理 (State)
    // ----------------------------------------------------------------
    const [loading, setLoading] = useState<boolean>(false);

    // 控制弹窗
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 表单数据
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [removeTeacherId, setRemoveTeacherId] = useState("");

    // ----------------------------------------------------------------
    // 2. 核心业务逻辑 (API Actions)
    // ----------------------------------------------------------------

    /** 新增教师 */
    const handleAddTeacher = async (): Promise<void> => {
        if (!name.trim() || !subject.trim()) {
            alert("请完整填写姓名和学科");
            return;
        }
        if (loading) return;

        setLoading(true);
        try {
            const res = await fetch("/api/teacher/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    teacherId: crypto.randomUUID(),
                    name: name.trim(),
                    subject: subject.trim(),
                } as Teacher),
            });

            if (!res.ok) throw new Error("请求失败");

            setShowAddModal(false);
            setName("");
            setSubject("");
            await fetchTeachers(); // 刷新列表
        } catch (err) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    /** 删除教师 */
    const handleRemoveTeacher = async (): Promise<void> => {
        if (!removeTeacherId || loading) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/teacher/remove?teacherId=${removeTeacherId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) throw new Error("请求失败");

            setShowDeleteModal(false);
            setRemoveTeacherId("");
            await fetchTeachers(); // 刷新列表
        } catch (err) {
            console.error(err);
            alert("删除失败");
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------
    // 3. 子模块渲染 (Render Helpers)
    // ----------------------------------------------------------------

    // 渲染新增教师的弹窗
    const renderAddModal = () => {
        if (!showAddModal) return null;
        return (
            <div className="modal-overlay">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">新增教师</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">教师姓名</label>
                            <input
                                placeholder="请输入姓名"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">教授学科</label>
                            <input
                                placeholder="请输入学科"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            disabled={loading}
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                        >
                            取消
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleAddTeacher}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
                        >
                            {loading ? "提交中..." : "确认"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ----------------------------------------------------------------
    // 4. 主页面渲染
    // ----------------------------------------------------------------
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">教师管理</h2>

            <div className="flex justify-between items-center mb-4">
                <div className="flex justify-start">
                </div>
                {/* 新增教师按钮 */}
                <button
                    onClick={() => {
                        setName("");
                        setSubject("");
                        setShowAddModal(true);
                    }}
                    className="bgbg-blue-500 text-white px-4 py-2 rounded mb-4 btn-gradient"
                >
                    + 新增教师
                </button>
            </div>

            {/* 数据表格 */}
            <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
                <table className="w-full bg-white shadow rounded">
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>学科</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t.teacherId} className="text-center border-t hover:bg-gray-50 transition-colors">
                                <td>{t.name}</td>
                                <td>{t.subject}</td>
                                <td>
                                    <button
                                        className="bg-red-500 hover:bg-red-800 text-white px-2 py-1 rounded"
                                        onClick={() => {
                                            setRemoveTeacherId(t.teacherId);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-4 text-gray-500 text-center">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 弹窗组件 */}
            {renderAddModal()}

            <ConfirmModal
                isOpen={showDeleteModal}
                title="确认删除"
                message="确定要删除这位教师的信息吗？此操作不可撤销。"
                loading={loading}
                onConfirm={handleRemoveTeacher}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setRemoveTeacherId("");
                }}
            />
        </div>
    );
}