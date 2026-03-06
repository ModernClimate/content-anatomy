-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE project_role AS ENUM ('strategist', 'client');

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  sheet_id TEXT,
  sheet_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROJECT MEMBERS
-- ============================================================

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role project_role NOT NULL DEFAULT 'client',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STAGES
-- ============================================================

CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SWIM LANES
-- ============================================================

CREATE TABLE swim_lanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE swim_lanes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COLOR CATEGORIES
-- ============================================================

CREATE TABLE color_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  hex_color TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE color_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BUBBLE POSITIONS
-- ============================================================

CREATE TABLE bubble_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bubble_id TEXT NOT NULL,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, bubble_id)
);

ALTER TABLE bubble_positions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMMENTS
-- ============================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bubble_id TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  body TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INVITES
-- ============================================================

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role project_role NOT NULL DEFAULT 'client',
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION is_project_member(pid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = pid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_project_strategist(pid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = pid AND user_id = auth.uid() AND role = 'strategist'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- projects
CREATE POLICY "members can view projects"
  ON projects FOR SELECT USING (is_project_member(id));

CREATE POLICY "authenticated users can create projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "strategists can update projects"
  ON projects FOR UPDATE USING (is_project_strategist(id));

-- project_members
CREATE POLICY "members can view project membership"
  ON project_members FOR SELECT USING (is_project_member(project_id));

CREATE POLICY "strategists can manage members"
  ON project_members FOR ALL USING (is_project_strategist(project_id));

CREATE POLICY "users can see their own membership"
  ON project_members FOR SELECT USING (user_id = auth.uid());

-- stages
CREATE POLICY "members can view stages"
  ON stages FOR SELECT USING (is_project_member(project_id));

CREATE POLICY "strategists can manage stages"
  ON stages FOR ALL USING (is_project_strategist(project_id));

-- swim_lanes
CREATE POLICY "members can view swim lanes"
  ON swim_lanes FOR SELECT USING (is_project_member(project_id));

CREATE POLICY "strategists can manage swim lanes"
  ON swim_lanes FOR ALL USING (is_project_strategist(project_id));

-- color_categories
CREATE POLICY "members can view color categories"
  ON color_categories FOR SELECT USING (is_project_member(project_id));

CREATE POLICY "strategists can manage color categories"
  ON color_categories FOR ALL USING (is_project_strategist(project_id));

-- bubble_positions
CREATE POLICY "members can view bubble positions"
  ON bubble_positions FOR SELECT USING (is_project_member(project_id));

CREATE POLICY "strategists can manage bubble positions"
  ON bubble_positions FOR ALL USING (is_project_strategist(project_id));

-- comments
CREATE POLICY "members can view comments"
  ON comments FOR SELECT USING (is_project_member(project_id));

CREATE POLICY "members can create comments"
  ON comments FOR INSERT WITH CHECK (
    is_project_member(project_id) AND auth.uid() = author_id
  );

CREATE POLICY "author or strategist can update comment"
  ON comments FOR UPDATE USING (
    auth.uid() = author_id OR is_project_strategist(project_id)
  );

-- invites: only strategists manage, no public read
CREATE POLICY "strategists can manage invites"
  ON invites FOR ALL USING (is_project_strategist(project_id));
