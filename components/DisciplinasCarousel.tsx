'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Dumbbell, Plus, Waves } from "lucide-react";
import Link from "next/link";

// Definir el tipo para las disciplinas
interface Disciplina {
  id?: string | number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
}

// Props del componente
interface DisciplinasCarouselProps {
  disciplinas: Disciplina[];
}

export default function DisciplinasCarousel({ disciplinas }: DisciplinasCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const carouselRef = useRef(null);

  // Configurar autoplay y ajuste de elementos visibles
  useEffect(() => {
    // Función para actualizar la cantidad de elementos visibles
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setItemsPerView(3);
      } else if (width >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    // Configurar intervalo para el autoplay
    const autoplayInterval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex >= Math.ceil(disciplinas.length / itemsPerView) - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Cambia cada 3 segundos

    // Configurar el evento de redimensionado
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);

    // Limpiar el intervalo y el event listener al desmontar el componente
    return () => {
      clearInterval(autoplayInterval);
      window.removeEventListener('resize', updateItemsPerView);
    };
  }, [disciplinas.length, itemsPerView]); // Dependencias para recalcular cuando cambien

  const getIconForDisciplina = (nombre: string) => {
    const lowerCaseName = nombre.toLowerCase();
    if (lowerCaseName.includes("basquet")) return <Dumbbell className="h-10 w-10 text-primary" />;
    if (lowerCaseName.includes("aquagym")) return <Waves className="h-10 w-10 text-primary" />;
    if (lowerCaseName.includes("fútbol") || lowerCaseName.includes("futbol")) return <Dumbbell className="h-10 w-10 text-primary" />;
    if (lowerCaseName.includes("gym") || lowerCaseName.includes("gimnasio")) return <Dumbbell className="h-10 w-10 text-primary" />;
    return <Plus className="h-10 w-10 text-primary" />;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= Math.ceil(disciplinas.length / itemsPerView) - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? Math.ceil(disciplinas.length / itemsPerView) - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Calcular el ancho de cada tarjeta basado en la cantidad de elementos visibles
  const cardWidth = 100 / itemsPerView;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative group">
        {/* Botón de navegación anterior */}
        <button 
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300 hidden sm:block"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Contenedor del carrusel */}
        <div 
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-in-out py-6 px-2"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {disciplinas.map((disciplina, index) => (
            <div 
              key={disciplina.id || index}
              className="flex-shrink-0 px-2 transition-all duration-300"
              style={{ width: `${cardWidth}%` }}
            >
              <div className="h-full flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Contenedor de la imagen */}
                <div className="relative w-full" style={{ paddingTop: '1%' }}>
                  {disciplina.imagen_url ? (
                    <>
                      <img
                        src={disciplina.imagen_url}
                        alt={disciplina.nombre}
                        className='h-full w-full object-cover'
                        //className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-primary">
                        {getIconForDisciplina(disciplina.nombre)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Título de la disciplina */}
                <div className="bg-white p-3">
                  <h3 className="text-center font-semibold text-gray-800">
                    {disciplina.nombre}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de navegación siguiente */}
        <button 
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300 hidden sm:block"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Indicadores de paginación */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: Math.ceil(disciplinas.length / itemsPerView) }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-primary w-8' : 'bg-gray-300'}`}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
