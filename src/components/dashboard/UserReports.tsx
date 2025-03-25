import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditReportDialog } from "./EditReportDialog";
import { Loader2 } from "lucide-react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { useLoadScript } from "@react-google-maps/api";

interface UserReportsProps {
  userId: string | undefined;
}



export const UserReports: React.FC<UserReportsProps> = ({ userId }) => {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [reportToDelete, setReportToDelete] = useState<any>(null);
    const { locationsDetails } = useReverseGeocode(reports);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    useEffect(() => {
        fetchUserReports();
    }, [userId]);

    const fetchUserReports = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from("reports")
                .select(`
                    *,
                    categories(name)
                `)
                .eq("createdby", userId)
                .order("createdat", { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    {/*}
    useEffect(() => {
        reports.forEach(async (report) => {
            if (report.latitude && report.longitude) {
                const geocoder = new google.maps.Geocoder();
                try {
                    const response = await geocoder.geocode({
                        location: { lat: report.latitude, lng: report.longitude }
                    });

                    if (response.results[0]) {
                        const addressComponents = response.results[0].address_components;
                        const details = {
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
                }
            }
        });
    }, [reports]);

    */}

    
    const handleDelete = async () => {
        try {
            const { error } = await supabase
                .from("reports")
                .delete()
                .eq("id", reportToDelete.id);

            if (error) throw error;

            toast.success("Reporte eliminado exitosamente");
            fetchUserReports();
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar el reporte");
        } finally {
            setReportToDelete(null);
        }
    };

    if (isLoading) {
        return <Loader2 className="h-8 w-8 animate-spin" />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <Card key={report.id} className="p-4">
                    {report.imageurl ? (
                        <img
                            src={report.imageurl}
                            alt="Reporte"
                            className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                    ) : (
                        <div className="w-full h-40 bg-muted flex items-center justify-center rounded-lg mb-4">
                            <p className="text-sm text-muted-foreground">Aún no hay imagen</p>
                        </div>
                    )}
                    <h3 className="font-semibold mb-2">{report.description}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        Categoría: {report.categories.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                            Severidad: {report.severity}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                                Reportado el {new Date(report.createdat).toLocaleDateString()}
                        </p>

                        {locationsDetails[report.id] ? (
                            <p className="text-sm text-muted-foreground mb-2">
                                📍 {locationsDetails[report.id].district || locationsDetails[report.id].city || 'Ubicación no disponible'}
                                {locationsDetails[report.id].district && locationsDetails[report.id].city && `, ${locationsDetails[report.id].city}`}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground mb-2">
                                📍 Obteniendo ubicación...
                            </p>
                        )}
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={() => setSelectedReport(report)}
                            variant="outline"
                            className="flex-1"
                        >
                            Editar
                        </Button>
                        <Button
                            onClick={() => setReportToDelete(report)}
                            variant="destructive"
                            size="icon"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

            ))}

        <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro? 🤔</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el reporte y no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReportToDelete(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {selectedReport && (
                <EditReportDialog
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onUpdate={fetchUserReports}
                />
            )}
        </div>
    );
};

// Removed duplicate setLocationsDetails function definition.
