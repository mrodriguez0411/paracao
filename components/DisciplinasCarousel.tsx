'use client';

import React from 'react';
import { ArrowRight, Basketball, Dumbbell, Plus, Soccer, Waves } from "lucide-react";
import Link from "next/link";

// NOTE: This component is now a client component to solve the rendering errors.

export default function DisciplinasCarousel({ disciplinas }) {

  const getIconForDisciplina = (nombre) => {
    const lowerCaseName = nombre.toLowerCase();
    if (lowerCaseName.includes("basquet")) return <Basketball className="h-10 w-10 text-primary" />;
    if (lowerCaseName.includes("aquagym")) return <Waves className="h-10 w-10 text-primary" />;
    if (lowerCaseName.includes("fútbol") || lowerCaseName.includes("futbol")) return <Soccer className="h-10 w-10 text-primary" />;
    if (lowerCaseName.includes("gym") || lowerCaseName.includes("gimnasio")) return <Dumbbell className="h-10 w-10 text-primary" />;
    return <Plus className="h-10 w-10 text-primary" />;
  };

  return (
    <div className="relative w-full">
      <div className="flex space-x-6 overflow-x-auto py-4 -m-4 p-4">
        {disciplinas.map((disciplina) => (
          <div key={disciplina.nombre} className="w-80 flex-shrink-0 sm:w-96">
            <div className="h-full transition-all hover:shadow-xl hover:-translate-y-2 flex flex-col items-center justify-between text-center p-6 min-h-[320px] rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-center flex flex-col items-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  {getIconForDisciplina(disciplina.nombre)}
                </div>
                <h3 className="text-2xl font-bold">{disciplina.nombre}</h3>
              </div>
              <div className="text-center flex flex-col items-center flex-grow">
                <p className="text-muted-foreground text-base mb-4 min-h-[72px]">
                  {disciplina.descripcion || 'Descripción detallada de la disciplina y sus beneficios.'}
                </p>
                <Link href="#contacto" className="text-primary underline-offset-4 hover:underline mt-auto px-0 font-semibold flex items-center self-center">
                  Más información
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
