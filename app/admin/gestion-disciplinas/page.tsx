import { redirect } from 'next/navigation'

export default async function GestionDisciplinasPage() {
  // Redirect to Disciplinas page; management moved to disciplina edit page
  return redirect('/admin/disciplinas')
}
