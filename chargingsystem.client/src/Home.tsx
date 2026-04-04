import React, { useEffect, useState } from 'react';
import './App.css';
import type { Forecast } from './types';

interface HomeProps {
    user: { username: string };
    onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
    const [forecasts, setForecasts] = useState<Forecast[]>();

    useEffect(() => {
        populateWeatherData();
    }, []);

    const contents = forecasts === undefined
        ? <p><em>Loading...</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Temp. (C)</th>
                    <th>Temp. (F)</th>
                    <th>Summary</th>
                </tr>
            </thead>
            <tbody>
                {forecasts.map(forecast =>
                    <tr key={forecast.date}>
                        <td>{forecast.date}</td>
                        <td>{forecast.temperatureC}</td>
                        <td>{forecast.temperatureF}</td>
                        <td>{forecast.summary}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>你好, {user?.username || "未知用户"}</h1>
                {/* 使用 ?. 确保 user 不为 null，使用 || 提供保底显示 */}
                <button onClick={onLogout}>退出登录</button>
            </div>
            <p>这是从 ASP.NET 后端获取的受保护数据：</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {contents}     
            </div>
        </div>
    );

    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        if (response.ok) {
            const data = await response.json();
            setForecasts(data);
        }
    }
};