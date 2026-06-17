# Gestione Progetti

Applicazione web per la gestione di progetti, attività e event log, in italiano, con ruoli utente (Amministratore, Supervisore, Utente).

## Features

- ✅ Autenticazione con Supabase
- ✅ Gestione progetti con priorità e scadenze
- ✅ Assegnazione attività ai membri del progetto
- ✅ Event log (incoming, outgoing, meeting, general notes)
- ✅ Controllo d'accesso basato su ruoli (RLS in Supabase)
- ✅ Interfaccia interamente in italiano

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel (gratuito)
- **Routing**: React Router v6

## Setup Locale

### 1. Clona il repo

```bash
git clone <repo>
cd gestione-progetti
```

### 2. Installa dipendenze

```bash
npm install
```

### 3. Crea account Supabase

1. Vai su https://supabase.com
2. Crea un nuovo progetto (scegli la regione più vicina)
3. Vai in "Settings" → "API" e copia:
   - Project URL
   - Anon Key

### 4. Setup database

1. In Supabase, vai su "SQL Editor"
2. Apri il file `supabase_schema.sql` (è nella root del progetto)
3. Copia tutto il contenuto SQL e incollalo nell'editor SQL di Supabase
4. Esegui (premi "Run")
5. Attendi che tutte le tabelle siano create

### 5. Configura variabili d'ambiente

1. Copia `.env.example` a `.env.local`
2. Sostituisci con i tuoi valori Supabase:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

### 6. Crea utenti demo in Supabase

1. Vai in "Authentication" → "Users"
2. Clicca "Add user" e crea tre utenti di test:
   - Email: `admin@test.com` Password: `password123`
   - Email: `supervisor@test.com` Password: `password123`
   - Email: `user@test.com` Password: `password123`

3. Una volta creati, vai in "SQL Editor" ed esegui:

```sql
UPDATE profiles SET full_name = 'Admin User', role = 'admin' WHERE email = 'admin@test.com';
UPDATE profiles SET full_name = 'Supervisor User', role = 'supervisor' WHERE email = 'supervisor@test.com';
UPDATE profiles SET full_name = 'Normal User', role = 'user' WHERE email = 'user@test.com';
```

### 7. Avvia il server di sviluppo

```bash
npm run dev
```

Apri http://localhost:5173

## Deployment su Vercel

### 1. Push il codice su GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuoutente/gestione-progetti.git
git push -u origin main
```

### 2. Collega Vercel a GitHub

1. Vai su https://vercel.com
2. Clicca "New Project"
3. Seleziona il tuo repo GitHub
4. Clicca "Import"

### 3. Configura variabili d'ambiente in Vercel

1. Nel passaggio "Environment Variables" di Vercel, aggiungi:

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = xxxxx
```

2. Clicca "Deploy"

### 4. Fine!

Il tuo sito sarà live a `https://tuodominio.vercel.app`

## Flusso di lavoro

### Admin
- Crea progetti
- Aggiunge/rimuove utenti da progetti
- Vede tutto
- Accesso a pannello admin

### Supervisor
- Crea progetti
- Crea/modifica/cancella attività
- Assegna attività ai colleghi
- Vede statistiche progetto

### Utente
- Vede solo i progetti a cui è membro
- Completa attività assegnate a lui
- Può creare attività solo per se stesso
- Può aggiungere eventi al progetto

## Struttura File

```
src/
├── pages/
│   ├── LoginPage.tsx          # Login form
│   ├── DashboardPage.tsx      # Lista progetti
│   ├── ProjectPage.tsx        # Dettagli progetto + tasks + events
│   └── AdminPage.tsx          # Admin panel
├── lib/
│   ├── supabase.ts            # Client Supabase + types
│   └── AuthContext.tsx        # Context per auth
├── App.tsx                    # Router
├── main.tsx                   # Entry point
└── index.css                  # Stili globali
```

## Note di sicurezza

- Tutte le query leggono/scrivono solo dati che l'utente può accedere (RLS Supabase)
- Le password non vengono mai inviate al frontend (Supabase Auth)
- Admin è un ruolo speciale che bypassa molte restrizioni — usalo con cautela

## Support

Per domande o problemi:
1. Controlla la console del browser (F12) per errori
2. Controlla i logs Supabase in "Logs" → "Query Performance"
3. Assicurati che il database schema sia stato importato correttamente

## Roadmap

- [ ] Gestione completa utenti in admin panel
- [ ] Caricamento file/documenti nei progetti
- [ ] Notifiche email
- [ ] Statistiche avanzate e grafici
- [ ] Esportazione dati in CSV/PDF
- [ ] Mobile app
