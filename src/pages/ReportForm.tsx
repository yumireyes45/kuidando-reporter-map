import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import CategorySelector from "@/components/CategorySelector";
import MapView from "@/components/MapView";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider"; // Adjust the path based on your project structure
import { supabase } from "@/supabaseClient";

// Asegúrate que la ruta sea correcta


const ReportForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [severity, setSeverity] = useState([2]); // Nivel medio por defecto
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [isAuthLoading, setIsAuthLoading] = useState(true); // Nuevo estado
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Añadir esta función para manejar cuando el mapa está listo
  const handleMapLoad = () => {
    setIsMapLoaded(true);
  };

  // Añadir esta función para obtener la etiqueta de severidad
  const getSeverityLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Bajo";
      case 2:
        return "Medio";
      case 3:
        return "Alto";
      case 4:
        return "Crítico";
      default:
        return "Medio";
    }
  };


  useEffect(() => {
    // Solo redirigir si estamos seguros de que no está autenticado
    if (!isAuthLoading && !isAuthenticated) {
      toast.error("Debes iniciar sesión para reportar un problema");
      navigate("/auth");
    }
    // Cuando isAuthenticated cambie a true, actualizamos isAuthLoading
    if (isAuthenticated) {
      setIsAuthLoading(false);
    }
  }, [isAuthenticated, navigate]);

  // Si aún está cargando la autenticación, mostramos un loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    if (!description) newErrors.description = true;
    if (!selectedCategory) newErrors.category = true;
    if (!selectedLocation) newErrors.location = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

  /** Simple image upload to Supabase */
  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
  
    const { data, error } = await supabase.storage
      .from("report_images")
      .upload(fileName, file);
  
    if (error) {
      console.error("Error al subir la imagen:", error);
      toast.error("No se pudo subir la imagen.");
      return null;
    }
  
    return supabase.storage.from("report_images").getPublicUrl(fileName).data.publicUrl;
  };
  

  /** Simple file change handler */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten imágenes.");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  

  /** 🔹 Manejar el envío del formulario */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para reportar un problema.");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = null;

      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      const reportData = {
        title,
        description,
        latitude: selectedLocation ? selectedLocation[0] : null,
        longitude: selectedLocation ? selectedLocation[1] : null,
        categoryid: selectedCategory,
        severity: severity[0],
        imageurl: uploadedImageUrl,
        createdby: user.id, // 🔹 Usa el ID del usuario autenticado
        supporters: 1,
      };

      console.log("📤 Datos que se envían a Supabase:", reportData);

      const { data, error } = await supabase.from("reports").insert([reportData]).select("id").single();

      if (error) throw error;

      // 🔹 Agregar al creador como primer supporter
      const { error: supportError } = await supabase.from("report_supporters").insert([
        { report_id: data.id, user_id: user.id },
      ]);

      if (supportError) {
        console.error("❌ Error al registrar el primer apoyo:", supportError);
      }

      toast.success("¡Problema reportado con éxito!");
      navigate("/map");
    } catch (error) {
      console.error("❌ Error en el envío:", error);
      toast.error("Ocurrió un error al reportar el problema.");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Manejar la selección de ubicación en el mapa */
  const handleLocationSelect = (lat: number, lng: number) => {
    console.log("📍 Ubicación seleccionada:", lat, lng);
    setSelectedLocation([lat, lng]);
    toast.success(`Ubicación seleccionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div className="flex-1 pt-14 pb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="container max-w-5xl mx-auto px-4 py-6 md:px-6">

          <div className="flex items-center gap-4 ">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/50 hover:bg-primary"
              onClick={() => navigate('/map')}
            >
              <ArrowLeft className="!h-5 !w-5" />
              <span className="sr-only">Volver al mapa</span>
            </Button>
          </div>

            <p className="text-xl text-gray-500 mb-3 pl-5">
              <span className="text-2xl font-bold mb-4 !text-black">Reporta un problema 🫡
                </span> Tranqui, será 100% anónimo :)
            </p>

            

          <form onSubmit={handleSubmit}>

            <Card className="p-6 shadow-sm mb-2">
              <CategorySelector selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            </Card>

            <Card className="p-6 shadow-sm mb-2">
              <h3 className="text-base font-medium text-muted-foreground mb-2">Descripción del Problema</h3>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Card>


            <Card className="p-6 shadow-sm mb-2">
              <h3 className="text-base font-medium text-muted-foreground mb-2">
                Nivel de Severidad
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">
                    {getSeverityLabel(severity[0])}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Nivel {severity[0]} de 4
                  </span>
                </div>
                <Slider
                  value={severity}
                  onValueChange={setSeverity}
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Bajo</span>
                  <span>Medio</span>
                  <span>Alto</span>
                  <span>Crítico</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm mb-2">
              <h3 className="text-base font-medium text-muted-foreground mb-2">
                Ubicación del Problema (Clic en la ubicación exacta)
              </h3>
              <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
                <MapView 
                  centerOnUser={true} 
                  onLocationSelect={handleLocationSelect} 
                  selectedLocation={selectedLocation} 
                  disableInteractions={false} // 🔹 Desactiva interacciones
                  showReportDetails={false} // Añadir esta prop
                  onLoad={handleMapLoad}
                />
              </div>
            </Card>

            <Card className="p-6 shadow-sm mb-2">
            <h3 className="text-base font-medium text-muted-foreground mb-2">
                Subir Imagen (Recomendación: en formato horizontal)
              </h3>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {imageUrl && <img src={imageUrl} alt="Vista previa" className="w-full h-40 object-cover rounded-lg mt-2" />}
            </Card>

            <Button type="submit" className="w-full py-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enviar reporte (anónimo)"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportForm;
