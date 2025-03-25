import React, { useEffect, useState } from "react";
import { categories } from "./CategorySelector";
import { MapPin, X, ArrowUp, Angry, SearchIcon, Calendar1, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useLoadScript } from "@react-google-maps/api";


const ReportDetails = ({ reports, onSupport, currentUserId, onClose }) => {
  if (!reports) return null; // 🔹 Evita errores si `report` es `null`

  const category = categories.find((c) => c.id === reports.categoryid);
  const [supportersCount, setSupportersCount] = useState(reports.supporters);
  const [hasSupported, setHasSupported] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);


  const { locationsDetails } = useReverseGeocode([reports]); // Pass reports as an array
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });
  

  useEffect(() => {
    const checkIfUserSupported = async () => {
      if (!currentUserId) return;
    
      try {
        const { data, error } = await supabase
          .from("report_supporters")
          .select("id")
          .eq("report_id", reports.id)
          .eq("user_id", currentUserId)
          .maybeSingle(); // Cambiar single() por maybeSingle()
    
        if (error) {
          console.error("❌ Error al verificar apoyo al reporte:", error);
          return;
        }
    
        setHasSupported(!!data);
      } catch (error) {
        console.error("Error inesperado:", error);
      }
    };

    checkIfUserSupported();
  }, [currentUserId, reports.id]);

  const handleSupport = async () => {
    if (!currentUserId) {
      toast.error("Debes iniciar sesión para sumarte a este reporte.");
      return;
    }

    if (currentUserId === reports.createdby) {
      toast.info("No puedes sumarte a tu propio reporte.");
      return;
    }

    if (hasSupported) {
      toast.info("Ya te has sumado a este reporte.");
      return;
    }

    try {
      // 🔹 Agregar el usuario a la tabla report_supporters
      const { error: insertError } = await supabase.from("report_supporters").insert([
        { report_id: reports.id, user_id: currentUserId },
      ]);

      if (insertError) {
        console.error("❌ Error al registrar el apoyo:", insertError);
        toast.error("No se pudo registrar tu apoyo.");
        return;
      }

      // 🔹 Incrementar el número de supporters en la base de datos
      const { error: updateError } = await supabase
        .from("reports")
        .update({ supporters: supportersCount + 1 })
        .eq("id", reports.id);

      if (updateError) {
        console.error("❌ Error al actualizar supporters:", updateError);
        toast.error("No se pudo actualizar el número de apoyos.");
        return;
      }

      // 🔹 Actualizar el estado local
      setSupportersCount((prev) => prev + 1);
      setHasSupported(true);
      toast.success("¡Te has sumado a este reporte!");
    } catch (error) {
      console.error("❌ Error inesperado al apoyar reporte:", error);
      toast.error("Ocurrió un error al sumarte al reporte.");
    }
  };

  // Reemplazar la sección de imagen existente con:
  const renderImage = () => (
    <div className="relative w-full">
      {reports.imageurl ? (
        <>
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
  
          {/* Imagen con carga controlada */}
          <img 
            src={reports.imageurl} 
            alt={category?.name || "Imagen del problema"} 
            className="w-full h-[200px] sm:h-[300px] object-cover transition-opacity duration-200"
            style={{ opacity: isImageLoading ? 0 : 1 }}
            onLoad={() => setIsImageLoading(false)}
          />
  
          {/* 🔹 Botón de apertura con `stopPropagation()` solo en el icono */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // 🔹 Evita que el clic cierre el reporte o haga otras acciones
              setIsImageOpen(true);
            }}
            className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-full flex items-center gap-1 text-white text-xs"
          >
            <SearchIcon className="h-4 w-4" />
            Ver imagen completa
          </button>
        </>
      ) : (
        <div className="w-full h-[200px] sm:h-[300px] bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">No hay imagen disponible</span>
        </div>
      )}
    </div>
  );
  

  return (
    <motion.div 
    className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto bg-background/80 backdrop-blur-sm rounded-t-xl sm:relative sm:bottom-auto sm:rounded-lg"
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 100 }}
  >
      <Card className="overflow-hidden relative border-0 sm:border">
        {/* Botón de cierre con posición fija */}
      <div className="absolute top-4 right-2 z-[60]">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Cerrar reporte"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

        {/* 🔹 Verifica si hay imagen antes de mostrar */}
        {renderImage()}

        <div className="p-4 sm:p-6">

          {/* Reemplazamos el título por la categoría */}
          <h1 className="text-xl sm:text-2xl font-bold mt-2">
          {category?.name || "Problema reportado"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
            {reports.description}
          </p>

          {/* Add location details after description */}
          {locationsDetails[reports.id] ? (
            <p className="text-muted-foreground mt-2 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {locationsDetails[reports.id].district || locationsDetails[reports.id].city || 'Ubicación no disponible'}
              {locationsDetails[reports.id].district && locationsDetails[reports.id].city && `, ${locationsDetails[reports.id].city}`}
            </p>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Obteniendo ubicación...</span>
            </p>
          )}

          {/* Metadata del reporte */}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
            <Calendar1 className="mt-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground mt-2 text-sm sm:text-base">
                Reportado el {new Date(reports.createdat).toLocaleDateString()}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category?.color}`}>
              {category && React.createElement(category.icon, {
                className: 'h-4 w-4 text-white'
              })}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <Angry className="h-5 w-5" />
              <span>Personas que se unieron al reporte: {supportersCount}</span>
            </div>
          </div>
          
          

          {/* Botón de apoyo */}
          <div className="pt-4 border-t mt-2">
            <Button 
              onClick={handleSupport} 
              disabled={hasSupported} 
              className="w-full gap-2 py-6 text-sm sm:text-base"
            >
              <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>
                {hasSupported ? "Ya estás apoyando 😎" : "Unirme a este reporte (100% anónimo 🤫)"}
              </span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog para mostrar imagen completa */}
    <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] h-auto p-0">
        <DialogTitle className="sr-only">
          {category?.name || "Imagen del problema"}
        </DialogTitle>

        <div className="relative w-full h-full max-h-[85vh] overflow-hidden">
          <button
            onClick={() => setIsImageOpen(false)}
            className="absolute top-2 right-2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Cerrar imagen"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          <div className="w-full h-full flex items-center justify-center bg-black/5">
            <img 
              src={reports.imageurl} 
              alt={category?.name || "Imagen del problema"} 
              className="max-w-full max-h-[80vh] object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>

    </motion.div>
  );
};

export default ReportDetails;
