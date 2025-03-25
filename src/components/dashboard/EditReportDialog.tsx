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

interface EditReportDialogProps {
  report: any;
  onClose: () => void;
  onUpdate: () => void;
}

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
          <DialogContent className="max-w-3xl h-[85vh] p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Editar Reporte</DialogTitle>
            </DialogHeader>
    
            <div className="px-6 pb-6 overflow-y-auto h-[calc(85vh-120px)]">
              <div className="space-y-4">
                <CategorySelector
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                />
    
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción detallada del problema"
                    className="min-h-[100px]"
                  />
                </div>
    
                <div className="space-y-2">
                  <Label>Nivel de Severidad ({severity[0]})</Label>
                  <Slider
                    value={severity}
                    onValueChange={setSeverity}
                    min={1}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                </div>
    
                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <div className="h-[250px] rounded-md overflow-hidden border">
                    <MapView
                      selectedLocation={location}
                      onLocationSelect={(lat, lng) => setLocation([lat, lng])}
                      centerOnUser={false}
                      showReportDetails={false}
                    />
                  </div>
                </div>
    
                <div className="space-y-2">
                  <Label>Imagen</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded-md overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Vista previa" 
                        className="w-full h-32 object-cover" 
                      />
                    </div>
                  )}
                </div>
    
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