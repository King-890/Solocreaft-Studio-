-- ============================================
-- STEP 2: ENABLE ROW LEVEL SECURITY & POLICIES
-- Run this after Step 1
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_clips ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Tracks policies
CREATE POLICY "Users can view tracks in their projects"
    ON tracks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tracks in their projects"
    ON tracks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tracks in their projects"
    ON tracks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tracks in their projects"
    ON tracks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tracks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Audio clips policies
CREATE POLICY "Users can view clips in their projects"
    ON audio_clips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = audio_clips.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create clips in their projects"
    ON audio_clips FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = audio_clips.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clips in their projects"
    ON audio_clips FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = audio_clips.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clips in their projects"
    ON audio_clips FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = audio_clips.project_id
            AND projects.user_id = auth.uid()
        )
    );
