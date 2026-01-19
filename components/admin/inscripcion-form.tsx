"use client"

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

const FormSchema = z.object({
  disciplina: z.string({
    required_error: "Por favor selecciona una disciplina.",
  }),
  actividad: z.string().optional(),
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
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("")

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  useEffect(() => {
    // Fetch disciplinas
    const fetchDisciplinas = async () => {
      const res = await fetch("/api/admin/disciplinas")
      const data = await res.json()
      setDisciplinas(data)
    }
    fetchDisciplinas()
  }, [])

  useEffect(() => {
    if (selectedDisciplina) {
      // Fetch actividades for the selected disciplina
      const fetchActividades = async () => {
        const res = await fetch(`/api/admin/disciplinas/${selectedDisciplina}/actividades`)
        const data = await res.json()
        setActividades(data)
      }
      fetchActividades()
    } else {
      setActividades([])
    }
  }, [selectedDisciplina])


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Here you would handle form submission,
    // for example, by calling an API route to create the inscription.
    toast({
      title: "Te has inscrito a:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="disciplina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disciplina</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                setSelectedDisciplina(value)
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una disciplina" />
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
              <FormLabel>Actividad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDisciplina || actividades.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una actividad" />
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
        <Button type="submit">Inscribir</Button>
      </form>
    </Form>
  )
}
