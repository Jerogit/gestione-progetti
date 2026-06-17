import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, Project, Task, ProjectEvent, Profile } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<ProjectEvent[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'media', assigned_to: '', start_date: '', due_date: '' })
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_type: 'general', event_date: '' })

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    if (!projectId) return
    setLoading(true)

    const [projectRes, tasksRes, eventsRes, profilesRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_events').select('*').eq('project_id', projectId).order('event_date', { ascending: false }),
      supabase.from('profiles').select('*'),
    ])

    if (projectRes.data) setProject(projectRes.data)
    if (tasksRes.data) setTasks(tasksRes.data)
    if (eventsRes.data) setEvents(eventsRes.data)
    if (profilesRes.data) setAllProfiles(profilesRes.data)
    setLoading(false)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !user) return

    const { error } = await supabase.from('tasks').insert({
      project_id: projectId,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      assigned_to: newTask.assigned_to || null,
      created_by: user.id,
      start_date: newTask.start_date || null,
      due_date: newTask.due_date || null,
    })

    if (!error) {
      setNewTask({ title: '', description: '', priority: 'media', assigned_to: '', start_date: '', due_date: '' })
      setShowNewTask(false)
      loadProjectData()
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !user) return

    const { error } = await supabase.from('project_events').insert({
      project_id: projectId,
      title: newEvent.title,
      description: newEvent.description,
      event_type: newEvent.event_type,
      event_date: newEvent.event_date,
      created_by: user.id,
    })

    if (!error) {
      setNewEvent({ title: '', description: '', event_type: 'general', event_date: '' })
      setShowNewEvent(false)
      loadProjectData()
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (!error) loadProjectData()
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return '#ef9f27'
      case 'media': return '#97c459'
      case 'bassa': return '#5dcaa5'
      default: return '#888'
    }
  }

  const eventTypeLabel = (type: string) => {
    switch (type) {
      case 'incoming': return '📥 Incoming'
      case 'outgoing': return '📤 Outgoing'
      case 'meeting': return '👥 Meeting'
      case 'general': return '📝 General'
      default: return type
    }
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completata').length,
    inProgress: tasks.filter(t => t.status === 'in_corso').length,
    blocked: tasks.filter(t => t.status === 'bloccata').length,
  }

  if (loading) return <div style={{ padding: '2rem' }}>Caricamento progetto...</div>
  if (!project) return <div style={{ padding: '2rem' }}>Progetto non trovato</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #d1ccc7', padding: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>← Indietro</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
            <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>{project.description}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Project Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #d1ccc7' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px' }}>Priorità</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: priorityColor(project.priority) }}>
              {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
            </p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #d1ccc7' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px' }}>Scadenza</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
              {project.deadline ? new Date(project.deadline).toLocaleDateString('it-IT') : '—'}
            </p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #d1ccc7' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px' }}>Membri</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>{project.members?.length || 0}</p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #d1ccc7' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px' }}>Attività</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
              {taskStats.completed}/{taskStats.total}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left Column - Tasks */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Attività ({taskStats.total})</h2>
              {(profile?.role === 'admin' || profile?.role === 'supervisor') && (
                <button onClick={() => setShowNewTask(!showNewTask)}>+ Nuova Attività</button>
              )}
            </div>

            {/* New Task Form */}
            {showNewTask && (
              <form
                onSubmit={handleCreateTask}
                style={{
                  background: 'white',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #d1ccc7',
                  marginBottom: '1.5rem',
                }}
              >
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Titolo attività"
                  required
                  style={{ marginBottom: '1rem', width: '100%' }}
                />
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descrizione"
                  style={{ width: '100%', minHeight: '60px', marginBottom: '1rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="bassa">Bassa</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  >
                    <option value="">Assegna a...</option>
                    {allProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                  <input
                    type="date"
                    value={newTask.start_date}
                    onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                  />
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" data-primary>Crea Attività</button>
                  <button type="button" onClick={() => setShowNewTask(false)}>Annulla</button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <p style={{ color: '#999' }}>Nessuna attività</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: 'white',
                      border: '1px solid #d1ccc7',
                      borderRadius: '8px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px' }}>{task.title}</h4>
                        {task.description && <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{task.description}</p>}
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        style={{ fontSize: '12px', marginLeft: '1rem' }}
                      >
                        <option value="da_fare">Da fare</option>
                        <option value="in_corso">In corso</option>
                        <option value="completata">Completata</option>
                        <option value="bloccata">Bloccata</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#999', marginTop: '0.5rem' }}>
                      {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString('it-IT')}</span>}
                      {task.assigned_to && (
                        <span>👤 {allProfiles.find(p => p.id === task.assigned_to)?.full_name}</span>
                      )}
                      <span style={{ color: priorityColor(task.priority) }}>⚡ {task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Events */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Evento Log</h2>
              <button onClick={() => setShowNewEvent(!showNewEvent)} style={{ fontSize: '13px' }}>+ Nuovo</button>
            </div>

            {/* New Event Form */}
            {showNewEvent && (
              <form
                onSubmit={handleCreateEvent}
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #d1ccc7',
                  marginBottom: '1.5rem',
                }}
              >
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Titolo"
                  required
                  style={{ marginBottom: '8px', width: '100%' }}
                />
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Descrizione"
                  style={{ width: '100%', minHeight: '60px', marginBottom: '8px' }}
                />
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  style={{ marginBottom: '8px', width: '100%' }}
                >
                  <option value="general">General</option>
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                  <option value="meeting">Meeting</option>
                </select>
                <input
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  required
                  style={{ marginBottom: '8px', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="submit" data-primary style={{ fontSize: '12px' }}>Salva</button>
                  <button type="button" onClick={() => setShowNewEvent(false)} style={{ fontSize: '12px' }}>Annulla</button>
                </div>
              </form>
            )}

            {/* Events List */}
            {events.length === 0 ? (
              <p style={{ color: '#999', fontSize: '13px' }}>Nessun evento</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      background: 'white',
                      border: '1px solid #d1ccc7',
                      borderRadius: '8px',
                      padding: '0.75rem',
                    }}
                  >
                    <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 500 }}>
                      {eventTypeLabel(event.event_type)}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: '12px' }}>{event.title}</p>
                    {event.description && (
                      <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999' }}>{event.description}</p>
                    )}
                    <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>
                      {new Date(event.event_date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
