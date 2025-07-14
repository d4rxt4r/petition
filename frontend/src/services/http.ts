import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export const http = axios.create({
    baseURL: '/api',
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
const retryQueue: ((tokenRefreshed: boolean) => void)[] = [];

async function refreshTokens() {
    // повторы не запускаем
    if (!refreshPromise) {
        refreshPromise = http.post('/auth/refresh').then(() => {
            refreshPromise = null;
            isRefreshing = false;
            retryQueue.splice(0).forEach((cb) => cb(true));
        });
    }
    return refreshPromise;
}

http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & {
            _retry?: true;
        };
        const status = error.response?.status;

        if ((status === 401 || status === 422) && !original._retry) {
            original._retry = true;

            if (!isRefreshing)
                isRefreshing = true;

            try {
                await refreshTokens();
                // повтораем исходный запрос после успешного refresh
                return http(original);
            } catch {
                // refresh не прошёл → редирект на логин
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth';
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    },
);
