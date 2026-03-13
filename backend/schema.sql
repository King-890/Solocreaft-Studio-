-- SoloCraft Studio Database Schema

-- Table for user projects
CREATE TABLE IF NOT EXISTS Projects (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    bpm INTEGER DEFAULT 120,
    createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    projectData TEXT -- JSON stringified state
);

-- Table for studio metadata/assets
CREATE TABLE IF NOT EXISTS StudioMetadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Initial indexing
CREATE INDEX IF NOT EXISTS idx_projects_userId ON Projects(userId);
