import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistorialCuotasDisciplinaClient } from "@/components/admin/mi-disciplina-client";
import { getHistorialCuotasDisciplina } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function MiDisciplinaPage() {
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  // Por defecto, carga el mes y año actual.
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const initialResult = await getHistorialCuotasDisciplina(currentMonth, currentYear);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-800">Consulta de Cuotas por Actividad</h2>
        <p className="text-lg text-gray-600">Filtra por mes y año para ver el estado de pago de los miembros en tus actividades.</p>
      </div>

      {initialResult.success ? (
        <HistorialCuotasDisciplinaClient 
          initialData={initialResult.data || []} 
          initialMonth={currentMonth}
          initialYear={currentYear}
        />
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Cargar Datos</AlertTitle>
          <AlertDescription>
            <p>No se pudo cargar el historial de cuotas. Por favor, intenta de nuevo más tarde.</p>
            <p className="text-sm text-gray-500 mt-2">Detalle: {initialResult.message}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
