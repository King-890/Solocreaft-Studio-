-- ============================================
-- STEP 1: CREATE TABLES
-- Run this first
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    tempo INTEGER DEFAULT 120,
    key TEXT DEFAULT 'C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    volume REAL DEFAULT 1.0,
    pan REAL DEFAULT 0.0,
    order_index INTEGER DEFAULT 0,
    muted BOOLEAN DEFAULT FALSE,
    solo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio clips table
CREATE TABLE audio_clips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    file_path TEXT NOT NULL,
    start_time INTEGER DEFAULT 0,
    duration INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tracks_project_id ON tracks(project_id);
CREATE INDEX idx_audio_clips_track_id ON audio_clips(track_id);
CREATE INDEX idx_audio_clips_project_id ON audio_clips(project_id);
