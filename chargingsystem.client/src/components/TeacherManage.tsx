import { useState } from "react";
import type { Teacher } from "../types";
import ConfirmModal from "./ConfirmModal";
import Modal from './Modal';
import TableContainer from './TableContainer';
import ModalActions from './ModalActions';

export default function TeacherManagePage({
    teachers,
    fetchTeachers
}: {
    teachers: Teacher[];
    fetchTeachers: () => Promise<void>
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [removeTeacherId, setRemoveTeacherId] = useState("");

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
            await fetchTeachers();
        } catch (err) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

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
            await fetchTeachers();
        } catch (err) {
            console.error(err);
            alert("删除失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4">教师管理</h2>

            <div className="flex justify-between items-center mb-4">
                <div className="flex justify-start">
                </div>
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

            <TableContainer>
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
            </TableContainer>

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="新增教师">
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
                <ModalActions
                    onConfirm={handleAddTeacher}
                    onCancel={() => setShowAddModal(false)}
                    loading={loading}
                />
            </Modal>

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
