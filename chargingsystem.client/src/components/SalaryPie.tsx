import { useState, useEffect, useCallback } from 'react';

interface SalaryData {
    teacherName: string;
    salary: number;
}

async function fetchSalaryData(date: string): Promise<SalaryData[]> {
    const [year, month] = date.split('-');
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/consume/query_salary?queryYear=${year}&queryMonth=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
        return await response.json();
    }
    return [];
}

export default function SalaryPie() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [salaryData, setSalaryData] = useState<SalaryData[]>([]);

    const fetchSalary = useCallback(async (date: string) => {
        const data = await fetchSalaryData(date);
        setSalaryData(data);
    }, []);

    useEffect(() => {
        const handleMonthSelect = (e: CustomEvent) => {
            const { year, month } = e.detail;
            const date = `${year}-${String(month).padStart(2, '0')}`;
            fetchSalary(date);
        };
        window.addEventListener('salaryMonthSelect', handleMonthSelect as EventListener);
        fetchSalary(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
        return () => window.removeEventListener('salaryMonthSelect', handleMonthSelect as EventListener);
    }, [currentYear, currentMonth, fetchSalary]);

    const colors = ['#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#F97316'];

    const total = salaryData.reduce((sum, d) => sum + d.salary, 0);

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 lg:p-5 rounded-xl shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl flex justify-center w-full overflow-x-auto">
            <div className="min-w-fit">
                <h3 className="text-purple-300 text-xs lg:text-sm font-medium mb-3 text-center">收入分布</h3>
                {salaryData.length > 0 ? (
                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                {salaryData.reduce((acc, d, i) => {
                                    const percent = total > 0 ? d.salary / total : 0;
                                    const offset = acc.offset;
                                    acc.elements.push(
                                        <circle
                                            key={i}
                                            cx="18"
                                            cy="18"
                                            r="15.9155"
                                            fill="transparent"
                                            stroke={colors[i % colors.length]}
                                            strokeWidth="4"
                                            strokeDasharray={`${percent * 100} ${100 - percent * 100}`}
                                            strokeDashoffset={25 - offset}
                                        />
                                    );
                                    acc.offset += percent * 100;
                                    return acc;
                                }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                            {salaryData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                                    <span className="text-purple-200">{d.teacherName}</span>
                                    <span className="text-white font-medium">¥{d.salary.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-400 text-sm">暂无数据</div>
                )}
            </div>
        </div>
    );
}