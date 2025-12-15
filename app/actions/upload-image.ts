"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file) {
    throw new Error('No file provided')
  }

  const filePath = `discipline-images/${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('discipline-images')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading image:', error)
    throw new Error('Error uploading image')
  }

  const { data } = supabase.storage
    .from('discipline-images')
    .getPublicUrl(filePath)

  revalidatePath('/') // Revalidate the home page to show the new image

  return {
    url: data.publicUrl,
  }
}
