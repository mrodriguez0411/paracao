'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
  disciplina: z.string({
    required_error: "Por favor selecciona una disciplina.",
  }),
  actividad: z.string({
    required_error: "Por favor selecciona una actividad.",
  }),
})

interface Disciplina {
    id: string
    nombre: string
}

interface Actividad {
    id: string
    nombre: string
}

export function InscripcionForm({ miembroId }: { miembroId: string }) {
  const router = useRouter()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    const fetchDisciplinas = async () => {
      const res = await fetch("/api/admin/disciplinas")
      const data = await res.json()
      setDisciplinas(data)
    }
    fetchDisciplinas()
  }, [])

  useEffect(() => {
    form.setValue('actividad', '') // Reset actividad when disciplina changes
    if (selectedDisciplina) {
      const fetchActividades = async () => {
        const res = await fetch(`/api/admin/disciplinas/${selectedDisciplina}/actividades`)
        const data = await res.json()
        setActividades(data)
      }
      fetchActividades()
    } else {
      setActividades([])
    }
  }, [selectedDisciplina, form])

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/inscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          miembro_id: miembroId,
          actividad_id: data.actividad,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear la inscripción")
      }

      toast({
        title: "¡Éxito!",
        description: "El socio ha sido inscrito correctamente.",
      })
      router.push(`/admin/socios`)
      router.refresh() // To see the changes in the socios list

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="disciplina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>1. Selecciona una Disciplina</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                setSelectedDisciplina(value)
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige la disciplina principal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {disciplinas.map(d => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="actividad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>2. Selecciona una Actividad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDisciplina || actividades.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedDisciplina ? "Elige la actividad o grupo" : "Primero elige una disciplina"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {actividades.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Inscribiendo...' : 'Inscribir Socio'}
        </Button>
      </form>
    </Form>
  )
}
