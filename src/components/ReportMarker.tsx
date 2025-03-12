
import React from "react";
import { categories } from "./CategorySelector";
import { User, Clock, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export interface Report {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  severity: number;
  imageUrl: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  supporters: number;
}

interface ReportMarkerProps {
  report: Report;
  onSupport: (reportId: string) => void;
  currentUserId: string | null;
  isDetailed?: boolean;
}

const ReportMarker: React.FC<ReportMarkerProps> = ({
  report,
  onSupport,
  currentUserId,
  isDetailed = false
}) => {
  const category = categories.find(c => c.id === report.categoryId);
  const date = new Date(report.createdAt);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
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

  if (!isDetailed) {
    // Simplified marker for map display
    return (
      <motion.div 
        className="map-card max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{report.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{report.description}</p>
            </div>
            {category && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${category.color}/10 shrink-0 ml-2`}>
                <category.icon className={`h-3.5 w-3.5 text-${category.color.split('-')[1]}-500`} />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <Badge variant="outline" className={`text-xs ${getSeverityColor(report.severity)}`}>
              {getSeverityLabel(report.severity)}
            </Badge>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3" />
              <span>{report.supporters}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Detailed view for popup or sidebar display
  return (
    <motion.div 
      className="map-card max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              {category && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color}/10`}>
                  <category.icon className={`h-4 w-4 text-${category.color.split('-')[1]}-500`} />
                </div>
              )}
              <div>
                <h3 className="font-medium">{report.title}</h3>
                <p className="text-xs text-muted-foreground">{category?.name}</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${getSeverityColor(report.severity)}`}>
            {getSeverityLabel(report.severity)}
          </Badge>
        </div>
        
        {report.imageUrl && (
          <div className="rounded-lg overflow-hidden h-32 bg-secondary">
            <img 
              src={report.imageUrl} 
              alt={report.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <p className="text-sm">{report.description}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{report.createdBy.name}</span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        <Button 
          onClick={() => onSupport(report.id)} 
          className="w-full gap-2"
          disabled={!currentUserId}
        >
          <ArrowUp className="h-4 w-4" />
          <span>Sumarse ({report.supporters})</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default ReportMarker;
