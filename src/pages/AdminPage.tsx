import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function AdminPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  if (profile?.role !== 'admin') {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Accesso negato. Solo gli amministratori possono accedere a questa pagina.</p>
        <button onClick={() => navigate('/')}>Torna ai progetti</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #d1ccc7', padding: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>← Indietro</button>
        <h1 style={{ marginBottom: '0.5rem' }}>Amministrazione</h1>
        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Gestione utenti e impostazioni globali</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #d1ccc7', textAlign: 'center' }}>
          <h2 style={{ color: '#999' }}>Funzionalità in preparazione</h2>
          <p style={{ color: '#ccc' }}>
            Qui sarà possibile gestire utenti, ruoli, e impostazioni di sistema.
          </p>
          <p style={{ color: '#ddd', fontSize: '12px' }}>
            Nel prototipo finale avrà: gestione utenti, assegnazione ruoli, statistiche globali, backup dati
          </p>
        </div>
      </div>
    </div>
  )
}
