import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'supervisor' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  priority: 'bassa' | 'media' | 'alta' | 'critica'
  status: 'attivo' | 'in_pausa' | 'completato' | 'annullato'
  created_by: string
  created_at: string
  updated_at: string
  deadline: string | null
  members: string[] | null
  profiles?: Profile
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'da_fare' | 'in_corso' | 'completata' | 'bloccata'
  priority: 'bassa' | 'media' | 'alta'
  assigned_to: string | null
  created_by: string
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  assignee?: Profile
  creator?: Profile
  projects?: Project
}

export interface ProjectEvent {
  id: string
  project_id: string
  event_type: 'incoming' | 'outgoing' | 'meeting' | 'general'
  title: string
  description: string | null
  created_by: string
  event_date: string
  created_at: string
  profile?: Profile
}
