import { useState } from "react";
import type { RechargeRecord, Student } from '../types';
import Modal from './Modal';
import LargeModal from './LargeModal';
import TableContainer from './TableContainer';
import SearchInput from './SearchInput';
import ModalActions from './ModalActions';
import NumberInput from './NumberInput';

export default function StudentManagePage({ students, fetchStudents }: { students: Student[]; fetchStudents: () => Promise<void> }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [hour, setHour] = useState(0);
    const [cost, setCost] = useState(0);

    const handleAddConfirm = async () => {
        if (!name.trim()) return alert("请输入姓名");
        if (loading) return;

        setLoading(true);
        try {
            const res = await fetch("/api/student/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ studentId: crypto.randomUUID(), name }),
            });
            if (!res.ok) throw new Error();
            setShowModal(false);
            setName("");
            await fetchStudents();
        } catch (err) {
            console.error(err);
            alert("新增失败");
        } finally {
            setLoading(false);
        }
    };

    const handleRechargeConfirm = async () => {
        if (!currentStudent || loading) return;

        setLoading(true);
        try {
            await fetch("/api/recharge/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    studentId: currentStudent.studentId,
                    rechargePrice: price,
                    rechargeHour: hour,
                    date: new Date().toLocaleDateString('sv-SE'),
                    cost: cost
                }),
            });
            setShowRechargeModal(false);
            await fetchStudents();
        } catch (err) {
            console.error(err);
            alert("充值失败");
        } finally {
            setLoading(false);
        }
    };

    const openRecordModal = async (student: Student) => {
        setCurrentStudent(student);
        setShowRecordModal(true);
        setLoading(true);
        try {
            const res = await fetch(`/api/recharge/query?studentId=${encodeURIComponent(student.studentId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            setRechargeRecords(data);
        } catch (err) {
            console.error(err);
            alert("无法加载记录");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4">学生管理</h2>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜索姓名..." />
                <button
                    onClick={() => { setShowModal(true); setName(""); }}
                    className="bg-blue-500 text-white px-4 py-2 rounded btn-gradient w-full sm:w-auto"
                >
                    + 新增学生
                </button>
            </div>

            <TableContainer>
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">姓名</th>
                            <th className="px-4 py-3 text-center text-purple-300 font-medium text-sm">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((s) => (
                                <tr key={s.studentId} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                                    <td className="px-4 py-3 text-center text-white">{s.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex space-x-2 justify-center">
                                            <button className="bg-green-500/80 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                                                onClick={() => {
                                                    setCurrentStudent(s);
                                                    setShowRechargeModal(true);
                                                    setHour(0); setPrice(0); setCost(0);
                                                }}>充值</button>
                                            <button className="bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
                                                onClick={() => openRecordModal(s)}>记录</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="py-6 text-slate-400 text-center">暂无数据</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </TableContainer>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="新增学生">
                <input
                    placeholder="请输入姓名"
                    className="w-full bg-white/50 border border-solid p-3 rounded-lg outline-none text-gray-800 placeholder:text-gray-400 mb-4 modal-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <ModalActions
                    onConfirm={handleAddConfirm}
                    onCancel={() => setShowModal(false)}
                    loading={loading}
                />
            </Modal>

            <Modal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} title={`充值 - ${currentStudent?.name}`}>
                <div className="flex flex-col gap-4">
                    {[
                        { label: "充值课时", val: hour, setVal: setHour },
                        { label: "课时单价", val: price, setVal: setPrice },
                        { label: "成本价", val: cost, setVal: setCost }
                    ].map((field, idx) => (
                        <div key={idx} className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 mb-2">{field.label}</span>
                            <span className="text-xs text-gray-500 mb-1">{field.tip}</span>
                            <NumberInput value={field.val} onChange={field.setVal} />
                        </div>
                    ))}
                </div>
                <ModalActions
                    onConfirm={handleRechargeConfirm}
                    onCancel={() => setShowRechargeModal(false)}
                    loading={loading}
                />
            </Modal>

            <LargeModal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title={`${currentStudent?.name} 的充值记录`}>
                <div className="overflow-x-auto overflow-y-auto max-h-[40vh] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/10">
                                <th className="p-3 text-left text-purple-300 font-medium text-sm">日期</th>
                                <th className="p-3 text-left text-purple-300 font-medium text-sm">金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rechargeRecords.length > 0 ? (
                                rechargeRecords.map(record => (
                                    <tr key={record.id} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                                        <td className="p-3 text-left text-gray-400">{record.date.substring(0, 10)}</td>
                                        <td className="p-3 text-left font-medium text-green-400">￥{record.rechargeHour * record.rechargePrice}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={2} className="p-8 text-center text-slate-400">暂无充值记录</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={() => setShowRecordModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors">关闭</button>
                </div>
            </LargeModal>
        </div>
    );
}
