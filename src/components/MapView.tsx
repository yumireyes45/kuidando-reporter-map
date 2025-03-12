
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Report } from './ReportMarker';
import { categories } from './CategorySelector';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import ReportMarker from './ReportMarker';

// Mock reports for the MVP
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Vereda rota en Av. Arequipa',
    description: 'Hay un tramo de vereda completamente destruido que dificulta el paso de peatones y es peligroso.',
    latitude: -12.046374,
    longitude: -77.0427934,
    categoryId: 'broken-sidewalks',
    severity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1618078264159-553be9417921',
    createdBy: {
      id: 'user1',
      name: 'Carlos Mendoza'
    },
    createdAt: '2023-06-15T14:30:00Z',
    supporters: 12
  },
  {
    id: '2',
    title: 'Basura acumulada en parque',
    description: 'Hay acumulación de basura desde hace días en la esquina del parque Kennedy. Atrae insectos y mal olor.',
    latitude: -12.0487,
    longitude: -77.0358,
    categoryId: 'garbage',
    severity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d9a',
    createdBy: {
      id: 'user2',
      name: 'Ana López'
    },
    createdAt: '2023-06-20T09:15:00Z',
    supporters: 8
  },
  {
    id: '3',
    title: 'Poste a punto de caerse',
    description: 'Hay un poste de luz inclinado que parece que caerá en cualquier momento. Representa un peligro para los transeúntes.',
    latitude: -12.0510,
    longitude: -77.0432,
    categoryId: 'unstable-poles',
    severity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1621554808274-cc814a76f1eb',
    createdBy: {
      id: 'user3',
      name: 'Jorge Ramírez'
    },
    createdAt: '2023-06-22T16:45:00Z',
    supporters: 23
  },
  {
    id: '4',
    title: 'Hueco en pista causa accidentes',
    description: 'Hay un hueco grande en la pista que ya ha causado varios accidentes de motocicletas y bicicletas.',
    latitude: -12.0440,
    longitude: -77.0380,
    categoryId: 'potholes',
    severity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1589335368493-97623186a1c9',
    createdBy: {
      id: 'user4',
      name: 'María Sánchez'
    },
    createdAt: '2023-06-25T11:20:00Z',
    supporters: 18
  }
];

interface MapViewProps {
  centerOnUser?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  interactive?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  centerOnUser = true, 
  onLocationSelect,
  selectedLocation = null,
  interactive = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const location = useGeolocation();
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const { user } = useAuth();
  const [popupOpen, setPopupOpen] = useState(false);
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  // Create a reference for marker elements to clean them up later
  const reportMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Temporary Mapbox token for MVP demonstration
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1xYSIsImEiOiJjbHV6Zmt4bHowMWxpMnBwNjJ2OW1na2l0In0._QjmjGcMnNhoM6zCyQwRNA';

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: selectedLocation ? [selectedLocation[1], selectedLocation[0]] : [-77.042793, -12.046374], // Default to Lima, Peru
      zoom: 14,
      pitch: 40,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true
      }),
      'top-right'
    );

    // Create a DOM element for popups
    popupContentRef.current = document.createElement('div');
    
    map.current.on('load', () => {
      // Add any map styles or layers here if needed
    });
    
    if (interactive) {
      // Add click handler for location selection if onLocationSelect is provided
      if (onLocationSelect) {
        map.current.on('click', (e) => {
          if (markerRef.current) {
            markerRef.current.setLngLat(e.lngLat);
          } else {
            markerRef.current = new mapboxgl.Marker({ color: '#2563EB', draggable: true })
              .setLngLat(e.lngLat)
              .addTo(map.current!);
              
            markerRef.current.on('dragend', () => {
              const lngLat = markerRef.current?.getLngLat();
              if (lngLat && onLocationSelect) {
                onLocationSelect(lngLat.lat, lngLat.lng);
              }
            });
          }
          
          onLocationSelect(e.lngLat.lat, e.lngLat.lng);
        });
      }
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map when location is updated
  useEffect(() => {
    if (map.current && location.latitude && location.longitude && centerOnUser) {
      map.current.flyTo({
        center: [location.longitude, location.latitude],
        essential: true,
        zoom: 15
      });
    }
  }, [location.latitude, location.longitude, centerOnUser]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!map.current || !selectedLocation) return;
    
    if (markerRef.current) {
      markerRef.current.setLngLat([selectedLocation[1], selectedLocation[0]]);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: '#2563EB', draggable: interactive })
        .setLngLat([selectedLocation[1], selectedLocation[0]])
        .addTo(map.current);
        
      if (interactive && onLocationSelect) {
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current?.getLngLat();
          if (lngLat) {
            onLocationSelect(lngLat.lat, lngLat.lng);
          }
        });
      }
    }
    
    map.current.flyTo({
      center: [selectedLocation[1], selectedLocation[0]],
      essential: true,
      zoom: 16
    });
  }, [selectedLocation]);

  // Add report markers to the map
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing markers
    reportMarkersRef.current.forEach(marker => marker.remove());
    reportMarkersRef.current = [];
    
    // Add report markers
    reports.forEach(report => {
      const category = categories.find(c => c.id === report.categoryId);
      
      // Create marker element
      const el = document.createElement('div');
      el.className = `report-marker relative cursor-pointer animate-pulse-soft`;
      
      // Create the inner marker content
      const markerInner = document.createElement('div');
      markerInner.className = `flex items-center justify-center w-6 h-6 rounded-full ${category?.color} shadow-lg transform-gpu transition-transform duration-300 hover:scale-110`;
      
      // Add a dot or icon in the center if needed
      markerInner.innerHTML = `<div class="w-2 h-2 rounded-full bg-white"></div>`;
      
      // Assemble the marker
      el.appendChild(markerInner);
      
      // Create popup for the marker
      const popup = new mapboxgl.Popup({
        closeButton: false,
        maxWidth: '300px',
        offset: 15
      });
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click event to the marker
      el.addEventListener('click', () => {
        setActiveReportId(report.id);
        
        // Render report info in popup
        popup.setDOMContent(popupContentRef.current!);
        setPopupOpen(true);
        
        // Center map on the marker with offset
        map.current?.flyTo({
          center: [report.longitude, report.latitude],
          offset: [0, -150],
          essential: true,
          zoom: 16
        });
      });
      
      // Store marker reference for cleanup
      reportMarkersRef.current.push(marker);
    });
    
    return () => {
      setPopupOpen(false);
    };
  }, [reports]);

  const handleSupportReport = (reportId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para sumarte a este reporte");
      return;
    }
    
    // Update the report supporters count
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId 
          ? { ...report, supporters: report.supporters + 1 } 
          : report
      )
    );
    
    toast.success("¡Te has sumado a este reporte!");
  };
  
  // Get the active report
  const activeReport = reports.find(r => r.id === activeReportId);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      
      {/* Loading indicator */}
      {location.loading && (
        <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
          <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Buscando ubicación...</span>
          </div>
        </div>
      )}
      
      {/* Center on user button */}
      {location.latitude && location.longitude && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-24 right-4 rounded-full shadow-lg bg-background/90 backdrop-blur-sm z-10"
          onClick={() => {
            if (map.current && location.latitude && location.longitude) {
              map.current.flyTo({
                center: [location.longitude, location.latitude],
                essential: true,
                zoom: 15
              });
            }
          }}
        >
          <MapPin className="h-5 w-5" />
        </Button>
      )}
      
      {/* Add new report button - only shown on the map page */}
      {!onLocationSelect && user && (
        <Link to="/report">
          <Button
            className="absolute bottom-4 right-4 rounded-full shadow-lg z-10 px-6"
          >
            <Plus className="h-5 w-5 mr-1" />
            <span>Reportar problema</span>
          </Button>
        </Link>
      )}
      
      {/* Render the active report marker popup content */}
      {popupOpen && activeReport && popupContentRef.current && createPortal(
        <ReportMarker 
          report={activeReport} 
          onSupport={handleSupportReport}
          currentUserId={user?.id || null}
          isDetailed={true} 
        />,
        popupContentRef.current
      )}
    </div>
  );
};

export default MapView;
