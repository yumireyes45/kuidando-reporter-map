import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  previewUrl?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalPreview, setInternalPreview] = useState<string | null>(previewUrl || null);

  // Sincronizar previewUrl cuando cambie externamente
  useEffect(() => {
    setInternalPreview(previewUrl || null);
  }, [previewUrl]);

  const validateFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen (PNG, JPG, JPEG).");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB.");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file)) {
      onFileChange(file);
      setInternalPreview(URL.createObjectURL(file)); // Crear vista previa
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && validateFile(file)) {
      onFileChange(file);
      setInternalPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    onFileChange(null);
    setInternalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Foto del problema</h3>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!internalPreview ? (
          <motion.div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={handleButtonClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-secondary text-muted-foreground">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium">Arrastra tu foto aquí o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG o JPEG (max. 5MB)</p>
              </div>
              <Button type="button" variant="outline" size="sm">
                Seleccionar imagen
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative rounded-xl overflow-hidden bg-secondary h-64"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <img src={internalPreview} alt="Vista previa" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full opacity-90"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
