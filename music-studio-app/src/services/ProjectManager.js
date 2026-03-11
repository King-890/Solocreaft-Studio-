// ProjectManager handles project-related operations locally for guest mode


export const ProjectManager = {
    async createProject(name, userId) {
        return { 
            data: { id: Date.now().toString(), name, user_id: userId, tempo: 120, key: 'C' }, 
            error: null 
        };
    },

    async getUserProjects(userId) {
        return { data: [], error: null };
    },

    async deleteProject(projectId) {
        return { error: null };
    }
};
