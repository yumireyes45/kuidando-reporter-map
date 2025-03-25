import React, { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EditReportDialog } from "./EditReportDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

export const AllReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const { user } = useAuth();
  const [reportToDelete, setReportToDelete] = useState<any>(null);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          categories(name)
        `)
        .order('createdat', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportToDelete.id);

      if (error) throw error;

      toast.success("Reporte eliminado exitosamente");
      fetchAllReports();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el reporte");
    } finally {
      setReportToDelete(null);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
              <p className="text-sm text-muted-foreground">No hay imagen disponible</p>
            </div>
          )}
          <h3 className="font-semibold mb-2">{report.description}</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Categoría: {report.categories?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Severidad: {report.severity}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
                Reportado el {new Date(report.createdat).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Apoyos: {report.supporters}
            </p>

          </div>
          {user?.id === report.createdby && (
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
          )}
        </Card>
      ))}

      <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
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
          onUpdate={fetchAllReports}
        />
      )}
    </div>
  );
};