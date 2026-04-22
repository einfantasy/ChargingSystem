export function isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() < Date.now();
}

export function getTimeRemaining(): number {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) return 0;
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    return expiryTime - now;
}

export async function refreshToken(): Promise<{ success: boolean; data?: any }> {
    try {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("expiresAt", data.expiresAt);
            return { success: true, data };
        }
        return { success: false };
    } catch {
        return { success: false };
    }
}

export function checkTokenStatus(onExpire: () => void, onWarn: (message: string) => void): void {
    const expiresAt = localStorage.getItem("expiresAt");
    if (!expiresAt) {
        onExpire();
        return;
    }

    const remaining = getTimeRemaining();

    if (remaining <= 0) {
        onExpire();
        return;
    }

    const fiveMinutes = 5 * 60 * 1000;
    if (remaining <= fiveMinutes) {
        const minsLeft = Math.ceil(remaining / 60000);
        onWarn(`登录将在 ${minsLeft} 分钟后过期，是否继续？`);
    }
}
