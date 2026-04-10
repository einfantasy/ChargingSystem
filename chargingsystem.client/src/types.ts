// src/types.ts

// 定义用户基本信息接口
export interface User {
    username: string;
    token: string;
    // 你可以根据后端 API 的实际返回增加字段
    email?: string; // 问号表示该字段是可选的
    expiresAt: string;// ISO 字符串日期
}

// 如果你以后有复杂的 API 返回格式，也可以定义在这里
export interface LoginResponse {
    user: User;
    expiration: string;
}

// 也可以定义天气预报的接口，让 Home.tsx 也能复用
export interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

export interface DashboardInfo {
    totalHours: string;
    totalMoney: string;
    teacherCount: string;
    studentCount: string;
}

export interface Student {
    studentId: string;
    name: string;
}

export interface Teacher {
    teacherId: string;
    name: string;
    subject: string;
}

export interface StudentBalanceDto {
    studentId: string;
    studentName: string;
    rechargeId: string;
    remainingHours: number;
    cost: number;
}

export interface RechargeRecord {
    id: string;
    studentId: string;
    rechargePrice: number;
    rechargeHour: number;
    date: string
    cost: number;
}