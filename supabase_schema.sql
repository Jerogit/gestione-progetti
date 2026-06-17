-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users (id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('bassa', 'media', 'alta', 'critica')),
  status TEXT DEFAULT 'attivo' CHECK (status IN ('attivo', 'in_pausa', 'completato', 'annullato')),
  created_by UUID NOT NULL REFERENCES profiles (id),
  deadline DATE,
  members UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'da_fare' CHECK (status IN ('da_fare', 'in_corso', 'completata', 'bloccata')),
  priority TEXT CHECK (priority IN ('bassa', 'media', 'alta')),
  assigned_to UUID REFERENCES profiles (id),
  created_by UUID NOT NULL REFERENCES profiles (id),
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Project Events (Activity Log)
CREATE TABLE project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('incoming', 'outgoing', 'meeting', 'general')),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles (id),
  event_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can view projects they're member of or created" ON projects
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(members) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin and supervisors can create projects" ON projects
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'supervisor')
  );

CREATE POLICY "Project creator and admin can update" ON projects
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admin can delete projects" ON projects
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Tasks
CREATE POLICY "Users can view tasks in their projects" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id AND (
        auth.uid() = projects.created_by OR 
        auth.uid() = ANY(projects.members) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "Supervisors and admins can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id AND (
        auth.uid() = projects.created_by OR
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'supervisor')
      )
    )
  );

CREATE POLICY "Users can update own tasks or assigned tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id AND (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'supervisor')
      )
    )
  );

-- Project Events
CREATE POLICY "Users can view events in their projects" ON project_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_events.project_id AND (
        auth.uid() = projects.created_by OR 
        auth.uid() = ANY(projects.members) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "Project members can create events" ON project_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_events.project_id AND (
        auth.uid() = projects.created_by OR 
        auth.uid() = ANY(projects.members) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      )
    )
  );
