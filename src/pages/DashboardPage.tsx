import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Project } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', priority: 'media', deadline: '' })
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    if (!user) return
    setLoading(true)
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`created_by.eq.${user.id},members.cs.{${user.id}}`)
      .order('created_at', { ascending: false })

    if (!error) setProjects(data || [])
    setLoading(false)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    const { error } = await supabase.from('projects').insert({
      name: newProject.name,
      description: newProject.description,
      priority: newProject.priority,
      deadline: newProject.deadline || null,
      created_by: user.id,
      members: [user.id],
    })

    if (!error) {
      setNewProject({ name: '', description: '', priority: 'media', deadline: '' })
      setShowNewProject(false)
      loadProjects()
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return '#e24b4a'
      case 'alta': return '#ef9f27'
      case 'media': return '#97c459'
      case 'bassa': return '#5dcaa5'
      default: return '#888'
    }
  }

  const priorityLabel = (priority: string) => {
    switch (priority) {
      case 'critica': return 'Critica'
      case 'alta': return 'Alta'
      case 'media': return 'Media'
      case 'bassa': return 'Bassa'
      default: return priority
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #d1ccc7', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Progetti</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{profile?.full_name} • {profile?.role}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {profile?.role === 'admin' && (
            <button onClick={() => navigate('/admin')}>⚙️ Admin</button>
          )}
          <button onClick={signOut}>Esci</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* New Project Button */}
        {(profile?.role === 'admin' || profile?.role === 'supervisor') && (
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            style={{ marginBottom: '1.5rem' }}
          >
            + Nuovo Progetto
          </button>
        )}

        {/* New Project Form */}
        {showNewProject && (
          <form
            onSubmit={handleCreateProject}
            style={{
              background: 'white',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #d1ccc7',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Nome del progetto"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                  Priorità
                </label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                >
                  <option value="bassa">Bassa</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Critica</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                Descrizione
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Descrizione del progetto"
                style={{ width: '100%', minHeight: '60px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                Scadenza
              </label>
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" data-primary>
                Crea Progetto
              </button>
              <button type="button" onClick={() => setShowNewProject(false)}>
                Annulla
              </button>
            </div>
          </form>
        )}

        {/* Projects Grid */}
        {loading ? (
          <p>Caricamento progetti...</p>
        ) : projects.length === 0 ? (
          <p style={{ color: '#888' }}>Nessun progetto</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/progetti/${project.id}`)}
                style={{
                  background: 'white',
                  border: '1px solid #d1ccc7',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#b4b2a9'
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#d1ccc7'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <h3 style={{ flex: 1, margin: 0 }}>{project.name}</h3>
                  <span
                    style={{
                      background: priorityColor(project.priority),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      marginLeft: '8px',
                    }}
                  >
                    {priorityLabel(project.priority)}
                  </span>
                </div>

                {project.description && (
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {project.description}
                  </p>
                )}

                <div style={{ fontSize: '12px', color: '#999', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #eee' }}>
                  {project.deadline && <p style={{ margin: 0 }}>📅 Scadenza: {new Date(project.deadline).toLocaleDateString('it-IT')}</p>}
                  <p style={{ margin: '4px 0 0' }}>👥 {project.members?.length || 1} membro(i)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
