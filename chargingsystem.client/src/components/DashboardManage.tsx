import React, { useEffect, useState } from 'react';
import type { DashboardInfo } from '../types';
import Contribution from './Contribution';

const DashboardManage: React.FC = () => {
    const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>({
        totalMoney: "0",
        totalHours: "0",
        teacherCount: "0",
        studentCount: "0"
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed, so we add 1
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);

    const fetchDashboard = async (qYear: number, qMonth: number) => {
        try {
            const response = await fetch(`/api/util/dashboard?queryYear=${qYear}&queryMonth=${qMonth}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDashboardInfo(data);
            }
        } catch (error) {
            console.error("看板数据获取失败:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchDashboard(year, month);
        };
        loadData();
    }, [year, month]);

    const handleMonthSelect = (selectedYear: number, selectedMonth: number) => {
        setYear(selectedYear);
        setMonth(selectedMonth);
        fetchDashboard(selectedYear, selectedMonth);
    };

    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white">数据总览</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card title="当月课时" value={dashboardInfo.totalHours} />
                <Card title="当月收入" value={`¥${dashboardInfo.totalMoney}`} />
                <Card title="教师人数" value={dashboardInfo.teacherCount} />
               <Card title="活跃学生" value={dashboardInfo.studentCount} />
            </div>
           <div className="mt-4">
                <Contribution onMonthSelect={handleMonthSelect} />
            </div>
        </div>
    );
};

function Card({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 lg:p-5 rounded-xl shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:scale-[1.02]">
            <div className="text-purple-300 text-xs lg:text-sm font-medium mb-1">{title}</div>
            <div className="text-xl lg:text-2xl font-bold text-white">{value}</div>
        </div>
    );
}

export default DashboardManage;
