import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2, MapPin, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";


const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginForm.email) {
      newErrors.loginEmail = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.loginEmail = "El correo electrónico no es válido";
    }
    
    if (!loginForm.password) {
      newErrors.loginPassword = "La contraseña es obligatoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateRegister = () => {
    const newErrors: Record<string, string> = {};

    if (!registerForm.email) {
      newErrors.registerEmail = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.registerEmail = "El correo electrónico no es válido";
    }
    
    if (!registerForm.password) {
      newErrors.registerPassword = "La contraseña es obligatoria";
    } else if (registerForm.password.length < 6) {
      newErrors.registerPassword = "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.registerConfirmPassword = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateLogin()) {

      try {
        await login(loginForm.email, loginForm.password);
        navigate("/map"); // Solo navegamos si el login fue exitoso
      } catch (error: any) {
        console.error("Error en el inicio de sesión:", error);
        // El toast de error ya se muestra en el AuthContext
      }
    }
    
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro iniciado..."); // 🔍 Ver si se ejecuta
  
    if (!validateRegister()) {
      console.error("⚠️ Error en la validación del formulario:", errors);
      return;
    }
  
    try {
      console.log("Datos enviados a Supabase:", registerForm.email, registerForm.password);
      await register(registerForm.email, registerForm.password);
      toast.success("¡Registro exitoso!");
      navigate("/map");
    } catch (error: any) {
      toast.error("Error al registrarse: " + error.message);
      console.error("Error en el registro:", error);
    }
  };
  
  

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Añadir el botón de volver */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-20 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Volver al inicio"
      >
        <ArrowLeft className="h-6 w-6 text-gray-600" />
      </button>
      
      <motion.div 
        className="flex-1 flex items-center justify-center px-4 py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Bienvenido a Kuidando</h1>
            <p className="text-muted-foreground mt-1">
              Inicia sesión o regístrate para reportar problemas
            </p>
          </div>
          
          <Card className="border-border/60 shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className={errors.loginEmail ? "border-red-500" : ""}
                      />
                      {errors.loginEmail && <p className="text-red-500 text-xs">{errors.loginEmail}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className={errors.loginPassword ? "border-red-500" : ""}
                      />
                      {errors.loginPassword && <p className="text-red-500 text-xs">{errors.loginPassword}</p>}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar sesión"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Correo electrónico</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className={errors.registerEmail ? "border-red-500" : ""}
                      />
                      {errors.registerEmail && <p className="text-red-500 text-xs">{errors.registerEmail}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className={errors.registerPassword ? "border-red-500" : ""}
                      />
                      {errors.registerPassword && <p className="text-red-500 text-xs">{errors.registerPassword}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className={errors.registerConfirmPassword ? "border-red-500" : ""}
                      />
                      {errors.registerConfirmPassword && (
                        <p className="text-red-500 text-xs">{errors.registerConfirmPassword}</p>
                      )}
                    </div>

                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registrarse"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
