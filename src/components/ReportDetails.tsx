
import React from "react";
import { Report } from "./ReportMarker";
import { categories } from "./CategorySelector";
import { MapPin, User, Calendar, Shield, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ReportDetailsProps {
  report: Report;
  onSupport: (reportId: string) => void;
  currentUserId: string | null;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({
  report,
  onSupport,
  currentUserId
}) => {
  const category = categories.find(c => c.id === report.categoryId);
  const date = new Date(report.createdAt);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1: return "Baja";
      case 2: return "Media";
      case 3: return "Alta";
      case 4: return "Urgente";
      default: return "No especificada";
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "bg-green-500/20 text-green-700";
      case 2: return "bg-yellow-500/20 text-yellow-700";
      case 3: return "bg-orange-500/20 text-orange-700";
      case 4: return "bg-red-500/20 text-red-700";
      default: return "bg-blue-500/20 text-blue-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden">
        {report.imageUrl && (
          <div className="w-full h-60 bg-secondary">
            <img 
              src={report.imageUrl} 
              alt={report.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {category && (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color}/10`}>
                    <category.icon className={`h-5 w-5 text-${category.color.split('-')[1]}-500`} />
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">{category?.name}</span>
                  <h1 className="text-2xl font-bold">{report.title}</h1>
                </div>
              </div>
              <Badge variant="outline" className={`text-sm ${getSeverityColor(report.severity)}`}>
                {getSeverityLabel(report.severity)}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">{report.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Ubicación</span>
                <p className="text-sm font-medium">
                  {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
              <User className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Reportado por</span>
                <p className="text-sm font-medium">{report.createdBy.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">Fecha</span>
                <p className="text-sm font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={() => onSupport(report.id)} 
              className="w-full gap-2 py-6"
              disabled={!currentUserId}
            >
              <ArrowUp className="h-5 w-5" />
              <span className="font-medium">Sumarse a este reporte</span>
              <Badge variant="secondary" className="ml-2">{report.supporters}</Badge>
            </Button>
            
            {!currentUserId && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Debes iniciar sesión para sumarte a este reporte
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReportDetails;
