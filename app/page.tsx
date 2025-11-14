import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Trophy, Users, Target, Award, Calendar, Phone, Mail, MapPin, Menu, X } from "lucide-react"
//import Image from "next/image"

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#EFB600] backdrop-blur-sm border-b shadow-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image
              src="/Nueva%20carpeta/Oficial%20png.png"
              alt="Club Paracao Logo"
              width={50}
              height={50}
              className="h-20 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#inicio" className="px-5 py-2.5 text-lg font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors hover:bg-brand-blue/5 rounded-lg">
              Inicio
            </Link>
            <Link href="#nosotros" className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-brand-blue transition-colors hover:bg-brand-blue/5 rounded-lg">
              Nosotros
            </Link>
            <Link href="#disciplinas" className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-brand-blue transition-colors hover:bg-brand-blue/5 rounded-lg">
              Disciplinas
            </Link>
            <Link href="#galeria" className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-brand-blue transition-colors hover:bg-brand-blue/5 rounded-lg">
              Galería
            </Link>
            <Link href="#contacto" className="px-4 py-2 text-base font-semibold text-gray-700 hover:text-brand-blue transition-colors hover:bg-brand-blue/5 rounded-lg">
              Contacto
            </Link>
            <Button asChild size="lg" className="ml-3 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white transition-colors px-8 py-2.5 h-auto text-lg font-oswald">
              <Link href="/auth/login" className="font-bold">Área de Socios</Link>
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden text-gray-800 hover:bg-gray-100 h-12 w-12">
            <Menu className="h-8 w-8" />
            <span className="sr-only">Menú</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-1 w-full ">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-10">
            <Image
              src="/Nueva%20carpeta/Claim%20amarillo1.png"
              alt="Club Paracao"
              width={400}
              height={100}
              className="mx-auto h-100 w-full max-w-lg mb-6"
            />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Más que un club, una familia. Promoviendo el deporte, la salud y la integración social desde 1980.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild className="bg-[#EFB600] hover:bg-[#EFB600]/90 text-[#1e3a8a] px-8 py-3 text-lg font-semibold transition-all duration-200">
                <Link href="#disciplinas">Ver Disciplinas</Link>
              </Button>
              <Button asChild className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-8 py-3 text-lg font-semibold transition-all duration-200">
                <Link href="#contacto">Contáctanos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section id="nosotros" className="py-20 bg-muted/30 w-full">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">Nuestra Historia</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="mt-4 text-lg text-muted-foreground">
              Fundado en 1980, el Club Paracao ha sido un pilar en la comunidad, ofreciendo un espacio de esparcimiento,
              deporte y desarrollo personal para todas las edades.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center text-center bg-textura-amarilla">
              <CardHeader className="text-center flex flex-col items-center">
                <div className="mx-auto bg-[#1e3a8a]/10 p-3 rounded-full w-fit mb-4">
                  <Users className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <CardTitle className="text-xl">Comunidad</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Un espacio donde las familias se reúnen, los niños crecen y las amistades perduran. Más de 40 años forjando comunidad.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 bg-textura-amarilla">
              <CardHeader className="text-center">
                <div className="mx-auto bg-[#1e3a8a]/10 p-3 rounded-full w-fit mb-4">
                  <Target className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <CardTitle className="text-xl">Excelencia Deportiva</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Infraestructura de primer nivel y profesionales calificados para potenciar tu rendimiento deportivo y bienestar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-textura-amarilla h-full transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center text-center">
              <CardHeader className="text-center flex flex-col items-center">
                <div className="mx-auto bg-[#1e3a8a]/10 p-3 rounded-full w-fit mb-4">
                  <Award className="h-8 w-8 text-[#1e3a8a]" />
                </div>
                <CardTitle className="text-xl">Trayectoria</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Años de experiencia formando deportistas y promoviendo valores a través del deporte
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disciplinas Section */}
      <section id="disciplinas" className="py-20 w-full">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">Nuestras Disciplinas</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="mt-4 text-lg text-muted-foreground">
              Ofrecemos una amplia variedad de disciplinas deportivas para todas las edades y niveles.
              ¡Encuentra la actividad perfecta para ti y tu familia!
            </p>
          </div>

          {disciplinas && disciplinas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {disciplinas.map((disciplina) => {
                // Seleccionar ícono basado en el nombre de la disciplina
                let icon = (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                );

                if (disciplina.nombre.toLowerCase().includes('fútbol') || disciplina.nombre.toLowerCase().includes('futbol')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                      <path d="M8.5 8.5v.01" />
                      <path d="M16 15.5v.01" />
                      <path d="M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                      <path d="M7 10c2 2 5 2 10 0" />
                    </svg>
                  );
                } else if (disciplina.nombre.toLowerCase().includes('natación') || disciplina.nombre.toLowerCase().includes('natacion')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M19 16.2L12 22l-7-5.6v-1.2M19 8.8 12 14 5 8.8" />
                      <path d="M19 12.5 12 18l-7-5.5" />
                      <path d="M19 7.8 12 13 5 7.8" />
                      <path d="M12 12v9" />
                      <path d="M5 5.3c.7-.5 2.2-1.1 4.5-1.1s4.8.6 5.5 1.1" />
                      <path d="M5 10.2c.7-.5 2.2-1.1 4.5-1.1s4.8.6 5.5 1.1" />
                    </svg>
                  );
                } else if (disciplina.nombre.toLowerCase().includes('tenis')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M12 22c4.97 0 9-2.24 9-5s-4.03-5-9-5-9 2.24-9 5 4.03 5 9 5Z" />
                      <path d="M12 12c4.97 0 9-2.24 9-5s-4.03-5-9-5-9 2.24-9 5 4.03 5 9 5Z" />
                      <path d="M3 12v5c0 2.76 4.03 5 9 5s9-2.24 9-5v-5" />
                    </svg>
                  );
                } else if (disciplina.nombre.toLowerCase().includes('hockey') || disciplina.nombre.toLowerCase().includes('jockey')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M4 6h16" />
                      <path d="m4 12 14-3" />
                      <path d="M4 18h8" />
                      <path d="m18 9.5 1-.9a1.5 1.5 0 0 1 2 2.2L18 14" />
                      <path d="M18 14h1a2 2 0 1 0 0-4h-1" />
                    </svg>
                  );
                } else if (disciplina.nombre.toLowerCase().includes('basquet') || disciplina.nombre.toLowerCase().includes('básquet')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  );
                } else if (disciplina.nombre.toLowerCase().includes('voley') || disciplina.nombre.toLowerCase().includes('vóley')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  );
                } else if (disciplina.nombre.toLowerCase().includes('gimnasia') || disciplina.nombre.toLowerCase().includes('gimnasio')) {
                  icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                      <path d="M6 4v16" />
                      <path d="M18 4v16" />
                      <path d="M2 12h20" />
                      <path d="M12 2v20" />
                      <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                      <path d="M12 14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
                    </svg>
                  );
                }

                return (
                  <Card key={disciplina.nombre} className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="text-center">
                      <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        {icon}
                      </div>
                      <CardTitle className="text-xl">{disciplina.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground">
                        {disciplina.descripcion || 'Descripción detallada de la disciplina y sus beneficios.'}
                      </p>
                      <Button variant="link" className="mt-4 px-0" asChild>
                        <Link href="#contacto">
                          Más información
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                Próximamente más información sobre nuestras disciplinas
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-20 bg-muted/50 w-full">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Contacto</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                ¿Interesado en unirte? Contáctanos para más información
              </p>
            </div>

            <Card className="bg-textura-amarilla rounded-lg shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-6 text-[#020617]">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Dirección</h3>
                    <p className="">Calle Principal 123, Ciudad</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Teléfono</h3>
                    <p className="">+54 11 1234-5678</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Email</h3>
                    <p className="">info@clubdeportivo.com</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Horario de Atención</h3>
                    <p className="">
                      Lunes a Viernes: 9:00 - 20:00
                      <br />
                      Sábados: 9:00 - 13:00
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold">
                      <Link href="/portal">Acceder al Portal de Socios</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background w-full">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 max-w-7xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Club Paracao</span>
              </div>
              <p className="text-muted-foreground">
                Más que un club, una familia. Promoviendo el deporte, la salud y la integración social desde 1980.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Enlaces Rápidos</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors">Inicio</a></li>
                <li><a href="#nosotros" className="text-muted-foreground hover:text-primary transition-colors">Nosotros</a></li>
                <li><a href="#disciplinas" className="text-muted-foreground hover:text-primary transition-colors">Disciplinas</a></li>
                <li><a href="#galeria" className="text-muted-foreground hover:text-primary transition-colors">Galería</a></li>
                <li><a href="#contacto" className="text-muted-foreground hover:text-primary transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Horario</h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li className="flex justify-between">
                  <span>Lun - Vie</span>
                  <span>8:00 - 22:00 hs</span>
                </li>
                <li className="flex justify-between">
                  <span>Sábados</span>
                  <span>9:00 - 21:00 hs</span>
                </li>
                <li className="flex justify-between">
                  <span>Domingos</span>
                  <span>9:00 - 13:00 hs</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Contacto</h3>
              <address className="mt-4 not-italic text-muted-foreground space-y-2">
                <p className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Av. Principal 1234, Ciudad</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>+54 9 11 1234-5678</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>info@clubparacao.com.ar</span>
                </p>
              </address>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
              <p>© {new Date().getFullYear()} Club Paracao. Todos los derechos reservados.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-primary transition-colors">Términos y condiciones</a>
                <a href="#" className="hover:text-primary transition-colors">Política de privacidad</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
