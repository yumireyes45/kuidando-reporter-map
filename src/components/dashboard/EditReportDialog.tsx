import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import CategorySelector from "@/components/CategorySelector";
import MapView from "@/components/MapView";
import { Card } from "@/components/ui/card";

interface EditReportDialogProps {
  report: any;
  onClose: () => void;
  onUpdate: () => void;
}

interface SingleReportMapProps {
  location: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}

const SingleReportMap: React.FC<SingleReportMapProps> = ({ location, onLocationSelect }) => {
  return (
    <MapView
      selectedLocation={location}
      onLocationSelect={onLocationSelect}
      centerOnUser={false}
      showReportDetails={false}
      initialCenter={{
        lat: location[0],
        lng: location[1]
      }}
      zoom={15}
      hideOtherMarkers={true} // Nueva prop para ocultar otros marcadores
    />
  );
};

export const EditReportDialog: React.FC<EditReportDialogProps> = ({
    report,
    onClose,
    onUpdate,
  }) => {
    const [description, setDescription] = useState(report.description);
    const [category, setCategory] = useState(report.categoryid);
    const [severity, setSeverity] = useState([report.severity]); // Array para mantener consistencia con ReportForm
    const [location, setLocation] = useState<[number, number]>([
      report.latitude,
      report.longitude,
    ]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(report.imageurl);
    const [isLoading, setIsLoading] = useState(false);
  
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
  
    const handleSubmit = async () => {
      setIsLoading(true);
      try {
        let uploadedImageUrl = imageUrl;
  
        if (imageFile) {
          const newImageUrl = await uploadImage(imageFile);
          if (newImageUrl) uploadedImageUrl = newImageUrl;
        }
  
        const { error } = await supabase
          .from("reports")
          .update({
            description,
            categoryid: category,
            severity: severity[0],
            latitude: location[0],
            longitude: location[1],
            imageurl: uploadedImageUrl,
          })
          .eq("id", report.id);
  
        if (error) throw error;
  
        toast.success("Reporte actualizado con éxito");
        onUpdate();
        onClose();
      } catch (error) {
        console.error("Error updating report:", error);
        toast.error("Error al actualizar el reporte");
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="max-w-3xl h-[85vh] p-0 rounded-lg">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle><span className="text-2xl">Editar Reporte</span></DialogTitle>
            </DialogHeader>
    
            <div className="px-6 pb-6 overflow-y-auto h-[calc(85vh-120px)] ">
              <div className="space-y-4">
                <Card className="p-6 shadow-sm mb-2">
                  <CategorySelector
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                  />
                </Card>

                <Card className="p-6 shadow-sm mb-2">
                  <h3 className="text-base font-medium text-muted-foreground mb-2">Descripción del Problema</h3>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción detallada del problema"
                    className="min-h-[100px]"
                  />
                </Card>
    
                <Card className="p-6 shadow-sm mb-2">
                  <h3 className="text-base font-medium text-muted-foreground mb-2">
                    Nivel de Severidad
                  </h3>
                  <Slider
                    value={severity}
                    onValueChange={setSeverity}
                    min={1}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                </Card>
    
                <Card className="p-6 shadow-sm mb-2">
              <h3 className="text-base font-medium text-muted-foreground mb-2">
                Ubicación Actual del Problema (Clic para actualizar)
              </h3>
              <div className="h-[250px] rounded-md overflow-hidden border">
                <SingleReportMap
                  location={location}
                  onLocationSelect={(lat, lng) => setLocation([lat, lng])}
                />
              </div>
            </Card>
    
                <Card className="p-6 shadow-sm mb-2">
                  <h3 className="text-base font-medium text-muted-foreground mb-2">
                      Subir Imagen (Recomendación: en formato horizontal)
                  </h3>
                  <Input className="mb-4"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded-md overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Vista previa" 
                        className="w-full h-36 object-cover" 
                      />
                    </div>
                  )}
                </Card>
    
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Guardar cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
  };