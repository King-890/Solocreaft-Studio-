import { supabase } from './supabase';

export const ProjectManager = {
    async createProject(name, userId) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([
                    { name, user_id: userId, tempo: 120, key: 'C' }
                ])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating project:', error);
            return { data: null, error };
        }
    },

    async getUserProjects(userId) {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching projects:', error);
            return { data: null, error };
        }
    },

    async deleteProject(projectId) {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting project:', error);
            return { error };
        }
    }
};
