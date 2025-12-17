"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { generarCuotas } from "@/app/admin/cuotas/actions"
import { useToast } from "@/hooks/use-toast"

const meses = [
  { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" }, 
  { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" }, 
  { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" }, 
  { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" }
]

export function GenerarCuotasForm() {
  const { toast } = useToast()
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1)
  const [anio, setAnio] = useState<number>(new Date().getFullYear())
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append("mes", String(mes))
      formData.append("anio", String(anio))

      const result = await generarCuotas(formData)

      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="p-6 bg-white/80 backdrop-blur border border-[#1e3a8a]/20">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <Select value={String(mes)} onValueChange={(value) => setMes(Number(value))}>
              <SelectTrigger id="mes">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map(m => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="anio" className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <Input 
              id="anio" 
              type="number" 
              value={anio} 
              onChange={(e) => setAnio(Number(e.target.value))} 
              placeholder="Año"
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white" style={{backgroundColor: "#efb600", color: "#1e3a8a" }}>
          {isPending ? "Generando..." : "Generar Cuotas"}
        </Button>
      </form>
    </Card>
  )
}
