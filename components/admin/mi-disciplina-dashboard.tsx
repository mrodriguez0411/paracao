
'use client';

import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, Users, Trophy, CreditCard } from 'lucide-react';

interface DashboardProps {
  isSuperAdmin: boolean;
  totalInscriptos?: number;
  totalAbonados?: number;
  totalPendientes?: number;
  gruposFamiliares?: number;
  disciplinasActivas?: number;
  cuotasPendientes?: number;
  recaudadoMes?: number;
}

export function MiDisciplinaDashboard({ 
  isSuperAdmin, 
  totalInscriptos, 
  totalAbonados, 
  totalPendientes, 
  gruposFamiliares,
  disciplinasActivas,
  cuotasPendientes,
  recaudadoMes
}: DashboardProps) {

  if (isSuperAdmin) {
    // --- RENDER PARA SUPER ADMIN ---
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Grupos Familiares" value={gruposFamiliares || 0} icon={Users} />
        <StatCard title="Disciplinas Activas" value={disciplinasActivas || 0} icon={Trophy} />
        <StatCard title="Cuotas Pendientes" value={cuotasPendientes || 0} icon={CreditCard} />
        <StatCard title="Recaudado (Mes)" value={`$${(recaudadoMes || 0).toFixed(2)}`} icon={DollarSign} />
      </div>
    );
  }

  // --- RENDER PARA ADMIN DISCIPLINA ---
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Total Inscriptos" value={totalInscriptos || 0} icon={Users} />
      <StatCard title="Socios al Día" value={totalAbonados || 0} icon={Users} />
      <StatCard title="Cuotas Pendientes" value={totalPendientes || 0} icon={CreditCard} />
    </div>
  );
}
