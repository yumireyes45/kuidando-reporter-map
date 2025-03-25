import { useState, useEffect } from 'react';
import { useLoadScript } from "@react-google-maps/api";

interface LocationDetail {
  district: string;
  city: string;
  address: string;
}

interface LocationDetails {
  [key: string]: LocationDetail;
}

export const useReverseGeocode = (reports: any[]) => {
  const [locationsDetails, setLocationsDetails] = useState<LocationDetails>({});
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    if (!isLoaded) return;

    reports.forEach(async (report) => {
      if (report.latitude && report.longitude) {
        const geocoder = new window.google.maps.Geocoder();
        try {
          const response = await geocoder.geocode({
            location: { lat: report.latitude, lng: report.longitude }
          });

          if (response.results[0]) {
            const addressComponents = response.results[0].address_components;
            const details: LocationDetail = {
              district: '',
              city: '',
              address: response.results[0].formatted_address
            };

            addressComponents.forEach(component => {
              if (component.types.includes('sublocality_level_1')) {
                details.district = component.long_name;
              }
              if (component.types.includes('administrative_area_level_2')) {
                details.city = component.long_name;
              }
            });

            setLocationsDetails(prev => ({
              ...prev,
              [report.id]: details
            }));
          }
        } catch (error) {
          console.error('Error getting location details:', error);
          setLocationsDetails(prev => ({
            ...prev,
            [report.id]: { district: '', city: '', address: 'Error al obtener ubicación' }
          }));
        }
      }
    });
  }, [reports, isLoaded]);

  return { locationsDetails, isLoaded };
};