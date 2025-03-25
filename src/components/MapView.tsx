import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import ReportDetails from "./ReportDetails"; // 🔹 Importamos ReportDetails
import { Loader2 } from "lucide-react";


const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: -12.046374,
  lng: -77.0427934,
};


interface MapViewProps {
  centerOnUser?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  disableInteractions?: boolean; // Added property
  showReportDetails?: boolean; // Añadir esta nueva prop
  onLoad?: () => void;  // Agregar esta prop
}

const MapView: React.FC<MapViewProps> = ({ centerOnUser = true, onLocationSelect, selectedLocation, 
  disableInteractions = false, showReportDetails = true, onLoad}) => {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const location = useGeolocation();
  const [reports, setReports] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const [selectedReport, setSelectedReport] = useState(null); // 🔹 Nuevo estado para el reporte seleccionado
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationError, setShowLocationError] = useState(false);
  const [userHasPanned, setUserHasPanned] = useState(false);

  // Añadir useEffect para manejar errores de geolocalización
  useEffect(() => {
    if (location.error) {
      setShowLocationError(true);
      toast.error("No se pudo obtener tu ubicación. Mostrando mapa de Lima.", {
        duration: 2000, // 2 segundo
      });
      
      // Ocultar el mensaje después de 1 segundo
      setTimeout(() => {
        setShowLocationError(false);
      }, 2000);
    }
  }, [location.error]);

// Mover la definición del mapIcon dentro del componente
const mapIcon = React.useMemo(() => isLoaded ? {
  url: "https://jbekmeyktgqumyyrjjdh.supabase.co/storage/v1/object/public/report_images//marker-angry.webp",
  scaledSize: new window.google.maps.Size(34, 42),
  anchor: new window.google.maps.Point(16, 32)
} : null, [isLoaded]);

  // Actualizar el mapCenter para manejar mejor los casos de error
  const mapCenter = React.useMemo(() => {
    if (userHasPanned) {
      return mapRef.current?.getCenter() || defaultCenter;
    }
    if (selectedLocation) {
      return { lat: selectedLocation[0], lng: selectedLocation[1] };
    }
    if (centerOnUser && location.latitude && location.longitude && !locationError) {
      return { lat: location.latitude, lng: location.longitude };
    }
    return defaultCenter;
  }, [selectedLocation, centerOnUser, location.latitude, location.longitude, locationError, userHasPanned]);
  

  


  // Obtener reportes desde Supabase de manera más eficiente
  useEffect(() => {
    const getReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order('createdat', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error("❌ Error al obtener los reportes:", error);
        toast.error("No se pudieron cargar los reportes");
      }
    };

    getReports();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' },
        () => getReports()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isLoaded) return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  return (
    <div className="relative w-full h-full">

      {showLocationError && centerOnUser && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-50 border border-yellow-200 p-3 rounded-lg shadow-sm">
          <p className="text-sm text-yellow-800">
            Para una mejor experiencia, permite el acceso a tu ubicación
          </p>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={14}
        onClick={(e) => {
          if (onLocationSelect) {
            onLocationSelect(e.latLng.lat(), e.latLng.lng());
          }
        }}
        onLoad={(map: google.maps.Map) => {
          mapRef.current = map;
          onLoad?.();  // Llamar onLoad si existe
        }}
        onDragStart={() => {
          setUserHasPanned(true);
        }}
      >

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={{ lat: report.latitude, lng: report.longitude }}
            icon={mapIcon || undefined}
            onClick={() => showReportDetails && setSelectedReport(report)} // Solo muestra detalles si showReportDetails es true
          >
          </Marker>
        ))}

        {selectedLocation && (
          <Marker
            position={{ lat: selectedLocation[0], lng: selectedLocation[1] }}
            animation={google.maps.Animation.DROP} // Añade una animación al marcador
          >
            </Marker>
        )}
      </GoogleMap>

      {/* Solo muestra el ReportDetails si showReportDetails es true */}
      {showReportDetails && selectedReport && (
        <div className="absolute inset-x-0 bottom-0 z-50">
          <ReportDetails 
            reports={selectedReport} 
            onSupport={() => {}}
            currentUserId={user?.id || null}
            onClose={() => setSelectedReport(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;
