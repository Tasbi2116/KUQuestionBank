import axios from "axios";

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL as string) ?? "http://localhost:5000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(async (config) => {
    try {
        const { supabase } = await import("./supabase");
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch {
        // Public endpoint — no token needed
    }
    return config;
});

export default api;