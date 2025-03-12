
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import CategorySelector from "@/components/CategorySelector";
import FileUpload from "@/components/FileUpload";
import MapView from "@/components/MapView";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const ReportForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [severity, setSeverity] = useState([2]); // Default to medium severity
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para reportar un problema");
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Handle file selection and preview
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!title) newErrors.title = true;
    if (!description) newErrors.description = true;
    if (!selectedCategory) newErrors.category = true;
    if (!selectedLocation) newErrors.location = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call - In a real app, this would send data to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("¡Problema reportado con éxito!");
      navigate("/map");
    } catch (error) {
      toast.error("Ocurrió un error al reportar el problema");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.div 
        className="flex-1 pt-16 pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container max-w-5xl mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Reportar un problema</h1>
              <p className="text-muted-foreground">
                Completa el formulario para informar sobre un problema en tu comunidad
              </p>
            </div>
            
            <Button variant="outline" onClick={() => navigate("/map")}>
              Volver al mapa
            </Button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Form fields */}
              <div className="space-y-6">
                <Card className="p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className={errors.title ? "text-red-500" : ""}>
                        Título del problema *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Ej: Vereda rota en Av. Arequipa"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-xs">El título es obligatorio</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
                        Descripción *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe el problema con detalle"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs">La descripción es obligatoria</p>
                      )}
                    </div>
                  </div>
                </Card>
                
                <Card className={`p-6 shadow-sm ${errors.category ? "border-red-500" : ""}`}>
                  <CategorySelector
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-2">Selecciona una categoría</p>
                  )}
                </Card>
                
                <Card className="p-6 shadow-sm">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Nivel de gravedad</h3>
                    <div className="pt-2">
                      <Slider
                        defaultValue={[2]}
                        min={1}
                        max={4}
                        step={1}
                        value={severity}
                        onValueChange={setSeverity}
                      />
                      
                      <div className="flex justify-between mt-2">
                        <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">Baja</span>
                        <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full">Media</span>
                        <span className="text-xs bg-orange-500/20 text-orange-700 px-2 py-0.5 rounded-full">Alta</span>
                        <span className="text-xs bg-red-500/20 text-red-700 px-2 py-0.5 rounded-full">Urgente</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 shadow-sm">
                  <FileUpload onFileChange={setFile} previewUrl={filePreview} />
                </Card>
              </div>
              
              {/* Right column - Map */}
              <div className="space-y-6">
                <Card className={`p-6 shadow-sm ${errors.location ? "border-red-500" : ""}`}>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Ubicación del problema *
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en el mapa para seleccionar la ubicación exacta del problema
                    </p>
                    
                    <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                      <MapView 
                        centerOnUser={true} 
                        onLocationSelect={handleLocationSelect}
                        selectedLocation={selectedLocation}
                      />
                    </div>
                    
                    {errors.location && (
                      <div className="flex items-center gap-2 text-red-500 text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Selecciona la ubicación del problema</span>
                      </div>
                    )}
                    
                    {selectedLocation && (
                      <div className="flex items-center gap-2 text-green-600 text-xs">
                        <CheckCircle className="h-4 w-4" />
                        <span>Ubicación seleccionada: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}</span>
                      </div>
                    )}
                  </div>
                </Card>
                
                <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando reporte...
                    </>
                  ) : (
                    "Enviar reporte"
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Al enviar este reporte, aceptas que la información proporcionada es verídica
                  y puede ser verificada por las autoridades correspondientes.
                </p>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportForm;
