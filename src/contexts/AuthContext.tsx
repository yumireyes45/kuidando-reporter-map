import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) {
        throw error;
      }
  
      if (data && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
        });
        toast.success("¡Inicio de sesión exitoso!");
        return; // Login exitoso
      }
  
      throw new Error("No se pudo iniciar sesión");
    } catch (error: any) {
      toast.error("Error al iniciar sesión: " + error.message);
      throw error; // Re-lanzamos el error para manejarlo en el componente Auth
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    console.log("Intentando registrar usuario en Supabase:", email); // 🔍 Ver si se ejecuta
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            email_confirm: true // Marca el email como confirmado
          }
        }
      });
  
      if (error) {
        console.error("Error en Supabase:", error);
        throw error;
      }
  
      // Si el registro es exitoso, iniciamos sesión inmediatamente
      if (data.user) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (loginError) throw loginError;

        toast.success("¡Registro exitoso! Bienvenido a Kuidando");
        // No mostramos el mensaje de verificación de email
      }
    } catch (error: any) {
      toast.error("Error al registrarse: " + error.message);
      console.error("Registro error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Has cerrado sesión");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
