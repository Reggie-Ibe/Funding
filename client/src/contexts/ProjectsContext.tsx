// client/src/contexts/ProjectsContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { projectService } from '../services/ApiService';

interface Project {
  project_id: string;
  title: string;
  innovator_id: string;
  short_description: string;
  category: string;
  status: string;
  funding_goal: number;
  current_funding: number;
  min_investment: number;
  sdg_alignment: string[];
  created_at: string;
  innovator_name?: string;
  // Additional fields can be added as needed
}

interface ProjectFilters {
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
}

interface ProjectsContextType {
  projects: Project[];
  featuredProjects: Project[];
  loading: boolean;
  error: string | null;
  filters: ProjectFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProjectFilters>>;
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  getProjectById: (id: string) => Promise<Project | null>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({});

  // Fetch projects on initial load
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async (newFilters?: ProjectFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentFilters = newFilters || filters;
      const data = await projectService.getAllProjects(currentFilters);
      setProjects(data.projects || []);
      
      // Also fetch featured projects if needed
      if (!newFilters && !filters.category && !filters.search) {
        const featuredData = await projectService.getAllProjects({ 
          featured: true,
          limit: 3
        });
        setFeaturedProjects(featuredData.projects || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (id: string): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const project = await projectService.getProjectById(id);
      return project;
    } catch (err: any) {
      console.error('Failed to fetch project details:', err);
      setError(err.response?.data?.message || 'Failed to load project details. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        featuredProjects,
        loading,
        error,
        filters,
        setFilters,
        fetchProjects,
        getProjectById
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};