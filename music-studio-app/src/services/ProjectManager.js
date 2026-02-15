import { supabase } from './supabase';

export const ProjectManager = {
    async createProject(name, userId) {
        console.log('Mocking project creation locally...');
        return { 
            data: { id: Date.now().toString(), name, user_id: userId, tempo: 120, key: 'C' }, 
            error: null 
        };
    },

    async getUserProjects(userId) {
        console.log('Guest Mode: Projects should be managed via ProjectContext recordings flow.');
        return { data: [], error: null };
    },

    async deleteProject(projectId) {
        console.log(`Mocking project deletion (${projectId}) locally...`);
        return { error: null };
    }
};
