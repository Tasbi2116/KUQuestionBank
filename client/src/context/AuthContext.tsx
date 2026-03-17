import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";
import api from "@/lib/axios";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const initDone = useRef(false);

    const fetchProfile = async (): Promise<void> => {
        try {
            const { data } = await api.get<{
                success: boolean;
                data: UserProfile;
            }>("/api/auth/me");
            if (data?.success && data?.data) {
                setProfile(data.data);
            } else {
                setProfile(null);
            }
        } catch {
            setProfile(null);
        }
    };

    const refreshProfile = async (): Promise<void> => {
        await fetchProfile();
    };

    useEffect(() => {
        if (initDone.current) return;
        initDone.current = true;

        // Listen to auth state changes — this is the single source of truth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Small delay to ensure token is ready before API call
                    setTimeout(async () => {
                        await fetchProfile();
                        setLoading(false);
                    }, 100);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setLoading(false);
            }
            // If session exists, onAuthStateChange will fire and handle it
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async (): Promise<void> => {
        setUser(null);
        setProfile(null);
        setSession(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{ user, profile, session, loading, signOut, refreshProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};