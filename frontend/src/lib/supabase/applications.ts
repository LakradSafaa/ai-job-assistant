// src/lib/supabase/applications.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getApplicationResults(profileId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      cover_letter,
      cv_url,
      created_at,
      jobs ( title, company_name )
    `)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des candidatures :', error)
    throw error
  }

  return data
}