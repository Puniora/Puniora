import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  loginWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  loginWithOtp: async () => { },
  verifyOtp: async () => { },
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error("Auth session check failed:", error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithOtp = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // Don't include emailRedirectTo - this forces OTP token instead of magic link
        },
      });

      if (error) throw error;
      toast.success("OTP sent!", {
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Smart Handling: If rate limit exceeded, user likely already has a valid OTP.
      // We allow them to proceed to the OTP step to enter the code they have.
      if (error.message?.toLowerCase().includes("rate limit") || 
          error.message?.toLowerCase().includes("too many requests") ||
          error.status === 429) {
            
        toast.info("OTP already sent recently", {
          description: "Please check your email for the code sent a moment ago. Rate limit exceeded for new codes.",
        });
        // We do NOT throw here, effectively treating it as a "success" so the UI moves to the next step
        return; 
      }

      toast.error("Failed to send OTP", {
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);

      toast.success("Login successful!", {
        description: "Welcome back to Puniora.",
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Invalid OTP", {
        description: "Please check the code and try again.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, loginWithOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
