import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Trophy, Users, Target, Award } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  // Obtener disciplinas activas
  const { data: disciplinas } = await supabase
    .from("disciplinas")
    .select("nombre, descripcion")
    .eq("activa", true)
    .order("nombre")

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Club Deportivo</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#nosotros" className="text-sm font-medium hover:text-primary">
              Nosotros
            </Link>
            <Link href="#disciplinas" className="text-sm font-medium hover:text-primary">
              Disciplinas
            </Link>
            <Link href="#contacto" className="text-sm font-medium hover:text-primary">
              Contacto
            </Link>
            <Button asChild>
              <Link href="/auth/login">Ingresar</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Bienvenido a Nuestro Club Deportivo
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              Un espacio para toda la familia donde el deporte, la salud y la comunidad se encuentran. Únete a nosotros
              y descubre tu pasión.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="#disciplinas">Ver Disciplinas</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#contacto">Contactar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section id="nosotros" className="py-20 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sobre Nosotros</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Somos un club dedicado a promover el deporte y la vida saludable para toda la comunidad
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Comunidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Un lugar donde familias y amigos se reúnen para compartir su pasión por el deporte
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Excelencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Entrenadores profesionales y facilidades de primer nivel para tu desarrollo deportivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Trayectoria</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Años de experiencia formando deportistas y promoviendo valores a través del deporte
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disciplinas Section */}
      <section id="disciplinas" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nuestras Disciplinas</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ofrecemos una amplia variedad de disciplinas deportivas para todas las edades
            </p>
          </div>

          {disciplinas && disciplinas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {disciplinas.map((disciplina) => (
                <Card key={disciplina.nombre} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <CardTitle>{disciplina.nombre}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {disciplina.descripcion || "Disciplina disponible en nuestro club"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Próximamente más información sobre nuestras disciplinas</p>
            </Card>
          )}
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-20 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Contacto</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ¿Interesado en unirte? Contáctanos para más información
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Dirección</h3>
                    <p className="text-muted-foreground">Calle Principal 123, Ciudad</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Teléfono</h3>
                    <p className="text-muted-foreground">+54 11 1234-5678</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">info@clubdeportivo.com</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Horario de Atención</h3>
                    <p className="text-muted-foreground">
                      Lunes a Viernes: 9:00 - 20:00
                      <br />
                      Sábados: 9:00 - 13:00
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full">
                      <Link href="/auth/login">Acceder al Portal de Socios</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Club Deportivo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Club Deportivo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
