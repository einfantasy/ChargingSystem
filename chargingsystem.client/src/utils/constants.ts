export const API = {
    AUTH: {
        LOGIN: "/api/auth/login",
        REFRESH: "/api/auth/refresh",
        CHANGE_PASSWORD: "/api/auth/change-password",
    },
    STUDENT: {
        LIST: "/api/student/list",
        ADD: "/api/student/add",
    },
    TEACHER: {
        LIST: "/api/teacher/list",
        ADD: "/api/teacher/add",
        REMOVE: "/api/teacher/remove",
    },
    RECHARGE: {
        ADD: "/api/recharge/add",
        QUERY: "/api/recharge/query",
    },
    CONSUME: {
        ADD: "/api/consume/add",
        QUERY: "/api/consume/query",
    },
    UTIL: {
        DASHBOARD: "/api/util/dashboard",
    },
} as const;
