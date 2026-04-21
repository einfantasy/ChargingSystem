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
                <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[90%] sm:w-96 border border-white/20">
                    <h3 className="text-xl font-bold mb-5 text-gray-900">新增教师</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">教师姓名</label>
                            <input
                                placeholder="请输入姓名"
                                className="w-full bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800 placeholder:text-gray-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">教授学科</label>
                            <input
                                placeholder="请输入学科"
                                className="w-full bg-white/50 border border-white/20 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-800 placeholder:text-gray-400"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            disabled={loading}
                            onClick={() => setShowAddModal(false)}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleAddTeacher}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all"
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
            <h2 className="text-xl lg:text-2xl font-bold mb-4">教师管理</h2>

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
                    className="bg-blue-500 text-white px-4 py-2 rounded btn-gradient w-full sm:w-auto"
                >
                    + 新增教师
                </button>
            </div>

            {/* 数据表格 */}
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">姓名</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">学科</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t.teacherId} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                                <td className="px-4 py-3 text-center text-white">{t.name}</td>
                                <td className="px-4 py-3 text-center text-slate-300">{t.subject}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
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
                                <td colSpan={3} className="py-6 text-slate-400 text-center">暂无数据</td>
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