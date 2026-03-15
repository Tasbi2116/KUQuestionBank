import axios from "axios";

/**
 * Pre-configured Axios instance pointing to the Express backend.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL as string,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach Supabase access token to every request automatically
api.interceptors.request.use(async (config) => {
    const { supabase } = await import("./supabase");
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export default api;